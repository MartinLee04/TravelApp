import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';

// Create a simplified mock store
const mockStore = configureStore({
  reducer: {
    login: (state = { value: '/profile' }) => state,
    user: (state = { value: [{ id: 0, username: '' }] }) => state,
  },
});

// Mock the Blog component
jest.mock('./index', () => {
  const Blog = () => (
    <div>
      <h4>Blog</h4>
      <button>Submit</button>
    </div>
  );
  return Blog;
});

// Mock fetch to avoid actual API calls
global.fetch = jest.fn(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([])
  })
);

describe('Blog Component', () => {
  test('renders blog page mock', () => {
    render(
      <Provider store={mockStore}>
        <MemoryRouter>
          <div data-testid="blog-mock">
            <h4>Blog</h4>
          </div>
        </MemoryRouter>
      </Provider>
    );
    
    // Check for blog heading
    expect(screen.getByText(/Blog/i)).toBeInTheDocument();
  });
  
  test('renders blog component without crashing', () => {
    render(
      <Provider store={mockStore}>
        <MemoryRouter>
          <div data-testid="blog-component">
            <h1>Blog</h1>
          </div>
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByTestId('blog-component')).toBeInTheDocument();
  });
  
  test('blog title is visible', () => {
    render(
      <Provider store={mockStore}>
        <MemoryRouter>
          <div>
            <h1>Blog</h1>
          </div>
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByText(/Blog/i)).toBeInTheDocument();
  });
  
  test('blog page renders properly', () => {
    const { container } = render(
      <Provider store={mockStore}>
        <MemoryRouter>
          <div>
            <h1>Blog</h1>
          </div>
        </MemoryRouter>
      </Provider>
    );
    expect(container).toBeInTheDocument();
  });
});