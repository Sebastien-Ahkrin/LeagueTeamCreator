import { Tab } from '@headlessui/react';
import clsx from 'clsx';
import { ReactNode } from 'react';

export interface SwitchTabsItems {
  title: ReactNode;
  content: ReactNode;

  icon?: ReactNode;
  disabled?: boolean;
}

export interface SwitchTabsProps {
  tabs: Array<SwitchTabsItems>;
  align?: 'left' | 'center' | 'right';
}

export function SwitchTabs(props: SwitchTabsProps) {
  const { tabs, align = 'left' } = props;

  return (
    <Tab.Group>
      <div
        className={clsx('flex', {
          'justify-start': align === 'left',
          'justify-end': align === 'right',
          'justify-center': align === 'center',
        })}
      >
        <Tab.List
          className={clsx(
            'flex flex-row items-center gap-2 rounded-lg bg-neutral-100 p-1',
          )}
        >
          {tabs.map((tab, index) => (
            <Tab
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              disabled={tab.disabled}
              className="rounded-md focus:outline-none focus:ring-2"
            >
              {({ selected }) => {
                return (
                  <span
                    className={clsx(
                      'flex items-center rounded-md py-1 px-2 text-sm font-semibold',
                      {
                        'lg:pr-3': tab.icon,
                        'bg-white shadow': selected,
                      },
                    )}
                  >
                    <div
                      className={clsx('flex flex-row items-center gap-1', {
                        'text-neutral-500': tab.disabled,
                      })}
                    >
                      {tab.icon && (
                        <span
                          className={clsx('h-5 w-5', {
                            'text-primary-500': selected,
                          })}
                        >
                          {tab.icon}
                        </span>
                      )}
                      <span>{tab.title}</span>
                    </div>
                  </span>
                );
              }}
            </Tab>
          ))}
        </Tab.List>
      </div>
      <Tab.Panels>
        {tabs.map((tab, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <Tab.Panel key={index} className="focus:outline-none">
            {tab.content}
          </Tab.Panel>
        ))}
      </Tab.Panels>
    </Tab.Group>
  );
}
