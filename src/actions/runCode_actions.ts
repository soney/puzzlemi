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
export function runCode(index: number) {
    return (dispatch: Dispatch, getState) => {
        const { user, problems } = getState();
        const problem = problems[index];
        const { id, afterCode, tests } = problem;
        const solution = user.solutions[id];
        const { code } = solution;

        let output: string = '';
        const outputs: string[] = [];
        const outf = (outValue: string): void => {
            outputs.push(outValue);
            output = outputs.join('');
            dispatch({
                id,
                output,
                type: EventTypes.OUTPUT_CHANGED
            });
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
        const assertions: PMAssertion[] = tests.map((t) => new PMAssertEqual(t.actual, t.expected, t.description));
        const testSuite = new PMTestSuite();
        testSuite.setAssertions(assertions);
        const testsStr = testSuite.getString();
        testSuite.onBeforeRunningTests();
        Sk.configure({
            filewriter: writef,
            output: outf,
            read: readf
        });
        const myPromise = Sk.misceval.asyncToPromise(() => {
            return Sk.importMainWithBody("<stdin>", false, `${code}\n${afterCode}\n${testsStr}`, true);
        });
        myPromise.catch((err) => {
            dispatch({
                errors: [err.toString()],
                id,
                type: EventTypes.ERROR_CHANGED
            });
        }).finally(() => {
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
        });
    };
}