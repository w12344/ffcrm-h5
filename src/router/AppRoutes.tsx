import { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import AuthRouteWrapper from './AuthRouteWrapper';
import { routes } from './routes';

const LoginComponent = routes.find((r) => r.path === '/login')?.component;

const AppRoutes = () => {
  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>加载中...</div>}>
      <Routes>
        {/* 登录页 - 独立全屏布局，无需 Layout */}
        <Route
          path="/login"
          element={
            <AuthRouteWrapper noAuth>
              {LoginComponent && <LoginComponent />}
            </AuthRouteWrapper>
          }
        />
        
        {/* 其他路由 - 需要认证，使用 Layout */}
        {routes
          .filter((r) => r.path !== '/login')
          .map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                <AuthRouteWrapper noAuth={!!route.meta?.noAuth}>
                  <Layout>
                    <route.component />
                  </Layout>
                </AuthRouteWrapper>
              }
            />
          ))}
        
        {/* 默认重定向到仪表板 */}
        <Route
          path="/"
          element={
            <AuthRouteWrapper>
              <Navigate to="/dashboard" replace />
            </AuthRouteWrapper>
          }
        />
        
        {/* 404页面 */}
        <Route
          path="*"
          element={
            <AuthRouteWrapper>
              <Navigate to="/dashboard" replace />
            </AuthRouteWrapper>
          }
        />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;