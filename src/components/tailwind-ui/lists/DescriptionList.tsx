import { PaperClipIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { ReactNode } from 'react';

interface DescriptionListAttribute {
  title: string;
  details?: ReactNode;
}

interface DescriptionListSection {
  title: string;
  attributes: DescriptionListAttribute[];
}

export type DescriptionListProps =
  | FlatDescriptionListProps
  | GroupedDescriptionListProps;

export interface FlatDescriptionListProps {
  type: 'flat';
  title: ReactNode;
  subtitle?: ReactNode;
  stripes?: boolean;
  attributes: DescriptionListAttribute[];
}

export interface GroupedDescriptionListProps {
  type: 'grouped';
  title: ReactNode;
  subtitle?: ReactNode;
  attributes: DescriptionListSection[];
}

export function DescriptionList(props: DescriptionListProps) {
  const { title, subtitle } = props;
  let count = 0;
  const stripes = isGrouped(props) ? false : props.stripes;
  const list = getList(props);
  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg font-semibold leading-6 text-neutral-900">
          {title}
        </h3>
        <div className="mt-1 max-w-2xl text-sm text-neutral-500">
          {subtitle}
        </div>
      </div>

      {list.map((el) => {
        return (
          <div
            className="border-t border-neutral-200 px-4 py-3 sm:p-0"
            key={el.title}
          >
            <dl className="sm:divide-y sm:divide-neutral-200">
              {el.title && (
                <AttributeSection
                  attribute={el}
                  dark={stripes ? count++ % 2 === 0 : true}
                />
              )}
              {el.attributes.map((element) => (
                <Attribute
                  attribute={element}
                  key={element.title}
                  dark={stripes ? count++ % 2 === 0 : false}
                />
              ))}
            </dl>
          </div>
        );
      })}
    </div>
  );
}

interface AttributeProps {
  attribute: DescriptionListAttribute;
  dark: boolean;
}

interface AttributeSectionProps {
  attribute: DescriptionListSection;
  dark: boolean;
}

function AttributeSection(props: AttributeSectionProps) {
  return (
    <div
      className={clsx(
        'py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:border-b sm:border-neutral-200 sm:py-3 sm:px-6',
        props.dark ? 'sm:bg-neutral-50' : 'bg-white',
      )}
    >
      <div className="text-sm font-semibold text-neutral-700">
        {props.attribute.title}
      </div>
    </div>
  );
}

function Attribute(props: AttributeProps) {
  const { attribute, dark } = props;
  return (
    <div
      className={clsx(
        'py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6',
        dark ? 'bg-white sm:bg-neutral-50' : '',
      )}
    >
      <dt className="text-sm font-semibold text-neutral-500">
        {attribute.title}
      </dt>
      <dd className="mt-1 text-sm text-neutral-900 sm:col-span-2 sm:mt-0">
        {attribute.details}
      </dd>
    </div>
  );
}

function getList(props: DescriptionListProps): DescriptionListSection[] {
  if (isGrouped(props)) {
    return props.attributes;
  } else {
    return [
      {
        title: '',
        attributes: props.attributes,
      },
    ];
  }
}

function isGrouped(
  props: DescriptionListProps,
): props is GroupedDescriptionListProps {
  return props.type === 'grouped';
}

interface Attachment extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  filename: string;
}

interface DescriptionAttachmentListProps {
  attachments: Attachment[];
}

export function DescriptionAttachmentList(
  props: DescriptionAttachmentListProps,
) {
  return (
    <ul className="divide-y divide-neutral-200 rounded-md border border-neutral-200">
      {props.attachments.map((attachment) => (
        <li
          key={attachment.filename}
          className="flex items-center justify-between py-3 pl-3 pr-4 text-sm"
        >
          <div className="flex w-0 flex-1 items-center">
            <PaperClipIcon className="h-5 w-5 shrink-0 text-neutral-400" />
            <span className="ml-2 w-0 flex-1 truncate">
              {attachment.filename}
            </span>
          </div>
          <div className="ml-4 shrink-0">
            <a
              {...attachment}
              className="font-semibold text-primary-600 hover:text-primary-500"
            >
              Download
            </a>
          </div>
        </li>
      ))}
    </ul>
  );
}
