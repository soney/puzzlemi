import { combineReducers } from 'redux';
import { problems } from './problems';
import { user } from './user';
import { doc } from './sharedb';
​
export default combineReducers({
    doc,
    user,
    problems,
});