import { combineReducers, createStore } from 'redux';
import { appReducer } from './app/appReducer';
import { elementoReducer } from './elemento/reducer/elementoReducer';

const combinedReducer = combineReducers({
  appReducer: appReducer,
  elementoReducer: elementoReducer,
});

export const rootStore = createStore(combinedReducer, (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__());
