import { combineReducers } from 'redux';
import { problems } from './problems';
import { isAdmin } from './isAdmin';
import { doc } from './sharedb';
​
export default combineReducers({
    doc,
    isAdmin,
    problems,
});