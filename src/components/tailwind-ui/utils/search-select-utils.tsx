import {
  ChevronDownIcon,
  PlusCircleIcon,
  XMarkIcon,
} from '@heroicons/react/20/solid';
import clsx from 'clsx';
import {
  ChangeEvent,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
  Ref,
  UIEvent,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Spinner } from '../elements/spinner/Spinner';
import { Checkbox } from '../forms/basic/Checkbox';
import { Input } from '../forms/basic/Input';
import {
  SearchSelectCanCreateCallback,
  SearchSelectOnCreateCallback,
  SearchSelectRenderCreateCallback,
} from '../forms/basic/SearchSelect';
import {
  GetValue,
  RenderOption,
  SimpleSelectOption,
} from '../forms/basic/Select';
import {
  Help,
  inputColor,
  inputError,
  Label,
  InputErrorIcon,
  InputCorner,
} from '../forms/basic/common';
import { useModifiedPopper, UseModifiedPopperReturn } from '../hooks/popper';
import { useOnClickOutside } from '../hooks/useOnClickOutside';
import { useOnOff } from '../hooks/useOnOff';
import { Color } from '../types';

export type OptionsFilter<OptionType> = (
  query: string,
  options: OptionType[],
) => OptionType[];

export type IsOptionRemovableCallback<OptionType> = (
  option: OptionType,
) => boolean;

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function defaultOptionsFilter<OptionType extends SimpleSelectOption>(
  query: string,
  options: OptionType[],
): OptionType[] {
  const normalizedQuery = normalize(query);
  return options.filter((option) =>
    normalize(String(defaultRenderOption(option))).includes(normalizedQuery),
  );
}

export function customOptionsFilter<OptionType>(
  getText: (option: OptionType) => string,
) {
  return (query: string, options: Array<OptionType>) => {
    const normalizedQuery = normalize(query);
    return options.filter((obj) =>
      normalize(getText(obj)).includes(normalizedQuery),
    );
  };
}

function DefaultNoResultsHint() {
  return <div>No results.</div>;
}

export const defaultNoResultsHint = <DefaultNoResultsHint />;

export function defaultRenderOption(option: SimpleSelectOption): ReactNode {
  return typeof option === 'object' ? option.label : option;
}

export function defaultRenderSelectedOptions(options: unknown[]): ReactNode {
  if (options.length === 0) return null;
  return `${options.length} item${options.length > 1 ? 's' : ''} selected`;
}

export function defaultGetValue(option: SimpleSelectOption): string | number {
  return typeof option === 'object' ? option.value : option;
}

export function defaultCanCreate() {
  return true;
}

export function defaultRenderCreate(value: string) {
  return `Create "${value}"`;
}

export function defaultGetBadgeColor() {
  return Color.neutral;
}

export function defaultIsOptionRemovable() {
  return true;
}

export function preventDefault(event: UIEvent) {
  event.preventDefault();
}

export type InternalOption<OptionType> =
  | {
      type: 'option';
      value: string | number;
      label: ReactNode;
      originalValue: OptionType;
      selected: boolean;
      removable: boolean;
    }
  | {
      type: 'create';
      value: '___internal_create___';
      label: ReactNode;
      originalValue: string;
      selected: false;
      removable: false;
    };

