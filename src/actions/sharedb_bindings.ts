import { ListInsertOp, ListDeleteOp, ObjectInsertOp, ObjectDeleteOp } from 'sharedb';
import { SDBDoc } from 'sdb-ts';
import { Dispatch } from 'redux';
import EventTypes from './EventTypes';
import { IPuzzleSet } from '../utils/types';


export const setDoc = (doc: SDBDoc<IPuzzleSet>) => ({
    doc, type: EventTypes.SET_DOC,
});

function parseOpType(op): string {
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
        case ((problemRelPath) && (problemRelPath.length === 3) && (problemRelPath[1] === 'notes')): return EventTypes.NOTES_CHANGED;
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

function dispatchOp(op, doc, dispatch) {
    const { p } = op;
    const { li } = op as ListInsertOp;
    const { oi } = op as ObjectInsertOp;
    const problemRelPath = SDBDoc.relative(['problems'], p);
    const userDataRelPath = SDBDoc.relative(['userData'], p);

    const type = parseOpType(op);
    // problem index
    let index;
    let testIndex;
    let fileIndex;
    let variableIndex;
    // problem id
    let id;
    console.log('SDBOp:' + type);

    switch (type) {
        case EventTypes.PROBLEM_ADDED:
            dispatch({ type, index: problemRelPath[0], problem: li });
            break;
        case EventTypes.PROBLEM_DELETED:
            dispatch({ type, index: problemRelPath[0] });
            break;
        case EventTypes.DESCRIPTION_CHANGED:
            index = problemRelPath[0] as number;
            const newDescription = doc.traverse(['problems', index, 'description']);
            dispatch({ type, index, description: newDescription });
            break;
        case EventTypes.NOTES_CHANGED:
            index = problemRelPath[0] as number;
            const newNotes = doc.traverse(['problems', index, 'notes']);
            dispatch({ type, index, notes: newNotes });
            break;
        case EventTypes.GIVEN_CODE_CHANGED:
            index = problemRelPath[0] as number;
            id = doc.traverse(['problems', index, 'id']);
            const newGivenCode = doc.traverse(['problems', index, 'givenCode']);
            dispatch({ type, index, code: newGivenCode, id });
            break;
        case EventTypes.AFTER_CODE_CHANGED:
            index = problemRelPath[0] as number;
            const newAfterCode = doc.traverse(['problems', index, 'afterCode']);
            dispatch({ type, index, code: newAfterCode });
            break;
        case EventTypes.STANDARD_CODE_CHANGED:
            index = problemRelPath[0] as number;
            const newStandardCode = doc.traverse(['problems', index, 'standardCode']);
            dispatch({ type, index, code: newStandardCode });
            break;
        case EventTypes.TEST_ADDED:
            index = problemRelPath[0] as number;
            id = doc.traverse(['problems', index, 'id']);
            dispatch({ type, index, id, testIndex: problemRelPath[2], test: li });
            break;
        case EventTypes.TEST_DELETED:
            index = problemRelPath[0] as number;
            id = doc.traverse(['problems', index, 'id']);
            dispatch({ type, index, id, testIndex: problemRelPath[2] });
            break;
        case EventTypes.FILE_ADDED:
            index = problemRelPath[0] as number;
            dispatch({ type, index, fileIndex: problemRelPath[2], file: li });
            break;
        case EventTypes.FILE_DELETED:
            index = problemRelPath[0] as number;
            dispatch({ type, index, fileIndex: problemRelPath[2] });
            break;
        case EventTypes.TEST_PART_CHANGED:
            index = problemRelPath[0] as number;
            testIndex = problemRelPath[2] as number;
            let partType = problemRelPath[3] as string;
            let partValue = doc.traverse(['problems', index, 'tests', testIndex, partType])
            id = doc.traverse(['problems', index, 'id']);
            dispatch({ type, index, testIndex, id, partType, partValue });
            break;
        case EventTypes.TEST_VALUE_CHANGED:
            index = problemRelPath[0] as number;
            testIndex = problemRelPath[2] as number;
            let variableType = problemRelPath[3];
            variableIndex = problemRelPath[4];
            let variableValue = doc.traverse(['problems', index, 'tests', testIndex, variableType, variableIndex, 'value']);
            dispatch({ type, index, testIndex, variableType, variableIndex, variableValue });
            break;
        case EventTypes.TEST_STATUS_CHANGED:
            dispatch({ type, index: problemRelPath[0], testIndex: problemRelPath[2], value: oi });
            break;
        case EventTypes.FILE_PART_CHANGED:
            index = problemRelPath[0] as number;
            fileIndex = problemRelPath[2] as number;
            const filePartType = problemRelPath[3] as 'name' | 'contents';
            const newFilePart = doc.traverse(['problems', index, 'files', fileIndex, filePartType]);
            dispatch({ type, index, fileIndex, part: filePartType, value: newFilePart })
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
            dispatch({ type, index: problemRelPath[0], variable: li, variableIndex: problemRelPath[2] });
            break;
        case EventTypes.VARIABLE_DELETED:
            index = problemRelPath[0] as number;
            dispatch({ type, index: problemRelPath[0], variableIndex: problemRelPath[2] })
            break;
        case EventTypes.VARIABLE_PART_CHANGED:
            index = problemRelPath[0] as number;
            variableIndex = problemRelPath[2] as number;
            const value = doc.traverse(['problems', index, 'variables', variableIndex, problemRelPath[3]]);
            dispatch({ type, index, variableIndex, part: problemRelPath[3], value })
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
            dispatch({ type, index, problemID: id, config_item: problemRelPath[2], config_value: oi });
            break;

        default:
            if (p.length === 0) { // full replacement
                const puzzles = doc.getData();
                dispatch({
                    puzzles, type: EventTypes.PUZZLES_FETCHED,
                })
            }

    }
}

export function beginListeningOnDoc(doc: SDBDoc<IPuzzleSet>) {
    return (dispatch: Dispatch, getState) => {
        doc.subscribe((type, ops) => {
            if (type === null) {
                const puzzles = doc.getData();
                dispatch({
                    puzzles, type: EventTypes.PUZZLES_FETCHED,
                })
            } else if (type === 'op') {
                ops!.forEach((op) => {
                    dispatchOp(op, doc, dispatch)
                })
            }
        })
    }
}