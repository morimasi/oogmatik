// @ts-nocheck
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
<<<<<<< HEAD
=======
import './src/styles/tailwind.css';
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
