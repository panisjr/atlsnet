// src/redux/timerActions.js
export const START_TIMER = 'START_TIMER';
export const UPDATE_TIMER = 'UPDATE_TIMER';
export const RESET_TIMER = 'RESET_TIMER';

// Action to start a timer with a given duration
export const startTimer = (timerId, duration) => ({
  type: START_TIMER,
  payload: { timerId, duration },
});

// Action to update the timer countdown
export const updateTimer = (timerId, countdown) => ({
  type: UPDATE_TIMER,
  payload: { timerId, countdown },
});

// Action to reset all timers
export const resetTimer = () => ({
  type: RESET_TIMER,
});
