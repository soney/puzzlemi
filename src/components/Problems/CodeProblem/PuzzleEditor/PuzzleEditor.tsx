import * as React from 'react';
import { useState } from 'react';
import update from 'immutability-helper';
import { connect } from "react-redux";
import { CodeEditor } from '../../../CodeEditor';
import { ICodeSolution } from '../../../../reducers/solutions';
import { ICodeSolutionState } from '../../../../reducers/intermediateUserState';
import { codeChanged, setActiveTest } from '../../../../actions/user_actions';
import { ICodeTest, CodeTestType, CodeTestStatus } from '../../../../reducers/aggregateData';
import { addTest, deleteTest, changeTestStatus } from '../../../../actions/sharedb_actions';
import { runVerifyTest } from '../../../../actions/runCode_actions';

const PuzzleEditor = ({ userSolution, problemsDoc, isAdmin, problem, config, username, testObjects, dispatch, currentTest, testResults, flag, aggregateDataDoc, instructorTestObjects, allTestsObjects }) => {
    const [count, setCount] = useState(0);

    if (!currentTest) { return null; }
    const codeSolution = userSolution as ICodeSolution;
    const p_test = currentTest.type === CodeTestType.INSTRUCTOR ? ['allProblems', problem.id, 'problemDetails', 'tests', currentTest.id] : ['userData', problem.id, 'tests', currentTest.id];
    const beforeCodeSubDoc = currentTest.type === CodeTestType.INSTRUCTOR ? problemsDoc.subDoc([...p_test, 'before']) : aggregateDataDoc.subDoc([...p_test, 'before']);
    const afterCodeSubDoc = currentTest.type === CodeTestType.INSTRUCTOR ? problemsDoc.subDoc([...p_test, 'after']) : aggregateDataDoc.subDoc([...p_test, 'after']);
    const testNameSubDoc = currentTest.type === CodeTestType.INSTRUCTOR ? problemsDoc.subDoc([...p_test, 'name']) : aggregateDataDoc.subDoc([...p_test, 'name']);

    const p_prb = ['allProblems', problem.id];
    const givenCodeSubDoc = problemsDoc.subDoc([...p_prb, 'problemDetails', 'givenCode']);
    const liveCodeSubDoc = problemsDoc.subDoc([...p_prb, 'problemDetails', 'liveCode']);
    const standardCodeSubDoc = problemsDoc.subDoc([...p_prb, 'problemDetails', 'standardCode']);
    const isEdit = isAdmin ? true : currentTest !== undefined && currentTest.author === username;
    const doSetCode = (ev) => {
        const { value } = ev;
        return dispatch(codeChanged(problem, value));
    };

    const doAddTest = () => {
        dispatch(addTest(problem.id, username, isAdmin));
    }

    const doDeleteTest = () => {
        dispatch(deleteTest(problem.id, currentTest));
    }

    const doSetCurrentTest = (e) => {
        const testID = e.target.getAttribute('data-tag');
        dispatch(setActiveTest(testID, problem.id))
    }

    const doChangeTestStatus = () => {
        const newStatus = currentTest.status === CodeTestStatus.PASSED ? CodeTestStatus.FAILED : CodeTestStatus.PASSED;
        dispatch(changeTestStatus(problem.id, currentTest, newStatus))
    }
    const doVerifyAll = () => {
        allTestsObjects.forEach(test => {
            dispatch(runVerifyTest(problem, test))
        })
    }

    const getTestClassName = (test) => {
        const baseClasses = "list-group-item list-group-item-action test-list-item " + (test.type === CodeTestType.INSTRUCTOR ? 'instructor' : 'student');
        const activeClass = test.id === currentTest.id ? " active " : " ";
        const result = testResults[test.id];
        const isEditClass = test.author === username ? " isedit " : " ";
        let validClass;
        switch (test.status) {
            case CodeTestStatus.PASSED:
                validClass = " valid ";
                break;
            case CodeTestStatus.FAILED:
                validClass = " invalid ";
                break;
            case CodeTestStatus.UNVERIFIED:
                validClass = " unknown ";
                break;
        }
        const adminClass = isAdmin ? " isadmin " : " ";
        const passClass = result && result.hasOwnProperty('passed') ? result.passed : "";
        return baseClasses + activeClass + isEditClass + validClass + adminClass + passClass;
    }

    const refreshCM = () => {
        setCount(count + 1);
    }

    if (config.disableTest) {
        return <>
            <div className="row">
                <div className="col">
                    {isAdmin
                        ? <>
                            <nav>
                                <div className="nav nav-tabs instructor-tab" id={"nav-instructor-code-tab-" + problem.id} role="tablist">
                                    <a className="nav-item nav-link active" id={"nav-given-tab-" + problem.id} data-toggle="tab" href={"#nav-given-" + problem.id} role="tab" aria-controls={"nav-given-" + problem.id} aria-selected="true">Given Code</a>
                                    <a className="nav-item nav-link" id={"nav-live-tab-" + problem.id} data-toggle="tab" href={"#nav-live-" + problem.id} role="tab" aria-controls={"nav-live-" + problem.id} aria-selected="false" onClick={refreshCM}>Live Code</a>
                                    <a className="nav-item nav-link" id={"nav-standard-tab-" + problem.id} data-toggle="tab" href={"#nav-standard-" + problem.id} role="tab" aria-controls={"nav-standard-" + problem.id} aria-selected="false" onClick={refreshCM}>Standard Code</a>
                                </div>
                            </nav>
                            <div className="tab-content" id={"nav-instructor-code-tabContent-" + problem.id}>
                                <div className="tab-pane fade show active" id={"nav-given-" + problem.id} role="tabpanel" aria-labelledby={"nav-given-tab-" + problem.id}>
                                    <CodeEditor shareDBSubDoc={givenCodeSubDoc} />
                                </div>
                                <div className="tab-pane fade" id={"nav-live-" + problem.id} role="tabpanel" aria-labelledby={"nav-live-tab-" + problem.id}>
                                    <CodeEditor shareDBSubDoc={liveCodeSubDoc} flag={count} />
                                </div>
                                <div className="tab-pane fade" id={"nav-standard-" + problem.id} role="tabpanel" aria-labelledby={"nav-standard-tab-" + problem.id}>
                                    <CodeEditor shareDBSubDoc={standardCodeSubDoc} flag={count} />
                                </div>
                            </div>
                        </>
                        : <CodeEditor value={codeSolution.code} onChange={doSetCode} flag={flag} />
                    }
                </div>
            </div>
        </>
    }

    return <>
        <div className="row">
            <div className="col-9">
                <div className="row">
                    <div className="col-4">Current Test: </div>
                    <div className="col-5">
                        {isEdit
                            ? <CodeEditor shareDBSubDoc={testNameSubDoc} options={{ lineNumbers: false, mode: 'markdown', lineWrapping: true, height: 30 }} refreshDoc={currentTest.id} />
                            : <div>{currentTest.name}</div>
                        }
                    </div>
                    <div className="col-3">
                        {isEdit && currentTest.author !== 'null' &&
                            <button className="btn btn-outline-danger btn-sm btn-block" onClick={doDeleteTest}>
                                <i className="fas fa-trash"></i> Delete
                            </button>
                        }
                        {isAdmin && currentTest.author !== 'null' &&
                            <div>{
                                (currentTest.status === CodeTestStatus.PASSED
                                    ? <button className="btn btn-outline-success btn-sm" onClick={doChangeTestStatus}>Passed</button>
                                    : <button className="btn btn-outline-danger btn-sm" onClick={doChangeTestStatus}>{currentTest.status === CodeTestStatus.FAILED ? 'Failed' : 'Unverified'}</button>)
                            }
                            </div>
                        }
                    </div>
                </div>
                <CodeEditor shareDBSubDoc={beforeCodeSubDoc} options={{ readOnly: !isEdit, lineNumbers: true, height: 80 }} refreshDoc={currentTest.id} />
                {isAdmin
                    ? <>
                        <nav>
                            <div className="nav nav-tabs instructor-tab" id={"nav-instructor-code-tab-" + problem.id} role="tablist">
                                <a className="nav-item nav-link active" id={"nav-given-tab-" + problem.id} data-toggle="tab" href={"#nav-given-" + problem.id} role="tab" aria-controls={"nav-given-" + problem.id} aria-selected="true">Given Code</a>
                                <a className="nav-item nav-link" id={"nav-live-tab-" + problem.id} data-toggle="tab" href={"#nav-live-" + problem.id} role="tab" aria-controls={"nav-live-" + problem.id} aria-selected="false" onClick={refreshCM}>Live Code</a>
                                <a className="nav-item nav-link" id={"nav-standard-tab-" + problem.id} data-toggle="tab" href={"#nav-standard-" + problem.id} role="tab" aria-controls={"nav-standard-" + problem.id} aria-selected="false" onClick={refreshCM}>Standard Code</a>
                            </div>
                        </nav>
                        <div className="tab-content" id={"nav-instructor-code-tabContent-" + problem.id}>
                            <div className="tab-pane fade show active" id={"nav-given-" + problem.id} role="tabpanel" aria-labelledby={"nav-given-tab-" + problem.id}>
                                <CodeEditor shareDBSubDoc={givenCodeSubDoc} />
                            </div>
                            <div className="tab-pane fade" id={"nav-live-" + problem.id} role="tabpanel" aria-labelledby={"nav-live-tab-" + problem.id}>
                                <CodeEditor shareDBSubDoc={liveCodeSubDoc} flag={count} />
                            </div>
                            <div className="tab-pane fade" id={"nav-standard-" + problem.id} role="tabpanel" aria-labelledby={"nav-standard-tab-" + problem.id}>
                                <CodeEditor shareDBSubDoc={standardCodeSubDoc} flag={count} />
                            </div>
                        </div>
                    </>
                    : <CodeEditor value={codeSolution.code} onChange={doSetCode} flag={flag} />}
                <CodeEditor shareDBSubDoc={afterCodeSubDoc} options={{ readOnly: !isEdit, lineNumbers: true, height: 80 }} refreshDoc={currentTest.id} />
            </div>
            <div className="col-3">
                <div>Instructors' Tests</div>
                {instructorTestObjects.map((test, i) => <div key={i} data-tag={test.id} className={getTestClassName(test)} onClick={doSetCurrentTest}>
                    {test.name}
                    {test.author === username &&
                        <span className="badge badge-light"><i className="fas fa-user"></i></span>
                    }
                </div>)}
                {testObjects.length > 0 &&
                    <>
                        <div>Students' Tests</div>
                        <div className="list-group test-lists">
                            {testObjects.map((test, i) => <div key={i} data-tag={test.id} className={getTestClassName(test)} onClick={doSetCurrentTest}>
                                {test.name}
                                {test.author === username &&
                                    <span className="badge badge-light"><i className="fas fa-user"></i></span>
                                }
                            </div>)}
                        </div>

                    </>
                }
                {(config.addTests || isAdmin) &&
                    <div className="add-button">
                        <button className="btn btn-outline-success btn-sm btn-block" onClick={doAddTest}>+ Test</button>
                    </div>
                }
                {isAdmin &&
                    <div className="add-button">
                        <button className="btn btn-outline-primary btn-sm btn-block" onClick={doVerifyAll}>Verify All</button>
                    </div>
                }
            </div>
        </div>
    </>

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
    const username = myuid.slice(0, 7) === "testuid" ? "testuser-" + myuid.slice(-4) : users.allUsers[myuid].username;
    const intermediateCodeState: ICodeSolutionState = intermediateUserState.intermediateSolutionState[ownProps.problem.id];
    const { currentActiveTest, testResults } = intermediateCodeState;
    const userSolution = solutions.allSolutions[problem.id][myuid];
    let tests = {};

    if (aggregateData) {
        tests = aggregateData.userData[problem.id].tests;
    }
    const testObjects: ICodeTest[] = Object.values(tests);
    const instructorTestObjects: ICodeTest[] = Object.values(instructorTests);
    const allTests = Object.assign(JSON.parse(JSON.stringify(tests)), instructorTests);
    const allTestsObjects: ICodeTest[] = Object.values(allTests);

    const currentTest = allTests.hasOwnProperty(currentActiveTest) ? allTests[currentActiveTest] : instructorTestObjects[0];

    return update(ownProps, { $merge: { isAdmin, username, userSolution, tests, testObjects, aggregateDataDoc, currentTest, problemsDoc, testResults, config, instructorTestObjects, allTestsObjects } })
}

export default connect(mapStateToProps)(PuzzleEditor);