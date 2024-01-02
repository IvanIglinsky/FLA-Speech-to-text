import React from 'react';

import App from './App';
import { AuthProvider } from './pages/auth-context.tsx';
import {createRoot} from "react-dom/client";
import {MantineProvider} from "@mantine/core";
import "./App.css"
import "./index.css"

const rootElement = document.getElementById('root');

if (rootElement) {
    createRoot(rootElement).render(
        <>
        <React.StrictMode>
            <AuthProvider>
                <MantineProvider>
                <App />
                </MantineProvider>
            </AuthProvider>
        </React.StrictMode>
            </>
    );
} else {
    console.error('Root element with id "root" not found.');
}
