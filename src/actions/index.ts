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
export const givenCodeChanged = (index: number, code: string) => ({
    code, index, type: EventTypes.DESCRIPTION_CHANGED,
});
export const afterCodeChanged = (index: number, code: string) => ({
    code, index, type: EventTypes.DESCRIPTION_CHANGED,
});
export const problemDeleted = (index: number) => ({
    index, type: EventTypes.PROBLEM_DELETED,
});
export const testAdded = (index: number, testIndex: number, test) => ({
    index, testIndex, test, type: EventTypes.TEST_ADDED,
});
export const testDeleted = (index: number, testIndex: number) => ({
    index, testIndex, type: EventTypes.TEST_DELETED,
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
export const testPartChanged = (index: number, testIndex: number, part: 'actual'|'expected'|'description', value) => ({
    index, testIndex, part, value, type: EventTypes.TEST_PART_CHANGED,
});
export const setDoc = (doc: SDBDoc<IPuzzleSet>) => ({
    doc, type: EventTypes.SET_DOC,
});
export const setIsAdmin = (isAdmin: boolean) => ({
    isAdmin, type: EventTypes.SET_IS_ADMIN,
});

export function runCode(index: number) {
    return (dispatch: Dispatch, getState) => {
        const { doc } = getState();
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
    SET_IS_ADMIN
}