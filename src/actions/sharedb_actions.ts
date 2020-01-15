import { IPuzzleSet, IProblem, IHelpSession, IProblemUserInfo } from '../components/App';
import { SDBDoc } from 'sdb-ts';
import { Dispatch } from 'redux';
import uuid from '../utils/uuid';
import EventTypes from './EventTypes';
import { ListInsertOp, ListDeleteOp, ObjectInsertOp, ObjectDeleteOp } from 'sharedb';

export const puzzlesFetched = (puzzles: IPuzzleSet) => ({
    puzzles, type: EventTypes.PUZZLES_FETCHED,
});
export const setDoc = (doc: SDBDoc<IPuzzleSet>) => ({
    doc, type: EventTypes.SET_DOC,
});

export function addProblem() {
    return (dispatch: Dispatch, getState) => {
        const { doc } = getState();
        const newProblem: IProblem = {
            afterCode: '',
            description: '*no description*',
            files: [],
            givenCode: `# code here`,
            standardCode: `# standard solution`,
            id: uuid(),
            variables: [],
            tests: [],
            config: {
                runTests: false,
                addTests: false,
                displayInstructor: false,
                peerHelp: false,
                autoVerify: false
            }
        };

        const newUserData: IProblemUserInfo = {
            completed_default: [],
            completed_tests: [],
            visible: true,
            testData: {},
            helpSessions: [],
        }

        doc.submitObjectInsertOp(['userData', newProblem.id], newUserData);
        doc.submitListPushOp(['problems'], newProblem);
    };
}

export function deleteProblem(index: number) {
    return (dispatch: Dispatch, getState) => {
        const { doc } = getState();
        return doc.submitListDeleteOp(['problems', index]);
    };
}

export function newEmptyTest(index: number, name: string, isAdmin: boolean) {
    return (dispatch: Dispatch, getState) => {
        const { doc } = getState();
        const p = ['problems', index, 'variables'];
        const variables = doc.traverse(p);
        let input = [] as any[];
        let output = [] as any[];
        variables.forEach(variable => {
            if (variable.type === "input") input.push({ name: variable.name, value: '' });
            if (variable.type === "output") output.push({ name: variable.name, value: '' });
        })
        const newTest = {
            author: name,
            verified: isAdmin,
            id: uuid(),
            input,
            output
        };
        return doc.submitListPushOp(['problems', index, 'tests'], newTest);
    };
}

export function newTest(index: number, test: any) {
    return (dispatch: Dispatch, getState) => {
        const { doc } = getState();
        return doc.submitListPushOp(['problems', index, 'tests'], test);
    };
}

export function addTestVariable(index: number, isAdmin: boolean) {
    return (dispatch: Dispatch, getState) => {
        const { doc } = getState();
        const newVariable = {
            type: 'input',
            name: '',
            value: 'null'
        };
        return doc.submitListPushOp(['problems', index, 'variables'], newVariable);
    };
}

export function deleteTest(index: number, testIndex: number) {
    return (dispatch: Dispatch, getState) => {
        const { doc } = getState();
        return doc.submitListDeleteOp(['problems', index, 'tests', testIndex]);
    };
}

export function deleteTestVariable(index: number, variableIndex: number) {
    return (dispatch: Dispatch, getState) => {
        const { doc } = getState();
        return doc.submitListDeleteOp(['problems', index, 'variables', variableIndex]);
    }
}

export function changeTestStatus(index: number, testIndex: number, verified: boolean) {
    return (dispatch: Dispatch, getState) => {
        const { doc } = getState();
        console.log('change test status')
        // const { tests } = problems[index];
        // const  test = tests[testIndex];
        // const verified = !test.verified;
        return doc.submitObjectReplaceOp(['problems', index, 'tests', testIndex, 'verified'], verified);
    };
}

export function updateVariableType(index: number, variableIndex: number, type: string) {
    return (dispatch: Dispatch, getState) => {
        const { doc } = getState();
        return doc.submitObjectReplaceOp(['problems', index, 'variables', variableIndex, 'type'], type);
    }
}

export function addFile(index: number) {
    return (dispatch: Dispatch, getState) => {
        const { doc } = getState();
        const newFile = {
            contents: 'file contents',
            id: uuid(),
            name: 'file.txt',
        };
        return doc.submitListPushOp(['problems', index, 'files'], newFile);
    };
}

