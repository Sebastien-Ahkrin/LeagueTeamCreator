import { Placement } from '@popperjs/core';
import { HTMLAttributes, useState } from 'react';
import { Modifier, usePopper } from 'react-popper';

const sameWidth: Modifier<'sameWidth'> = {
  name: 'sameWidth',
  enabled: true,
  phase: 'beforeWrite',
  requires: ['computeStyles'],
  fn: ({ state }) => {
    state.styles.popper.width = `${state.rects.reference.width}px`;
  },
  effect: ({ state }) => {
    state.elements.popper.style.width = `${
      state.elements.reference.getBoundingClientRect().width
    }px`;
  },
};

export interface UseModifiedPopperReturn<
  R extends Element = HTMLDivElement,
  P extends HTMLElement = HTMLDivElement,
> {
  setReferenceElement: (ref: R | null) => void;
  setPopperElement: (popper: P | null) => void;
  popperProps: HTMLAttributes<P>;
}

export function useModifiedPopper<
  R extends Element = HTMLDivElement,
  P extends HTMLElement = HTMLDivElement,
>(options: {
  placement?: Placement;
  offset?: number;
  sameWidth?: boolean;
}): UseModifiedPopperReturn<R, P> {
  const [referenceElement, setReferenceElement] = useState<R | null>(null);
  const [popperElement, setPopperElement] = useState<P | null>(null);

  const modifiers: Modifier<'sameWidth' | 'offset'>[] = [];

  if (options.sameWidth) {
    modifiers.push(sameWidth);
  }

  if (options.offset) {
    modifiers.push({
      name: 'offset',
      options: {
        offset: [0, options.offset],
      },
    });
  }

  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: options.placement,
    strategy: 'fixed',
    modifiers,
  });

  return {
    setReferenceElement,
    setPopperElement,
    popperProps: {
      style: styles.popper,
      ...attributes.popper,
    },
  };
}
