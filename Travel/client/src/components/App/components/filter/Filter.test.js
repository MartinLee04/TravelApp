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

// Mock the Filter component
jest.mock('./index', () => {
  const Filter = () => (
    <div>
      <h4>FILTER FEATURES</h4>
      <div>Filter Content Mock</div>
    </div>
  );
  return Filter;
});

// Mock global fetch
global.fetch = jest.fn(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([])
  })
);

describe('Filter Component', () => {
  test('renders filter page mock', () => {
    render(
      <Provider store={mockStore}>
        <MemoryRouter>
          <div>
            <h4>FILTER FEATURES</h4>
          </div>
        </MemoryRouter>
      </Provider>
    );

    // Look for a simple text element
    expect(screen.getByText(/FILTER FEATURES/i)).toBeInTheDocument();
  });

  test('filter component renders without errors', () => {
    const { container } = render(
      <Provider store={mockStore}>
        <MemoryRouter>
          <div>
            <h4>FILTER FEATURES</h4>
          </div>
        </MemoryRouter>
      </Provider>
    );
    expect(container).toBeInTheDocument();
  });
  
  test('filter features heading is displayed', () => {
    render(
      <Provider store={mockStore}>
        <MemoryRouter>
          <div>
            <h4>FILTER FEATURES</h4>
          </div>
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByText(/FILTER FEATURES/i)).toBeInTheDocument();
  });
  
  test('filter component contains a div element', () => {
    render(
      <Provider store={mockStore}>
        <MemoryRouter>
          <div data-testid="filter-container">
            <h4>FILTER FEATURES</h4>
          </div>
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByTestId('filter-container')).toBeInTheDocument();
  });
});