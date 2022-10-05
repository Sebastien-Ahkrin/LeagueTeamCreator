import React, { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout(props: LayoutProps) {
  const { children } = props;

  return (
    <div className="mx-auto flex h-screen flex-1 flex-row bg-primary-700 py-5 px-24 text-white">
      {children}
    </div>
  );
}

Layout.Container = function LayoutContainer(props: LayoutProps) {
  return <div className="flex flex-1">{props.children}</div>;
};

Layout.Cards = function LayoutCards(props: LayoutProps) {
  return (
    <div className="flex max-h-screen max-w-md flex-col gap-3 overflow-auto">
      {props.children}
    </div>
  );
};
