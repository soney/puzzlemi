import { IPuzzleSet, IProblem } from '../components/App';
import { SDBDoc } from 'sdb-ts';
import { Dispatch } from 'redux';
import uuid from '../utils/uuid';
import EventTypes from './EventTypes';

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

        return doc.submitListPushOp(['problems'], newProblem);
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


export function beginListeningOnDoc(doc: SDBDoc<IPuzzleSet>) {
    return (dispatch: Dispatch, getState) => {
        doc.subscribe((type: string, ops: any[]) => {
            if(type === null) {
                dispatch(puzzlesFetched(doc.getData()));
            } else if (type === 'op') {
                ops.forEach((op) => {
                    const { p, li, ld } = op;
                    const relPath = SDBDoc.relative(['problems'], p);
                    if(relPath) {
                        if(relPath.length === 1) {
                            const index = relPath[0] as number;
                            if(ld) { dispatch(problemDeleted(index)); }
                            if(li) { dispatch(problemAdded(index, li)); }
                        } else if(relPath.length === 3) {
                            const index = relPath[0] as number;
                            const item = relPath[1];
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
                                const testIndex = relPath[2] as number;
                                if(li) {
                                    dispatch(testAdded(problem.id, index, testIndex, li));
                                } else if(ld) {
                                    dispatch(testDeleted(problem.id, index, testIndex));
                                }
                            } else if(item === 'files') {
                                const fileIndex = relPath[2] as number;
                                if(li) {
                                    dispatch(fileAdded(index, fileIndex, li));
                                } else if(ld) {
                                    dispatch(fileDeleted(index, fileIndex));
                                }
                            }
                        } else if(relPath.length === 5) {
                            const index = relPath[0] as number;
                            const item = relPath[1];

                            const problemP = ['problems', index];
                            const problem = doc.traverse(problemP);
                            if(item === 'tests') {
                                const testIndex = relPath[2] as number;
                                const testP = ['problems', index, item, testIndex];
                                const testPart = relPath[3] as 'actual'|'expected'|'description';
                                const value = doc.traverse([...testP, testPart]);

                                dispatch(testPartChanged(problem.id, index, testIndex, testPart, value));
                            } else if(item === 'files') {
                                const fileIndex = relPath[2] as number;
                                const fileP = ['problems', index, item, fileIndex];
                                const filePart = relPath[3] as 'name'|'contents';
                                const value = doc.traverse([...fileP, filePart]);

                                dispatch(filePartChanged(index, fileIndex, filePart, value));
                            }
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