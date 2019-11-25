import { Dispatch } from "redux";
import '../js/skulpt/skulpt.min.js';
import '../js/skulpt/skulpt-stdlib.js';
import { PMAssertion, PMAssertEqual } from "../pyTests/PMTest";
import { PMTestSuite } from "../pyTests/PMTestSuite";
import EventTypes from "./EventTypes";
import { SDBDoc } from "sdb-ts";
import { IPuzzleSet } from "../components/App.js";

declare var Sk;

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

export function runCode(index: number) {
    return (dispatch: Dispatch, getState) => {
        const { user, problems } = getState();
        const problem = problems[index];
        const { id, afterCode, tests } = problem;
        const solution = user.solutions[id];
        const { code } = solution;
        const testSuite = new PMTestSuite();

        let output: string = '';
        let test = tests[0] as any;
        let beforeCode = "";
        test.input.forEach(variable=>{
            const state:string = variable.name + "=" + variable.value + ";\n";
            beforeCode = beforeCode.concat(state);
        })
        const fullCode = beforeCode.concat(code);
 

        const outputs: string[] = [];
        const outf = (outValue: string): void => {
            if(!testSuite.currentlyRunning()) {
                outputs.push(outValue);
                output = outputs.join('');
                dispatch({
                    id,
                    output,
                    type: EventTypes.OUTPUT_CHANGED
                });
            }
        };

        const readf = (fname: string): string => {
            const problemFiles = problem.files;
            const userFiles = solution.files;

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
                contents,
                id,
                name: fname,
                type: EventTypes.FILE_WRITTEN
            })
        };

        // this.setState({ hasError: true, output: '' });
        dispatch({
            id,
            type: EventTypes.BEGIN_RUN_CODE
        });
        const assertions: PMAssertion[] = test.output.map((t) => new PMAssertEqual(t.name, t.value, ''));
        testSuite.setBeforeTests(afterCode);
        testSuite.setAssertions(assertions);
        testSuite.onBeforeRunningTests();
        Sk.configure({
            filewriter: writef,
            output: outf,
            read: readf
        });
        const myPromise = Sk.misceval.asyncToPromise(() => {
            return Sk.importMainWithBody("<stdin>", false, `${fullCode}\n${testSuite.getString()}`, true);
        });
        const onFinally = () => {
            testSuite.onAfterRanTests();
            const testSuiteResults = testSuite.getTestResults();
            const { passedAll, results } = testSuiteResults;
            const problemTests = getState().problems[index].tests;
            const testResults = { };
            results.forEach((result, i) => {
                const test = problemTests[i];
                const testId = test.id;
                testResults[testId] = result;
            });
            dispatch({
                hasError: true,
                id,
                passedAll,
                testResults,
                type: EventTypes.DONE_RUNNING_CODE
            });
            if(passedAll) {
                const currentState = getState();
                const userID = currentState.user.id;
                const doc: SDBDoc<IPuzzleSet> = currentState.doc;
                const { userData } = doc.getData();
                if(userData[id]) {
                    if(userData[id].completed.indexOf(userID) < 0) {
                        doc.submitListPushOp(['userData', id, 'completed'], userID);
                    }
                } else {
                    doc.submitObjectInsertOp(['userData', id], {
                        completed: [userID],
                        visible: true
                    });
                }
            }
        };
        myPromise.then(onFinally, (err) => {
            const pretextLines = 0;
            const matches = fullCode.match(/\n/g);
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
                id,
                type: EventTypes.ERROR_CHANGED
            });
            onFinally();
        });
    };
}