import { ElementType, ForwardedRef, ReactNode } from 'react';

import { Color, PropsOf, Roundness, Size, Variant } from '../../types';
import { forwardRefWithAs } from '../../util';
import { WithTooltip, WithTooltipProps } from '../popper/WithTooltip';

import { getButtonClassName } from './utils';

interface ButtonPropsInternal<T extends ElementType = 'button'>
  extends WithTooltipProps {
  children: ReactNode;
  type?: 'button' | 'submit';
  color?: Color;
  size?: Size;
  variant?: Variant;
  roundness?: Roundness;
  group?: 'left' | 'right' | 'middle';
  noBorder?: boolean;
  as?: T;
}

export type ButtonProps<T extends ElementType = 'button'> =
  ButtonPropsInternal<T> & Omit<PropsOf<T>, 'title'>;

export const Button = forwardRefWithAs(function ButtonForwardRef<
  T extends ElementType = 'button',
>(props: ButtonProps<T>, ref: ForwardedRef<HTMLButtonElement>) {
  const {
    color = Color.primary,
    size = Size.medium,
    variant = Variant.primary,
    group,
    children,
    roundness = Roundness.light,
    className,
    noBorder = false,

    type = 'button',
    tooltip,
    tooltipDelay,
    tooltipPlacement,

    as: Component = 'button',

    ...otherProps
  } = props;

  return (
    <WithTooltip
      tooltip={tooltip}
      tooltipDelay={tooltipDelay}
      tooltipPlacement={tooltipPlacement}
    >
      <Component
        type={Component === 'button' ? type : undefined}
        {...otherProps}
        className={getButtonClassName({
          variant,
          roundness,
          color,
          group,
          noBorder,
          size,
          disabled: props.disabled,
          className,
        })}
        ref={ref}
      >
        {children}
      </Component>
    </WithTooltip>
  );
});
