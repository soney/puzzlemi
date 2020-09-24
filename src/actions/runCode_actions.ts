import { Dispatch } from "redux";
import '../js/skulpt/skulpt.min.js';
import '../js/skulpt/skulpt-stdlib.js';
import EventTypes from "./EventTypes";
import { IProblem, ICodeProblem, ICodeFile, IProblemType, IProblemLeaderBoardList } from "../reducers/problems";
import { ICodeTest, CodeTestType, CodeTestStatus } from "../reducers/aggregateData";
import { ICodeSolutionState, CodePassedState, ICodeTestResult } from "../reducers/intermediateUserState";
import { IPMState } from "../reducers/index.js";
import uuid from "../utils/uuid";
import { logEvent } from '../utils/Firebase';
import { IDeleteUserFileAction } from "./user_actions.js";

declare const Sk;

// const jsonExternalLibInfo = {
//     dependencies: [
//         `skulpt-libs/json.sk-master/stringify.js`,
//     ],
//     path: `skulpt-libs/json.sk-master/__init__.js`,
// };
const puzzlemiExternalLibInfo = {
    path: 'skulpt-libs/puzzlemi_skulpt_lib.js'
};
const requestsLibInfo = {
    path: `skulpt-libs/requests/__init__.py`,
};
const requestsWithCachingLibInfo = {
    path: `skulpt-libs/requests_with_caching/__init__.py`,
};

const externalLibs = {
    // 'json': jsonExternalLibInfo,
    './puzzlemi/__init__.js': puzzlemiExternalLibInfo,
    'src/builtin/requests.py': requestsLibInfo,
    'src/builtin/requests_with_caching.py': requestsWithCachingLibInfo
};

Sk.configure({
});


// if (Sk.externalLibraries) {
//     Sk.externalLibraries.json = jsonExternalLibInfo;
//     Sk.externalLibraries.puzzlemi = puzzlemiExternalLibInfo;
//     Sk.externalLibraries.requests = requestsLibInfo;
//     Sk.externalLibraries.requests_with_caching = requestsWithCachingLibInfo;
// } else {
//     Sk.externalLibraries = {
//     };
// }
// console.log(Sk.externalLibraries);

export interface IDoneRunningCodeAction {
    type: EventTypes.DONE_RUNNING_CODE,
    problemID: string,
    passed: CodePassedState,
    testID: string
}

export interface IOutputChangedAction {
    type: EventTypes.OUTPUT_CHANGED,
    problemID: string,
    testID: string,
    output: string
}

export interface IFileWrittenAction {
    type: EventTypes.FILE_WRITTEN,
    contents: string,
    problemID: string,
    name: string
}

export interface IBeginRunningCodeAction {
    type: EventTypes.BEGIN_RUN_CODE,
    problem: IProblem,
    testID: string
}

export interface IErrorChangedAction {
    type: EventTypes.ERROR_CHANGED,
    problemID: string,
    testID: string,
    errors: string[]
}
export interface IPassedAddAction {
    type: EventTypes.ADD_PASSED_TESTS,
    problemID: string,
    passedIDs: string[]
}

export interface IFailedAddAction {
    type: EventTypes.ADD_FAILED_TEST,
    problemID: string,
    failedID: string
}

export interface IDoneRunningLiveCodeAction {
    type: EventTypes.DONE_RUNNING_LIVE,
    problemID: string,
    passed: CodePassedState,
    errors: string[]
}

export interface IExecuteCodeResult {
    errString: string,
    output: string
}

