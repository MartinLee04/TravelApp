import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import Landing from './index'; // Update the path to your component
import store from '../../store/store';


describe('Landing Component', () => {
    test('renders landing page', () => {
        render(
            <Provider store={store}>
            <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Landing />
            </MemoryRouter>
            </Provider>
        );

        const linkElement = screen.getByText(/TRAVELERS RECOMMENDATIONS/i);
        expect(linkElement).toBeInTheDocument();
    });

    test('displays featured countries carousel', () => {
        render(
        <Provider store={store}>
            <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Landing />
            </MemoryRouter>
        </Provider>
        );

        // Check the label of the first image
        const firstCountryLabel = screen.getByText(/Canada/i);
        expect(firstCountryLabel).toBeInTheDocument();

        const image = screen.getByAltText(/Canada/i);
        expect(image).toBeInTheDocument();
    });

    test('shows login/register button', () => {
        render(
          <Provider store={store}>
            <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Landing />
            </MemoryRouter>
          </Provider>
        );
      });

    test('renders app title correctly', () => {
        render(
            <Provider store={store}>
                <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <Landing />
                </MemoryRouter>
            </Provider>
        );
        expect(screen.getByText(/TRAVELERS RECOMMENDATIONS/i)).toBeInTheDocument();
    });

    test('shows the About Us navigation option', () => {
        render(
            <Provider store={store}>
                <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <Landing />
                </MemoryRouter>
            </Provider>
        );
        expect(screen.getByText(/About Us/i)).toBeInTheDocument();
    });

    test('displays the Blog navigation option', () => {
        render(
            <Provider store={store}>
                <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <Landing />
                </MemoryRouter>
            </Provider>
        );
    });
});