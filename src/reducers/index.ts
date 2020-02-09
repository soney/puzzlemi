import { combineReducers } from 'redux';
import reduceReducers from 'reduce-reducers';
import { users, IUsers } from './users';
import { solutions, ISolutions, crossSliceSolutionsReducer } from './solutions';
import { shareDBDocs, ISDBDocsState } from './sharedb';
import { intermediateUserState, IIntermediateUserState, crossSliceIntermediateUserStateReducer } from './intermediateUserState';
import { app, IAppState } from './app';

export interface IPMState {
    shareDBDocs: ISDBDocsState,
    intermediateUserState: IIntermediateUserState,
    solutions: ISolutions,
    users: IUsers,
    app: IAppState
}

const combinedReducers = combineReducers({
    shareDBDocs,
    intermediateUserState,
    solutions,
    users,
    app
});

export const rootReducer = reduceReducers(combinedReducers, crossSliceSolutionsReducer as any, crossSliceIntermediateUserStateReducer as any) as any;