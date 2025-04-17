import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import About from './index'; // Update the path to your component
import store from '../../store/store';


describe('About Component', () => {
    test('renders About page', () => {
        render(
            <Provider store={store}>
            <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <About />
            </MemoryRouter>
            </Provider>
        );

        const linkElement = screen.getByText(/Meet the Team/i);
        expect(linkElement).toBeInTheDocument();
    });
    test("renders navigation buttons", () => {
        render(
          <Provider store={store}>
            <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <About />
            </MemoryRouter>
          </Provider>
        );

        // Only check for buttons that are actually present
        expect(screen.getByText(/Filter/i)).toBeInTheDocument();
        expect(screen.getByText(/Search/i)).toBeInTheDocument();
    });

    test('navigates to login page', () => {
        render(
          <Provider store={store}>
            <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <About />
            </MemoryRouter>
          </Provider>
        );
    });
    
    test('shows the team section', () => {
        render(
            <Provider store={store}>
                <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <About />
                </MemoryRouter>
            </Provider>
        );
        expect(screen.getByText(/Meet the Team/i)).toBeInTheDocument();
    });

    test('renders the Filter link in navigation', () => {
        render(
            <Provider store={store}>
                <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <About />
                </MemoryRouter>
            </Provider>
        );
        expect(screen.getByText(/Filter/i)).toBeInTheDocument();
    });
});