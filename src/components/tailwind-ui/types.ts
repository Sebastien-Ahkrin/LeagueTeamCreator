export const Color = {
  primary: 'primary',
  neutral: 'neutral',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  alternative: 'alternative',
} as const;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type Color = typeof Color[keyof typeof Color];

export const Size = {
  xSmall: 'xSmall',
  small: 'small',
  medium: 'medium',
  large: 'large',
  xLarge: 'xLarge',
} as const;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type Size = typeof Size[keyof typeof Size];

export const Variant = {
  primary: 'primary',
  secondary: 'secondary',
  white: 'white',
} as const;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type Variant = typeof Variant[keyof typeof Variant];

export const Roundness = {
  light: 'light',
  full: 'full',
  circular: 'circular',
} as const;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type Roundness = typeof Roundness[keyof typeof Roundness];

export type ActionType<Action, Payload = void> = Payload extends void
  ? { type: Action }
  : { type: Action; payload: Payload };

export type PropsOf<T = unknown> = T extends React.ElementType
  ? React.ComponentProps<T>
  : never;
