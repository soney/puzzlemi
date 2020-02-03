import * as React from 'react';
import '../css/App.scss';
import * as reactRedux from 'react-redux';
import { ReconnectingWebsocket, SDBClient, SDBDoc } from 'sdb-ts';
import Problems from './Problems/Problems';
import { setProblemsDoc, beginListeningOnProblemsDoc, beginListeningOnAggregateDataDoc, setSolutionsDoc, setUsersDoc, setAggregateDataDoc, beginListeningOnDoc } from '../actions/sharedb_actions';
import { setUser } from '../actions/user_actions';
import UserHeader from './UserHeader';
import { IProblems } from '../reducers/problems';
import { IAggregateData } from '../reducers/aggregateData';
import { IPMState } from '../reducers';
import { setAppState } from '../actions/app_actions';
import update from 'immutability-helper';
import { appState } from '..';
import { ISolutions } from '../reducers/solutions';
import { IUsers } from '../reducers/users';


const PMApplication = ({ isAdmin, dispatch }) => {
    return <div className="container">
        <UserHeader />
        <Problems />
    </div>;
};

function mapStateToProps(state: IPMState, ownProps) {
    return ownProps;
}

function mapDispatchToProps(dispatch, ownProps) {
    const emptyProblemsDoc: IProblems = { allProblems: {}, order: [] };
    const emptyAggregateDataDoc: IAggregateData = { userData: {} };

    dispatch(setAppState(appState));

    const ws: ReconnectingWebsocket = new ReconnectingWebsocket(appState.websocketLocation);
    const sdbClient: SDBClient = new SDBClient(ws);

    const problemsDoc: SDBDoc<IProblems> = sdbClient.get(appState.channel, 'problems');
    dispatch(setProblemsDoc(problemsDoc));
    problemsDoc.createIfEmpty(emptyProblemsDoc).then(() => {
        dispatch(beginListeningOnProblemsDoc(problemsDoc));
        dispatch(beginListeningOnDoc(problemsDoc, 'problems'));
        return problemsDoc;
    });

    const aggregateDataDoc: SDBDoc<IAggregateData> = sdbClient.get(appState.channel, 'aggregateData');
    dispatch(setAggregateDataDoc(aggregateDataDoc));
    aggregateDataDoc.createIfEmpty(emptyAggregateDataDoc).then(() => {
        dispatch(beginListeningOnAggregateDataDoc(aggregateDataDoc));
        dispatch(beginListeningOnDoc(aggregateDataDoc, 'aggregateData'));
        return aggregateDataDoc;
    });

    fetch(`${appState.postBase}/_myInfo`).then((response) => {
        return response.json();
    }).then((myInfo) => {
        if(appState.debugMode) {
            myInfo = update(myInfo, { uid: { $set: 'testuid' }})
        }
        dispatch(setUser(myInfo));
        if(myInfo.isInstructor) {
            const solutionsDoc: SDBDoc<ISolutions> = sdbClient.get(appState.channel, 'solutions');
            dispatch(setSolutionsDoc(solutionsDoc));
            dispatch(beginListeningOnDoc(solutionsDoc, 'solutions'));

            const usersDoc: SDBDoc<IUsers> = sdbClient.get(appState.channel, 'users');
            dispatch(setUsersDoc(usersDoc));
            dispatch(beginListeningOnDoc(usersDoc, 'users'));
        }
        return myInfo;
    });
    return ownProps;
}
export const App = reactRedux.connect(mapStateToProps, mapDispatchToProps)(PMApplication);