import { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { routes } from './routes';

const AppRoutes = () => {
  return (
    <Suspense fallback={<div className="loading">加载中...</div>}>
      <Routes>
        {routes.map((route) => (
          <Route    
            key={route.path}
            path={route.path}
            element={<route.component />}
          />
        ))}
        
        {/* 默认重定向到顾问列表页 */}
        <Route path="/" element={<Navigate to="/advisors" replace />} />
        
        {/* 404页面 */}
        <Route path="*" element={<Navigate to="/advisors" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;