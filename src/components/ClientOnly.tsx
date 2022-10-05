import { ReactNode, useState, useEffect } from 'react';

export function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return hasMounted;
}

interface ClientOnlyProps {
  children: ReactNode;
}

export function ClientOnly(props: ClientOnlyProps): JSX.Element | null {
  const isMounted = useHasMounted();

  if (!isMounted) {
    return null;
  }

  return <>{props.children}</>;
}