export function deleteFile(index: number, fileIndex: number) {
    return (dispatch: Dispatch, getState) => {
        const { doc } = getState();
        return doc.submitListDeleteOp(['problems', index, 'files', fileIndex]);
    };
}

export function setProblemVisibility(id: string, visible: boolean) {
    return (dispatch: Dispatch, getState) => {
        const { doc } = getState();
        const { userData } = doc.getData();
        if (userData[id]) {
            doc.submitObjectReplaceOp(['userData', id, 'visible'], visible);
        } else {
            doc.submitObjectInsertOp(['userData', id], {
                completed: [],
                visible
            });
        }
    };
}

export function changeProblemConfig(index: string, item: string, status: boolean) {
    return (dispatch: Dispatch, getState) => {
        const { doc } = getState();
        const p = ['problems', index, 'config', item];
        doc.submitObjectReplaceOp(p, status);
    }
}

export function setHelpRequest(id: string, uid: string) {
    return (dispatch: Dispatch, getState) => {
        const { doc, user } = getState();
        const { solutions } = user;
        const solution = solutions[id];
        let newHelpSession: IHelpSession = {
            status: true,
            tutorIDs: [],
            tuteeID: uid,
            solution,
        }
        doc.submitListPushOp(['userData', id, 'helpSessions'], newHelpSession);
    };
}

export function joinHelpSession(id: string, tuteeID: string, tutorID: string) {
    return (dispatch: Dispatch, getState) => {
        const { doc } = getState();
        const { userData } = doc.getData();
        const { helpSessions } = userData[id];
        let sessionIndex;

        helpSessions.forEach((session, index) => {
            if (session.tuteeID === tuteeID) sessionIndex = index;
        })
        doc.submitListPushOp(['userData', id, 'helpSessions', sessionIndex, 'tutorIDs'], tutorID);
    }
}

export function quitHelpSession(id: string, sessionIndex: string, uid: string) {
    return (dispatch: Dispatch, getState) => {
        const { doc } = getState();
        const { userData } = doc.getData();
        const { helpSessions } = userData[id];
        const session = helpSessions[sessionIndex];
        if (session.tuteeID === uid) doc.submitListDeleteOp(['userData', id, 'helpSessions', sessionIndex]);
        const tutorIndex = session.tutorIDs.indexOf(uid);
        if (tutorIndex !== -1) doc.submitListDeleteOp(['userData', id, 'helpSessions', sessionIndex, 'tutorIDs', tutorIndex]);
    }
}

