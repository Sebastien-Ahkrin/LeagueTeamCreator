import { get } from 'react-hook-form';

import { useCheckedFormRHFContext } from '../../hooks/useCheckedFormRHF';
import { InputProps, Input } from '../basic/Input';
import {
  defaultErrorSerializer,
  FieldProps,
  RHFRegisterProps,
  EmptyValue,
  getSetValueAs,
  getEmptyValueProp,
  RHFValidationProps,
} from '../util';

import { useRHFConfig } from './FormRHF';

export type InputFieldProps = InputProps;

export interface InputFieldRHFCustomProps {
  /**
   * State value when user enters an empty value in the input
   * This option is ignored if setValueAs is set in rhfOptions
   */
  emptyValue?: EmptyValue;
}

export type InputFieldRHFProps = InputProps &
  FieldProps &
  RHFValidationProps &
  RHFRegisterProps &
  InputFieldRHFCustomProps;

export function InputFieldRHF(props: InputFieldRHFProps) {
  const {
    defaultValue,
    serializeError = defaultErrorSerializer,
    emptyValue,
    onChange,
    onBlur,
    deps,
    rhfOptions,
    ...otherProps
  } = props;
  const {
    register,
    formState: { errors },
  } = useCheckedFormRHFContext();
  const rhfConfig = useRHFConfig();
  const error = get(errors, props.name);

  const finalEmptyValue = getEmptyValueProp(props, rhfConfig);

  return (
    <Input
      {...otherProps}
      {...register(props.name, {
        onChange,
        onBlur,
        setValueAs: getSetValueAs(finalEmptyValue, props.type),
        deps,
        ...rhfOptions,
      })}
      error={serializeError(error)}
    />
  );
}
