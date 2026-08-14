import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClientProvider } from 'react-query';
import { queryClient } from './lib/queries';
import { AuthProvider } from './context/AuthContext';
import { TransitionProvider } from './context/TransitionContext';
import AppShell from './components/layout/AppShell';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import RequireAuth from './components/RequireAuth';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Markets from './pages/Markets';
import AssetDetail from './pages/AssetDetail';
import Insights from './pages/Insights';
import Portfolio from './pages/Portfolio';
import Settings from './pages/Settings';
import DesignSystem from './pages/DesignSystem';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
      <AuthProvider>
        <Router>
        <TransitionProvider>
        <Routes>
          {/* Full-bleed surfaces (their own chrome) */}
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Product surfaces inside the app shell */}
          <Route element={<AppShell />}>
            <Route
              path="/"
              element={
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              }
            />
            <Route path="/markets" element={<Markets />} />
            <Route path="/markets/:symbol" element={<AssetDetail />} />
            <Route path="/insights" element={<Insights />} />
            <Route
              path="/portfolio"
              element={
                <RequireAuth>
                  <Portfolio />
                </RequireAuth>
              }
            />
            <Route
              path="/settings"
              element={
                <RequireAuth>
                  <Settings />
                </RequireAuth>
              }
            />
            <Route path="/design-system" element={<DesignSystem />} />
          </Route>

          {/* 404 — standalone, viewport-locked (no scroll) */}
          <Route path="*" element={<NotFound />} />
          </Routes>
        </TransitionProvider>
        </Router>
      </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
