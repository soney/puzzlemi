import { IProblem, IHelpSession, IProblemUserInfo, IVariable, ITest, IFile } from '../utils/types';
import { Dispatch } from 'redux';
import uuid from '../utils/uuid';

export function addProblem() {
    return (dispatch: Dispatch, getState) => {
        const { doc } = getState();
        const newProblem: IProblem = {
            afterCode: '',
            description: '*no description*',
            files: [],
            givenCode: `# code here`,
            standardCode: `# standard solution`,
            notes: '*no notes*',
            id: uuid(),
            variables: [],
            tests: [],
            config: {
                runTests: false,
                addTests: false,
                displayInstructor: false,
                peerHelp: false,
                autoVerify: false
            },
            sketch: [],
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
        doc.submitListDeleteOp(['problems', index]);
    };
}

export function newEmptyTest(index: number, name: string, isAdmin: boolean) {
    return (dispatch: Dispatch, getState) => {
        const { doc } = getState();
        const p = ['problems', index, 'variables'];
        const variables = doc.traverse(p);
        let input = [] as IVariable[];
        let output = [] as IVariable[];
        variables.forEach(variable => {
            const newVariable: IVariable = {
                name: variable.name,
                value: variable.value,
                type: variable.type
            }
            if (variable.type === "input") input.push(newVariable);
            if (variable.type === "output") output.push(newVariable);
        })
        const newTest: ITest = {
            author: name,
            verified: isAdmin,
            id: uuid(),
            input,
            output
        };
        doc.submitListPushOp(['problems', index, 'tests'], newTest);
    };
}

export function newTest(index: number, test: any) {
    return (dispatch: Dispatch, getState) => {
        const { doc } = getState();
        doc.submitListPushOp(['problems', index, 'tests'], test);
    };
}

export function addTestVariable(index: number, isAdmin: boolean) {
    return (dispatch: Dispatch, getState) => {
        const { doc } = getState();
        const newVariable: IVariable = {
            type: 'input',
            name: 'x',
            value: '0'
        };
        doc.submitListPushOp(['problems', index, 'variables'], newVariable);
    };
}

export function deleteTest(index: number, testIndex: number) {
    return (dispatch: Dispatch, getState) => {
        const { doc } = getState();
        doc.submitListDeleteOp(['problems', index, 'tests', testIndex]);
    };
}

export function deleteTestVariable(index: number, variableIndex: number) {
    return (dispatch: Dispatch, getState) => {
        const { doc } = getState();
        doc.submitListDeleteOp(['problems', index, 'variables', variableIndex]);
    }
}

export function changeTestStatus(index: number, testIndex: number, verified: boolean) {
    return (dispatch: Dispatch, getState) => {
        const { doc } = getState();
        doc.submitObjectReplaceOp(['problems', index, 'tests', testIndex, 'verified'], verified);
    };
}

export function updateVariableType(index: number, variableIndex: number, type: string) {
    return (dispatch: Dispatch, getState) => {
        const { doc } = getState();
        doc.submitObjectReplaceOp(['problems', index, 'variables', variableIndex, 'type'], type);
    }
}

export function addFile(index: number) {
    return (dispatch: Dispatch, getState) => {
        const { doc } = getState();
        const newFile: IFile = {
            contents: 'file contents',
            id: uuid(),
            name: 'file.txt',
        };
        doc.submitListPushOp(['problems', index, 'files'], newFile);
    };
}

export function deleteFile(index: number, fileIndex: number) {
    return (dispatch: Dispatch, getState) => {
        const { doc } = getState();
        doc.submitListDeleteOp(['problems', index, 'files', fileIndex]);
    };
}

export function setProblemVisibility(id: string, visible: boolean) {
    return (dispatch: Dispatch, getState) => {
        const { doc } = getState();
        const { userData } = doc.getData();
        if (userData[id]) {
            doc.submitObjectReplaceOp(['userData', id, 'visible'], visible);
        } else {
            doc.submitObjectInsertOp(['userData', id], { completed: [], visible});
        }
    };
}

export function setEditGivenCode(index: string, editgivencode: boolean) {
    return (dispatch: Dispatch, getState) => {
        const { doc } = getState();
        doc.submitObjectReplaceOp(['problems', index, 'editgivencode'], editgivencode);

    };
}
export function updateSketch(index: string, sketch: any[]) {

    return (dispatch: Dispatch, getState) => {
        const { doc } = getState();
        doc.submitObjectReplaceOp(['problems', index, 'sketch'], sketch);

    };
}

export function changeProblemConfig(index: string, item: string, status: boolean) {
    return (dispatch: Dispatch, getState) => {
        const { doc } = getState();
        doc.submitObjectReplaceOp(['problems', index, 'config', item], status);
    }
}

export function setHelpRequest(id: string, uid: string) {
    return (dispatch: Dispatch, getState) => {
        const { doc, user } = getState();
        const { solutions } = user;
        let newHelpSession: IHelpSession = {
            status: true,
            tutorIDs: [],
            tuteeID: uid,
            solution: solutions[id],
        }
        doc.submitListPushOp(['userData', id, 'helpSessions'], newHelpSession);
    };
}

export function joinHelpSession(id: string, tuteeID: string, tutorID: string) {
    return (dispatch: Dispatch, getState) => {
        const { doc } = getState();
        const { userData } = doc.getData();
        const { helpSessions } = userData[id];
        const sessionIndex = helpSessions.findIndex(e => e.tuteeID === tuteeID);
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