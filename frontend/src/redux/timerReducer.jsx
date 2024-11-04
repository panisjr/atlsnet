// src/redux/timerReducer.js
import { START_TIMER, UPDATE_TIMER, RESET_TIMER } from './timerActions';

const initialState = {
  activeTimers: [], // Store active timers with their countdowns
};

const timerReducer = (state = initialState, action) => {
  switch (action.type) {
    case START_TIMER:
      return {
        ...state,
        activeTimers: [
          ...state.activeTimers,
          { timerId: action.payload.timerId, countdown: action.payload.duration },
        ],
      };
    case UPDATE_TIMER:
      return {
        ...state,
        activeTimers: state.activeTimers.map((timer) =>
          timer.timerId === action.payload.timerId
            ? { ...timer, countdown: action.payload.countdown }
            : timer
        ),
      };
    case RESET_TIMER:
      return initialState; // Reset the state to initial state
    default:
      return state;
  }
};

export default timerReducer;
