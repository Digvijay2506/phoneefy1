import React from 'react';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ShopProvider } from './contexts/ShopContext';
import { AppLayout } from './components/layout/AppLayout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Shops from './pages/Shops';
import AddShop from './pages/AddShop';
import ShopProfile from './pages/ShopProfile';
import Verification from './pages/Verification';
import Requests from './pages/Requests';
import Credentials from './pages/Credentials';
import Inventory from './pages/Inventory';
import Subscriptions from './pages/Subscriptions';
import Complaints from './pages/Complaints';
import Notifications from './pages/Notifications';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import ActivityLogs from './pages/ActivityLogs';
import ImeiVerification from './pages/ImeiVerification';
import CeirVerification from './pages/CeirVerification';

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) return <Login />;
  return (
    <AppLayout>
      <Component />
    </AppLayout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">
        <ProtectedRoute component={Dashboard} />
      </Route>
      {/* /shops/add must come BEFORE /shops/:id so "add" is not matched as an id */}
      <Route path="/shops/add">
        <ProtectedRoute component={AddShop} />
      </Route>
      <Route path="/shops/:id">
        <ProtectedRoute component={ShopProfile} />
      </Route>
      <Route path="/shops">
        <ProtectedRoute component={Shops} />
      </Route>
      <Route path="/verification">
        <ProtectedRoute component={Verification} />
      </Route>
      <Route path="/requests">
        <ProtectedRoute component={Requests} />
      </Route>
      <Route path="/credentials">
        <ProtectedRoute component={Credentials} />
      </Route>
      <Route path="/inventory">
        <ProtectedRoute component={Inventory} />
      </Route>
      <Route path="/subscriptions">
        <ProtectedRoute component={Subscriptions} />
      </Route>
      <Route path="/complaints">
        <ProtectedRoute component={Complaints} />
      </Route>
      <Route path="/notifications">
        <ProtectedRoute component={Notifications} />
      </Route>
      <Route path="/analytics">
        <ProtectedRoute component={Analytics} />
      </Route>
      <Route path="/settings">
        <ProtectedRoute component={Settings} />
      </Route>
      <Route path="/activity-logs">
        <ProtectedRoute component={ActivityLogs} />
      </Route>
      <Route path="/imei-verification">
        <ProtectedRoute component={ImeiVerification} />
      </Route>
      <Route path="/ceir-verification">
        <ProtectedRoute component={CeirVerification} />
      </Route>
      <Route>
        <div className="flex h-screen items-center justify-center text-muted-foreground">
          404 — Page Not Found
        </div>
      </Route>
    </Switch>
  );
}

export default function AdminApp() {
  return (
    <div className="admin-shell dark min-h-screen">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <ShopProvider>
              <WouterRouter base="/admin">
                <Router />
              </WouterRouter>
            </ShopProvider>
          </AuthProvider>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </div>
  );
}
