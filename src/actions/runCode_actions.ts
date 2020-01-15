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

export function runSharedCode(index: number, sessionIndex: number) {
    return (dispatch: Dispatch, getState) => {
        const { problems, doc } = getState();
        const problem = problems[index];
        const { id, afterCode, tests } = problem;
        const userp = ['userData', id, 'helpSessions'];
        const currentSolutionSubDoc = doc.subDoc([...userp, sessionIndex, 'solution']);

        const solution = currentSolutionSubDoc.getData();
        const { code } = solution;
        const testSuite = new PMTestSuite();

        let output: string = '';
        let test = tests[0] as any;
        let beforeCode = "";
        if (test) {
            test.input.forEach(variable => {
                const state: string = variable.name + "=" + variable.value + ";\n";
                beforeCode = beforeCode.concat(state);
            })
        }
        const fullCode = beforeCode.concat(code);

        dispatch({
            id,
            sessionIndex,
            output,
            type: EventTypes.SHARED_OUTPUT_CHANGED
        });

        const outputs: string[] = [];
        const outf = (outValue: string): void => {
            if (!testSuite.currentlyRunning()) {
                outputs.push(outValue);
                output = outputs.join('');
            }
            console.log(output);
        };

        const readf = (fname: string): string => {
            const problemFiles = problem.files;
            const userFiles = solution.files;

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
            dispatch({
                contents,
                id,
                sessionIndex,
                name: fname,
                type: EventTypes.SHARED_FILE_WRITTEN
            })
        };

        // this.setState({ hasError: true, output: '' });
        dispatch({
            id,
            sessionIndex,
            type: EventTypes.BEGIN_RUN_SHARED_CODE
        });
        let assertions: PMAssertion[] = [];
        if (test) assertions = test.output.map((t) => new PMAssertEqual(t.name, t.value, ''));
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
            const testResults = {};
            results.forEach((result, i) => {
                const test = problemTests[i];
                const testId = test.id;
                testResults[testId] = result;
            });
            dispatch({
                hasError: true,
                id,
                sessionIndex,
                passedAll,
                testResults,
                type: EventTypes.DONE_RUNNING_SHARED_CODE
            });
            // if(passedAll) {
            //     const currentState = getState();
            //     const userID = currentState.user.id;
            //     const doc: SDBDoc<IPuzzleSet> = currentState.doc;
            //     const { userData } = doc.getData();
            //     if(userData[id]) {
            //         if(userData[id].completed.indexOf(userID) < 0) {
            //             doc.submitListPushOp(['userData', id, 'completed'], userID);
            //         }
            //     } else {
            //         doc.submitObjectInsertOp(['userData', id], {
            //             completed: [userID],
            //             visible: true
            //         });
            //     }
            // }
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
                } else if (errorLine > (progLines + pretextLines)) {
                    errorAfter = true;
                } else {
                    if (pretextLines > 0) {
                        err.traceback[0].lineno = err.traceback[0].lineno - pretextLines + 1;
                    }
                }
            }
            let errString: string;
            if (errorBefore) {
                errString = `Error before your code ran:\n${err.toString()}`;
            } else if (errorAfter) {
                errString = `Error while running our tests:\n${err.toString()}`;
            } else {
                errString = err.toString();
            }

            dispatch({
                errors: [errString],
                id,
                sessionIndex,
                type: EventTypes.SHARED_ERROR_CHANGED
            });
            onFinally();
        });
    }
};



const initUserData = (id, testID, userID, doc) => {
    const { userData } = doc.getData();
    const data = userData[id];

    if (!data.testData[testID]) {
        const emptyData = { [userID]: { passedAll: false } };
        doc.submitObjectInsertOp(['userData', id, 'testData', testID], emptyData);
    } else if (!data.testData[testID][userID]) {
        doc.submitObjectInsertOp(['userData', id, 'testData', testID, userID], { passedAll: false });
    }
}

const updateUserData = (id, testID, userID, passedAll, doc) => {
    doc.submitObjectReplaceOp(['userData', id, 'testData', testID, userID, 'passedAll'], passedAll);
}

