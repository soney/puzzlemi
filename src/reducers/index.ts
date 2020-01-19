import { combineReducers } from 'redux';
import reduceReducers from 'reduce-reducers';
import { users, IUsers } from './users';
import { solutions, ISolutions, crossSliceSolutionsReducer } from './solutions';
import { shareDBDocs, ISDBDocsState } from './sharedb';
import { intermediateUserState, IIntermediateUserState } from './intermediateUserState';
import { aggregateData, IAggregateData } from './aggregateData';
import { app, IAppState } from './app';

export interface IPMState {
    aggregateData: IAggregateData,
    shareDBDocs: ISDBDocsState,
    intermediateUserState: IIntermediateUserState,
    solutions: ISolutions,
    users: IUsers,
    app: IAppState
}

const combinedReducers = combineReducers({
    aggregateData,
    shareDBDocs,
    intermediateUserState,
    solutions,
    users,
    app
});

export const rootReducer = reduceReducers(combinedReducers, crossSliceSolutionsReducer as any) as any;