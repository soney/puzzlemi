import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import { ICodeSolution } from '../../../reducers/solutions';
import { ICodeSolutionState } from '../../../reducers/intermediateUserState';
import { runCode } from '../../../actions/runCode_actions';
// import { addVariableTest, addHelpSession } from '../../../actions/sharedb_actions';
import Files from './Files';
import PuzzleEditor from './PuzzleEditor/PuzzleEditor';
import { ICodeTest } from '../../../reducers/aggregateData';

const MySolution = ({ userSolution, intermediateCodeState, testObjects, currentTest, currentResult, problem, config, flag, dispatch, myHelpSession, redirectCallback }) => {
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
        testObjects.forEach(test => {
            dispatch(runCode(codeSolution, problem, intermediateCodeState, graphicsEl_tmp, test))
        })
    }

    const doRequestHelp = () => {
        // dispatch(addHelpSession(problem.id, username, userSolution, helpID)).then(
        //     dispatch(updateCurrentActiveHelpSession(problem.id, helpID))
        // );
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
                                    <button disabled={false} className='btn btn-outline-success btn-sm btn-block' onClick={doRunAll}>Run All</button>
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
                            <button type="button" className="btn btn-outline-primary" onClick={doRequestHelp}>Enable a Help Session</button>
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
    const { config } = problemDetails;
    const myuid = users.myuid as string;
    const username = myuid.slice(7) === "testuid" ? "testuser-" + myuid.slice(-4) : users.allUsers[myuid].username;

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
    const currentTest = tests.hasOwnProperty(currentActiveTest) ? tests[currentActiveTest] : testObjects[0];
    const currentResult = testResults[currentTest.id];
    return update(ownProps, { $merge: { isAdmin, username, problemsDoc, config, myuid, userSolution, intermediateCodeState, myHelpSession, currentTest, currentResult, testObjects } });
}
export default connect(mapStateToProps)(MySolution);
