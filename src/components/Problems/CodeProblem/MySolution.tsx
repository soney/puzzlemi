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
import HelpMatch from './PeerHelp/HelpMatch';

const MySolution = ({ userSolution, myuid, problem, config, currentResult, currentTest, flag, myHelpSession, dispatch, redirectCallback, username }) => {
    const graphicsRef = React.createRef<HTMLDivElement>();

    const doRequestHelp = () => {
        const helpID = uuid();
        let title = "";
        let errorTags: string[] = [];
        let testTags: string[] = [];
        testTags.push(currentTest.id);
        if (currentResult && currentResult.passed === "failed") {
            if (currentResult.errors.length > 0) {
                const errorMessages = currentResult.errors[0].split('\n');
                const errorMessage = errorMessages[errorMessages.length - 1];
                const errorType = errorMessage.split(':')[0];
                errorTags.push(errorType);
                if (errorType === "AssertionError") title = "Failed the assertion in **" + currentTest.name + "**";
                else title = "`" + errorType + "` in my code"
            }
        }
        else {
            title = "Help me with **" + currentTest.name + "**";
        }
        const newCode = currentTest.before + "\n" + userSolution.code + "\n" + currentTest.after;
        dispatch(addHelpSession(problem.id, username, newCode, helpID, errorTags, testTags, title)).then(() => {
            dispatch(updateCurrentActiveHelpSession(problem.id, helpID));
            dispatch(changeHelperLists(problem.id, helpID, myuid))
        });
        redirectCallback();
    }

    const doSwitchHelp = () => {
        dispatch(updateCurrentActiveHelpSession(problem.id, myHelpSession.id))
        redirectCallback();
    }

    return <div>
        <div className="row">
            <div className={config.disableTest ? "col" : "col-7"}>
                <div>
                    <PuzzleEditor problem={problem} flag={flag} graphicsRef={graphicsRef} />
                </div>
            </div>
            <div className={config.disableTest ? "col" : "col-5"}>
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
        {config.peerHelp &&
            <HelpMatch problem={problem} redirectCallback={redirectCallback} />
        }
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
