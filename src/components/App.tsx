import * as React from 'react';
import '../css/App.scss';
import * as reactRedux from 'react-redux';
import { ReconnectingWebsocket, SDBClient, SDBDoc } from 'sdb-ts';
import Problems from './Problems/Problems';
import { setDoc, beginListeningOnDoc } from '../actions/sharedb_actions';
import { setIsAdmin, setUser } from '../actions/user_actions';
import UserHeader from './UserHeader';

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
    id: string;
    problem: IMultipleChoiceProblem | ICodeProblem | ITextResponseProblem
};


export interface IMultipleChoiceOption {
    description: string;
    optionType: 'fixed' | 'free-response';
    freeResponse?: string | null;
    isCorrect: boolean;
}

export interface ITextResponseProblem {
    description: string;
    problemType: 'text-response';
}

export interface IMultipleChoiceProblem {
    description: string;
    options: IMultipleChoiceOption[];
    problemType: 'multiple-choice';
    selectionType: 'single'|'multiple';
    revealSolution: boolean;
}

export interface ICodeProblem {
    afterCode: string;
    description: string;
    givenCode: string;
    files: any;
    tests: any;
    problemType: 'code';
}

export interface IUserInfo {
    username: string,
    email: string,
    isInstructor: boolean,
    loggedIn: boolean
}

const DEBUG_MODE = window.location.host === 'localhost:3000';
const emptyDoc = { problems: [], userData: {} };
const PMApplication = ({ isAdmin, dispatch }) => {
    const wsLocation = DEBUG_MODE ? `ws://localhost:8000` : `${window.location.protocol === 'http:' ? 'ws' : 'wss'}://${window.location.host}`;
    const puzzleName = DEBUG_MODE ? 'p' : window.location.pathname.slice(1);

    const ws: ReconnectingWebsocket = new ReconnectingWebsocket(wsLocation);
    const sdbClient: SDBClient = new SDBClient(ws);
    const sdbDoc: SDBDoc<IPuzzleSet> = sdbClient.get('puzzles', puzzleName);
    dispatch(setDoc(sdbDoc));
    dispatch(setIsAdmin(isAdmin));
    sdbDoc.createIfEmpty(emptyDoc).then(() => {
        dispatch(beginListeningOnDoc(sdbDoc));
    });
    const myInfoURL = DEBUG_MODE ? `http://localhost:8000/_myInfo` : `/_myInfo`;
    fetch(myInfoURL).then((response) => {
        return response.json();
    }).then((myInfo) => {
        dispatch(setUser(myInfo));
    });
    window['fromJSON'] = (str: string) => {
        const newData: IPuzzleSet = JSON.parse(str);
        sdbDoc.submitObjectReplaceOp([], newData);
    };
    return <div>
        <div className="container"><UserHeader /></div>
        <Problems />
        <div className='contact'>
            Contact: <a href='http://from.so/' target='_blank' rel='noopener noreferrer'>Steve Oney</a> (University of Michigan)
        </div>
    </div>;
};

export const App = reactRedux.connect()(PMApplication);