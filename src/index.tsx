import { AppError } from './utils/AppError';
// @ts-nocheck
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles/tailwind.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new AppError("Could not find root element to mount to", 'INTERNAL_ERROR', 500);
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
