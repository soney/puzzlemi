import * as React from 'react';
import '../css/App.scss';
import * as reactRedux from 'react-redux';
import { ReconnectingWebsocket, SDBClient, SDBDoc } from 'sdb-ts';
import Problems from './Problems/Problems';
import { setProblemsDoc, beginListeningOnProblemsDoc, setSolutionsDoc, setUsersDoc, setAggregateDataDoc, beginListeningOnAggregateDataDoc } from '../actions/sharedb_actions';
import { setUser } from '../actions/user_actions';
import UserHeader from './UserHeader';
import { IProblem, IProblems } from '../reducers/problems';
import { IAggregateData } from '../reducers/aggregateData';
import { IPMState } from '../reducers';
import { IAppState } from '../reducers/app';
import { setAppState } from '../actions/app_actions';
import update from 'immutability-helper';

export interface IPuzzleSet {
    problems: IProblem[];
    userData: {
        [problemID: string]: IProblemUserInfo;
    };
}

export interface IProblemUserInfo {
    completed: string[];
    hidden: boolean;
}


export interface IUsersDoc {
    users: {
        [uid: string]: {
            uid: string,
            name: string,
            email: string
        }
    }
}

export interface ISolutionsDoc {
    solutions: {
        [uid: string]: {
            [problemid: string]: {

            }
        }
    }
}

const PMApplication = ({ isAdmin, dispatch }) => {
    return <div>
        <div className="container"><UserHeader /></div>
        <Problems />
        <div className='contact'>
            {/* Contact: <a href='http://from.so/' target='_blank' rel='noopener noreferrer'>Steve Oney</a> (University of Michigan) */}
        </div>
    </div>;
};

function mapStateToProps(state: IPMState, ownProps) {
    return ownProps;
}

function mapDispatchToProps(dispatch, ownProps) {
    const DEBUG_MODE = window.location.host === 'localhost:3000';
    const emptyProblemsDoc: IProblems = { allProblems: {}, order: [] };
    const emptyAggregateDataDoc: IAggregateData = { userData: {} };

    const appState:IAppState = {
        debugMode: DEBUG_MODE,
        websocketLocation: DEBUG_MODE ? `ws://localhost:8000` : `${window.location.protocol === 'http:' ? 'ws' : 'wss'}://${window.location.host}`,
        channel: DEBUG_MODE ? 'p' : window.location.pathname.slice(1).split('/')[1],
        postBase: DEBUG_MODE ? `http://localhost:8000` : '',
        selectedUserForSolutionsView: false
    };
    dispatch(setAppState(appState));

    const ws: ReconnectingWebsocket = new ReconnectingWebsocket(appState.websocketLocation);
    const sdbClient: SDBClient = new SDBClient(ws);

    const problemsDoc: SDBDoc<IProblems> = sdbClient.get(appState.channel, 'problems');
    dispatch(setProblemsDoc(problemsDoc));
    problemsDoc.createIfEmpty(emptyProblemsDoc).then(() => {
        dispatch(beginListeningOnProblemsDoc(problemsDoc));
        return problemsDoc;
    });

    const aggregateDataDoc: SDBDoc<IAggregateData> = sdbClient.get(appState.channel, 'aggregateData');
    dispatch(setAggregateDataDoc(aggregateDataDoc));
    aggregateDataDoc.createIfEmpty(emptyAggregateDataDoc).then(() => {
        dispatch(beginListeningOnAggregateDataDoc(aggregateDataDoc));
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
            const solutionsDoc: SDBDoc<any> = sdbClient.get(appState.channel, 'solutions');
            const usersDoc: SDBDoc<any> = sdbClient.get(appState.channel, 'users');
            dispatch(setSolutionsDoc(solutionsDoc));
            dispatch(setUsersDoc(usersDoc));
            solutionsDoc.subscribe();
            usersDoc.subscribe();
        }
        return myInfo;
    });
    return ownProps;
}
export const App = reactRedux.connect(mapStateToProps, mapDispatchToProps)(PMApplication);