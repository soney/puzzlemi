import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import { ICodeSolutionState } from '../../../reducers/intermediateUserState';
import { addHelpSession, changeHelperLists } from '../../../actions/sharedb_actions';
import { updateCurrentActiveHelpSession } from '../../../actions/user_actions';
import Files from './Files';
import PuzzleEditor from './PuzzleEditor/PuzzleEditor';
import { ICodeTest, IHelpSession } from '../../../reducers/aggregateData';
import uuid from '../../../utils/uuid';
import CodeOutput from './CodeOutput'

const MySolution = ({ userSolution, myuid, problem, config, flag, myHelpSession, dispatch, redirectCallback, username }) => {
    const graphicsRef = React.createRef<HTMLDivElement>();
    const messageRef = React.createRef<HTMLDivElement>();

    const doRequestHelp = () => {
        const helpID = uuid();
        dispatch(addHelpSession(problem.id, username, userSolution, helpID)).then(()=>{
            dispatch(updateCurrentActiveHelpSession(problem.id, helpID));
            dispatch(changeHelperLists(problem.id, helpID, myuid))
        });
        redirectCallback();
    }

    const doSwitchHelp=()=>{
        redirectCallback();
    }

    return <div>
        <div className="row">
            <div className={config.disableTest ? "col" : "col-7"}>
                <div>
                    <PuzzleEditor problem={problem} flag={flag} graphicsRef={graphicsRef} />
                </div>
            </div>
            <div className="col">
                <CodeOutput problem={problem} />
                <div ref={graphicsRef} className='graphics'></div>

                <Files problem={problem} />
                {config.peerHelp &&
                    <div>
                        {myHelpSession === null &&
                            <button type="button" className="btn btn-outline-primary" onClick={doRequestHelp}><i className="fas fa-comment"></i> Start a Help Session</button>
                        }
                        {myHelpSession !== null &&
                            <button type="button" className="btn btn-outline-secondary" onClick={doSwitchHelp}>Check My Help Session</button>
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
    const username = users.allUsers[myuid].username;

    const userSolution = solutions.allSolutions[problem.id][myuid];
    const helpSessions = aggregateData.userData[problem.id].helpSessions;
    const helpSessionObjects: IHelpSession[] = Object.values(helpSessions);

    let myHelpS = helpSessionObjects.filter(s => s.tutee === username && s.status);
    const myHelpSession = myHelpS.length > 0 ? myHelpS[0] : null;
    const intermediateCodeState: ICodeSolutionState = intermediateUserState.intermediateSolutionState[ownProps.problem.id];

    const { currentActiveTest, testResults } = intermediateCodeState;
    let tests = {};
    if (aggregateData) {
        tests = aggregateData.userData[problem.id].tests;
    }

    const testObjects: ICodeTest[] = Object.values(tests);
    const instructorTestObjects: ICodeTest[] = Object.values(instructorTests);
    const allTests = Object.assign(JSON.parse(JSON.stringify(tests)), instructorTests);
    const allTestsObjects: ICodeTest[] = Object.values(allTests);

    const currentTest = allTests.hasOwnProperty(currentActiveTest) ? allTests[currentActiveTest] : instructorTestObjects[0];
    const currentResult = currentTest && testResults[currentTest.id];
    return update(ownProps, { $merge: { isAdmin, username, problemsDoc, config, myuid, userSolution, intermediateCodeState, myHelpSession, currentTest, currentResult, testObjects, allTestsObjects } });
}
export default connect(mapStateToProps)(MySolution);