const runTest = (test, problem, user, dispatch, doc) => {
    return new Promise(async (resolve, reject) => {
        if (!test.verified) {
            resolve(-1);
            return;
        }
        const { id, afterCode } = problem;
        const solution = user.solutions[id];
        const { code } = solution;
        const testID = test.id;
        const userID = user.id;

        const testSuite = new PMTestSuite();

        let output: string = '';
        let beforeCode = "";
        test.input.forEach(variable => {
            const state: string = variable.name + "=" + variable.value + ";\n";
            beforeCode = beforeCode.concat(state);
        })
        const fullCode = beforeCode.concat(code);
        const outputs: string[] = [];
        const outf = (outValue: string): void => {
            if (!testSuite.currentlyRunning()) {
                outputs.push(outValue);
                output = outputs.join('');
                dispatch({
                    id,
                    testID,
                    output,
                    type: EventTypes.TESTS_OUTPUT_CHANGED
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
        // this.setState({ hasError: true, output: '' });
        dispatch({
            id,
            testID,
            userID,
            type: EventTypes.BEGIN_RUN_TEST
        });
        initUserData(id, testID, userID, doc);
        let assertions: PMAssertion[] = [];
        assertions = test.output.map((t) => new PMAssertEqual(t.name, t.value, ''));
        testSuite.setBeforeTests(afterCode);
        testSuite.setAssertions(assertions);
        testSuite.onBeforeRunningTests();
        Sk.configure({
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
            dispatch({
                id,
                testID,
                results,
                passedAll,
                userID,
                type: EventTypes.DONE_RUNNING_TEST
            });
            updateUserData(id, testID, userID, passedAll, doc);
            resolve(passedAll);
        };
        myPromise.then(onFinally, (err) => {
            console.log(err);
            const pretextLines = 0;
            const matches = fullCode.match(/\n/g);
            const progLines = matches ? (matches.length + 1) : 1;

            let errorBefore: boolean = false;
            let errorAfter: boolean = false;
            if (err.traceback.length >= 1) {
                const errorLine = err.traceback[0].lineno;
                if (errorLine <= pretextLines) {
                    errorBefore = true;
                } else if (errorLine > (progLines + pretextLines)) {
                    errorAfter = true;
                } else {
                    if (pretextLines > 0) {
                        err.traceback[0].lineno = err.traceback[0].lineno - pretextLines + 1;
                    }
                }
            }
            let errString: string;
            if (errorBefore) {
                errString = `Error before your code ran:\n${err.toString()}`;
            } else if (errorAfter) {
                errString = `Error while running our tests:\n${err.toString()}`;
            } else {
                errString = err.toString();
            }
            console.log(errString);
            dispatch({
                errors: [errString],
                id,
                testID,
                type: EventTypes.TESTS_ERROR_CHANGED
            });
            onFinally();
        });
    })
}


const runTests = async (user, problem, dispatch, doc, getState) => {
    const { tests, id } = problem;
    const userID  = user.id;

    dispatch({
        id,
        userID,
        type: EventTypes.BEGIN_RUN_TESTS
    });

    const status = await Promise.all(tests.map(test => runTest(test, problem, user, dispatch, doc)));
    const passedAll = status.every((value) => value !== false);

    dispatch({
        id: problem.id,
        passedAll,
        type: EventTypes.DONE_RUNNING_TESTS
    })

    if (passedAll) {
        const currentState = getState();
        const currentDoc = currentState.doc;
        const { userData } = currentDoc.getData();
        if (userData[id].completed_tests.indexOf(userID) < 0) {
            doc.submitListPushOp(['userData', id, 'completed_tests'], userID);
        }
    } else {
        let keyTest: any = null;
        tests.forEach((test, i) => {
            if (status[i] === false && keyTest === null) keyTest = test;
        })
        if (keyTest !== null) {
            dispatch({
                problemID: problem.id,
                testID: keyTest.id,
                type: EventTypes.UPDATE_ACTIVE_FAILED_TEST_ID
            })
        }
    }
}

export function runUnitTests(index: number) {
    return (dispatch: Dispatch, getState) => {
        const { doc, user } = getState();
        const { problems } = doc.getData();
        const problem = problems[index];
        runTests(user, problem, dispatch, doc, getState);
    }
}

export function runVerifyTest(index: number, testID) {
    console.log('run verifying test')
    return (dispatch: Dispatch, getState) => {
        const { doc, user, problems } = getState();
        const problem = problems[index];
        const { standardCode, id, afterCode, tests } = problem;
        const solution = user.solutions[id];
        let testIndex = 0;
        let test;
        tests.forEach((t, i) => {
            if (t.id === testID) {
                test = t;
                testIndex = i;
            }
        })

        const testSuite = new PMTestSuite();

        let output: string = '';
        let beforeCode = "";
        test.input.forEach(variable => {
            const state: string = variable.name + "=" + variable.value + ";\n";
            beforeCode = beforeCode.concat(state);
        })
        const fullCode = beforeCode.concat(standardCode);
        const outputs: string[] = [];
        const outf = (outValue: string): void => {
            if (!testSuite.currentlyRunning()) {
                outputs.push(outValue);
                output = outputs.join('');
            }
            console.log(output);
        };

        const readf = (fname: string): string => {
            const problemFiles = problem.files;
            const userFiles = solution.files;

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

        let assertions: PMAssertion[] = [];
        assertions = test.output.map((t) => new PMAssertEqual(t.name, t.value, ''));
        testSuite.setBeforeTests(afterCode);
        testSuite.setAssertions(assertions);
        testSuite.onBeforeRunningTests();
        Sk.configure({
            output: outf,
            read: readf
        });
        const myPromise = Sk.misceval.asyncToPromise(() => {
            return Sk.importMainWithBody("<stdin>", false, `${fullCode}\n${testSuite.getString()}`, true);
        });
        const onFinally = () => {
            testSuite.onAfterRanTests();
            const testSuiteResults = testSuite.getTestResults();
            const { passedAll } = testSuiteResults;
            doc.submitObjectReplaceOp(['problems', index, 'tests', testIndex, 'verified'], passedAll);
        };
        myPromise.then(onFinally, (err) => {
            console.log(err);
            const pretextLines = 0;
            const matches = fullCode.match(/\n/g);
            const progLines = matches ? (matches.length + 1) : 1;

            let errorBefore: boolean = false;
            let errorAfter: boolean = false;
            if (err.traceback.length >= 1) {
                const errorLine = err.traceback[0].lineno;
                if (errorLine <= pretextLines) {
                    errorBefore = true;
                } else if (errorLine > (progLines + pretextLines)) {
                    errorAfter = true;
                } else {
                    if (pretextLines > 0) {
                        err.traceback[0].lineno = err.traceback[0].lineno - pretextLines + 1;
                    }
                }
            }
            let errString: string;
            if (errorBefore) {
                errString = `Error before your code ran:\n${err.toString()}`;
            } else if (errorAfter) {
                errString = `Error while running our tests:\n${err.toString()}`;
            } else {
                errString = err.toString();
            }
            doc.submitObjectReplaceOp(['problems', index, 'tests', testIndex, 'verified'], false);
            console.log(errString);
        })
    }
}

export function runCode(index: number) {
    return (dispatch: Dispatch, getState) => {
        const { user, problems } = getState();
        const problem = problems[index];
        const { id, afterCode } = problem;
        const variables = problem.variables;
        const solution = user.solutions[id];
        const { code } = solution;
        const testSuite = new PMTestSuite();
        const userID = user.id;

        let output: string = '';

        let inputVariables: any[] = [];
        let outputVariables: any[] = [];
        variables.forEach(variable => {
            if (variable.type === "input") inputVariables.push(variable);
            if (variable.type === "output") outputVariables.push(variable);
        })
        let beforeCode = "";
        inputVariables.forEach(variable => {
            const state: string = variable.name + "=" + variable.value + ";\n";
            beforeCode = beforeCode.concat(state);
        })
        const fullCode = beforeCode.concat(code);

        const outputs: string[] = [];
        const outf = (outValue: string): void => {
            if (!testSuite.currentlyRunning()) {
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
            userID,
            type: EventTypes.BEGIN_RUN_CODE
        });
        let assertions: PMAssertion[] = [];
        assertions = outputVariables.map((t) => new PMAssertEqual(t.name, t.value, ''));
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
            dispatch({
                hasError: true,
                id,
                passedAll,
                results,
                userID,
                type: EventTypes.DONE_RUNNING_CODE
            });
            if (passedAll) {
                const currentState = getState();
                const userID = currentState.user.id;
                const doc: SDBDoc<IPuzzleSet> = currentState.doc;
                const {userData} = currentState;
                if (userData[id]) {
                    if (userData[id].completed_default.indexOf(userID) < 0) {
                        doc.submitListPushOp(['userData', id, 'completed_default'], userID);
                    }
                } else {
                    doc.submitObjectInsertOp(['userData', id], {
                        completed_default: [userID],
                        visible: true,
                        testData: {}
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
                } else if (errorLine > (progLines + pretextLines)) {
                    errorAfter = true;
                } else {
                    if (pretextLines > 0) {
                        err.traceback[0].lineno = err.traceback[0].lineno - pretextLines + 1;
                    }
                }
            }
            let errString: string;
            if (errorBefore) {
                errString = `Error before your code ran:\n${err.toString()}`;
            } else if (errorAfter) {
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