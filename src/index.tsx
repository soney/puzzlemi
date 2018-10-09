import 'bootstrap/dist/css/bootstrap.min.css';
import { render } from 'react-dom'
import * as React from 'react'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import rootReducer from './reducers'
import { App } from './components/App';
import './css/index.css';
import registerServiceWorker from './registerServiceWorker';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';

const loggerMiddleware = createLogger();

export const store = createStore(rootReducer, applyMiddleware(
    thunkMiddleware,
    loggerMiddleware
));

render(
    <Provider store={store}>
        <App isAdmin={false} />
    </Provider>,
    document.getElementById('root')
)
registerServiceWorker(); 