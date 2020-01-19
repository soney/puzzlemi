import 'bootstrap/dist/css/bootstrap.min.css';
import { render } from 'react-dom'
import * as React from 'react'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import { rootReducer } from './reducers'
import { App } from './components/App';
import './css/index.css';
import registerServiceWorker from './registerServiceWorker';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { PersistGate } from 'redux-persist/integration/react';

const ENABLE_LOGGER = false;
const middleware = [thunkMiddleware];
if(ENABLE_LOGGER) {
    const loggerMiddleware = createLogger();
    middleware.push(loggerMiddleware);
}

const reducerConfig = {
    storage,
    key: 'puzzlemi',
    whitelist: ['solutions', 'intermediateUserState']
}

const finalReducer = persistReducer(reducerConfig, rootReducer);
const store = createStore(finalReducer, applyMiddleware(...middleware));
export const finalStore = persistStore(store);

// finalStore.purge();

render(
    <Provider store={store}>
        <PersistGate loading={null} persistor={finalStore}>
            <App isAdmin={false} />
        </PersistGate>
    </Provider>,
    document.getElementById('root')
)
registerServiceWorker(); 