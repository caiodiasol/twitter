import React from 'react';
import { render } from '@testing-library/react';

// Mock simples para evitar problemas de dependências
jest.mock('./contexts/AuthContext', () => ({
  AuthProvider: ({ children }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    loading: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    updateUser: jest.fn(),
  }),
}));

jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div data-testid="router">{children}</div>,
  Routes: ({ children }) => <div data-testid="routes">{children}</div>,
  Route: ({ children }) => <div data-testid="route">{children}</div>,
  Navigate: () => <div data-testid="navigate" />,
}));

// Mock dos componentes de página para evitar problemas
jest.mock('./pages/SignIn', () => () => <div data-testid="signin">SignIn</div>);
jest.mock('./pages/SignUp', () => () => <div data-testid="signup">SignUp</div>);
jest.mock('./pages/Feed', () => () => <div data-testid="feed">Feed</div>);
jest.mock('./pages/Profile', () => () => (
  <div data-testid="profile">Profile</div>
));
jest.mock('./pages/UserProfilePage', () => () => (
  <div data-testid="user-profile">UserProfile</div>
));

describe('App', () => {
  test('renders without crashing', () => {
    // Importar App depois dos mocks
    const App = require('./App').default;

    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });

  test('renders auth provider', () => {
    const App = require('./App').default;

    const { getByTestId } = render(<App />);
    expect(getByTestId('auth-provider')).toBeInTheDocument();
  });
});
