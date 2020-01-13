import { IPuzzleSet, IProblem, IMultipleChoiceOption } from '../components/App';
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
export const multipleChoiceOptionAdded = (index: number, optionIndex: number, option: IMultipleChoiceOption) => ({
    index, option, optionIndex, type: EventTypes.OPTION_ADDED
});
export const multipleChoiceOptionDeleted = (index: number, optionIndex: number) => ({
    index, optionIndex, type: EventTypes.OPTION_DELETED
});
export const multipleChoiceOptionDescriptionChanged = (index: number, optionIndex: number, description: string) => ({
    index, optionIndex, description, type: EventTypes.OPTION_DESCRIPTION_CHANGED
});
export const multipleChoiceOptionCorrectChanged = (index: number, optionIndex: number, isCorrect: boolean) => ({
    index, optionIndex, isCorrect, type: EventTypes.OPTION_CORRECTNESS_CHANGED
});
export const multipleChoiceSelectionTypeChanged = (index: number, selectionType: 'single'|'multiple', problemId: string) => ({
    index, selectionType, problemId, type: EventTypes.MULTIPLE_CHOICE_SELECTION_TYPE_CHANGED
});
export const multipleChoiceRevealSolutionChanged = (index: number, revealSolution: boolean) => ({
    index, revealSolution, type: EventTypes.MULTIPLE_CHOICE_REVEAL_SOLUTION_CHANGED
});
export const afterCodeChanged = (index: number, code: string) => ({
    code, index, type: EventTypes.AFTER_CODE_CHANGED,
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

export function addMultipleChoiceOption(index: number, optionType:'fixed'|'free-response'='fixed') {
    return (dispatch: Dispatch, getState) => {
        const { doc } = getState();
        const newOption: IMultipleChoiceOption = {
            id: uuid(), description: '(no description)', optionType, isCorrect: false
        };
        doc.submitListPushOp(['problems', index, 'problem', 'options'], newOption);
    };
}
export function deleteMultipleChoiceOption(index: number, optionIndex: number) {
    return (dispatch: Dispatch, getState) => {
        const { doc } = getState();
        doc.submitListDeleteOp(['problems', index, 'problem', 'options', optionIndex]);
    };
}

export function setMultipleChoiceOptionCorrect(index: number, optionIndex: number, correct: boolean) {
    return (dispatch: Dispatch, getState) => {
        const { doc } = getState();
        doc.submitObjectReplaceOp(['problems', index, 'problem', 'options', optionIndex, 'isCorrect'], correct);
    };
}

export function setMultipleChoiceSelectionEnabled(index: number, enabled: boolean) {
    return (dispatch: Dispatch, getState) => {
        const { doc } = getState();
        doc.submitObjectReplaceOp(['problems', index, 'problem', 'selectionType'], enabled ? 'multiple' : 'single');
    };
}

export function setRevealSolution(index: number, reveal: boolean) {
    return (dispatch: Dispatch, getState) => {
        const { doc } = getState();
        doc.submitObjectReplaceOp(['problems', index, 'problem', 'revealSolution'], reveal);
    };
}

export function addCodeProblem() {
    return (dispatch: Dispatch, getState) => {
        const { doc } = getState();
        const newProblem: IProblem = {
            id: uuid(),
            problem: {
                problemType: 'code',
                tests: [],
                givenCode: `# code here`,
                afterCode: '',
                description: '*no description*',
                files: [],
            }
        };

        doc.submitObjectInsertOp(['userData', newProblem.id], {
            completed: [],
            visible: true
        });
        doc.submitListPushOp(['problems'], newProblem);
    };
}

export function addMultipleChoiceProblem() {
    return (dispatch: Dispatch, getState) => {
        const { doc } = getState();
        const newProblem: IProblem = {
            id: uuid(),
            problem: {
                problemType: 'multiple-choice',
                description: '*no description*',
                options: [],
                selectionType: 'single',
                revealSolution: false
            }
        };

        doc.submitObjectInsertOp(['userData', newProblem.id], {
            completed: [],
            visible: true
        });
        doc.submitListPushOp(['problems'], newProblem);
    };
}

export function addTextResponseProblem() {
    return (dispatch: Dispatch, getState) => {
        const { doc } = getState();
        const newProblem: IProblem = {
            id: uuid(),
            problem: {
                problemType: 'text-response',
                description: '*no description*',
            }
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
        return doc.submitListPushOp(['problems', index, 'problem', 'tests'], newTest);
    };
}

export function deleteTest(index: number, testIndex: number) {
    return (dispatch: Dispatch, getState) => {
        const { doc } = getState();
        return doc.submitListDeleteOp(['problems', index, 'problem', 'tests', testIndex]);
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
        return doc.submitListPushOp(['problems', index, 'problem', 'files'], newFile);
    };
}

export function deleteFile(index: number, fileIndex: number) {
    return (dispatch: Dispatch, getState) => {
        const { doc } = getState();
        return doc.submitListDeleteOp(['problems', index, 'problem', 'files', fileIndex]);
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
                        } else if(problemRelPath.length === 4 && problemRelPath[1] === 'problem') {
                            const index = problemRelPath[0] as number;
                            const item = problemRelPath[2];
                            const problemP = ['problems', index];
                            const problem = doc.traverse(problemP);
                            if(item === 'description') {
                                const newDescription = doc.traverse([...problemP, 'problem', item]);
                                dispatch(descriptionChanged(index, newDescription));
                            } else if(item === 'givenCode') {
                                const id = doc.traverse([...problemP, 'id']);
                                const newCode = doc.traverse([...problemP, 'problem', item]);
                                dispatch(givenCodeChanged(index, id, newCode));
                            } else if(item === 'afterCode') {
                                const newCode = doc.traverse([...problemP, 'problem', item]);
                                dispatch(afterCodeChanged(index, newCode));
                            } else if(item === 'tests') {
                                const testIndex = problemRelPath[3] as number;
                                if(li) {
                                    dispatch(testAdded(problem.id, index, testIndex, li));
                                } else if(ld) {
                                    dispatch(testDeleted(problem.id, index, testIndex));
                                }
                            } else if(item === 'files') {
                                const fileIndex = problemRelPath[3] as number;
                                if(li) {
                                    dispatch(fileAdded(index, fileIndex, li));
                                } else if(ld) {
                                    dispatch(fileDeleted(index, fileIndex));
                                }
                            } else if(item === 'options') {
                                const optionIndex = problemRelPath[3] as number;
                                if(li) {
                                    dispatch(multipleChoiceOptionAdded(index, optionIndex, li));
                                } else if(ld) {
                                    dispatch(multipleChoiceOptionDeleted(index, optionIndex));
                                }
                            }
                        } else if(problemRelPath.length === 5) {
                            const index = problemRelPath[0] as number;
                            const item = problemRelPath[2];

                            if(item === 'options') {
                                const optionIndex = problemRelPath[3] as number;
                                const { oi } = op as ObjectInsertOp;
                                if(problemRelPath[4] === 'isCorrect') {
                                    dispatch(multipleChoiceOptionCorrectChanged(index, optionIndex, oi));
                                }
                            }
                        } else if(problemRelPath.length === 6) {
                            const index = problemRelPath[0] as number;
                            const item = problemRelPath[2];

                            const problemP = ['problems', index];
                            const problem = doc.traverse(problemP);
                            if(item === 'tests') {
                                console.log(problemRelPath);
                                const testIndex = problemRelPath[3] as number;
                                const testP = ['problems', index, 'problem', item, testIndex];
                                const testPart = problemRelPath[4] as 'actual'|'expected'|'description';
                                const value = doc.traverse([...testP, testPart]);

                                dispatch(testPartChanged(problem.id, index, testIndex, testPart, value));
                            } else if(item === 'files') {
                                const fileIndex = problemRelPath[3] as number;
                                const fileP = ['problems', index, 'problem', item, fileIndex];
                                const filePart = problemRelPath[4] as 'name'|'contents';
                                const value = doc.traverse([...fileP, filePart]);

                                dispatch(filePartChanged(index, fileIndex, filePart, value));
                            } else if(item === 'options') {
                                const optionIndex = problemRelPath[3] as number;
                                const optionP = ['problems', index, 'problem', item, optionIndex]
                                const value = doc.traverse([...optionP, 'description']);

                                dispatch(multipleChoiceOptionDescriptionChanged(index, optionIndex, value));
                            }
                        } else if(problemRelPath.length === 3) {
                            const index = problemRelPath[0] as number;
                            const { oi } = op as ObjectInsertOp;
                            if(problemRelPath[2] === 'selectionType') {
                                const problemId = doc.traverse(['problems', index, 'id']);
                                dispatch(multipleChoiceSelectionTypeChanged(index, oi, problemId));
                            } else if(problemRelPath[2] === 'revealSolution') {
                                dispatch(multipleChoiceRevealSolutionChanged(index, oi));
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