const testFunctions = `\nimport puzzlemi\ndef getEditorText(): return puzzlemi.doFNCallReturnString('getEditorText')\ndef getOutput(): return puzzlemi.doFNCallReturnString('getOutput')`;
const testFunctionsMatches = testFunctions.match(/\n/g);
const testFunctionsLines = testFunctionsMatches ? testFunctionsMatches.length : 1;
function executeCode(beforeCode: string, code: string, afterCode: string, files: { problemFiles: ICodeFile[], userFiles: ICodeFile[], tempFiles: ICodeFile[] }, outputChangeHandler, writeFileHandler, graphics) {
    beforeCode = beforeCode ? beforeCode + '\n' : '';
    afterCode = afterCode ? '\n' + afterCode : '';
    const fullCode = `${beforeCode}${code}${testFunctions}${afterCode}`;
    let oldGetEditorText: any;
    let oldGetOutput: any;
    const NONE = {};
    return new Promise<IExecuteCodeResult>(function (resolve, reject) {
        let output: string = '';
        const outputs: string[] = [];

        oldGetEditorText = window.hasOwnProperty('getEditorText') ? window['getEditorText'] : NONE;
        window['getEditorText'] = () => code;
        oldGetOutput = window.hasOwnProperty('getOutput') ? window['getOutput'] : NONE;
        window['getOutput'] = () => output;

        const outf = (outValue: string): void => {
            outputs.push(outValue);
            output = outputs.join('');
            outputChangeHandler(output);
        };

        const readf = (fname: string): string => {
            const { problemFiles, userFiles, tempFiles } = files;

            if (externalLibs[fname] !== undefined) {
                return Sk.misceval.promiseToSuspension(
                    fetch(externalLibs[fname].path).then(
                        function (resp){ return resp.text(); }
                    ));
            } else if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][fname] === undefined) {
                let file;
                [...problemFiles, ...userFiles, ...tempFiles].forEach((f) => {
                    const { name } = f;
                    if (name === fname) {
                        file = f;
                    }
                });

                if (file) {
                    return file.contents;
                } else {
                    throw new Error(`File not found: '${fname}'`);
                }
            } else {
                return Sk.builtinFiles["files"][fname];
            }
        }
        const writef = (contents: string, fname: string, pos: number): void => {
            writeFileHandler(contents, fname);
        };

        Sk.configure({
            jsonpSites: ['https://itunes.apple.com'],
            // python3: true,
            __future__: Sk.python3,
            filewriter: writef,
            output: outf,
            read: readf,
            inputfunTakesPrompt: true
        });
        if (graphics) (Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target = graphics;
        const myPromise = Sk.misceval.asyncToPromise(() => {
            return Sk.importMainWithBody("<stdin>", false, `${fullCode}\n`, true);
        });
        let errString: string;
        myPromise.catch((err) => {
            const pretextLines = (beforeCode.match(/\n/g) || '').length;

            const matches = code.match(/\n/g);
            const progLines = matches ? (matches.length + 1) : 1;

            let errorBefore: boolean = false;
            let errorAfter: boolean = false;

            if (err.traceback.length >= 1) {
                const errorLine = err.traceback[0].lineno;
                if (errorLine <= pretextLines) {
                    errorBefore = true;
                } else if (errorLine > (pretextLines + progLines + testFunctionsLines)) {
                    errorAfter = true;
                    err.traceback[0].lineno = err.traceback[0].lineno - pretextLines - progLines - testFunctionsLines;
                } else {
                    if (pretextLines > 0) {
                        err.traceback[0].lineno = err.traceback[0].lineno - pretextLines;
                    }
                }
            }
            if (errorBefore) {
                errString = `Error before your code ran:\n${err.toString()}`;
            } else if (errorAfter) {
                errString = `Error while running our tests:\n${err.toString()}`;
            } else {
                errString = err.toString();
            }
        }).finally(() => {
            if (oldGetEditorText === NONE) {
                delete window['getEditorText'];
            } else {
                window['getEditorText'] = oldGetEditorText;
            }
            oldGetEditorText = undefined;

            if (oldGetOutput === NONE) {
                delete window['getOutput'];
            } else {
                window['getOutput'] = oldGetOutput;
            }
            oldGetOutput = undefined;

            const returnResult: IExecuteCodeResult = { errString, output };
            resolve(returnResult);
        });

    });
}