function buildInternalOptions<OptionType>(
  // List of options, including the selected ones (duplicated in order to preserve order)
  options: OptionType[],
  getValue: GetValue<OptionType>,
  renderOption: RenderOption<OptionType>,
  renderCreate: SearchSelectRenderCreateCallback,
  selected: OptionType[],
  showSelected: boolean,
  isOptionRemovable?: IsOptionRemovableCallback<OptionType>,
  createValue?: string,

  // list of every filtered options
  filteredSelected?: OptionType[],
  formattedSelected?: { value: string | number; label: ReactNode },
  pinSelectedOptions = false,

  // liste des options sélectionnées au moment de l’ouverture du dropdown filtrés
  pinnedOptions?: Array<OptionType>,
): InternalOption<OptionType>[] {
  const internalOptions: InternalOption<OptionType>[] = [];

  const pinFiltered =
    pinnedOptions?.filter(
      (el) =>
        filteredSelected?.some(
          (filtered) => getValue(filtered) === getValue(el),
        ) || options.some((opt) => getValue(opt) === getValue(el)),
    ) || [];

  if (showSelected) {
    // Start with options which are selected but not in the list (in case of pagination)
    const optionsAdditionnalPinned =
      filteredSelected?.filter(
        (option) => !options?.some((opt) => getValue(opt) === getValue(option)),
      ) || [];

    let renderOptions = [...optionsAdditionnalPinned, ...options];

    if (pinSelectedOptions) {
      // Create 2 array from options, to separate the pinned and not pinned one (if containing in pinFiltered)
      const { pinned, notPinned } = options.reduce<{
        notPinned: Array<OptionType>;
        pinned: Array<OptionType>;
      }>(
        (acc, curr) => {
          const isPinned = pinFiltered.some(
            (option) => getValue(option) === getValue(curr),
          );

          acc[isPinned ? 'pinned' : 'notPinned'].push(curr);
          return acc;
        },
        { notPinned: [], pinned: [] },
      );

      renderOptions = [...optionsAdditionnalPinned, ...pinned, ...notPinned];
    }

    internalOptions.push(
      ...renderOptions.map((option) => {
        const value = getValue(option);
        return {
          type: 'option' as const,
          value: getValue(option),
          label: renderOption(option),
          originalValue: option,
          selected: selected.some(
            (selectedOption) => getValue(selectedOption) === value,
          ),
          removable: isOptionRemovable?.(option) || false,
        };
      }),
    );
  } else {
    const optionsToShow = options.filter((option) => {
      const value = getValue(option);
      return (
        value === formattedSelected?.value ||
        !selected.some((selectedOption) => getValue(selectedOption) === value)
      );
    });
    internalOptions.push(
      ...optionsToShow.map((option) => ({
        type: 'option' as const,
        value: getValue(option),
        label: renderOption(option),
        originalValue: option,
        selected: false,
        removable: isOptionRemovable?.(option) || false,
      })),
    );
  }
  if (createValue) {
    internalOptions.push({
      type: 'create',
      value: '___internal_create___',
      label: renderCreate(createValue),
      originalValue: createValue,
      selected: false,
      removable: false,
    });
  }

  return internalOptions;
}

export interface FormattedOptionProps<OptionType> {
  index: number;
  option: InternalOption<OptionType>;
  focused: number;
  setFocused: (index: number) => void;
  onSelect: (option: InternalOption<OptionType>) => void;
  highlightClassName: string;
  showSelected: boolean;
}

export function FormattedOption<OptionType>(
  props: FormattedOptionProps<OptionType>,
) {
  const { index, option, focused, setFocused, onSelect, showSelected } = props;
  const isFocused = focused === index;
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (isFocused) {
      ref.current?.scrollIntoView({ block: 'nearest' });
    }
  }, [isFocused]);

  return (
    <div
      ref={ref}
      className={clsx(
        isFocused ? props.highlightClassName : 'text-neutral-900',
        'py-2 px-4',
      )}
      onMouseMove={() => setFocused(index)}
      onClick={() => onSelect(option)}
    >
      {showSelected ? (
        <div className="flex items-center">
          {option.type === 'create' ? (
            <PlusCircleIcon className="-ml-0.5 mr-3 h-5 w-5 text-primary-600" />
          ) : (
            <Checkbox
              readOnly
              checked={option.selected}
              disabled={!option.removable}
              name={String(option.value)}
            />
          )}

          <div
            className={clsx({
              'text-neutral-500': !option.removable && option.selected,
            })}
          >
            {option.label}
          </div>
        </div>
      ) : option.selected ? null : (
        option.label
      )}
    </div>
  );
}

interface UseSearchSelectInternalsConfig<OptionType> {
  showSelected: boolean;
  selected: OptionType[];
  filteredSelected?: OptionType[];
  searchValue: string;
  onSearchChange: (newValue: string) => void;
  options: OptionType[];
  onSelect: (option: OptionType | undefined, remove?: boolean) => void;
  getValue: GetValue<OptionType>;
  renderOption: RenderOption<OptionType>;
  closeListOnSelect: boolean;
  clearSearchOnSelect: boolean;
  onCreate?: SearchSelectOnCreateCallback<OptionType>;
  canCreate: SearchSelectCanCreateCallback;
  renderCreate: SearchSelectRenderCreateCallback;
  isOptionRemovable?: IsOptionRemovableCallback<OptionType>;
  onBackspace?: () => void;
  pinSelectedOptions: boolean;
  formattedSelected?: { value: string | number; label: ReactNode };
}

