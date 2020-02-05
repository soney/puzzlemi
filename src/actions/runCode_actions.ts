import { Dispatch } from "redux";
import '../js/skulpt/skulpt.min.js';
import '../js/skulpt/skulpt-stdlib.js';
// import { PMAssertion, PMAssertEqual } from "../pyTests/PMTest";
import { IPMTestResult } from "../pyTests/PMTestSuite";
// import { PMTestSuite, IPMTestResult } from "../pyTests/PMTestSuite";
import EventTypes from "./EventTypes";
import { SDBDoc } from "sdb-ts";
import { ICodeSolution } from "../reducers/solutions.js";
// import { IProblem, ICodeProblem, ICodeVariableTest, ICodeTest } from "../reducers/problems";
import { IProblem, ICodeProblem } from "../reducers/problems";
import { IAggregateData, ICodeSolutionAggregate } from "../reducers/aggregateData.js";
import { ICodeSolutionState } from "../reducers/intermediateUserState.js";

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
    hasError: boolean,
    problemID: string,
    passedAll: boolean,
    testResults: {
        [testID: string]: IPMTestResult
    }
}

export interface IOutputChangedAction {
    type: EventTypes.OUTPUT_CHANGED,
    problemID: string,
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
    problemID: string
}

export interface IErrorChangedAction {
    type: EventTypes.ERROR_CHANGED,
    problemID: string
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
    passedAll: boolean,
    testResults: {},
    output: string
}

// function executeCode(code: string, tests: ICodeTest[], afterCode, files, outputChangeHandler, writeFileHandler, graphics) {
//     return new Promise<IExecuteCodeResult>(function (resolve, reject) {
//         let output: string = '';
//         const outputs: string[] = [];

//         const testSuite = new PMTestSuite(code, outputs);
//         const outf = (outValue: string): void => {
//             if (!testSuite.currentlyRunning()) {
//                 outputs.push(outValue);
//                 output = outputs.join('');
//                 outputChangeHandler(output);
//             }
//         };

//         const readf = (fname: string): string => {
//             const { problemFiles, userFiles } = files;

//             if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][fname] === undefined) {
//                 let file;
//                 [...problemFiles, ...userFiles].forEach((f) => {
//                     const { name } = f;
//                     if (name === fname) {
//                         file = f;
//                     }
//                 });

//                 if (file) {
//                     return file.contents;
//                 } else {
//                     throw new Error(`File not found: '${fname}'`);
//                 }
//             } else {
//                 return Sk.builtinFiles["files"][fname];
//             }
//         }
//         const writef = (contents: string, fname: string, pos: number): void => {
//             writeFileHandler(contents, fname);
//         };

//         const assertions: PMAssertion[] = tests.map((t) => new PMAssertEqual(t.id, t.actual, t.expected, t.description));
//         testSuite.setBeforeTests(afterCode);
//         testSuite.setAssertions(assertions);
//         testSuite.onBeforeRunningTests();
//         Sk.configure({
//             filewriter: writef,
//             output: outf,
//             read: readf,
//             inputfunTakesPrompt: true
//         });
//         if (graphics) (Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target = graphics;
//         const myPromise = Sk.misceval.asyncToPromise(() => {
//             return Sk.importMainWithBody("<stdin>", false, `${code}\n${testSuite.getString()}`, true);
//         });
//         let errString: string;
//         const onFinally = () => {
//             testSuite.onAfterRanTests();
//             const testSuiteResults = testSuite.getTestResults();
//             const { passedAll, results } = testSuiteResults;
//             const problemTests = tests;
//             const testResults = {};

//             results.forEach((result, i) => {
//                 const test = problemTests[i];
//                 const testId = test.id;
//                 testResults[testId] = result;
//             });

//             const returnResult: IExecuteCodeResult = { errString, passedAll, testResults, output };
//             resolve(returnResult);
//         };
//         myPromise.then(onFinally, (err) => {
//             const pretextLines = 0;
//             const matches = code.match(/\n/g);
//             const progLines = matches ? (matches.length + 1) : 1;

//             let errorBefore: boolean = false;
//             let errorAfter: boolean = false;
//             if (err.traceback.length >= 1) {
//                 const errorLine = err.traceback[0].lineno;
//                 if (errorLine <= pretextLines) {
//                     errorBefore = true;
//                 } else if (errorLine > (progLines + pretextLines)) {
//                     errorAfter = true;
//                 } else {
//                     if (pretextLines > 0) {
//                         err.traceback[0].lineno = err.traceback[0].lineno - pretextLines + 1;
//                     }
//                 }
//             }
//             if (errorBefore) {
//                 errString = `Error before your code ran:\n${err.toString()}`;
//             } else if (errorAfter) {
//                 errString = `Error while running our tests:\n${err.toString()}`;
//             } else {
//                 errString = err.toString();
//             }
//             onFinally();
//         });

