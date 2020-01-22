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
import { IAppState } from './reducers/app';
import { Helmet } from "react-helmet";

const ENABLE_LOGGER = false;
const middleware = [thunkMiddleware];
if(ENABLE_LOGGER) {
    const loggerMiddleware = createLogger();
    middleware.push(loggerMiddleware);
}

const DEBUG_MODE = window.location.host === 'localhost:3000';
export const appState:IAppState = {
    debugMode: DEBUG_MODE,
    websocketLocation: DEBUG_MODE ? `ws://localhost:8000` : `${window.location.protocol === 'http:' ? 'ws' : 'wss'}://${window.location.host}`,
    channel: DEBUG_MODE ? 'p' : window.location.pathname.slice(1).split('/')[1],
    postBase: DEBUG_MODE ? `http://localhost:8000` : '',
    selectedUserForSolutionsView: false
};

const reducerConfig = {
    storage,
    key: `puzzlemi-${appState.channel}`,
    whitelist: ['solutions']
}

const finalReducer = persistReducer(reducerConfig, rootReducer);
const store = createStore(finalReducer, applyMiddleware(...middleware));
export const finalStore = persistStore(store);

// finalStore.purge();

render(
    <Provider store={store}>
        <PersistGate loading={null} persistor={finalStore}>
            <Helmet>
                <title>PuzzleMI ({appState.channel})</title>
            </Helmet>
            <App isAdmin={false} />
        </PersistGate>
    </Provider>,
    document.getElementById('root')
)
registerServiceWorker(); 