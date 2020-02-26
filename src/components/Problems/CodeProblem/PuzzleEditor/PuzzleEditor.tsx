import * as React from 'react';
import update from 'immutability-helper';
import { connect } from "react-redux";
import { CodeEditor } from '../../../CodeEditor';
import { ICodeSolution } from '../../../../reducers/solutions';
import { ICodeSolutionState } from '../../../../reducers/intermediateUserState';
import { codeChanged } from '../../../../actions/user_actions';
import { ICodeTest, CodeTestType, CodeTestStatus } from '../../../../reducers/aggregateData';
import { deleteTest, changeTestStatus } from '../../../../actions/sharedb_actions';
import { runCode } from '../../../../actions/runCode_actions';
import { analytics } from '../../../../utils/Firebase';
import TestList from './TestList';
import getChannelName from '../../../../utils/channelName';

const PuzzleEditor = ({ userSolution, graphicsRef, myuid, myemail, allTests, problemsDoc, isAdmin, problem, config, username, dispatch, currentTest, flag, aggregateDataDoc }) => {
    const [count, setCount] = React.useState(0);
    const [codeTab, setCodeTab] = React.useState('g');
    const channel = getChannelName();


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

    const doInitTestStatus = () => {
        if (currentTest.status === CodeTestStatus.UNVERIFIED) return;
        if (isAdmin) return;
        const newStatus = CodeTestStatus.UNVERIFIED;
        dispatch(changeTestStatus(problem.id, currentTest, newStatus));
    }


    const doChangeTestStatus = () => {
        const newStatus = currentTest.status === CodeTestStatus.VERIFIED ? CodeTestStatus.VERIFICATION_FAILED : CodeTestStatus.VERIFIED;
        dispatch(changeTestStatus(problem.id, currentTest, newStatus))
        analytics.logEvent("verify_test", {problemID: problem.id, channel, user: myemail, test: JSON.stringify(currentTest), status: newStatus});

    }

    const doDeleteTest = () => {
        dispatch(deleteTest(problem.id, currentTest));
    }

    const switchInstructorCode = (e) => {
        setCodeTab(e.target.id.slice(4, 5))
        refreshCM();
    }

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
            dispatch(runCode(code, [], problem, graphicsEl, currentTest))
        } else {
            dispatch(runCode(code, codeSolution.files, problem, graphicsEl, currentTest));
        }
    };

    const doRunAll = () => {
        const graphicsEl_tmp = graphicsRef ? graphicsRef.current : null;
        if (graphicsEl_tmp) {
            graphicsEl_tmp.innerHTML = '';
        }
        const allTestsObjects: ICodeTest[] = Object.values(allTests);
        analytics.logEvent("run_all", {code: codeSolution.code, tests: JSON.stringify(allTestsObjects), user: myemail, channel, problemID: problem.id});


        allTestsObjects.forEach(test => {
            if (test.status === CodeTestStatus.VERIFIED) {
                dispatch(runCode(codeSolution.code, codeSolution.files, problem, graphicsEl_tmp, test))
            }
        });
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
                                    <CodeEditor run={doRunCode} shareDBSubDoc={givenCodeSubDoc} />
                                </div>
                                <div className="tab-pane fade" id={"nav-live-" + problem.id} role="tabpanel" aria-labelledby={"nav-live-tab-" + problem.id}>
                                    <CodeEditor run={doRunCode} shareDBSubDoc={liveCodeSubDoc} flag={count} />
                                </div>
                                <div className="tab-pane fade" id={"nav-standard-" + problem.id} role="tabpanel" aria-labelledby={"nav-standard-tab-" + problem.id}>
                                    <CodeEditor run={doRunCode} shareDBSubDoc={standardCodeSubDoc} flag={count} />
                                </div>
                            </div>
                        </>
                        : <CodeEditor run={doRunCode} value={codeSolution.code} options={{ height: 300, lineNumbers: true }} onChange={doSetCode} flag={flag} />
                    }
                </div>
            </div>
            <div className="row">
                <div className={config.disableTest ? "col" : "col-9 puzzle-editor"}>
                    <button disabled={false} className='btn btn-outline-success btn-sm btn-block' onClick={doRunCode}>Run</button>
                </div>
            </div>
        </>
    }


    return <>
        <div className="row">
            <div className="col-9 puzzle-editor">
                {isEdit &&
                    <div className="puzzle-header">
                        <div className="row">
                            <div className="col">
                                {isEdit
                                    ? <CodeEditor shareDBSubDoc={testNameSubDoc} captureTabs={false} selectOnFocus={true} options={{ lineNumbers: false, mode: 'text', lineWrapping: true, height: 30 }} refreshDoc={currentTest.id} />
                                    : <div>{currentTest.name}</div>
                                }
                            </div>
                            <div className="col">
                                <div className="btn-group btn-block">
                                    {
                                        isAdmin && currentTest.author !== null && (currentTest.status === CodeTestStatus.VERIFIED
                                            ? <button className="btn btn-outline-warning btn-sm" onClick={doChangeTestStatus}><i className="fas fa-times-circle"></i> Unverify</button>
                                            : <button className="btn btn-outline-info btn-sm" onClick={doChangeTestStatus}><i className="fas fa-check-circle"></i> {currentTest.status === CodeTestStatus.VERIFICATION_FAILED ? 'Verify' : 'Verify'}</button>)
                                    }
                                    {currentTest.author !== null &&
                                        <button className="btn btn-outline-danger btn-sm" onClick={doDeleteTest}><i className="fas fa-trash"></i> Delete</button>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                }
                <CodeEditor run={doRunCode} shareDBSubDoc={beforeCodeSubDoc} options={{ readOnly: !isEdit, lineNumbers: true, height: 80, lineWrapping: true }} refreshDoc={currentTest.id} onChange={doInitTestStatus} />
                {isAdmin
                    ? <>
                        <nav>
                            <div className="nav nav-tabs instructor-tab" id={"nav-instructor-code-tab-" + problem.id} role="tablist">
                                <a className="nav-item nav-link active" id={"nav-given-tab-" + problem.id} data-toggle="tab" href={"#nav-given-" + problem.id} role="tab" aria-controls={"nav-given-" + problem.id} aria-selected="true" onClick={switchInstructorCode}>Given Code</a>
                                <a className="nav-item nav-link" id={"nav-standard-tab-" + problem.id} data-toggle="tab" href={"#nav-standard-" + problem.id} role="tab" aria-controls={"nav-standard-" + problem.id} aria-selected="false" onClick={switchInstructorCode}>Solution Code</a>
                                <a className="nav-item nav-link" id={"nav-live-tab-" + problem.id} data-toggle="tab" href={"#nav-live-" + problem.id} role="tab" aria-controls={"nav-live-" + problem.id} aria-selected="false" onClick={switchInstructorCode}>Live Code</a>
                            </div>
                        </nav>
                        <div className="tab-content" id={"nav-instructor-code-tabContent-" + problem.id}>
                            <div className="tab-pane fade show active" id={"nav-given-" + problem.id} role="tabpanel" aria-labelledby={"nav-given-tab-" + problem.id}>
                                <CodeEditor shareDBSubDoc={givenCodeSubDoc} options={{ lineNumbers: true, height: 150, lineWrapping:true }} />
                            </div>
                            <div className="tab-pane fade" id={"nav-standard-" + problem.id} role="tabpanel" aria-labelledby={"nav-standard-tab-" + problem.id}>
                                <CodeEditor run={doRunCode} shareDBSubDoc={standardCodeSubDoc} options={{ lineNumbers: true, height: 150, lineWrapping:true }} flag={count} />
                            </div>
                            <div className="tab-pane fade" id={"nav-live-" + problem.id} role="tabpanel" aria-labelledby={"nav-live-tab-" + problem.id}>
                                <CodeEditor run={doRunCode} shareDBSubDoc={liveCodeSubDoc} options={{ lineNumbers: true, height: 150, lineWrapping:true }} flag={count} />
                            </div>
                        </div>
                    </>
                    : <CodeEditor run={doRunCode} value={codeSolution.code} options={{ lineNumbers: true, height: 300, lineWrapping:true }} onChange={doSetCode} flag={flag} />}
                <CodeEditor shareDBSubDoc={afterCodeSubDoc} options={{ readOnly: !isEdit, lineNumbers: true, height: 80, lineWrapping: true }} refreshDoc={currentTest.id} onChange={doInitTestStatus} />
            </div>
            <div className="col-3 tests">
                <TestList problem={problem} />
            </div>
        </div>
        <div className="row">
            <div className={config.disableTest ? "col" : "col-9 puzzle-editor"}>
                <button disabled={false} className='btn btn-outline-success btn-sm btn-block' onClick={doRunCode}>Run</button>
            </div>
            {!config.disableTest &&
                <div className="col-3">
                    {config.runTests &&
                        <button disabled={false} className='btn btn-outline-success btn-sm btn-block' onClick={doRunAll}>Run All Tests</button>
                    }
                </div>
            }
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
    const myemail = users.allUsers[myuid].email;

    const username = users.allUsers[myuid].username;
    const intermediateCodeState: ICodeSolutionState = intermediateUserState.intermediateSolutionState[ownProps.problem.id];
    const { currentActiveTest } = intermediateCodeState;
    const userSolution = solutions.allSolutions[problem.id][myuid];
    const tests: { [id: string]: ICodeTest } = aggregateData ? aggregateData.userData[problem.id].tests : {};

    const instructorTestObjects: ICodeTest[] = Object.values(instructorTests);
    const allTests = Object.assign(JSON.parse(JSON.stringify(tests)), instructorTests);

    const currentTest = allTests.hasOwnProperty(currentActiveTest) ? allTests[currentActiveTest] : instructorTestObjects[0];

    return update(ownProps, { $merge: { isAdmin, username, allTests, userSolution, tests, aggregateDataDoc, currentTest, problemsDoc, config, myuid, myemail } })
}

export default connect(mapStateToProps)(PuzzleEditor);