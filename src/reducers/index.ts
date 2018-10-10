import { combineReducers } from 'redux';
import { problems } from './problems';
import { user } from './user';
import { doc } from './sharedb';
import { userData } from './userData';
​
export default combineReducers({
    doc,
    problems,
    user,
    userData
});