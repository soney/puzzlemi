import { Dispatch } from "redux";
import '../js/skulpt/skulpt.min.js';
import '../js/skulpt/skulpt-stdlib.js';
import { PMAssertion, PMAssertEqual } from "../pyTests/PMTest";
import { PMTestSuite, IPMTestResult } from "../pyTests/PMTestSuite";
import EventTypes from "./EventTypes";
import { SDBDoc } from "sdb-ts";
import { ICodeSolution } from "../reducers/solutions.js";
import { IProblem, ICodeProblem, ICodeVariableTest } from "../reducers/problems";
import { IAggregateData, ICodeSolutionAggregate } from "../reducers/aggregateData.js";
import { ICodeSolutionState } from "../reducers/intermediateUserState.js";

declare const Sk;

Sk.configure({
    inputfunTakesPrompt: true,
    jsonpSites : ['https://itunes.apple.com'],
    python3: true,
});
const jsonExternalLibInfo = {
    dependencies : [
        `${window.location.origin}/json.sk-master/stringify.js`,
    ],
    path : `${window.location.origin}/json.sk-master/__init__.js`,
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

export function runCode(codeSolution: ICodeSolution, problem: IProblem, intermediateSolutionState: ICodeSolutionState, graphics: HTMLDivElement|null, variableTest: ICodeVariableTest) {
    return (dispatch: Dispatch, getState) => {
        const { id: problemID } = problem;
        const problemDetails = problem.problemDetails as ICodeProblem;
        const { afterCode, tests } = problemDetails;
        const { code } = codeSolution;
        let output: string = '';
        const outputs: string[] = [];

        let beforeCode = "";
        variableTest.input.forEach(variable=>{
            const snippet: string = variable.name + "=" + variable.value + ";\n";
            beforeCode = beforeCode.concat(snippet);
        })
        const fullCode = beforeCode.concat(code);

        let afterTest: any[] = [];
        variableTest.output.forEach((variable, i)=>{
            const t = {
                id: 'variable-'+i,
                actual: variable.name,
                expected: variable.value,
                description: 'expected variable ' + variable.name + ' = ' + variable.value
            }
            afterTest.push(t)
        });

        const fullTests = afterTest.concat(tests);

        const testSuite = new PMTestSuite(fullCode, outputs);
        const outf = (outValue: string): void => {
            if(!testSuite.currentlyRunning()) {
                outputs.push(outValue);
                output = outputs.join('');
                dispatch({
                    problemID,
                    output,
                    type: EventTypes.OUTPUT_CHANGED
                } as IOutputChangedAction);
            }
        };

        const readf = (fname: string): string => {
            const problemFiles = problemDetails.files;
            const userFiles = codeSolution.files;

            if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][fname] === undefined) {
                let file;
                [...problemFiles, ...userFiles].forEach((f) => {
                    const { name } = f;
                    if(name === fname) {
                        file = f;
                    }
                });

                if(file) {
                    return file.contents;
                } else {
                    throw new Error(`File not found: '${fname}'`);
                }
            } else {
                return Sk.builtinFiles["files"][fname];
            }
        }
        const writef = (contents: string, fname: string, pos: number): void => {
            dispatch({
                contents: contents+'\n',
                problemID,
                name: fname,
                type: EventTypes.FILE_WRITTEN
            } as IFileWrittenAction);
        };

        // this.setState({ hasError: true, output: '' });
        dispatch({
            problemID,
            type: EventTypes.BEGIN_RUN_CODE
        } as IBeginRunningCodeAction);
        const assertions: PMAssertion[] = fullTests.map((t) => new PMAssertEqual(t.id, t.actual, t.expected, t.description));
        testSuite.setBeforeTests(afterCode);
        testSuite.setAssertions(assertions);
        testSuite.onBeforeRunningTests();
        Sk.configure({
            filewriter: writef,
            output: outf,
            read: readf,
            inputfunTakesPrompt: true
        });
        (Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target = graphics;
        const myPromise = Sk.misceval.asyncToPromise(() => {
            return Sk.importMainWithBody("<stdin>", false, `${fullCode}\n${testSuite.getString()}`, true);
        });
        const onFinally = () => {
            testSuite.onAfterRanTests();
            const testSuiteResults = testSuite.getTestResults();
            const { passedAll, results } = testSuiteResults;
            const problemTests = fullTests;
            const testResults = { };
            console.log(results)
            results.forEach((result, i) => {
                const test = problemTests[i];
                const testId = test.id;
                testResults[testId] = result;
            });
            dispatch({
                hasError: true,
                problemID,
                passedAll,
                testResults,
                type: EventTypes.DONE_RUNNING_CODE
            } as IDoneRunningCodeAction);
            if(passedAll) {
                const currentState = getState();
                const { shareDBDocs } = currentState;
                const uid = currentState.users.myuid;

                const aggregateDataDoc: SDBDoc<IAggregateData> = shareDBDocs.aggregateData;

                const { userData } = aggregateDataDoc.getData();

                if(userData[problemID]) {
                    if((userData[problemID] as ICodeSolutionAggregate).completed.indexOf(uid) < 0) {
                        aggregateDataDoc.submitListPushOp(['userData', problemID, 'completed'], uid);
                    }
                } else {
                    aggregateDataDoc.submitObjectInsertOp(['userData', problemID], {
                        completed: [uid]
                    });
                }
            }
        };
        myPromise.then(onFinally, (err) => {
            const pretextLines = 0;
            const matches = code.match(/\n/g);
            const progLines = matches ? (matches.length + 1) : 1;

            let errorBefore: boolean = false;
            let errorAfter: boolean = false;
            if (err.traceback.length >= 1) {
                const errorLine = err.traceback[0].lineno;
                if (errorLine <= pretextLines) {
                    errorBefore = true;
                } else if(errorLine > (progLines + pretextLines)) {
                    errorAfter = true;
                } else {
                    if (pretextLines > 0) {
                        err.traceback[0].lineno = err.traceback[0].lineno - pretextLines + 1;
                    } 
                }
            }
            let errString: string;
            if(errorBefore) {
                errString = `Error before your code ran:\n${err.toString()}`;
            } else if(errorAfter) {
                errString = `Error while running our tests:\n${err.toString()}`;
            } else {
                errString = err.toString();
            }

            dispatch({
                errors: [errString],
                problemID,
                type: EventTypes.ERROR_CHANGED
            } as IErrorChangedAction);
            onFinally();
        });
    };
}