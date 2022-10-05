import { ReactNode, Ref, useCallback, useMemo } from 'react';

import { Badge } from '../../elements/badge/Badge';
import { Color } from '../../types';
import { forwardRefWithGeneric } from '../../util';
import {
  defaultCanCreate,
  defaultGetBadgeColor,
  defaultGetValue,
  defaultIsOptionRemovable,
  defaultRenderCreate,
  defaultRenderOption,
  defaultRenderSelectedOptions,
  InternalMultiSearchSelect,
  useSearchSelectInternals,
} from '../../utils/search-select-utils';

import {
  MultiSearchSelectProps,
  SimpleMultiSearchSelectProps,
} from './MultiSearchSelect';
import { SimpleSelectOption } from './Select';

export const CheckboxMultiSearchSelect = forwardRefWithGeneric(
  CheckboxMultiSearchSelectForwardRef,
);

interface CheckboxMultiSearchSelectExclusiveProps<OptionType> {
  renderSelectedOptions?: (options: OptionType[]) => ReactNode;
  getBadgeColor?: (option: OptionType[]) => Color;
  selectedFiltered?: OptionType[];
  pinSelectedOptions?: boolean;
}

export type CheckboxMultiSearchSelectProps<OptionType> = Omit<
  MultiSearchSelectProps<OptionType>,
  'renderSelectedOption' | 'getBadgeColor'
> &
  CheckboxMultiSearchSelectExclusiveProps<OptionType>;

export type CheckboxSimpleMultiSearchSelectProps<OptionType> = Omit<
  SimpleMultiSearchSelectProps<OptionType>,
  'renderSelectedOption' | 'getBadgeColor'
> &
  CheckboxMultiSearchSelectExclusiveProps<OptionType>;

function CheckboxMultiSearchSelectForwardRef<OptionType>(
  props: OptionType extends SimpleSelectOption
    ? CheckboxSimpleMultiSearchSelectProps<OptionType>
    : CheckboxMultiSearchSelectProps<OptionType>,
  ref: Ref<HTMLInputElement>,
): JSX.Element {
  const {
    onSearchChange,
    options,
    onSelect,
    isOptionRemovable = defaultIsOptionRemovable,
    selected,
    selectedFiltered: filteredSelected,
    getValue = defaultGetValue,
    renderOption = defaultRenderOption,
    renderSelectedOptions = defaultRenderSelectedOptions,
    getBadgeColor = defaultGetBadgeColor,
    closeListOnSelect = false,
    clearSearchOnSelect = false,
    onCreate,
    canCreate = defaultCanCreate,
    renderCreate = defaultRenderCreate,
    clearable = true,
    disabled = false,
    pinSelectedOptions = false,
    ...otherProps
  } = props;

  const nonRemovableValues = useMemo(
    () => selected.filter((value) => !isOptionRemovable(value)),
    [selected, isOptionRemovable],
  );

  const renderedSelected = useMemo(() => {
    const rendered = renderSelectedOptions(selected);

    if (rendered) {
      return [
        <Badge
          key="selected-items"
          variant="COLORED_BACKGROUND"
          label={rendered}
          color={getBadgeColor(selected)}
          rounded
        />,
      ];
    }
    return [];
  }, [selected, renderSelectedOptions, getBadgeColor]);

  const handleSelect = useCallback(
    (value: OptionType | undefined, remove?: boolean) => {
      if (value === undefined) {
        onSelect(nonRemovableValues);
      } else if (remove) {
        onSelect(
          selected.filter((option) => getValue(option) !== getValue(value)),
        );
      } else {
        onSelect([...selected, value]);
      }
    },
    [selected, onSelect, nonRemovableValues, getValue],
  );

  const internalProps = useSearchSelectInternals({
    showSelected: true,
    selected,
    filteredSelected,
    searchValue: props.searchValue,
    onSearchChange,
    options,
    onSelect: handleSelect,
    getValue,
    renderOption,
    closeListOnSelect,
    clearSearchOnSelect,
    onCreate,
    canCreate,
    renderCreate,
    pinSelectedOptions,
    isOptionRemovable,
  });

  return (
    <InternalMultiSearchSelect
      {...internalProps}
      {...otherProps}
      inputRef={ref}
      clearable={clearable}
      disabled={disabled}
      hasClearableValue={selected.length !== nonRemovableValues.length}
      selectedBadges={renderedSelected}
    />
  );
}
