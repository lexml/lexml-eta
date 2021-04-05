import { combineReducers, createStore } from 'redux';
import { appReducer } from './app-reducer';
import { elementoReducer } from './elemento-reducer';

// export const store = createStore(reducer);

// export const store = createStore(reducer, (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__());

const combinedReducer = combineReducers({
  appReducer: appReducer,
  elementoReducer: elementoReducer,
});

export const rootStore = createStore(combinedReducer, (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__());
