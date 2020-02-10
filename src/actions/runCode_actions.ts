import { Dispatch } from "redux";
import '../js/skulpt/skulpt.min.js';
import '../js/skulpt/skulpt-stdlib.js';
import EventTypes from "./EventTypes";
import { ICodeSolution } from "../reducers/solutions";
import { IProblem, ICodeProblem } from "../reducers/problems";
import { ICodeTest, CodeTestType, CodeTestStatus } from "../reducers/aggregateData";
import { ICodeSolutionState } from "../reducers/intermediateUserState";

declare const Sk;

Sk.configure({
    inputfunTakesPrompt: true,
    jsonpSites: ['https://itunes.apple.com'],
    python3: true,
});
const jsonExternalLibInfo = {
    dependencies: [
        `${window.location.origin}/json.sk-master/stringify.js`,
    ],
    path: `${window.location.origin}/json.sk-master/__init__.js`,
};

if (Sk.externalLibraries) {
    Sk.externalLibraries.json = jsonExternalLibInfo;
} else {
    Sk.externalLibraries = {
        json: jsonExternalLibInfo
    };
}

export interface IDoneRunningCodeAction {
    type: EventTypes.DONE_RUNNING_CODE,
    problemID: string,
    passed: boolean|null,
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
    problemID: string,
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

export interface IExecuteCodeResult {
    errString: string,
    output: string
}

function executeCode(beforeCode: string, code: string, afterCode: string, files, outputChangeHandler, writeFileHandler, graphics) {
    beforeCode = beforeCode + '\n';
    afterCode = '\n' + afterCode;
    const fullCode = `${beforeCode}${code}${afterCode}`;
    return new Promise<IExecuteCodeResult>(function (resolve, reject) {
        let output: string = '';
        const outputs: string[] = [];

        const outf = (outValue: string): void => {
            outputs.push(outValue);
            output = outputs.join('');
            outputChangeHandler(output);
        };

        const readf = (fname: string): string => {
            const { problemFiles, userFiles } = files;

            if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][fname] === undefined) {
                let file;
                [...problemFiles, ...userFiles].forEach((f) => {
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
        const onFinally = () => {
            const returnResult: IExecuteCodeResult = { errString, output };
            resolve(returnResult);
        };
        myPromise.then(onFinally, (err) => {
            const pretextLines = (beforeCode.match(/\n/g) || '').length;
 
            const matches = code.match(/\n/g);
            const progLines = matches ? (matches.length + 1) : 1;

            let errorBefore: boolean = false;
            let errorAfter: boolean = false;
            if (err.traceback.length >= 1) {
                const errorLine = err.traceback[0].lineno;
                if (errorLine <= pretextLines) {
                    errorBefore = true;
                } else if (errorLine > (progLines + pretextLines)) {
                    errorAfter = true;
                    err.traceback[0].lineno = err.traceback[0].lineno - pretextLines - progLines;
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
            onFinally();
        });

    });
}

export function runCode(codeSolution: ICodeSolution, problem: IProblem, intermediateSolutionState: ICodeSolutionState, graphics: HTMLDivElement | null, test: ICodeTest) {
    return (dispatch: Dispatch, getState) => {
        const { id: problemID } = problem;
        const problemDetails = problem.problemDetails as ICodeProblem;
        const { code } = codeSolution;
        const files = { problemFiles: problemDetails.files, userFiles: codeSolution.files };
        // const fullCode = test.before.concat(' \n' + code, ' \n' + test.after);
        const outputChangeHandler = (output) => {
            dispatch({
                problemID,
                output,
                testID: test.id,
                type: EventTypes.OUTPUT_CHANGED
            } as IOutputChangedAction);
        }
        const writeFileHandler = (contents, fname) => {
            dispatch({
                contents: contents + '\n',
                problemID,
                name: fname,
                type: EventTypes.FILE_WRITTEN
            } as IFileWrittenAction);
        }

        dispatch({
            problemID,
            testID: test.id,
            type: EventTypes.BEGIN_RUN_CODE
        } as IBeginRunningCodeAction);

        executeCode(test.before, code, test.after, files, outputChangeHandler, writeFileHandler, graphics).then(result => {
            const { errString } = result;
            const passed = errString?false:true;
            if (errString) {
                dispatch({
                    errors: [errString],
                    problemID,
                    testID: test.id,
                    type: EventTypes.ERROR_CHANGED
                } as IErrorChangedAction);
            }
            dispatch({
                problemID,
                passed,
                testID: test.id,
                type: EventTypes.DONE_RUNNING_CODE
            } as IDoneRunningCodeAction);
        })
    }
}

export function runVerifyTest(problem: IProblem, test:ICodeTest) {
    return (dispatch: Dispatch, getState) => {
        const { id: problemID } = problem;
        const problemDetails = problem.problemDetails as ICodeProblem;
        const { standardCode } = problemDetails;
        const files = { problemFiles: problemDetails.files};
       
        const outputChangeHandler = (output) => {
        }
        const writeFileHandler = (contents, fname) => {
        }
        executeCode(test.before, standardCode, test.after, files, outputChangeHandler, writeFileHandler, null).then(result => {
            const { errString } = result;
            const passed = errString?false:true;
            const { shareDBDocs } = getState();
            const problemsDoc = shareDBDocs.problems;
            const aggregateDataDoc = shareDBDocs.aggregateData;
            const newStatus = passed?CodeTestStatus.PASSED:CodeTestStatus.FAILED;
            if(test.type === CodeTestType.INSTRUCTOR) problemsDoc.submitObjectReplaceOp(['allProblems', problemID, 'problemDetails', 'tests', test.id, 'status'], newStatus);
            else aggregateDataDoc.submitObjectReplaceOp(['userData', problemID, 'tests', test.id, 'status'], newStatus)
        })
    }
}