import {
  BarsArrowUpIcon,
  BarsArrowDownIcon,
  Bars3Icon,
} from '@heroicons/react/20/solid';
import clsx from 'clsx';
import {
  createContext,
  Fragment,
  ReactNode,
  TdHTMLAttributes,
  ThHTMLAttributes,
  useContext,
  useMemo,
} from 'react';

import { TableSortDirection, TableSortConfig } from '..';
import { Pagination, PaginationProps } from '../elements/pagination/Pagination';

export interface TableProps<T> {
  data: Array<T>;
  renderTr: (value: T, index: number) => ReactNode;
  renderEmpty?: () => ReactNode;
  renderHeader?: () => ReactNode;
  pagination?: PaginationProps;
  itemsPerPage?: number;
  tableStyle?: React.CSSProperties;
  tableClassName?: string;
  sort?: TableSortConfig;
  getId?: IdGetter<T>;
}

export interface TablePropsWithIdGetter<T> extends TableProps<T> {
  getId: IdGetter<T>;
}

type IdGetter<T> = (value: T) => string | number;

interface DataWithId {
  id: string | number;
}

function defaultGetId<T extends DataWithId>(value: T) {
  return value.id;
}

interface TableContext {
  sort?: TableSortConfig;
}

const defaultTableContext: TableContext = {};

const tableContext = createContext<TableContext>(defaultTableContext);

export function Table<T>(
  props: T extends DataWithId ? TableProps<T> : TablePropsWithIdGetter<T>,
) {
  const {
    data,
    renderTr,
    renderEmpty,
    renderHeader,
    pagination,
    tableStyle,
    tableClassName,
    sort,
    getId = defaultGetId,
  } = props;

  const contextValue = useMemo(() => ({ sort }), [sort]);

  if (data.length === 0) {
    return renderEmpty ? <>{renderEmpty()}</> : null;
  }

  return (
    <tableContext.Provider value={contextValue}>
      <div className="flex flex-col">
        <div>
          <div className="inline-block min-w-full border-b border-neutral-200 align-middle shadow sm:rounded-lg">
            <table
              style={tableStyle}
              className={clsx(
                'min-w-full divide-y divide-neutral-200',
                tableClassName,
              )}
            >
              {renderHeader && <thead>{renderHeader()}</thead>}
              <tbody className="divide-y divide-neutral-200 bg-white">
                {data.map((value, index) => (
                  <Fragment key={getId(value)}>
                    {renderTr(value, index)}
                  </Fragment>
                ))}
              </tbody>
            </table>
            {pagination &&
              (pagination.itemsPerPage <= pagination.totalCount ||
                pagination.withText) && (
                <div className="border-t border-neutral-200 px-4 py-3 sm:px-6">
                  <Pagination {...pagination} />
                </div>
              )}
          </div>
        </div>
      </div>
    </tableContext.Provider>
  );
}

export interface TdProps extends TdHTMLAttributes<HTMLTableDataCellElement> {
  compact?: boolean;
}

export interface ThProps extends ThHTMLAttributes<HTMLTableHeaderCellElement> {
  compact?: boolean;
  sortField?: string;
}

export function Td(props: TdProps) {
  const { className, compact, ...otherProps } = props;
  return (
    <td
      className={clsx(
        'whitespace-nowrap text-sm font-semibold text-neutral-900',
        { 'px-6 py-4': !compact },
        props.className,
      )}
      {...otherProps}
    />
  );
}

export function Th(props: ThProps) {
  const { compact, sortField, className, children, ...otherProps } = props;
  const { sort } = useContext(tableContext);

  let handleClick, sortedClass, sortElement;
  if (sortField && sort) {
    handleClick = () => sort.onChange(sortField);
    sortedClass = 'cursor-pointer';
    if (sortField === sort.field) {
      sortElement =
        sort.direction === TableSortDirection.ASCENDING ? (
          <BarsArrowUpIcon className="h-4 w-4" />
        ) : (
          <BarsArrowDownIcon className="h-4 w-4" />
        );
    } else {
      sortElement = <Bars3Icon className="h-4 w-4" />;
    }
  }

  return (
    <th
      className={clsx(
        'bg-neutral-50 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500',
        {
          'px-6 py-3': !compact,
        },
        className,
        sortedClass,
      )}
      onClick={handleClick}
      {...otherProps}
    >
      <div className="flex gap-x-1">
        {children}
        {sortElement}
      </div>
    </th>
  );
}
