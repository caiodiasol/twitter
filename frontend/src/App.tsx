import React, { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import TestPage from './pages/TestPage';

interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  console.log('PrivateRoute: isAuthenticated =', isAuthenticated, 'loading =', loading);
  
  if (loading) {
    console.log('PrivateRoute: Still loading...');
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }
  
  if (isAuthenticated) {
    console.log('PrivateRoute: User is authenticated, rendering children');
    return <>{children}</>;
  } else {
    console.log('PrivateRoute: User not authenticated, redirecting to signin');
    return <Navigate to="/signin" />;
  }
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/test" element={<TestPage />} />
            <Route 
              path="/" 
              element={
                <PrivateRoute>
                  <Feed />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;