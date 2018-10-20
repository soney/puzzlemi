import * as React from 'react';
import '../css/App.scss';
import * as reactRedux from 'react-redux';
import { ReconnectingWebsocket, SDBClient, SDBDoc } from 'sdb-ts';
import Problems from './Problems';
import { setDoc, beginListeningOnDoc } from '../actions/sharedb_actions';
import { setIsAdmin } from '../actions/user_actions';
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

export interface IProblem {
    afterCode: string;
    description: string;
    givenCode: string;
    files: any;
    id: string;
    tests: any;
};

const emptyDoc = { problems: [], userData: {} };
const PMApplication = ({ isAdmin, dispatch }) => {
    const DEBUG_MODE = window.location.host === 'localhost:3000';
    const wsLocation = DEBUG_MODE ? `ws://localhost:8000` : `ws://${window.location.host}`;
    const puzzleName = DEBUG_MODE ? 'p' : window.location.pathname.slice(1);

    const ws: ReconnectingWebsocket = new ReconnectingWebsocket(wsLocation);
    ws.addListener('close', (ev: CloseEvent) => {
        console.log(ev);
    });
    const sdbClient: SDBClient = new SDBClient(ws);
    const sdbDoc: SDBDoc<IPuzzleSet> = sdbClient.get('puzzles', puzzleName);
    dispatch(setDoc(sdbDoc));
    dispatch(setIsAdmin(isAdmin));
    sdbDoc.createIfEmpty(emptyDoc).then(() => {
        dispatch(beginListeningOnDoc(sdbDoc));
    });
    window['su'] = () => {
        dispatch(setIsAdmin(true));
    };
    window['toJSON'] = () => {
        console.log(JSON.stringify(update(sdbDoc.getData(), { userData: { $set: {} }})));
    };
    window['fromJSON'] = (str: string) => {
        const newData: IPuzzleSet = JSON.parse(str);
        sdbDoc.submitObjectReplaceOp([], newData);
    };
    return <div>
        <Problems />
        <div className='contact'>
            Contact: <a href='http://from.so/' target='_blank'>Steve Oney</a> (University of Michigan)
        </div>
    </div>;
};

export const App = reactRedux.connect()(PMApplication);