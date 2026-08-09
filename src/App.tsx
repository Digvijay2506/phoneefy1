import { useState, useEffect } from 'react';
import AdminApp from './admin/AdminApp';
import CustomerApp from './CustomerApp';
import { ShopkeeperSessionProvider } from './contexts/ShopkeeperSessionContext';
import { CustomerSessionProvider } from './contexts/CustomerSessionContext';

export default function App() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  if (path.startsWith('/admin')) {
    return <AdminApp />;
  }

  return (
    <ShopkeeperSessionProvider>
      <CustomerSessionProvider>
        <CustomerApp />
      </CustomerSessionProvider>
    </ShopkeeperSessionProvider>
  );
}