//     });
// }

// function executeUniteTest(variableTest, codeSolution: ICodeSolution, problem: IProblem, intermediateSolutionState: ICodeSolutionState, graphics: HTMLDivElement | null) {
//     return new Promise(function (resolve, reject) {
//         const problemDetails = problem.problemDetails as ICodeProblem;
//         const { afterCode, tests } = problemDetails;
//         const { code } = codeSolution;
//         const files = { problemFiles: problemDetails.files, userFiles: codeSolution.files };
//         let beforeCode = "";
//         variableTest.input.forEach(variable => {
//             const snippet: string = variable.name + "=" + variable.value + ";\n";
//             beforeCode = beforeCode.concat(snippet);
//         });
//         const fullCode = beforeCode.concat(code);

//         let afterTest: any[] = [];
//         variableTest.output.forEach((variable, i) => {
//             const t = {
//                 id: 'variable-' + variable.name,
//                 actual: variable.name,
//                 expected: variable.value,
//                 description: 'expected variable ' + variable.name + ' = ' + variable.value
//             }
//             afterTest.push(t)
//         });
//         const outputChangeHandler = (output) => {
//         }
//         const writeFileHandler = (contents, fname) => {
//         };
//         const fullTests = afterTest.concat(tests);
//         executeCode(fullCode, fullTests, afterCode, files, outputChangeHandler, writeFileHandler, graphics).then(result => {
//             if (result.passedAll) resolve('True');
//             else reject({ test: variableTest, result });
//         });
//     })
// }

// export function runUnitTests(codeSolution: ICodeSolution, problem: IProblem, intermediateSolutionState: ICodeSolutionState, graphics: HTMLDivElement | null) {
//     return (dispatch: Dispatch, getState) => {
//         const { id: problemID } = problem;
//         const problemDetails = problem.problemDetails as ICodeProblem;
//         const { variableTests } = problemDetails;
//         const validVariableTests = variableTests.filter(i => i.status === 'Passed');
//         dispatch({
//             problemID,
//             type: EventTypes.BEGIN_RUN_CODE
//         } as IBeginRunningCodeAction);

//         Promise.all(validVariableTests.map(test => executeUniteTest(test, codeSolution, problem, intermediateSolutionState, graphics)))
//             .then(result => {
//                 // pass all the variable
//                 const passedIDs = validVariableTests.map(t => t.id);
//                 dispatch({
//                     problemID,
//                     passedIDs,
//                     type: EventTypes.ADD_PASSED_TESTS
//                 } as IPassedAddAction)
//             })
//             .catch(error => {
//                 const { test, result } = error;
//                 let passedIDs: string[] = [];
//                 for (let i = 0; i < validVariableTests.length; i++) {
//                     if (validVariableTests[i].id !== test.id) passedIDs.push(validVariableTests[i].id as string);
//                     else break;
//                 }
//                 dispatch({
//                     problemID,
//                     passedIDs,
//                     type: EventTypes.ADD_PASSED_TESTS
//                 } as IPassedAddAction)
//                 dispatch({
//                     problemID,
//                     failedID: test.id,
//                     type: EventTypes.ADD_FAILED_TEST
//                 } as IFailedAddAction)
//                 const { errString, passedAll, testResults, output } = result;
//                 if (errString) {
//                     dispatch({
//                         errors: [errString],
//                         problemID,
//                         type: EventTypes.ERROR_CHANGED
//                     } as IErrorChangedAction);
//                 }
//                 dispatch({
//                     problemID,
//                     output,
//                     type: EventTypes.OUTPUT_CHANGED
//                 } as IOutputChangedAction);
//                 dispatch({
//                     hasError: true,
//                     problemID,
//                     passedAll,
//                     testResults,
//                     type: EventTypes.DONE_RUNNING_CODE
//                 } as IDoneRunningCodeAction);
//             });
//     }
// }

// export function runVerifyTest(problem: IProblem, variableTest: ICodeVariableTest) {
//     return async (dispatch: Dispatch, getState) => {
//         const { id: problemID } = problem;
//         const problemDetails = problem.problemDetails as ICodeProblem;
//         const { afterCode, standardCode, tests } = problemDetails;
//         const files = { problemFiles: problemDetails.files, userFiles: null };

