import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
  XCircleIcon,
} from '@heroicons/react/20/solid';
import clsx from 'clsx';
import {
  ButtonHTMLAttributes,
  createContext,
  ReactNode,
  useContext,
} from 'react';

import { IconButton } from '../elements/buttons/IconButton';
import { Color } from '../types';

export const AlertType = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type AlertType = typeof AlertType[keyof typeof AlertType];

const closeButtonColors: Record<AlertType, string> = {
  [AlertType.INFO]:
    'text-primary-500 bg-primary-50 hover:bg-primary-100 active:bg-primary-200 focus:ring-primary-600',
  [AlertType.SUCCESS]:
    'text-success-500 bg-success-50 hover:bg-success-100 active:bg-success-200 focus:ring-success-600',
  [AlertType.WARNING]:
    'text-warning-500 bg-warning-50 hover:bg-warning-100 active:bg-warning-200 focus:ring-warning-600',
  [AlertType.ERROR]:
    'text-danger-500 bg-danger-50 hover:bg-danger-100 active:bg-danger-200 focus:ring-danger-600',
};

export interface AlertProps {
  type: AlertType;
  title?: ReactNode;
  children?: ReactNode;
  onDismiss?: () => void;
  className?: string;
}

const theme = {
  [AlertType.INFO]: {
    theme: {
      background: 'bg-primary-50',
      title: 'text-primary-800',
      text: 'text-primary-700',
    },
    icon: <InformationCircleIcon className="h-5 w-5 text-primary-400" />,
  },
  [AlertType.WARNING]: {
    theme: {
      background: 'bg-warning-50',
      title: 'text-warning-800',
      text: 'text-warning-700',
    },
    icon: <ExclamationTriangleIcon className="h-5 w-5 text-warning-400" />,
  },
  [AlertType.ERROR]: {
    theme: {
      background: 'bg-danger-50',
      title: 'text-danger-800',
      text: 'text-danger-700',
    },
    icon: <XCircleIcon className="h-5 w-5 text-danger-400" />,
  },
  [AlertType.SUCCESS]: {
    theme: {
      background: 'bg-success-50',
      title: 'text-success-800',
      text: 'text-success-700',
    },
    icon: <CheckCircleIcon className="h-5 w-5 text-success-400" />,
  },
};

function getColorByType(type: AlertType): Color {
  switch (type) {
    case AlertType.INFO:
      return Color.primary;
    case AlertType.ERROR:
      return Color.danger;
    case AlertType.SUCCESS:
      return Color.success;
    case AlertType.WARNING:
      return Color.warning;
    default:
      throw new Error('type cannot be null');
  }
}

const alertContext = createContext<AlertType>(AlertType.INFO);

export function Alert(props: AlertProps): JSX.Element {
  const type = theme[props.type];

  return (
    <div
      className={clsx('rounded-md p-4', type.theme.background, props.className)}
    >
      <div className="flex">
        <div className="shrink-0 text-xl">{type.icon}</div>
        <div className="ml-3">
          {props.title && (
            <div className={clsx('text-sm font-semibold', type.theme.title)}>
              {props.title}
            </div>
          )}
          {props.children && (
            <alertContext.Provider value={props.type}>
              <div
                className={clsx(
                  'text-sm',
                  props.title && 'mt-2',
                  type.theme.text,
                )}
              >
                {props.children}
              </div>
            </alertContext.Provider>
          )}
        </div>

        {props.onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <IconButton
                onClick={props.onDismiss}
                className={clsx(
                  closeButtonColors[props.type],
                  'rounded-full p-1.5 focus:outline-none focus:ring-2',
                )}
                icon={<XMarkIcon />}
                color={getColorByType(props.type)}
                size="5"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const alertButtonColors: Record<AlertType, string> = {
  [AlertType.INFO]:
    'bg-primary-50 text-primary-800 hover:bg-primary-100 focus:ring-primary-600',
  [AlertType.SUCCESS]:
    'bg-success-50 text-success-800 hover:bg-success-100 focus:ring-success-600',
  [AlertType.WARNING]:
    'bg-warning-50 text-warning-800 hover:bg-warning-100 focus:ring-warning-600',
  [AlertType.ERROR]:
    'bg-danger-50 text-danger-800 hover:bg-danger-100 focus:ring-danger-600',
};

export interface AlertButtonsProps {
  children: ReactNode;
}

Alert.Buttons = function AlertButtons(props: AlertButtonsProps) {
  return <div className="-mx-2 mt-1 flex gap-1.5">{props.children}</div>;
};

export interface AlertButtonProps {
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>['onClick'];
  children: ReactNode;
}

Alert.Button = function AlertButton(props: AlertButtonProps) {
  const color = useContext(alertContext);
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={clsx(
        'rounded-md px-2 py-1.5 text-sm font-medium focus:outline-none focus:ring-2',
        alertButtonColors[color],
      )}
    >
      {props.children}
    </button>
  );
};
