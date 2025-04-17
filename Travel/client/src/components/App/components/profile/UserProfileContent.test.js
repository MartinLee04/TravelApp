import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserProfileContent from './UserProfileContent';

// Mock axios to avoid actual API calls
jest.mock('axios', () => ({
  post: jest.fn(() => Promise.resolve({ data: [] }))
}));

// Mock the local path
jest.mock('../../localpath', () => ({
  localpath: 'http://test-server'
}));

// Mock PreferencesSurvey component
jest.mock('./PreferencesSurvey', () => {
  return function MockPreferencesSurvey() {
    return <div data-testid="preferences-mock">Preferences Survey</div>;
  };
});

describe('UserProfileContent', () => {
  const mockUserInfo = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    phone_number: '123-456-7890',
    languages_spoken: 'English'
  };
  
  const mockHandleLogout = jest.fn();

  test('renders user greeting with username', async () => {
    render(<UserProfileContent userInfo={mockUserInfo} handleLogout={mockHandleLogout} />);
    
    // Use waitFor to properly handle async state updates
    await waitFor(() => {
      expect(screen.getByText(/Hello, testuser!/i)).toBeInTheDocument();
    });
  });

  test('displays user information section', async () => {
    render(<UserProfileContent userInfo={mockUserInfo} handleLogout={mockHandleLogout} />);
    
    await waitFor(() => {
      expect(screen.getByText(/User Information/i)).toBeInTheDocument();
      expect(screen.getByText(/Username:/i)).toBeInTheDocument();
    });
  });

  test('shows logout button', async () => {
    render(<UserProfileContent userInfo={mockUserInfo} handleLogout={mockHandleLogout} />);
    
    await waitFor(() => {
      const logoutButton = screen.getByText('Logout');
      expect(logoutButton).toBeInTheDocument();
    });
  });

  test('renders tab navigation', () => {
    render(<UserProfileContent userInfo={mockUserInfo} handleLogout={mockHandleLogout} />);
    
    expect(screen.getByText(/My Blogs/i)).toBeInTheDocument();
    expect(screen.getByText(/Saved Flights/i)).toBeInTheDocument();
    expect(screen.getByText(/My Preferences/i)).toBeInTheDocument();
  });

  test('shows user email in the profile information', async () => {
    render(<UserProfileContent userInfo={mockUserInfo} handleLogout={mockHandleLogout} />);
    await waitFor(() => {
      expect(screen.getByText(/Email:/i)).toBeInTheDocument();
    });
  });
  
  test('shows user name in the profile information', async () => {
    render(<UserProfileContent userInfo={mockUserInfo} handleLogout={mockHandleLogout} />);
    await waitFor(() => {
      expect(screen.getByText("Name:")).toBeInTheDocument();
    });
  });
  
  test('shows user phone in the profile information', async () => {
    render(<UserProfileContent userInfo={mockUserInfo} handleLogout={mockHandleLogout} />);
    await waitFor(() => {
      expect(screen.getByText("Phone:")).toBeInTheDocument();
    });
  });
}); 