import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from '@components/common/PrivateRoute';
import { MainLayout } from '@components/layout/MainLayout';
import { FullPageSpinner } from '@components/ui/FullPageSpinner';
import { publicRoutes, privateRoutes } from './routes';

const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<FullPageSpinner />}>{children}</Suspense>
);

export const AppRoutes = () => (
  <Routes>
    {/* Публічні */}
    {publicRoutes.map(({ path, component: Component }) => (
      <Route
        key={path}
        path={path}
        element={
          <SuspenseWrapper>
            <Component />
          </SuspenseWrapper>
        }
      />
    ))}

    {/* Приватні */}
    <Route element={<PrivateRoute />}>
      <Route element={<MainLayout />}>
        {privateRoutes.map(({ path, component: Component, redirect, roles }) =>
          redirect ? (
            <Route key={path} path={path} element={<Navigate to={redirect} replace />} />
          ) : (
            <Route
              key={path}
              path={path}
              element={
                <PrivateRoute requiredRole={roles}>
                  <SuspenseWrapper>
                    <Component />
                  </SuspenseWrapper>
                </PrivateRoute>
              }
            />
          )
        )}
      </Route>
    </Route>

    {/* 404 */}
    <Route path="*" element={<SuspenseWrapper><NotFoundPage /></SuspenseWrapper>} />
  </Routes>
);