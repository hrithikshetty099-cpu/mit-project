import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { LanguageProvider } from './i18n/I18n.jsx';

createRoot(document.getElementById('root')).render(React.createElement(BrowserRouter, null, React.createElement(LanguageProvider, null, React.createElement(App))));