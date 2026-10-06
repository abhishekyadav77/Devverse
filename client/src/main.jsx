import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { BookmarksProvider } from './context/BookmarksContext.jsx';
import { NotificationsProvider } from './context/NotificationsContext.jsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <BookmarksProvider>
              <NotificationsProvider>
                <BrowserRouter>
                  <App />
                </BrowserRouter>
              </NotificationsProvider>
            </BookmarksProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);