//         let beforeCode = "";
//         variableTest.input.forEach(variable => {
//             const snippet: string = variable.name + "=" + variable.value + ";\n";
//             beforeCode = beforeCode.concat(snippet);
//         })
//         const fullCode = beforeCode.concat(standardCode);

//         let afterTest: any[] = [];
//         variableTest.output.forEach((variable, i) => {
//             const t = {
//                 id: 'variable-' + variable.name,
//                 actual: variable.name,
//                 expected: variable.value,
//                 description: 'expected variable ' + variable.name + ' = ' + variable.value
//             }
//             afterTest.push(t)
//         });
//         const fullTests = afterTest.concat(tests);

//         const outputChangeHandler = (output) => {
//         }
//         const writeFileHandler = (contents, fname) => {
//         }

//         const { shareDBDocs } = getState();
//         const problemsDoc = shareDBDocs.problems;
//         const updated_variableTests = problemsDoc.traverse(['allProblems', problemID, 'problemDetails', 'variableTests']);
//         let testIndex = 0;
//         updated_variableTests.forEach((t, i) => {
//             if (t.id === variableTest.id) testIndex = i;
//         })

//         await executeCode(fullCode, fullTests, afterCode, files, outputChangeHandler, writeFileHandler, null).then(result => {
//             const { passedAll } = result;
//             const status = passedAll ? 'Passed' : 'Failed';
//             problemsDoc.submitObjectReplaceOp(['allProblems', problemID, 'problemDetails', 'variableTests', testIndex, 'status'], status);
//         })

//     }
// }

// export function runCode(codeSolution: ICodeSolution, problem: IProblem, intermediateSolutionState: ICodeSolutionState, graphics: HTMLDivElement | null, variableTest: ICodeVariableTest) {
//     return (dispatch: Dispatch, getState) => {
//         const { id: problemID } = problem;
//         const problemDetails = problem.problemDetails as ICodeProblem;
//         const { afterCode, tests } = problemDetails;
//         const { code } = codeSolution;
//         const files = { problemFiles: problemDetails.files, userFiles: codeSolution.files };

//         let beforeCode = "";
//         variableTest.input.forEach(variable => {
//             const snippet: string = variable.name + "=" + variable.value + ";\n";
//             beforeCode = beforeCode.concat(snippet);
//         })
//         const fullCode = beforeCode.concat(code);

//         let afterTest: any[] = [];
//         variableTest.output.forEach((variable, i) => {
//             const t = {
//                 id: 'variable-' + variable.name,
//                 actual: variable.name,
//                 expected: variable.value,
//                 description: 'expected variable ' + variable.name + ' = ' + variable.value
//             }
//             afterTest.push(t)
//         });

//         const fullTests = afterTest.concat(tests);
//         const outputChangeHandler = (output) => {
//             dispatch({
//                 problemID,
//                 output,
//                 type: EventTypes.OUTPUT_CHANGED
//             } as IOutputChangedAction);
//         }
//         const writeFileHandler = (contents, fname) => {
//             dispatch({
//                 contents: contents + '\n',
//                 problemID,
//                 name: fname,
//                 type: EventTypes.FILE_WRITTEN
//             } as IFileWrittenAction);
//         }

//         dispatch({
//             problemID,
//             type: EventTypes.BEGIN_RUN_CODE
//         } as IBeginRunningCodeAction);

//         executeCode(fullCode, fullTests, afterCode, files, outputChangeHandler, writeFileHandler, graphics).then(result => {
//             const { errString, passedAll, testResults } = result;
//             if (errString) {
//                 dispatch({
//                     errors: [errString],
//                     problemID,
//                     type: EventTypes.ERROR_CHANGED
//                 } as IErrorChangedAction);
//             }
//             dispatch({
//                 hasError: true,
//                 problemID,
//                 passedAll,
//                 testResults,
//                 type: EventTypes.DONE_RUNNING_CODE
//             } as IDoneRunningCodeAction);
//             if (passedAll) {
//                 const currentState = getState();
//                 const { shareDBDocs } = currentState;
//                 const uid = currentState.users.myuid;
//                 const aggregateDataDoc: SDBDoc<IAggregateData> = shareDBDocs.aggregateData;
//                 const { userData } = aggregateDataDoc.getData();

//                 if (userData[problemID]) {
//                     if ((userData[problemID] as ICodeSolutionAggregate).completed.indexOf(uid) < 0) {
//                         aggregateDataDoc.submitListPushOp(['userData', problemID, 'completed'], uid);
//                     }
//                 } else {
//                     aggregateDataDoc.submitObjectInsertOp(['userData', problemID], { completed: [uid], variableTests: {} });
//                 }
//             }
//         })
//     }
// }