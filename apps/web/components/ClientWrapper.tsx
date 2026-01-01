import { useEffect, useState } from 'react';

interface ClientWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * ClientWrapper - Ensures components only render on the client side
 * This prevents SSR hydration issues with components that use browser-specific APIs
 */
const ClientWrapper: React.FC<ClientWrapperProps> = ({ children, fallback = null }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default ClientWrapper;
