import { useCallback } from 'react';
import { useController } from 'react-hook-form';

import { useCheckedFormRHFContext } from '../../hooks/useCheckedFormRHF';
import {
  CheckboxMultiSearchSelect,
  CheckboxMultiSearchSelectProps,
  CheckboxSimpleMultiSearchSelectProps,
} from '../basic/CheckboxMultiSearchSelect';
import { SimpleSelectOption } from '../basic/Select';
import {
  defaultErrorSerializer,
  FieldProps,
  RHFValidationProps,
} from '../util';

export type CheckboxMultiSearchSelectFieldProps<OptionType> = Omit<
  CheckboxMultiSearchSelectProps<OptionType>,
  'selected' | 'onSelect' | 'error' | 'onBlur'
> &
  FieldProps;

export type CheckboxSimpleMultiSearchSelectFieldProps<OptionType> = Omit<
  CheckboxSimpleMultiSearchSelectProps<OptionType>,
  'selected' | 'onSelect' | 'error' | 'onBlur'
> &
  FieldProps;

export function CheckboxMultiSearchSelectFieldRHF<OptionType>(
  props: RHFValidationProps &
    (OptionType extends SimpleSelectOption
      ? CheckboxSimpleMultiSearchSelectFieldProps<OptionType>
      : CheckboxMultiSearchSelectFieldProps<OptionType>),
): JSX.Element {
  const {
    name,
    serializeError = defaultErrorSerializer,
    deps,
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

  const handleSelect = useCallback(
    (options: OptionType[]) => {
      setValue(name, options, {
        shouldTouch: true,
        shouldValidate: isSubmitted,
      });
      if (deps && isSubmitted) {
        void trigger(deps);
      }
    },
    [setValue, isSubmitted, name, trigger, deps],
  );

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <CheckboxMultiSearchSelect<any>
      name={name}
      ref={field.ref}
      onBlur={field.onBlur}
      {...otherProps}
      error={serializeError(error)}
      selected={field.value || []}
      onSelect={handleSelect}
    />
  );
}
