import { IPuzzleSet, IProblem } from '../components/App';
import { SDBDoc } from 'sdb-ts';
import { Dispatch } from 'redux';
import uuid from '../utils/uuid';
import EventTypes from './EventTypes';
import { ListInsertOp, ListDeleteOp, ObjectInsertOp } from 'sharedb';

export const puzzlesFetched = (puzzles: IPuzzleSet) => ({
    puzzles, type: EventTypes.PUZZLES_FETCHED,
});
export const problemAdded = (index: number, problem: IProblem) => ({
    index, problem, type: EventTypes.PROBLEM_ADDED,
});
export const descriptionChanged = (index: number, description: string) => ({
    description, index, type: EventTypes.DESCRIPTION_CHANGED,
});
export const givenCodeChanged = (index: number, id: string, code: string) => ({
    code, id, index, type: EventTypes.GIVEN_CODE_CHANGED,
});
export const afterCodeChanged = (index: number, code: string) => ({
    code, index, type: EventTypes.DESCRIPTION_CHANGED,
});
export const problemDeleted = (index: number) => ({
    index, type: EventTypes.PROBLEM_DELETED,
});
export const testAdded = (id: string, index: number, testIndex: number, test) => ({
    id, index, test, testIndex, type: EventTypes.TEST_ADDED,
});
export const testDeleted = (id: string, index: number, testIndex: number) => ({
    id, index, testIndex, type: EventTypes.TEST_DELETED,
});
export const fileAdded = (index: number, fileIndex: number, file) => ({
    file, fileIndex, index, type: EventTypes.FILE_ADDED,
});
export const fileDeleted = (index: number, fileIndex: number) => ({
    fileIndex, index, type: EventTypes.FILE_DELETED,
});
export const filePartChanged = (index: number, fileIndex: number, part: 'name'|'contents', value) => ({
    fileIndex, index, part, type: EventTypes.FILE_PART_CHANGED, value
});
export const testPartChanged = (id: string, index: number, testIndex: number, part: 'actual'|'expected'|'description', value) => ({
    id, index, part, testIndex, type: EventTypes.TEST_PART_CHANGED, value
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
            id: uuid(),
            tests: [],
        };

        doc.submitObjectInsertOp(['userData', newProblem.id], {
            completed: [],
            visible: true
        });
        doc.submitListPushOp(['problems'], newProblem);
    };
}

export function deleteProblem(index: number) {
    return (dispatch: Dispatch, getState) => {
        const { doc } = getState();
        return doc.submitListDeleteOp(['problems', index]);
    };
}

export function addTest(index: number) {
    return (dispatch: Dispatch, getState) => {
        const { doc } = getState();
        const newTest = {
            actual: 'True',
            description: '*no description*',
            expected: 'True',
            id: uuid(),
        };
        return doc.submitListPushOp(['problems', index, 'tests'], newTest);
    };
}

export function deleteTest(index: number, testIndex: number) {
    return (dispatch: Dispatch, getState) => {
        const { doc } = getState();
        return doc.submitListDeleteOp(['problems', index, 'tests', testIndex]);
    };
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
        if(userData[id]) {
            doc.submitObjectReplaceOp(['userData', id, 'visible'], visible);
        } else {
            doc.submitObjectInsertOp(['userData', id], {
                completed: [],
                visible
            });
        }
    };
}


export function beginListeningOnDoc(doc: SDBDoc<IPuzzleSet>) {
    return (dispatch: Dispatch, getState) => {
        doc.subscribe((type, ops) => {
            if(type === null) {
                dispatch(puzzlesFetched(doc.getData()));
            } else if (type === 'op') {
                ops!.forEach((op) => {
                    const { p } = op;
                    const { li } = op as ListInsertOp;
                    const { ld } = op as ListDeleteOp;

                    const problemRelPath = SDBDoc.relative(['problems'], p);
                    const userDataRelPath = SDBDoc.relative(['userData'], p);
                    if(problemRelPath) {
                        if(problemRelPath.length === 1) {
                            const index = problemRelPath[0] as number;
                            if(ld) { dispatch(problemDeleted(index)); }
                            if(li) { dispatch(problemAdded(index, li)); }
                        } else if(problemRelPath.length === 3) {
                            const index = problemRelPath[0] as number;
                            const item = problemRelPath[1];
                            const problemP = ['problems', index];
                            const problem = doc.traverse(problemP);
                            if(item === 'description') {
                                const newDescription = doc.traverse([...problemP, item]);
                                dispatch(descriptionChanged(index, newDescription));
                            } else if(item === 'givenCode') {
                                const id = doc.traverse([...problemP, 'id']);
                                const newCode = doc.traverse([...problemP, item]);
                                dispatch(givenCodeChanged(index, id, newCode));
                            } else if(item === 'afterCode') {
                                const newCode = doc.traverse([...problemP, item]);
                                dispatch(afterCodeChanged(index, newCode));
                            } else if(item === 'tests') {
                                const testIndex = problemRelPath[2] as number;
                                if(li) {
                                    dispatch(testAdded(problem.id, index, testIndex, li));
                                } else if(ld) {
                                    dispatch(testDeleted(problem.id, index, testIndex));
                                }
                            } else if(item === 'files') {
                                const fileIndex = problemRelPath[2] as number;
                                if(li) {
                                    dispatch(fileAdded(index, fileIndex, li));
                                } else if(ld) {
                                    dispatch(fileDeleted(index, fileIndex));
                                }
                            }
                        } else if(problemRelPath.length === 5) {
                            const index = problemRelPath[0] as number;
                            const item = problemRelPath[1];

                            const problemP = ['problems', index];
                            const problem = doc.traverse(problemP);
                            if(item === 'tests') {
                                const testIndex = problemRelPath[2] as number;
                                const testP = ['problems', index, item, testIndex];
                                const testPart = problemRelPath[3] as 'actual'|'expected'|'description';
                                const value = doc.traverse([...testP, testPart]);

                                dispatch(testPartChanged(problem.id, index, testIndex, testPart, value));
                            } else if(item === 'files') {
                                const fileIndex = problemRelPath[2] as number;
                                const fileP = ['problems', index, item, fileIndex];
                                const filePart = problemRelPath[3] as 'name'|'contents';
                                const value = doc.traverse([...fileP, filePart]);

                                dispatch(filePartChanged(index, fileIndex, filePart, value));
                            }
                        }
                    } else if(userDataRelPath && userDataRelPath.length >= 1) {
                        const problemID = userDataRelPath[0];
                        if(userDataRelPath.length === 3 && userDataRelPath[1] === 'completed') {
                            const userID = li;
                            const index = userDataRelPath[2];
                            dispatch({
                                index,
                                problemID,
                                type: EventTypes.USER_COMPLETED_PROBLEM,
                                userID,
                            });
                        } else if(userDataRelPath.length === 2 && userDataRelPath[1] === 'visible') {
                            const { oi } = op as ObjectInsertOp;
                            dispatch({
                                problemID,
                                type: EventTypes.PROBLEM_VISIBILITY_CHANGED,
                                visible: oi as boolean,
                            });
                        } else if(userDataRelPath.length === 1) {
                            const { oi } = op as ObjectInsertOp;
                            dispatch({
                                completionInfo: oi,
                                problemID,
                                type: EventTypes.PROBLEM_COMPLETION_INFO_FETCHED,
                            });
                        }
                    } else if(p.length === 0) { // full replacement
                        dispatch(puzzlesFetched(doc.getData()));
                    }
                    // console.log(op);
                });
            }
        });
    };
}