function parseOpType(op, doc): string {
    const { p } = op;
    const { li } = op as ListInsertOp;
    const { ld } = op as ListDeleteOp;
    const { oi } = op as ObjectInsertOp;
    const { od } = op as ObjectDeleteOp;

    const problemRelPath = SDBDoc.relative(['problems'], p);
    const userDataRelPath = SDBDoc.relative(['userData'], p);

    switch (true) {
        case ((problemRelPath) && (problemRelPath.length === 1) && (li !== undefined)): return EventTypes.PROBLEM_ADDED;
        case ((problemRelPath) && (problemRelPath.length === 1) && (ld !== undefined)): return EventTypes.PROBLEM_DELETED;
        case ((problemRelPath) && (problemRelPath.length === 3) && (problemRelPath[1] === 'config') && (oi !== undefined)): return EventTypes.CHANGE_PROBLEM_CONFIG;
        case ((problemRelPath) && (problemRelPath.length === 3) && (problemRelPath[1] === 'description')): return EventTypes.DESCRIPTION_CHANGED;
        case ((problemRelPath) && (problemRelPath.length === 3) && (problemRelPath[1] === 'givenCode')): return EventTypes.GIVEN_CODE_CHANGED;
        case ((problemRelPath) && (problemRelPath.length === 3) && (problemRelPath[1] === 'afterCode')): return EventTypes.AFTER_CODE_CHANGED;
        case ((problemRelPath) && (problemRelPath.length === 3) && (problemRelPath[1] === 'standardCode')): return EventTypes.STANDARD_CODE_CHANGED;
        case ((problemRelPath) && (problemRelPath.length === 3) && (problemRelPath[1] === 'variables') && (li !== undefined)): return EventTypes.VARIABLE_ADDED;
        case ((problemRelPath) && (problemRelPath.length === 3) && (problemRelPath[1] === 'variables') && (ld !== undefined)): return EventTypes.VARIABLE_DELETED;
        case ((problemRelPath) && (problemRelPath.length === 3) && (problemRelPath[1] === 'tests') && (li !== undefined)): return EventTypes.TEST_ADDED;
        case ((problemRelPath) && (problemRelPath.length === 3) && (problemRelPath[1] === 'tests') && (ld !== undefined)): return EventTypes.TEST_DELETED;
        case ((problemRelPath) && (problemRelPath.length === 3) && (problemRelPath[1] === 'files') && (li !== undefined)): return EventTypes.FILE_ADDED;
        case ((problemRelPath) && (problemRelPath.length === 3) && (problemRelPath[1] === 'files') && (ld !== undefined)): return EventTypes.FILE_DELETED;
        case ((problemRelPath) && (problemRelPath.length === 4) && (problemRelPath[1] === 'variables') && (problemRelPath[3] === 'type') && (oi !== undefined) && (od !== undefined)): return EventTypes.VARIABLE_PART_CHANGED;
        case ((problemRelPath) && (problemRelPath.length === 4) && (problemRelPath[1] === 'tests') && (problemRelPath[3] === 'verified')): return EventTypes.TEST_STATUS_CHANGED;
        case ((problemRelPath) && (problemRelPath.length === 5) && (problemRelPath[1] === 'tests')): return EventTypes.TEST_PART_CHANGED;
        case ((problemRelPath) && (problemRelPath.length === 5) && (problemRelPath[1] === 'files')): return EventTypes.FILE_PART_CHANGED;
        case ((problemRelPath) && (problemRelPath.length === 5) && (problemRelPath[1] === 'variables')): return EventTypes.VARIABLE_PART_CHANGED;
        case ((problemRelPath) && (problemRelPath.length === 7) && (problemRelPath[1] === 'tests') && (problemRelPath[5] === 'value')): return EventTypes.TEST_VALUE_CHANGED;
        case ((userDataRelPath) && (userDataRelPath.length === 1) && (oi !== undefined)): return EventTypes.PROBLEM_COMPLETION_INFO_FETCHED;
        case ((userDataRelPath) && (userDataRelPath.length === 2) && (userDataRelPath[1] === 'visible') && (oi !== undefined)): return EventTypes.PROBLEM_VISIBILITY_CHANGED;
        case ((userDataRelPath) && (userDataRelPath.length === 3) && (userDataRelPath[1] === 'testData') && (oi !== undefined)): return EventTypes.INIT_TEST_USER_DATA;
        case ((userDataRelPath) && (userDataRelPath.length === 3) && (userDataRelPath[1] === 'completed_default') && (li !== undefined)): return EventTypes.USER_COMPLETED_PROBLEM_DEFAULT;
        case ((userDataRelPath) && (userDataRelPath.length === 3) && (userDataRelPath[1] === 'completed_tests') && (li !== undefined)): return EventTypes.USER_COMPLETED_PROBLEM_TESTS;
        // case ((problemRelPath) && (problemRelPath.length === 5) && (problemRelPath[1] === 'tests')): return EventTypes.TEST_PART_CHANGED;
        // case ((problemRelPath) && (problemRelPath.length === 5) && (problemRelPath[1] === 'files')): return EventTypes.FILE_PART_CHANGED;
        // case ((userDataRelPath) && (userDataRelPath.length === 1) && (oi!==undefined)): return EventTypes.PROBLEM_COMPLETION_INFO_FETCHED;
        // case ((userDataRelPath) && (userDataRelPath.length === 2) && (userDataRelPath[1] === 'visible') && (oi!==undefined)): return EventTypes.PROBLEM_VISIBILITY_CHANGED;
        // case ((userDataRelPath) && (userDataRelPath.length === 3) && (userDataRelPath[1] === 'completed') && (li!==undefined)): return EventTypes.USER_COMPLETED_PROBLEM;
        case ((userDataRelPath) && (userDataRelPath.length === 3) && (userDataRelPath[1] === 'helpSessions') && (li !== undefined)): return EventTypes.ENABLE_HELP_SESSION;
        case ((userDataRelPath) && (userDataRelPath.length === 3) && (userDataRelPath[1] === 'helpSessions') && (ld !== undefined)): return EventTypes.DISABLE_HELP_SESSION;
        case ((userDataRelPath) && (userDataRelPath.length === 4) && (userDataRelPath[1] === 'testData') && (oi !== undefined)): return EventTypes.INIT_USER_USER_DATA;
        case ((userDataRelPath) && (userDataRelPath.length === 5) && (userDataRelPath[1] === 'testData') && (userDataRelPath[4] === 'passedAll') && (oi !== undefined) && (od !== undefined)): return EventTypes.UPDATE_TEST_USER_INFO_USER_DATA;
        case ((userDataRelPath) && (userDataRelPath.length === 5) && (userDataRelPath[1] === 'helpSessions') && (userDataRelPath[3] === 'tutorIDs') && (li !== undefined)): return EventTypes.JOIN_HELP_SESSION;
        case ((userDataRelPath) && (userDataRelPath.length === 5) && (userDataRelPath[1] === 'helpSessions') && (userDataRelPath[3] === 'tutorIDs') && (ld !== undefined)): return EventTypes.QUIT_HELP_SESSION;
        default:
            console.log(op);
            return 'unknownType';
    }
}


