import * as React from 'react';
import '../css/App.scss';
import * as reactRedux from 'react-redux';
import { ReconnectingWebsocket, SDBClient, SDBDoc } from 'sdb-ts';
import Problems from './Problems';
import { setDoc, beginListeningOnDoc } from '../actions/sharedb_actions';
import { setIsAdmin, setUser } from '../actions/user_actions';
import update from 'immutability-helper';
import UserHeader from './UserHeader';

export interface IPuzzleSet {
    problems: IProblem[];
    userData: {
        [problemID: string]: IProblemUserInfo;
    };
}

export interface IUser {
    isAdmin: boolean;
    id: string;
    userInfo: IUserInfo;
    solutions: { [problemID: string]: ISolution }
}

export interface IHelpSession {
    status: boolean;
    tuteeID: string;
    tutorIDs: string[];
    solution: ISolution;
}

export interface IProblemUserInfo {
    completed_default: string[];
    completed_tests: string[];
    visible: boolean;
    testData: {
        [testID: string]: {
            [userID: string]: {
                passedAll: boolean
            }
        }
    },
    helpSessions: IHelpSession[];
}

export interface ITest {
    author: string,
    verified: boolean,
    id: string,
    input: IVariable[],
    output: IVariable[]
    hidden: boolean;
    helpSessions: IHelpSession[];
}

export interface IProblem {
    afterCode: string;
    description: string;
    givenCode: string;
    standardCode: string;
    whiteboardCode: string;
    files: any;
    id: string;
    variables: IVariable[];
    tests: ITest[];
    config: IProblemConfig;
    editgivencode: boolean;
    sketch: any [];
};

export interface IProblemConfig {
    runTests: boolean;
    addTests: boolean;
    displayInstructor: boolean;
    peerHelp: boolean;
    autoVerify: boolean;
}

export interface IVariable {
    name: string;
    value: string;
    type?: string;
}

export interface ISolution {
    modified: boolean,
    code: string,
    files: Array<{
        contents: string,
        name: string
    }>,
    defaultResult: IResult,
    passedAllTests: boolean | number,
    // targetID: string,
    testResults: {
        [testID: string]: IResult
    }
    activeFailedTestID: string,
}

export interface IResult {
    errors: string[],
    output: string,
    passedAll: boolean | number,
    results: ITestMessage[],
}

export interface ITestMessage {
    passed: boolean;
    message: string;
}

export interface IUserInfo {
    username: string,
    email: string,
    isInstructor: boolean,
    loggedIn: boolean
}

const DEBUG_MODE = window.location.host === 'localhost:3000';
const emptyDoc = { problems: [], userData: {} };
const PMApplication = ({ dispatch }) => {
    const wsLocation = DEBUG_MODE ? `ws://localhost:8000` : `${window.location.protocol === 'http:' ? 'ws' : 'wss'}://${window.location.host}`;
    const puzzleName = DEBUG_MODE ? 'p' : window.location.pathname.slice(1);

    const ws: ReconnectingWebsocket = new ReconnectingWebsocket(wsLocation);
    // ws.addListener('close', (ev: CloseEvent) => {
    //     console.log(ev);
    // });
    const sdbClient: SDBClient = new SDBClient(ws);
    const sdbDoc: SDBDoc<IPuzzleSet> = sdbClient.get('puzzles', puzzleName);
    dispatch(setDoc(sdbDoc));
    sdbDoc.createIfEmpty(emptyDoc).then(() => {
        dispatch(beginListeningOnDoc(sdbDoc));
    });
    const myInfoURL = DEBUG_MODE ? `http://localhost:8000/_myInfo` : `/_myInfo`;
    fetch(myInfoURL).then((response) => {
        return response.json();
    }).then((myInfo) => {
        dispatch(setUser(myInfo));
    }).catch((err) => {
        // dispatch(setUser({
        //     username: '',
        //     email: '',
        //     isInstructor: false,
        //     loggedIn: false
        // }))
    });
    window['su'] = () => {
        dispatch(setIsAdmin(true));
    };
    window['toJSON'] = () => {
        console.log(JSON.stringify(update(sdbDoc.getData(), { userData: { $set: {} } })));
    };
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