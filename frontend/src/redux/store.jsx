// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import timerReducer from './timerReducer';

// Load state from localStorage
const loadState = () => {
  try {
    const serializedState = localStorage.getItem('timerState');
    if (serializedState === null) return undefined;
    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
};

// Save state to localStorage
const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('timerState', serializedState);
  } catch (err) {
    // Ignore write errors
  }
};

const persistedState = loadState();

const store = configureStore({
  reducer: timerReducer,
  preloadedState: persistedState,  // Load persisted state
  devTools: process.env.NODE_ENV !== 'production',  // Enable Redux DevTools
});

// Save state to localStorage whenever the store changes
store.subscribe(() => {
  saveState(store.getState());
});

export default store;
