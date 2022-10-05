import { BasePlacement } from '@popperjs/core';
import clsx from 'clsx';
import {
  CSSProperties,
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { usePopper } from 'react-popper';

import { useOnOff } from '../../hooks/useOnOff';
import { Portal } from '../../overlays/Portal';

import {
  useTooltipContext,
  tooltipContext,
  TooltipContext,
} from './TooltipContext';

export interface TooltipProps {
  delay?: number;
  children: [ReactElement, ReactElement];
  placement?: BasePlacement;

  // False => Black background with white text
  // True => Gray background with black text
  invertColor?: boolean;
}

export function Tooltip(props: TooltipProps) {
  const {
    delay = 400,
    children,
    placement = 'top',
    invertColor = false,
  } = props;

  const [isTooltipOpen, openTooltip, closeTooltip] = useOnOff();
  const [contentRef, setContentRef] = useState<HTMLDivElement | null>(null);
  const [targetRef, setTargetRef] = useState<HTMLDivElement | null>(null);
  const [arrowRef, setArrowRef] = useState<HTMLDivElement | null>(null);

  const { styles, attributes } = usePopper(targetRef, contentRef, {
    placement,
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, 6],
        },
      },
      {
        name: 'arrow',
        options: {
          element: arrowRef,
        },
      },
    ],
  });

  const contextValue = useMemo<TooltipContext>(
    () => ({
      delay,
      invertColor,
      contentRef: setContentRef,
      targetRef: setTargetRef,
      arrowRef: setArrowRef,
      popper: { styles, attributes },
      callbacks: {
        isTooltipOpen,
        openTooltip,
        closeTooltip,
      },
    }),
    [
      attributes,
      closeTooltip,
      delay,
      isTooltipOpen,
      openTooltip,
      styles,
      invertColor,
    ],
  );

  return (
    <tooltipContext.Provider value={contextValue}>
      {children}
    </tooltipContext.Provider>
  );
}

interface TooltipContentProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

Tooltip.Content = function TooltipContent(props: TooltipContentProps) {
  const {
    contentRef,
    popper: { attributes, styles },
    callbacks: { isTooltipOpen },
    invertColor,
  } = useTooltipContext();

  const { children, className, style } = props;

  if (!isTooltipOpen || !children) {
    return null;
  }

  return (
    <Portal>
      <div
        id="popper-tooltip"
        role="tooltip"
        ref={contentRef}
        className={clsx(
          className === '' || !className
            ? 'rounded-md py-1 px-2 text-xs'
            : `rounded-md py-1 px-2 ${className}`,
          invertColor
            ? 'bg-neutral-100 text-black'
            : 'bg-neutral-900 text-white',
        )}
        style={{ ...style, ...styles.popper }}
        {...attributes.popper}
      >
        {children}
        <Arrow
          style={styles.arrow}
          placement={
            attributes.popper?.['data-popper-placement'] as BasePlacement
          }
        />
      </div>
    </Portal>
  );
};

interface TooltipTargetProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  noFit?: boolean;
}

Tooltip.Target = function TooltipTarget(props: TooltipTargetProps) {
  const {
    delay,
    targetRef,
    callbacks: { openTooltip, closeTooltip },
  } = useTooltipContext();

  const { children, className, style, noFit } = props;
  const ref = useRef<NodeJS.Timeout | null>(null);

  const onPointerEnter = useCallback(() => {
    if (ref.current) {
      clearTimeout(ref.current);
    }
    ref.current = setTimeout(() => {
      openTooltip();
    }, delay);
  }, [delay, openTooltip]);

  const onPointerLeave = useCallback(() => {
    if (ref.current) {
      clearTimeout(ref.current);
      ref.current = null;
    }

    closeTooltip();
  }, [closeTooltip]);

  useEffect(() => {
    return () => onPointerLeave();
  }, [onPointerLeave]);

  return (
    <div
      className={clsx({ 'max-w-fit': !noFit }, className)}
      ref={targetRef}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      style={style}
    >
      {children}
    </div>
  );
};

interface ArrowProps {
  placement?: BasePlacement;
  style?: CSSProperties;
}

function Arrow(props: ArrowProps) {
  const { arrowRef, invertColor } = useTooltipContext();
  const { placement, style } = props;

  if (placement === undefined) {
    return null;
  }

  let rotate = 'rotate-0';
  if (placement.startsWith('top')) {
    rotate = 'rotate-0';
  } else if (placement.startsWith('bottom')) {
    rotate = 'rotate-180';
  } else if (placement.startsWith('left')) {
    rotate = '-rotate-90';
  } else if (placement.startsWith('right')) {
    rotate = 'rotate-90';
  }

  return (
    <div
      ref={arrowRef}
      style={style}
      className={clsx(
        'absolute',
        {
          '-bottom-1': placement.startsWith('top'),
          '-top-1': placement.startsWith('bottom'),
          '-right-[9px]': placement.startsWith('left'),
          '-left-[9px]': placement.startsWith('right'),
        },
        invertColor ? 'text-neutral-100' : 'text-neutral-900',
      )}
    >
      <svg
        aria-hidden="true"
        width="16"
        height="6"
        viewBox="0 0 16 6"
        className={rotate}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M15 0H1V1.00366V1.00366V1.00371H1.01672C2.72058 1.0147 4.24225 2.74704 5.42685 4.72928C6.42941 6.40691 9.57154 6.4069 10.5741 4.72926C11.7587 2.74703 13.2803 1.0147 14.9841 1.00371H15V0Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}
