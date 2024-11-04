// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux'; // Import Provider
import store from './redux/store'; // Import your store
import App from './App.jsx';
import './index.css';
import { ThemeProvider } from './screens/ThemeProvider.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>  {/* Wrap App with Provider */}
    <ThemeProvider>
      <App />
  </ThemeProvider>
    </Provider>
  </StrictMode>
);
