import { useCallback } from 'react';
import { useController } from 'react-hook-form';

import { DatePicker, DatePickerProps } from '../..';
import { useCheckedFormRHFContext } from '../../hooks/useCheckedFormRHF';
import {
  defaultErrorSerializer,
  FieldProps,
  RHFValidationProps,
} from '../util';

export type DatePickerFieldProps<Modifiers extends string = never> = Omit<
  DatePickerProps<Modifiers>,
  'onChange' | 'value'
>;

interface DatePickerFieldRHFProps
  extends Omit<DatePickerProps, 'value' | 'onChange'>,
    FieldProps,
    RHFValidationProps {
  valueType?: 'string' | 'date';
}

export function DatePickerFieldRHF(props: DatePickerFieldRHFProps) {
  const {
    name,
    inputProps,
    serializeError = defaultErrorSerializer,
    deps,
    valueType = 'date',
    ...otherProps
  } = props;

  const { setValue, trigger } = useCheckedFormRHFContext();
  const {
    field,
    fieldState: { error },
    formState: { isSubmitted },
  } = useController({
    name: props.name,
  });

  const { value, onBlur, ref } = field;

  const setFieldValue = useCallback(
    (value: Date | null) => {
      if (valueType === 'string' && value !== null) {
        setValue(name, value.toISOString(), {
          shouldTouch: true,
          shouldValidate: isSubmitted,
        });
      } else {
        setValue(name, value, {
          shouldTouch: true,
          shouldValidate: isSubmitted,
        });
      }

      if (deps && isSubmitted) {
        void trigger(deps);
      }
    },
    [valueType, deps, isSubmitted, setValue, name, trigger],
  );

  return (
    <div className="flex">
      <DatePicker
        value={
          valueType === 'string' && value !== null ? new Date(value) : value
        }
        name={name}
        inputProps={{
          ...inputProps,
        }}
        inputRef={ref}
        error={serializeError(error)}
        onChange={(date: Date | null) => {
          setFieldValue(date);
        }}
        onBlur={onBlur}
        {...otherProps}
      />
    </div>
  );
}