export function useSearchSelectInternals<OptionType>(
  config: UseSearchSelectInternalsConfig<OptionType>,
): UseSearchSelectInternalsReturn<OptionType> {
  const {
    showSelected,
    selected,
    filteredSelected,
    searchValue,
    onSearchChange,
    options,
    onSelect,
    getValue,
    renderOption,
    closeListOnSelect,
    clearSearchOnSelect,
    onCreate,
    canCreate,
    formattedSelected,
    onBackspace,
    renderCreate,
    isOptionRemovable,
    pinSelectedOptions,
  } = config;

  const [isListOpen, openStateList, closeStateList] = useOnOff(false);
  const [focused, setFocused] = useState(0);
  const [pinnedOptions, setPinnedOptions] = useState<Array<OptionType>>([]);

  const mainRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(mainRef, closeStateList);

  const createValue =
    onCreate && searchValue && canCreate(searchValue) ? searchValue : undefined;

  const formattedOptions = useMemo(
    () =>
      buildInternalOptions(
        options,
        getValue,
        renderOption,
        renderCreate,
        selected,
        showSelected,
        isOptionRemovable,
        createValue,
        filteredSelected,
        formattedSelected,
        pinSelectedOptions,
        pinnedOptions,
      ),
    [
      options,
      getValue,
      renderOption,
      renderCreate,
      createValue,
      selected,
      isOptionRemovable,
      showSelected,
      filteredSelected,
      formattedSelected,
      pinSelectedOptions,
      pinnedOptions,
    ],
  );

  // Always reset focus to the first element if the options list has changed.
  useEffect(() => {
    if (formattedSelected) {
      for (let i = 0; i < options.length; i++) {
        if (formattedSelected.value === getValue(options[i])) {
          setFocused(i);
          return;
        }
      }
    }
    setFocused(0);
  }, [options, formattedSelected, getValue]);

  const { setReferenceElement, setPopperElement, popperProps } =
    useModifiedPopper<HTMLElement>({
      placement: 'bottom',
      offset: 6,
      sameWidth: true,
    });

  function openList() {
    setPinnedOptions(selected.slice());
    openStateList();
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (!isListOpen) {
      openList();
    }
    onSearchChange(event.target.value);
  }

  function selectOption(option: InternalOption<OptionType>): void {
    if (option.type === 'option') {
      if (option.selected) {
        if (option.removable) {
          onSelect(option.originalValue, true);
        }
        // Do not remove if not removable
      } else {
        onSelect(option.originalValue, false);
      }
    } else {
      onCreate?.(option.originalValue, onSelect);
    }
    if (closeListOnSelect) {
      closeStateList();
    }
    if (clearSearchOnSelect) {
      onSearchChange('');
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case 'ArrowUp':
        if (!isListOpen) {
          openList();
        } else {
          const previous = focused - 1;
          setFocused(previous >= 0 ? previous : formattedOptions.length - 1);
        }
        // Prevent moving the input cursor.
        event.preventDefault();
        break;
      case 'ArrowDown':
        if (!isListOpen) {
          openList();
        } else {
          setFocused((focused + 1) % formattedOptions.length);
        }
        // Prevent moving the input cursor.
        event.preventDefault();
        break;
      case 'Escape':
        onSearchChange('');
        if (isListOpen) {
          closeStateList();
        }
        break;
      case 'Enter':
        if (isListOpen && formattedOptions[focused]) {
          selectOption(formattedOptions[focused]);
        }
        // Prevent submitting the form.
        event.preventDefault();
        break;
      case ' ':
        if (searchValue === '') {
          if (isListOpen) {
            closeStateList();
          } else {
            openList();
          }
          event.preventDefault();
        }
        break;
      case 'Backspace':
        if (searchValue === '') {
          onBackspace?.();
        }
        break;
      default:
      // Ignore
    }
  }

  function handleChevronDownClick(event: MouseEvent) {
    if (isListOpen) {
      event.preventDefault();
      closeStateList();
    } else {
      openList();
    }
  }

  function handleXClick(event: MouseEvent) {
    event.preventDefault();
    onSelect(undefined);
  }

  return {
    mainRef,
    closeList: closeStateList,
    openList,
    isListOpen,
    formattedOptions,
    focused,
    setFocused,
    onSelect: selectOption,
    setReferenceElement,
    setPopperElement,
    popperProps,
    handleChange,
    handleKeyDown,
    handleChevronDownClick,
    handleXClick,
    showSelected,
  };
}

interface UseSearchSelectInternalsReturn<OptionType>
  extends UseModifiedPopperReturn<HTMLElement> {
  mainRef: Ref<HTMLDivElement>;
  closeList: () => void;
  openList: () => void;
  isListOpen: boolean;
  formattedOptions: InternalOption<OptionType>[];
  focused: number;
  showSelected: boolean;
  setFocused: (newFocus: number) => void;
  onSelect: (option: InternalOption<OptionType>) => void;
  handleChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  handleChevronDownClick: (event: MouseEvent) => void;
  handleXClick: (event: MouseEvent) => void;
}

