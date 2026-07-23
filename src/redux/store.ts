import { combineReducers, createStore } from 'redux';
import { appReducer } from './app/appReducer';
import { elementoReducer } from './elemento/reducer/elementoReducer';

const combinedReducer = combineReducers({
  appReducer: appReducer,
  elementoReducer: elementoReducer,
});

export const rootStore = createStore(combinedReducer, (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__());

// Exposto só sob Cypress: alguns testes E2E precisam simular uma sincronização de estado que uma
// digitação real do usuário sempre dispararia (ver cy.sincronizarTextoComQuill em remissao-commands.ts).
if ((window as any).Cypress) {
  (window as any).__rootStore = rootStore;
}
