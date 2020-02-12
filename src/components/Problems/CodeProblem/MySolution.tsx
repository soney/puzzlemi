import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import { ICodeSolution } from '../../../reducers/solutions';
import { ICodeSolutionState } from '../../../reducers/intermediateUserState';
import { runCode } from '../../../actions/runCode_actions';
// import { addVariableTest, addHelpSession } from '../../../actions/sharedb_actions';
import { addHelpSession } from '../../../actions/sharedb_actions';
import {updateCurrentActiveHelpSession} from '../../../actions/user_actions';
import Files from './Files';
import PuzzleEditor from './PuzzleEditor/PuzzleEditor';
import { ICodeTest, CodeTestStatus } from '../../../reducers/aggregateData';
import uuid from '../../../utils/uuid';

const MySolution = ({ userSolution, intermediateCodeState, testObjects, currentTest, currentResult, problem, config, flag, dispatch, myHelpSession, redirectCallback, username,allTestsObjects }) => {
    const codeSolution = userSolution as ICodeSolution;
    const graphicsRef = React.createRef<HTMLDivElement>();
    const messageRef = React.createRef<HTMLDivElement>();

    const doRunCode = () => {
        const graphicsEl = graphicsRef.current;
        if (graphicsEl) {
            graphicsEl.innerHTML = '';
        }
        return dispatch(runCode(codeSolution, problem, intermediateCodeState, graphicsEl, currentTest));
    };

    const doRunAll = () => {
        const graphicsEl_tmp = graphicsRef.current;
        if (graphicsEl_tmp) {
            graphicsEl_tmp.innerHTML = '';
        }
        allTestsObjects.forEach(test => {
            if(test.status === CodeTestStatus.PASSED){
                dispatch(runCode(codeSolution, problem, intermediateCodeState, graphicsEl_tmp, test))
            }
        })
    }

    const doRequestHelp = () => {
        const helpID = uuid();
        dispatch(addHelpSession(problem.id, username, userSolution, helpID)).then(
            dispatch(updateCurrentActiveHelpSession(problem.id, helpID))
        );
        redirectCallback();
    }

    return <div>
        <div className="row">
            <div className={config.disableTest ? "col" : "col-7"}>
                <div>
                    <PuzzleEditor problem={problem} flag={flag} />
                    <div className="row">
                        <div className={config.disableTest ? "col" : "col-9"}>
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
                </div>
            </div>
            <div className="col">
                {currentResult &&
                    <pre className={'codeOutput' + (currentResult.errors.length > 0 ? ' alert alert-danger' : ' no-error')}>
                        {currentResult.output}
                        {currentResult.errors.join('\n')}
                    </pre>
                }
                <div ref={graphicsRef} className='graphics'></div>

                <Files problem={problem} />
                {config.peerHelp &&
                    <div>
                        {myHelpSession === null &&
                            <button type="button" className="btn btn-outline-primary" onClick={doRequestHelp}><i className="fas fa-comment"></i> Start a Help Session</button>
                        }
                        {myHelpSession !== null &&
                            <button type="button" className="btn btn-outline-primary">Check My Help Session</button>
                        }
                    </div>
                }
            </div>
        </div>
        <div className="row">
            <div className="col test-case-message" ref={messageRef}>
            </div>
        </div>
    </div>
}

function mapStateToProps(state, ownProps) {
    const { intermediateUserState, shareDBDocs, solutions, users } = state;
    const { isAdmin } = intermediateUserState;
    const problemsDoc = shareDBDocs.problems;
    const aggregateDataDoc = shareDBDocs.aggregateData;
    const aggregateData = aggregateDataDoc.getData();
    const { problem } = ownProps;
    const { problemDetails } = problem;
    const instructorTests = problemDetails.tests;
    const { config } = problemDetails;
    const myuid = users.myuid as string;
    const username = myuid.slice(0,7) === "testuid" ? "testuser-" + myuid.slice(-4) : users.allUsers[myuid].username;

    const userSolution = solutions.allSolutions[problem.id][myuid];
    const helpSessions = aggregateData.userData[problem.id].helpSessions
    let myHelpS = helpSessions.filter(s => s.tuteeID === myuid && s.status === true);
    const myHelpSession = myHelpS.length > 0 ? myHelpS[0] : null;
    const intermediateCodeState: ICodeSolutionState = intermediateUserState.intermediateSolutionState[ownProps.problem.id];

    const { currentActiveTest, testResults } = intermediateCodeState;
    let tests = {};
    if (aggregateData) {
        tests = aggregateData.userData[problem.id].tests;
    }

    const testObjects: ICodeTest[] = Object.values(tests);
    const instructorTestObjects: ICodeTest[] = Object.values(instructorTests);
    const allTests = Object.assign(JSON.parse(JSON.stringify(tests)),instructorTests);
    const allTestsObjects: ICodeTest[] = Object.values(allTests);

    const currentTest = allTests.hasOwnProperty(currentActiveTest) ? allTests[currentActiveTest] : instructorTestObjects[0];
    const currentResult = currentTest && testResults[currentTest.id];
    return update(ownProps, { $merge: { isAdmin, username, problemsDoc, config, myuid, userSolution, intermediateCodeState, myHelpSession, currentTest, currentResult, testObjects, allTestsObjects } });
}
export default connect(mapStateToProps)(MySolution);