interface InternalSearchSelectProps<OptionType>
  extends UseSearchSelectInternalsReturn<OptionType> {
  clearable?: boolean;
  disabled?: boolean;
  loading?: boolean;
  autoFocus?: boolean;
  noResultsHint?: ReactNode;
  error?: string;
  help?: string;
  label: string;
  hiddenLabel?: boolean;
  corner?: ReactNode;
  placeholder?: string;
  searchValue: string;
  formattedSelected?: { value: string | number; label: ReactNode };
  showSelected: boolean;
  hasClearableValue: boolean;
  highlightClassName?: string;
  required?: boolean;
  inputRef?: Ref<HTMLInputElement>;
  onBlur?: (e: React.FocusEvent) => void;
  name?: string;
  id?: string;
  size?: number;
}

export function InternalSearchSelect<OptionType>(
  props: InternalSearchSelectProps<OptionType>,
): JSX.Element {
  const {
    mainRef,
    inputRef,
    closeList,
    openList,
    isListOpen,
    formattedOptions,
    focused,
    setFocused,
    onSelect,
    setReferenceElement,
    setPopperElement,
    popperProps,
    handleChange,
    handleKeyDown,
    handleChevronDownClick,
    handleXClick,

    clearable = false,
    disabled = false,
    required = false,
    loading = false,
    autoFocus = false,
    noResultsHint = defaultNoResultsHint,
    error,
    help,
    label,
    hiddenLabel,
    corner,
    placeholder,
    searchValue,
    formattedSelected,
    hasClearableValue,
    name,
    onBlur,
    highlightClassName = '',
    showSelected = false,
    size,
  } = props;

  const finalHighlightClassName =
    highlightClassName ||
    (showSelected ? 'bg-neutral-200' : 'text-white bg-primary-600');
  return (
    <div ref={mainRef}>
      <Input
        autoFocus={autoFocus}
        ref={inputRef}
        required={required}
        wrapperRef={setReferenceElement}
        type="text"
        name={name || label}
        label={label}
        hiddenLabel={hiddenLabel}
        corner={corner}
        value={searchValue}
        disabled={disabled}
        size={size}
        error={error}
        help={help}
        autoComplete="off"
        onBlur={(event) => {
          onBlur?.(event);
          closeList();
        }}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onClick={openList}
        placeholder={placeholder}
        inlinePlaceholder={
          formattedSelected && !searchValue
            ? formattedSelected.label
            : undefined
        }
        trailingInlineAddon={
          <TrailingTools
            {...{
              loading,
              clearable,
              hasClearableValue,
              disabled,
              handleXClick,
              handleChevronDownClick,
            }}
          />
        }
      />

      {isListOpen && (
        <OptionsList
          {...{
            setPopperElement,
            popperProps,
            formattedOptions,
            noResultsHint,
            focused,
            setFocused,
            onSelect,
            highlightClassName: finalHighlightClassName,
            showSelected,
          }}
        />
      )}
    </div>
  );
}

interface InternalMultiSearchSelectProps<OptionType>
  extends InternalSearchSelectProps<OptionType> {
  selectedBadges?: ReactNode[];
  showSelected: boolean;
}
export function InternalMultiSearchSelect<OptionType>(
  props: InternalMultiSearchSelectProps<OptionType>,
): JSX.Element {
  const {
    mainRef,
    inputRef,
    closeList,
    openList,
    isListOpen,
    formattedOptions,
    focused,
    setFocused,
    onSelect,
    setReferenceElement,
    setPopperElement,
    popperProps,
    handleChange,
    handleKeyDown,
    handleChevronDownClick,
    handleXClick,

    clearable = false,
    disabled = false,
    required = false,
    loading = false,
    autoFocus = false,
    noResultsHint,
    error,
    help,
    label,
    hiddenLabel,
    corner,
    placeholder,
    searchValue,
    selectedBadges,
    hasClearableValue,
    name,
    id = name,
    onBlur,
    highlightClassName,
    showSelected = false,
  } = props;

  const finalHighlightClassName =
    highlightClassName ||
    (showSelected ? 'bg-neutral-200' : 'text-white bg-primary-600');
  return (
    <div ref={mainRef} className="flex flex-col">
      <div className="flex items-baseline justify-between gap-2">
        <Label
          id={id}
          text={label}
          hidden={hiddenLabel}
          required={required}
          disabled={disabled}
        />
        <InputCorner>{corner}</InputCorner>
      </div>
      <label
        ref={setReferenceElement}
        htmlFor={id}
        className={clsx(
          'border py-2 px-3 focus-within:ring-1',
          'relative flex flex-1 flex-row text-base shadow-sm sm:text-sm',
          'rounded-md',
          {
            'mt-1': !hiddenLabel || corner,
            [inputColor]: !error,
            [inputError]: error,
            'bg-neutral-50 text-neutral-500': disabled,
            'bg-white': !disabled,
          },
        )}
      >
        <div className="flex flex-1 flex-row flex-wrap gap-1.5">
          {selectedBadges}
          <input
            id={id}
            ref={inputRef}
            type="text"
            name={name || label}
            value={searchValue}
            size={Math.max(5, placeholder?.length || 0, searchValue.length)}
            disabled={disabled}
            autoFocus={autoFocus}
            autoComplete="off"
            onBlur={(event) => {
              onBlur?.(event);
              closeList();
            }}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onClick={openList}
            placeholder={placeholder}
            className={clsx(
              {
                'flex-1 border-none p-0 focus:outline-none focus:ring-0 sm:text-sm':
                  true,
                'bg-neutral-50 text-neutral-500': disabled,
              },
              error ? 'placeholder-danger-300' : 'placeholder-neutral-400',
            )}
          />
        </div>
        <TrailingTools
          {...{
            loading,
            clearable,
            hasClearableValue,
            hasError: Boolean(error),
            disabled,
            handleXClick,
            handleChevronDownClick,
          }}
        />
      </label>
      <Help error={error} help={help} />
      {isListOpen && (
        <OptionsList
          {...{
            setPopperElement,
            popperProps,
            formattedOptions,
            noResultsHint,
            focused,
            setFocused,
            onSelect,
            highlightClassName: finalHighlightClassName,
            showSelected,
          }}
        />
      )}
    </div>
  );
}

