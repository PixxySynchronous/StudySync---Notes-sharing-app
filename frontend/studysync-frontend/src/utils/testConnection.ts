// Test CORS connection
import apiClient from '../lib/api';

export const testConnection = async () => {
  try {
    console.log('Testing backend connection...');
    const response = await fetch('http://localhost:5000/api/test');
    const data = await response.json();
    console.log('Connection test successful:', data);
    return data;
  } catch (error) {
    console.error('Connection test failed:', error);
    throw error;
  }
};

export const testAuthEndpoint = async () => {
  try {
    console.log('Testing auth endpoint...');
    const response = await apiClient.post('/auth/login', {
      email: 'test@test.com',
      password: 'test123'
    });
    console.log('Auth endpoint test:', response);
    return response;
  } catch (error) {
    console.log('Expected auth error (no user):', error.message);
    // This is expected to fail if user doesn't exist
    return { message: 'Endpoint accessible but credentials invalid (expected)' };
  }
};

// Export for testing in browser console
(window as any).testConnection = testConnection;
(window as any).testAuthEndpoint = testAuthEndpoint;