export function beginListeningOnDoc(doc: SDBDoc<IPuzzleSet>) {
    return (dispatch: Dispatch, getState) => {
        doc.subscribe((type, ops) => {
            if (type === null) {
                dispatch(puzzlesFetched(doc.getData()));
            } else if (type === 'op') {
                ops!.forEach((op) => {
                    const { p } = op;
                    const { li } = op as ListInsertOp;
                    const { oi } = op as ObjectInsertOp;
                    const problemRelPath = SDBDoc.relative(['problems'], p);
                    const userDataRelPath = SDBDoc.relative(['userData'], p);

                    const type = parseOpType(op, doc);
                    let index;
                    let testIndex;
                    let fileIndex;
                    let variableIndex;
                    let id;
                    console.log('SDBOp:' + type);

                    switch (type) {
                        case EventTypes.PROBLEM_ADDED:
                            index = problemRelPath[0] as number;
                            dispatch({ index, type, problem: li });
                            break;
                        case EventTypes.PROBLEM_DELETED:
                            index = problemRelPath[0] as number;
                            dispatch({ index, type });
                            break;
                        case EventTypes.DESCRIPTION_CHANGED:
                            index = problemRelPath[0] as number;
                            const newDescription = doc.traverse(['problems', index, 'description']);
                            dispatch({ index, type, description: newDescription });
                            break;
                        case EventTypes.GIVEN_CODE_CHANGED:
                            index = problemRelPath[0] as number;
                            id = doc.traverse(['problems', index, 'id']);
                            const newGivenCode = doc.traverse(['problems', index, 'givenCode']);
                            dispatch({ index, type, code: newGivenCode, id });
                            break;
                        case EventTypes.AFTER_CODE_CHANGED:
                            index = problemRelPath[0] as number;
                            const newAfterCode = doc.traverse(['problems', index, 'afterCode']);
                            dispatch({ index, type, code: newAfterCode });
                            break;
                        case EventTypes.STANDARD_CODE_CHANGED:
                            index = problemRelPath[0] as number;
                            const newStandardCode = doc.traverse(['problems', index, 'standardCode']);
                            dispatch({ index, type, code: newStandardCode });
                            break;
                        case EventTypes.TEST_ADDED:
                            index = problemRelPath[0] as number;
                            testIndex = problemRelPath[2] as number;
                            id = doc.traverse(['problems', index, 'id']);
                            dispatch({ index, type, id, testIndex, test: li });
                            break;
                        case EventTypes.TEST_DELETED:
                            index = problemRelPath[0] as number;
                            testIndex = problemRelPath[2] as number;
                            id = doc.traverse(['problems', index, 'id']);
                            dispatch({ index, type, id, testIndex });
                            break;
                        case EventTypes.FILE_ADDED:
                            index = problemRelPath[0] as number;
                            fileIndex = problemRelPath[2] as number;
                            dispatch({ index, type, fileIndex, file: li });
                            break;
                        case EventTypes.FILE_DELETED:
                            index = problemRelPath[0] as number;
                            fileIndex = problemRelPath[2] as number;
                            dispatch({ index, type, fileIndex });
                            break;
                        case EventTypes.TEST_PART_CHANGED:
                            index = problemRelPath[0] as number;
                            testIndex = problemRelPath[2] as number;
                            let partType = problemRelPath[3] as string;
                            let partValue = doc.traverse(['problems', index, 'tests', testIndex, partType])
                            id = doc.traverse(['problems', index, 'id']);
                            dispatch({ index, type, testIndex, id, partType, partValue });
                            break;
                        case EventTypes.TEST_VALUE_CHANGED:
                            index = problemRelPath[0] as number;
                            testIndex = problemRelPath[2] as number;
                            let variableType = problemRelPath[3];
                            variableIndex = problemRelPath[4];
                            let variableValue = doc.traverse(['problems', index, 'tests', testIndex, variableType, variableIndex, 'value']);
                            dispatch({ index, type, testIndex, variableType, variableIndex, variableValue });
                            break;
                        case EventTypes.TEST_STATUS_CHANGED:
                            index = problemRelPath[0] as number;
                            testIndex = problemRelPath[2] as number;
                            dispatch({ index, type, testIndex, value: oi });
                            break;
                        case EventTypes.FILE_PART_CHANGED:
                            index = problemRelPath[0] as number;
                            fileIndex = problemRelPath[2] as number;
                            const filePartType = problemRelPath[3] as 'name' | 'contents';
                            const newFilePart = doc.traverse(['problems', index, 'files', fileIndex, filePartType]);
                            dispatch({ index, type, fileIndex, part: filePartType, value: newFilePart })
                            break;
                        case EventTypes.PROBLEM_COMPLETION_INFO_FETCHED:
                            dispatch({ type, problemID: userDataRelPath[0], completionInfo: oi });
                            break;
                        case EventTypes.PROBLEM_VISIBILITY_CHANGED:
                            dispatch({ type, problemID: userDataRelPath[0], visible: oi as boolean });
                            break;
                        case EventTypes.USER_COMPLETED_PROBLEM_DEFAULT:
                            dispatch({ type, problemID: userDataRelPath[0], index: userDataRelPath[2], userID: li });
                            break;
                        case EventTypes.USER_COMPLETED_PROBLEM_TESTS:
                            dispatch({ type, problemID: userDataRelPath[0], index: userDataRelPath[2], userID: li });
                            break;
                        case EventTypes.VARIABLE_ADDED:
                            index = problemRelPath[0] as number;
                            variableIndex = problemRelPath[2] as number;
                            dispatch({ index, type, variable: li, variableIndex });
                            break;
                        case EventTypes.VARIABLE_DELETED:
                            index = problemRelPath[0] as number;
                            variableIndex = problemRelPath[2] as number;
                            dispatch({ index, type, variableIndex })
                            break;
                        case EventTypes.VARIABLE_PART_CHANGED:
                            index = problemRelPath[0] as number;
                            variableIndex = problemRelPath[2] as number;
                            const value = doc.traverse(['problems', index, 'variables', variableIndex, problemRelPath[3]]);
                            dispatch({ index, type, variableIndex, part: problemRelPath[3], value })
                            break;
                        case EventTypes.ENABLE_HELP_SESSION:
                            dispatch({ type, problemID: userDataRelPath[0], sessionIndex: userDataRelPath[2], helpSession: li });
                            break;
                        case EventTypes.DISABLE_HELP_SESSION:
                            dispatch({ type, problemID: userDataRelPath[0], sessionIndex: userDataRelPath[2] });
                            break;
                        case EventTypes.JOIN_HELP_SESSION:
                            dispatch({ type, problemID: userDataRelPath[0], sessionIndex: userDataRelPath[2], tutorIndex: userDataRelPath[4], tutorID: li });
                            break;
                        case EventTypes.QUIT_HELP_SESSION:
                            dispatch({ type, problemID: userDataRelPath[0], sessionIndex: userDataRelPath[2], tutorIndex: userDataRelPath[4] });
                            break;
                        case EventTypes.INIT_TEST_USER_DATA:
                            dispatch({ type, problemID: userDataRelPath[0], testID: userDataRelPath[2], value: oi });
                            break;
                        case EventTypes.INIT_USER_USER_DATA:
                            dispatch({ type, problemID: userDataRelPath[0], testID: userDataRelPath[2], userID: userDataRelPath[3], value: oi });
                            break;
                        case EventTypes.UPDATE_TEST_USER_INFO_USER_DATA:
                            dispatch({ type, problemID: userDataRelPath[0], testID: userDataRelPath[2], userID: userDataRelPath[3], value: oi });
                            break;
                        case EventTypes.CHANGE_PROBLEM_CONFIG:
                            index = problemRelPath[0] as number;
                            id = doc.traverse(['problems', index, 'id']);
                            const config_item = problemRelPath[2];
                            const config_value = oi;
                            dispatch({ type, index, problemID: id, config_item, config_value });
                            break;

                        default:
                            if (p.length === 0) { // full replacement
                                dispatch(puzzlesFetched(doc.getData()));
                            }
                    }
                });
            }
        });
    };
}