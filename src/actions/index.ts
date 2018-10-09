import { IProblem, IPuzzleSet } from "../components/App";
import { SDBDoc } from "sdb-ts";
import { Dispatch } from "redux";
import uuid from "src/utils/uuid";
import { PMTestSuite } from "src/pyTests/PMTestSuite";

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
    code, index, id, type: EventTypes.GIVEN_CODE_CHANGED,
});
export const afterCodeChanged = (index: number, code: string) => ({
    code, index, type: EventTypes.DESCRIPTION_CHANGED,
});
export const problemDeleted = (index: number) => ({
    index, type: EventTypes.PROBLEM_DELETED,
});
export const testAdded = (id: string, index: number, testIndex: number, test) => ({
    id, index, testIndex, test, type: EventTypes.TEST_ADDED,
});
export const testDeleted = (id: string, index: number, testIndex: number) => ({
    id, index, testIndex, type: EventTypes.TEST_DELETED,
});
export const fileAdded = (index: number, fileIndex: number, file) => ({
    index, fileIndex, file, type: EventTypes.FILE_ADDED,
});
export const fileDeleted = (index: number, fileIndex: number) => ({
    index, fileIndex, type: EventTypes.FILE_DELETED,
});
export const filePartChanged = (index: number, fileIndex: number, part: 'name'|'contents', value) => ({
    index, fileIndex, part, value, type: EventTypes.FILE_PART_CHANGED,
});
export const testPartChanged = (id: string, index: number, testIndex: number, part: 'actual'|'expected'|'description', value) => ({
    id, index, testIndex, part, value, type: EventTypes.TEST_PART_CHANGED,
});
export const setDoc = (doc: SDBDoc<IPuzzleSet>) => ({
    doc, type: EventTypes.SET_DOC,
});
export const setIsAdmin = (isAdmin: boolean) => ({
    isAdmin, type: EventTypes.SET_IS_ADMIN,
});

export function deleteUserFile(index: number, name: string) {
    return (dispatch: Dispatch, getState) => {
        const { user, problems } = getState();
        const problem = problems[index];
        const problemId = problem.id;

        dispatch({
            problemId: problemId, name, type: EventTypes.DELETE_USER_FILE
        });
    };
}
export function setCode(index: number, code: string) {
    return (dispatch: Dispatch, getState) => {
        const { problems } = getState();
        const problem = problems[index];
        const { id } = problem;

        dispatch({
            id, code, modified: true, type: EventTypes.CODE_CHANGED
        });
    };
}
export function resetCode(index: number) {
    return (dispatch: Dispatch, getState) => {
        const { problems } = getState();
        const problem = problems[index];
        const { id, givenCode } = problem;
        dispatch({
            id, code: givenCode, modified: false, type: EventTypes.CODE_CHANGED,
        });
    };
}
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
            id: uuid(),
            actual: 'True',
            expected: 'True',
            description: '*no description*'
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
            id: uuid(),
            name: 'file.txt',
            contents: 'file contents'
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
                                const { li, ld } = op;
                                const testIndex = relPath[2] as number;
                                if(li) {
                                    dispatch(testAdded(problem.id, index, testIndex, li));
                                } else if(ld) {
                                    dispatch(testDeleted(problem.id, index, testIndex));
                                }
                            } else if(item === 'files') {
                                const { li, ld } = op;
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
                    }
                    // console.log(op);
                });
            }
        });
    };
}

export enum EventTypes {
    RUN_CODE,
    DESCRIPTION_CHANGED,
    GIVEN_CODE_CHANGED,
    AFTER_CODE_CHANGED,
    PROBLEM_ADDED,
    TEST_ADDED,
    TEST_DELETED,
    TEST_PART_CHANGED,
    FILE_ADDED,
    FILE_PART_CHANGED,
    FILE_DELETED,
    PROBLEM_DELETED,
    PUZZLES_FETCHED,
    SET_DOC,
    SET_IS_ADMIN,
    CODE_CHANGED,
    RESET_CODE,
    OUTPUT_CHANGED,
    FILE_WRITTEN,
    ERROR_CHANGED,
    TEST_STATUS_CHANGED,
    PROBLEM_PASSED_CHANGED,
    BEGIN_RUN_CODE,
    DONE_RUNNING_CODE,
    DELETE_USER_FILE
}