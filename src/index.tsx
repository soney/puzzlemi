import 'bootstrap/dist/css/bootstrap.min.css';
import { render } from 'react-dom'
import * as React from 'react'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import rootReducer from './reducers'
import { App } from './components/App_Redux';
import './css/index.css';
import registerServiceWorker from './registerServiceWorker';

const store = createStore(rootReducer)

render(
     <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('root')
)
registerServiceWorker(); 