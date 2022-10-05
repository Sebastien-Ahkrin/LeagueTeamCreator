import {
  ClipboardDocumentIcon,
  XMarkIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

import { Spinner, Variant, Button } from '../..';
import { WithTooltip, WithTooltipProps } from '../popper/WithTooltip';

const clipboardContext = createContext<null | IconState>(null);

interface ClipboardButtonProps extends WithTooltipProps {
  onCopy: () => Promise<string | ClipboardItem>;
  children?: ReactNode;

  onError?: (error: Error) => void;
  onSuccess?: () => void;

  bare?: boolean;
}

export const IconState = {
  IDLE: 'IDLE',
  SPINNER: 'SPINNER',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type IconState = typeof IconState[keyof typeof IconState];

function getClipboardIcon(state: IconState) {
  switch (state) {
    case IconState.IDLE:
      return <ClipboardDocumentIcon className="h-5 w-5" />;
    case IconState.SPINNER:
      return <Spinner className="h-5 w-5" />;
    case IconState.SUCCESS:
      return (
        <ClipboardDocumentCheckIcon className="h-5 w-5 text-success-500" />
      );
    case IconState.ERROR:
      return <XMarkIcon className="h-5 w-5 text-danger-500" />;
    default:
      return <ClipboardDocumentIcon className="h-5 w-5" />;
  }
}

export function ClipboardButton(props: ClipboardButtonProps) {
  const {
    onCopy,
    children,
    onSuccess,
    onError,
    bare = false,
    ...tooltipProps
  } = props;

  const [iconState, setIconState] = useState<IconState>(IconState.IDLE);
  const isDisabled = iconState === IconState.SPINNER;

  useEffect(() => {
    let timeId: NodeJS.Timeout | null = null;

    if (iconState === IconState.SUCCESS || iconState === IconState.ERROR) {
      timeId = setTimeout(() => {
        setIconState(IconState.IDLE);
      }, 3000);
    }

    return () => {
      if (timeId !== null) {
        clearTimeout(timeId);
      }
    };
  }, [iconState, isDisabled]);

  function onClick() {
    setIconState(IconState.SPINNER);
    onCopy()
      .then((result) => {
        if (typeof result === 'string') {
          return navigator.clipboard.writeText(result).then(() => {
            onSuccess?.();
            setIconState(IconState.SUCCESS);
          });
        } else {
          return navigator.clipboard.write([result]).then(() => {
            onSuccess?.();
            setIconState(IconState.SUCCESS);
          });
        }
      })

      .catch((error: Error) => {
        onError?.(error);
        setIconState(IconState.ERROR);
      });
  }

  const buttonProps = {
    disabled: isDisabled,
    onClick,
    children: (
      <>
        {children === undefined ? (
          <>{getClipboardIcon(iconState)}</>
        ) : (
          <div className="flex flex-row items-center gap-1">{children}</div>
        )}
      </>
    ),
  };

  return (
    <clipboardContext.Provider value={iconState}>
      <WithTooltip {...tooltipProps}>
        {!bare ? (
          <Button {...buttonProps} variant={Variant.white} />
        ) : (
          <button
            type="button"
            className={clsx({
              'hover:underline': !isDisabled,
              'text-neutral-500': isDisabled,
            })}
            {...buttonProps}
          />
        )}
      </WithTooltip>
    </clipboardContext.Provider>
  );
}

ClipboardButton.Icon = function ClipboardButtonIcon() {
  const ctx = useContext(clipboardContext);

  if (!ctx) {
    throw new Error(
      'ClipboardButton.Icon must have access to the context provided by ClipboardButton',
    );
  }

  return <>{getClipboardIcon(ctx)}</>;
};
