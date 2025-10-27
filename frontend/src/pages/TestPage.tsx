import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const TestPage: React.FC = () => {
  const { user, isAuthenticated, login, register } = useAuth();
  const [testData, setTestData] = useState({
    username: 'testuser123',
    password: 'testpass123',
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User'
  });

  const handleTestRegister = async () => {
    console.log('Testing registration...');
    const success = await register(testData);
    console.log('Registration result:', success);
  };

  const handleTestLogin = async () => {
    console.log('Testing login...');
    const success = await login(testData.username, testData.password);
    console.log('Login result:', success);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Page</h1>
      
      <div className="mb-4">
        <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
        <p><strong>User:</strong> {user ? user.username : 'None'}</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Username:</label>
          <input
            type="text"
            value={testData.username}
            onChange={(e) => setTestData({...testData, username: e.target.value})}
            className="border rounded px-3 py-2 w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Password:</label>
          <input
            type="password"
            value={testData.password}
            onChange={(e) => setTestData({...testData, password: e.target.value})}
            className="border rounded px-3 py-2 w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Email:</label>
          <input
            type="email"
            value={testData.email}
            onChange={(e) => setTestData({...testData, email: e.target.value})}
            className="border rounded px-3 py-2 w-full"
          />
        </div>

        <div className="flex space-x-4">
          <button
            onClick={handleTestRegister}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Test Register
          </button>
          
          <button
            onClick={handleTestLogin}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Test Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
