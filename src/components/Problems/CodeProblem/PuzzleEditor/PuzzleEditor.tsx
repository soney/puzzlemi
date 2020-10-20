import * as React from 'react';
import update from 'immutability-helper';
import { connect } from "react-redux";
import { CodeEditor } from '../../../CodeEditor';
import { ICodeSolution } from '../../../../reducers/solutions';
import { codeChanged } from '../../../../actions/user_actions';
import { ICodeTest, CodeTestType, CodeTestStatus } from '../../../../reducers/aggregateData';
import { deleteTest, changeTestStatus, changeProblemConfig } from '../../../../actions/sharedb_actions';
import { runCode, runVerifyTest } from '../../../../actions/runCode_actions';
import TestList from './TestList';
import { ICodeSolutionState } from '../../../../reducers/intermediateUserState';

const PuzzleEditor = ({ userSolution, graphicsRef, allTests, problemsDoc, isAdmin, problem, config, username, dispatch, flag, aggregateDataDoc, doSelectCallback, currentTest, testResults }) => {
    const [count, setCount] = React.useState(0);
    const [codeTab, setCodeTab] = React.useState('g');

    const codeSolution = userSolution as ICodeSolution;
    const p_prb = ['allProblems', problem.id];
    const givenCodeSubDoc = problemsDoc.subDoc([...p_prb, 'problemDetails', 'givenCode']);
    const liveCodeSubDoc = problemsDoc.subDoc([...p_prb, 'problemDetails', 'liveCode', 'code']);
    const standardCodeSubDoc = problemsDoc.subDoc([...p_prb, 'problemDetails', 'standardCode']);
    const p_test = currentTest && (currentTest.type === CodeTestType.INSTRUCTOR ? ['allProblems', problem.id, 'problemDetails', 'tests', currentTest.id] : ['userData', problem.id, 'tests', currentTest.id]);
    const beforeCodeSubDoc = currentTest && (currentTest.type === CodeTestType.INSTRUCTOR ? problemsDoc.subDoc([...p_test, 'before']) : aggregateDataDoc.subDoc([...p_test, 'before']));
    const afterCodeSubDoc = currentTest && (currentTest.type === CodeTestType.INSTRUCTOR ? problemsDoc.subDoc([...p_test, 'after']) : aggregateDataDoc.subDoc([...p_test, 'after']));
    const testNameSubDoc = currentTest && (currentTest.type === CodeTestType.INSTRUCTOR ? problemsDoc.subDoc([...p_test, 'name']) : aggregateDataDoc.subDoc([...p_test, 'name']));
    const isEdit = isAdmin ? true : currentTest !== undefined && currentTest.author === username;


    const doRunCode = () => {
        const graphicsEl = graphicsRef ? graphicsRef.current : null;
        if (graphicsEl) {
            graphicsEl.innerHTML = '';
        }
        let code = codeSolution.code

        if (isAdmin) {
            switch (codeTab) {
                case "g":
                    code = givenCodeSubDoc.getData();
                    break;
                case "s":
                    code = standardCodeSubDoc.getData();
                    break;
                case "l":
                    code = liveCodeSubDoc.getData();
                    break;
            }
            dispatch(runCode(code, [], problem, graphicsEl, currentTest, codeTab))
        } else {
            dispatch(runCode(code, codeSolution.files, problem, graphicsEl, currentTest));
        }
        doRunAll(code);
        if (currentTest) {
            if(!isAdmin && currentTest.type == CodeTestType.INSTRUCTOR) return;
            doVerifyTest();
        }
    };


    const refreshCM = () => {
        setCount(count + 1);
    }
    const doSetCode = (ev) => {
        const { value } = ev;
        return dispatch(codeChanged(problem, value));
    };
    const doInitTestStatus = () => {
        if (currentTest.status === CodeTestStatus.UNVERIFIED) return;
        if (currentTest.author === 'default') return;
        if (isAdmin) return;
        if (currentTest.type === CodeTestType.INSTRUCTOR) return;
        const newStatus = CodeTestStatus.UNVERIFIED;
        dispatch(changeTestStatus(problem.id, currentTest, newStatus));
    }

    const doDeleteTest = () => {
        dispatch(deleteTest(problem.id, currentTest));
    }

    const doVerifyTest = () => {
        dispatch(runVerifyTest(problem, currentTest))
    }

    const switchInstructorCode = (e) => {
        setCodeTab(e.target.id.slice(4, 5))
        refreshCM();
    }

    const onSwitchLiveCode = (e) => {
        const item = e.target.id.split('-')[0];
        dispatch(changeProblemConfig(problem.id, item, e.target.checked));
    }

    const doRunAll = (code) => {
        const graphicsEl_tmp = graphicsRef ? graphicsRef.current : null;
        if (graphicsEl_tmp) {
            graphicsEl_tmp.innerHTML = '';
        }
        const allTestsObjects: ICodeTest[] = Object.values(allTests);

        allTestsObjects.forEach(test => {
            if (test.status === CodeTestStatus.VERIFIED) {
                dispatch(runCode(code, codeSolution.files, problem, graphicsEl_tmp, test, codeTab))
            }
        });
    }

    return <>
        <div className="row">
            <div className={(currentTest || isAdmin) ? "col-9 puzzle-editor" : "col"}>
                {(isEdit && currentTest) &&
                    <div className="puzzle-header">
                        <div className="row">
                            <div className="col">
                                <CodeEditor shareDBSubDoc={testNameSubDoc} captureTabs={false} selectOnFocus={true} options={{ lineNumbers: false, mode: 'text', lineWrapping: true, height: 30 }} refreshDoc={currentTest.id} />
                            </div>
                            <div className="col">
                                <div className="btn-group btn-block">
                                    {!isAdmin &&
                                        <div>
                                            {currentTest.status === CodeTestStatus.VERIFIED
                                                ? <button className="btn btn-outline-info btn-sm" disabled><i className="fas fa-check-circle"></i> Verified</button>
                                                : <button className="btn btn-outline-warning btn-sm" onClick={doVerifyTest}><i className="fas fa-times-circle"></i> Verify</button>
                                            }
                                        </div>
                                    }
                                    {currentTest.author !== "default" &&
                                        <button className="btn btn-outline-danger btn-sm" onClick={doDeleteTest}><i className="fas fa-trash"></i> Delete</button>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                }
                {isAdmin &&
                    <>
                        <nav>
                            <div className="nav nav-tabs instructor-tab" id={"nav-instructor-code-tab-" + problem.id} role="tablist">
                                <a className="nav-item nav-link active nav-given-first" id={"nav-given-tab-" + problem.id} data-toggle="tab" href={"#nav-given-" + problem.id} role="tab" aria-controls={"nav-given-" + problem.id} aria-selected="true" onClick={switchInstructorCode}>Given Code</a>
                                <a className="nav-item nav-link" id={"nav-standard-tab-" + problem.id} data-toggle="tab" href={"#nav-standard-" + problem.id} role="tab" aria-controls={"nav-standard-" + problem.id} aria-selected="false" onClick={switchInstructorCode}>Solution Code</a>
                                <a className="nav-item nav-link" id={"nav-live-tab-" + problem.id} data-toggle="tab" href={"#nav-live-" + problem.id} role="tab" aria-controls={"nav-live-" + problem.id} aria-selected="false" onClick={switchInstructorCode}>Live Code</a>
                            </div>
                        </nav>
                        <div className="instructions-admin">
                            {codeTab === 'l' &&
                                <>
                                    <div className="instructions-text">Edits here will be live streamed to students if made visible.</div>
                                    <div className="custom-control custom-switch edit-switch">
                                        <input type="checkbox" className="custom-control-input" id={"displayInstructor-" + problem.id} onClick={onSwitchLiveCode} defaultChecked={config.displayInstructor} />
                                        <label className="custom-control-label" htmlFor={"displayInstructor-" + problem.id}>Visible to Students</label>
                                    </div>
                                </>
                            }
                            {codeTab === 's' &&
                                <>
                                    <div className="instructions-text">Standard solution will be used to verify the test cases created by students.</div>
                                </>
                            }
                            {codeTab === 'g' &&
                                <>
                                    <div className="instructions-text">Students' editors will be initialized with given code the first time they load the problem.</div>
                                </>
                            }
                        </div>
                    </>
                }
                {currentTest &&
                    <div className="before-code"><CodeEditor run={doRunCode} shareDBSubDoc={beforeCodeSubDoc} options={{ readOnly: !isEdit, lineNumbers: true, lineWrapping: true }} refreshDoc={currentTest.id} onChange={doInitTestStatus} /></div>
                }
                {isAdmin
                    ? <>
                        <div className="tab-content" id={"nav-instructor-code-tabContent-" + problem.id}>
                            <div className="tab-pane fade show active given-code" id={"nav-given-" + problem.id} role="tabpanel" aria-labelledby={"nav-given-tab-" + problem.id}>
                                <CodeEditor shareDBSubDoc={givenCodeSubDoc} options={{ lineNumbers: true, lineWrapping: true }} />
                            </div>
                            <div className="tab-pane fade solution-code" id={"nav-standard-" + problem.id} role="tabpanel" aria-labelledby={"nav-standard-tab-" + problem.id}>
                                <CodeEditor run={doRunCode} shareDBSubDoc={standardCodeSubDoc} options={{ lineNumbers: true, lineWrapping: true }} flag={count} />
                            </div>
                            <div className="tab-pane fade live-code" id={"nav-live-" + problem.id} role="tabpanel" aria-labelledby={"nav-live-tab-" + problem.id}>
                                <CodeEditor run={doRunCode} shareDBSubDoc={liveCodeSubDoc} options={{ lineNumbers: true, lineWrapping: true }} flag={count} />
                            </div>
                        </div>
                    </>
                    : <div className="student-code"><CodeEditor run={doRunCode} value={codeSolution.code} options={{ lineNumbers: true, lineWrapping: true, readOnly: config.disableEdit }} onChange={doSetCode} flag={flag} /></div>
                }
                {currentTest &&
                    <div className="after-code"><CodeEditor shareDBSubDoc={afterCodeSubDoc} options={{ readOnly: !isEdit, lineNumbers: true, lineWrapping: true }} refreshDoc={currentTest.id} onChange={doInitTestStatus} /></div>
                }
            </div>
            {(currentTest || isAdmin) &&
                <div className="col-3 tests">
                    <TestList problem={problem} doSelectCallback={doSelectCallback} currentTest={currentTest} testResults={testResults} />
                </div>
            }
        </div>
        <div className="row">
            <div className={(currentTest || isAdmin) ? "col-9 puzzle-editor" : "col"}>
                <button disabled={false} className='btn btn-outline-success btn-sm btn-block' onClick={doRunCode}>Run</button>
            </div>
        </div>
    </>;
}

function mapStateToProps(state, ownProps) {
    const { intermediateUserState, shareDBDocs, solutions, users } = state;
    const { isAdmin } = intermediateUserState;
    const { problem } = ownProps;
    const problemsDoc = shareDBDocs.problems;
    const aggregateDataDoc = shareDBDocs.aggregateData;
    const aggregateData = shareDBDocs.i.aggregateData;
    const { problemDetails } = problem;
    const instructorTests = problemDetails.tests;
    const { config } = problemDetails;

    const myuid = users.myuid as string;
    const intermediateCodeState: ICodeSolutionState = intermediateUserState.intermediateSolutionState[ownProps.problem.id];
    const { testResults } = intermediateCodeState;


    const username = users.allUsers[myuid].username;
    const userSolution = solutions.allSolutions[problem.id][myuid];
    const tests: { [id: string]: ICodeTest } = aggregateData ? aggregateData.userData[problem.id].tests : {};

    const allTests = Object.assign(JSON.parse(JSON.stringify(instructorTests)), JSON.parse(JSON.stringify(tests)));

    return update(ownProps, { $merge: { isAdmin, username, allTests, userSolution, tests, aggregateDataDoc, problemsDoc, config, myuid, testResults } })
}

export default connect(mapStateToProps)(PuzzleEditor);