type OptionsListProps<OptionType> = Pick<
  UseSearchSelectInternalsReturn<OptionType>,
  | 'setPopperElement'
  | 'popperProps'
  | 'formattedOptions'
  | 'focused'
  | 'setFocused'
  | 'onSelect'
> &
  Pick<
    InternalSearchSelectProps<OptionType>,
    'noResultsHint' | 'highlightClassName'
  > & {
    showSelected: boolean;
  };

function OptionsList<OptionType>(props: OptionsListProps<OptionType>) {
  const {
    setPopperElement,
    popperProps,
    formattedOptions,
    noResultsHint = defaultNoResultsHint,
    focused,
    setFocused,
    onSelect,
    highlightClassName = 'text-white bg-primary-600',
    showSelected,
  } = props;
  const finalFormattedOptions = showSelected
    ? formattedOptions
    : formattedOptions.filter((option) => !option.selected);
  return (
    <div
      ref={setPopperElement}
      {...popperProps}
      className="z-20 max-h-60 w-full cursor-default overflow-auto rounded-md bg-white py-1 text-base shadow-lg sm:text-sm"
      // Prevent click in the options list from blurring the input,
      // because that would close the list.
      onMouseDown={preventDefault}
    >
      {finalFormattedOptions.length === 0 ? (
        <div className="p-2">{noResultsHint}</div>
      ) : (
        finalFormattedOptions.map((option, index) => (
          <FormattedOption
            key={option.value}
            index={index}
            option={option}
            focused={focused}
            setFocused={setFocused}
            onSelect={onSelect}
            highlightClassName={highlightClassName}
            showSelected={showSelected}
          />
        ))
      )}
    </div>
  );
}

interface TrailingToolsProps {
  loading?: boolean;
  clearable?: boolean;
  hasClearableValue: boolean;
  hasError?: boolean;
  disabled?: boolean;
  handleXClick: (event: MouseEvent) => void;
  handleChevronDownClick: (event: MouseEvent) => void;
}

function TrailingTools(props: TrailingToolsProps) {
  const {
    loading,
    clearable,
    hasClearableValue,
    hasError,
    disabled,
    handleXClick,
    handleChevronDownClick,
  } = props;
  return (
    <div className="inline-flex cursor-default flex-row items-center text-neutral-400">
      {loading && <Spinner className="mr-1 h-5 w-5 text-neutral-400" />}
      {clearable && hasClearableValue && !disabled && (
        <XMarkIcon
          className="h-4 w-4 hover:text-neutral-500"
          onClick={handleXClick}
        />
      )}
      {/* font-mono so the vertical bar is vertically aligned with the SVG */}
      <span className="mx-1 font-mono font-light">{` | `}</span>
      <ChevronDownIcon
        className={clsx({
          'h-5 w-5': true,
          'hover:text-neutral-500': !disabled,
        })}
        onMouseDown={preventDefault}
        onClick={disabled ? undefined : handleChevronDownClick}
      />
      {hasError && <InputErrorIcon />}
    </div>
  );
}
