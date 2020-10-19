import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import { ISharedSession } from '../../../../reducers/aggregateData';
import { ICodeSolutionState } from '../../../../reducers/intermediateUserState';
import SessionList from './SessionList';
import uuid from '../../../../utils/uuid';
import { addHelpSession, changeHelperLists } from '../../../../actions/sharedb_actions';
import { updateCurrentActiveHelpSession } from '../../../../actions/user_actions';

const HelpMatch = ({ dispatch, redirectCallback, problem, myemail, helpSessionObjects, myHelpSession, currentTest, currentResult, userSolution, myuid }) => {
    const [isDisplay, setIsDisplay] = React.useState(true);

    let errorTags: string[] = [];
    let testTags: string[] = [];
    testTags.push(currentTest.id);

    if (currentResult && currentResult.passed === "failed") {
        if (currentResult.errors.length > 0) {
            currentResult.errors.forEach(error => {
                const errorMessages = error.split('\n');
                const errorMessage = errorMessages[errorMessages.length - 1];
                const errorType = errorMessage.split(':')[0];
                errorTags.push(errorType);
            })
        }
    }
    let matchedSessions: ISharedSession[] = [];
    const findCommonElements = (arr1, arr2) => {
        return arr1.some(item => arr2.includes(item))
    }

    helpSessionObjects.forEach((session: ISharedSession) => {
        if (findCommonElements(session.errorTags, errorTags) || findCommonElements(session.testTags, testTags)) {
            if (session.userID !== myuid) matchedSessions.push(session);
        }
    })

    const clickCallback = () => {
        redirectCallback()
    }
    const toggleDisplay = () => {
        setIsDisplay(!isDisplay)
    }
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

        dispatch(addHelpSession(problem.id, myuid, newCode, helpID, errorTags, testTags, title)).then(() => {
            dispatch(updateCurrentActiveHelpSession(problem.id, helpID));
            dispatch(changeHelperLists(problem.id, helpID, myuid))
        });
        redirectCallback();
    }

    const doSwitchHelp = () => {
        dispatch(updateCurrentActiveHelpSession(problem.id, myHelpSession.id))
        redirectCallback();
    }

    // if the user finished the problem, then directed him to the latest help request
    if ((currentResult && currentResult.passed === "passed") || matchedSessions.length === 0) {
        const activeSession = helpSessionObjects.filter(s => s.status);
        matchedSessions = [];
        if (activeSession.length > 0) {
            matchedSessions.push(activeSession[activeSession.length - 1]);
        }
    }

    return <div className="match-container">
        {myHelpSession === null &&
            <button type="button" className="btn btn-outline-primary" onClick={doRequestHelp}><i className="fas fa-comment"></i> Start a Help Session</button>
        }
        {myHelpSession !== null &&
            <button type="button" className="btn btn-outline-secondary" onClick={doSwitchHelp}>Check My Help Session</button>
        }
        {(currentResult && currentResult.passed !== "pending") &&
            <>
                <div className="custom-control custom-switch related-button">
                    <input type="checkbox" className="custom-control-input" id={"related-help-button-" + problem.id} onClick={toggleDisplay} defaultChecked={isDisplay} />
                    <label className="custom-control-label" htmlFor={"related-help-button-" + problem.id}>Related Help Sessions</label>
                </div>
                {isDisplay &&
                    <div className="alert alert-light alert-dismissible fade show" role="alert">
                        {currentResult.passed === "passed"
                            ? <h4 className="alert-heading">Could you help them?</h4>
                            : <h4 className="alert-heading">You may find these sessions useful.</h4>
                        }
                        {matchedSessions.length === 0 &&
                            <div>No related help sessions right now. </div>
                        }
                        {matchedSessions.map((session, i) => <SessionList key={i} session={session} problem={problem} clickCallback={clickCallback} />)}
                    </div>
                }
            </>
        }
    </div>
}

function mapStateToProps(state, ownProps) {
    const { intermediateUserState, shareDBDocs, solutions, users } = state;
    const { problem, currentTest } = ownProps;
    const aggregateData = shareDBDocs.i.aggregateData
    const intermediateCodeState: ICodeSolutionState = intermediateUserState.intermediateSolutionState[ownProps.problem.id];
    const myuid = users.myuid as string;
    const myemail = users.allUsers[myuid].email;
    const username = users.allUsers[myuid].username;

    const { testResults } = intermediateCodeState;

    const userSolution = solutions.allSolutions[problem.id][myuid];

    const currentResult = currentTest && testResults[currentTest.id];

    let helpSessions = {};
    if (aggregateData) {
        helpSessions = aggregateData.userData[problem.id].helpSessions
    }
    const helpSessionObjects: ISharedSession[] = Object.values(helpSessions);

    let myHelpS = helpSessionObjects.filter(s => s.userID === myuid && s.status);
    const myHelpSession = myHelpS.length > 0 ? myHelpS[0] : null;

    return update(ownProps, { $merge: { helpSessionObjects, currentTest, currentResult, username, myHelpSession, userSolution, myuid, myemail } });
}
export default connect(mapStateToProps)(HelpMatch);