export function runCode(code: string, userFiles: ICodeFile[], problem: IProblem, graphics: HTMLDivElement | null, test: ICodeTest, option?) {
    return (dispatch: Dispatch, getState) => {
        const { id: problemID } = problem;
        const problemDetails = problem.problemDetails as ICodeProblem;
        const files = { problemFiles: problemDetails.files, userFiles, tempFiles: [] };
        const writtenFiles: string[] = [];
        const testID = test ? test.id : "default";
        // const fullCode = test.before.concat(' \n' + code, ' \n' + test.after);
        const outputChangeHandler = (output) => {
            dispatch({
                problemID,
                output,
                testID,
                type: EventTypes.OUTPUT_CHANGED
            } as IOutputChangedAction);
        }
        const writeFileHandler = (contents, fname) => {
            if (writtenFiles.indexOf(fname) < 0) {
                let fileID: string | null = null;
                for (let i: number = 0; i < userFiles.length; i++) {
                    const userFile = userFiles[i];
                    if (userFile.name === fname) {
                        fileID = userFile.id;
                        break;
                    }
                }
                if (fileID) {
                    dispatch({
                        problem, fileID,
                        type: EventTypes.DELETE_USER_FILE
                    } as IDeleteUserFileAction);
                }

                writtenFiles.push(fname);
            }
            dispatch({
                contents: contents,
                problemID,
                name: fname,
                type: EventTypes.FILE_WRITTEN
            } as IFileWrittenAction);
        }

        dispatch({
            problem,
            testID,
            type: EventTypes.BEGIN_RUN_CODE
        } as IBeginRunningCodeAction);

        executeCode(test && test.before, code, test && test.after, files, outputChangeHandler, writeFileHandler, graphics).then(result => {
            const { errString, output } = result;
            const passed = errString ? CodePassedState.FAILED : CodePassedState.PASSED;
            if (errString) {
                dispatch({
                    errors: [errString],
                    problemID,
                    testID,
                    type: EventTypes.ERROR_CHANGED
                } as IErrorChangedAction);
            }
            dispatch({
                problemID,
                passed,
                testID,
                type: EventTypes.DONE_RUNNING_CODE
            } as IDoneRunningCodeAction);

            const state: IPMState = getState();
            const { intermediateUserState, shareDBDocs, users } = state;
            const { intermediateSolutionState } = intermediateUserState;
            const intermediateCodeState: ICodeSolutionState = intermediateSolutionState[problem.id] as ICodeSolutionState;
            const { testResults } = intermediateCodeState;
            let passedAll: boolean = true;
            for (let testID in testResults) {
                if (testResults.hasOwnProperty(testID)) {
                    const testResult = testResults[testID];
                    if (testResult.passed !== CodePassedState.PASSED) {
                        passedAll = false;
                        break;
                    }
                }
            }

            const myuid = users.myuid as string;
            const aggregateDataDoc = shareDBDocs.aggregateData!;
            const aggregateData = aggregateDataDoc.getData();
            const completedIndex = aggregateData.userData[problem.id].completed!.indexOf(myuid);
            const isMarkedAsPassedAll = completedIndex >= 0;
            if (passedAll && !isMarkedAsPassedAll) {
                if(problem.problemDetails.problemType === IProblemType.Code){
                    const username = users.allUsers[myuid].username!;
                    const problemsDoc = shareDBDocs.problems!;
                    const newMember:IProblemLeaderBoardList = {
                        username: username,
                        completionTime: problem.problemDetails.config.maxTime - problem.problemDetails.config.currentTime
                    }
                    problemsDoc.submitListPushOp(['allProblems', problem.id, 'problemDetails', 'config', 'problemLeaderBoard'], newMember);
                }
                aggregateDataDoc.submitListPushOp(['userData', problem.id, 'completed'], myuid);
            } else if (!passedAll && isMarkedAsPassedAll) {
                aggregateDataDoc.submitListDeleteOp(['userData', problem.id, 'completed', completedIndex]);
            }

            const problemsDoc = shareDBDocs.problems!;
            if (option === "l") {
                const newResult: ICodeTestResult = {
                    passed,
                    errors: errString ? [errString] : [],
                    output,
                }
                problemsDoc.submitObjectReplaceOp(['allProblems', problemID, 'problemDetails', 'liveCode', 'testResults', testID], newResult)
            }

            logEvent("run_code", { code, test: test ? JSON.stringify(test) : "", result: JSON.stringify({ passed, errString, output }) }, problem.id, myuid);
        });
    }
}

export function runVerifyTest(problem: IProblem, test: ICodeTest) {
    return (dispatch: Dispatch, getState) => {
        const { id: problemID } = problem;
        const problemDetails = problem.problemDetails as ICodeProblem;
        const { standardCode } = problemDetails;
        const tempFiles: ICodeFile[] = [];
        const files = { problemFiles: problemDetails.files, userFiles: [], tempFiles };

        const outputChangeHandler = (output) => { };

        const writeFileHandler = (contents, name) => {
            const fIndex = tempFiles.findIndex((f) => f.name === name);
            if (fIndex < 0) {
                tempFiles.push({ id: uuid(), name, contents });
            } else {
                tempFiles[fIndex].contents = tempFiles[fIndex].contents + contents;
            }
        };

        const standardCodePromise = executeCode(test.before, standardCode, test.after, files, outputChangeHandler, writeFileHandler, null);
        const emptyCodePromise = executeCode(test.before, '', test.after, files, outputChangeHandler, writeFileHandler, null);
        Promise.all([standardCodePromise, emptyCodePromise]).then(([standardCodeResult, emptyCodeResult]) => {
            const passedStandard = !standardCodeResult.errString;
            const passedEmpty = !emptyCodeResult.errString;
            const { shareDBDocs, users } = getState();
            const problemsDoc = shareDBDocs.problems;
            const aggregateDataDoc = shareDBDocs.aggregateData;
            const newStatus = (passedStandard && !passedEmpty) ? CodeTestStatus.VERIFIED : CodeTestStatus.VERIFICATION_FAILED;
            if (test.type === CodeTestType.INSTRUCTOR) {
                problemsDoc.submitObjectReplaceOp(['allProblems', problemID, 'problemDetails', 'tests', test.id, 'status'], newStatus);
            } else {
                aggregateDataDoc.submitObjectReplaceOp(['userData', problemID, 'tests', test.id, 'status'], newStatus);
            }
            const myuid = users.myuid as string;
            logEvent("verify_test", { code: standardCode, test: test ? JSON.stringify(test) : "", newStatus: newStatus }, problem.id, myuid);
        })
    }
}
