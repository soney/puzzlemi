import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import { IHelpSession, ICodeTest } from '../../../../reducers/aggregateData';
import { ICodeSolutionState } from '../../../../reducers/intermediateUserState';
import SessionList from './SessionList';


const HelpMatch = ({ redirectCallback, problem, username, helpSessionObjects, currentTest, currentResult }) => {
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
    let matchedSessions: IHelpSession[] = [];
    const findCommonElements = (arr1, arr2) => {
        return arr1.some(item => arr2.includes(item))
    }

    helpSessionObjects.forEach(session => {
        if (findCommonElements(session.errorTags, errorTags) || findCommonElements(session.testTags, testTags)) {
            if (session.tutee !== username) matchedSessions.push(session);
        }
    })

    const clickCallback = () => {
        redirectCallback()
    }
    const toggleDisplay = () => {
        setIsDisplay(!isDisplay)
    }

    // if the user finished the problem, then directed him to the latest help request
    if ((currentResult && currentResult.passed === "passed") || matchedSessions.length === 0) {
        let activeSession = helpSessionObjects.filter(s => s.status)
        matchedSessions = []
        if (activeSession.length > 0) matchedSessions.push(activeSession[activeSession.length - 1])
    }

    return <div className="match-container">
        {(currentResult && currentResult.passed !== "pending") &&
            <>
                <button type="button" className="btn btn-outline-primary" onClick={toggleDisplay}>{isDisplay ? "Hide Suggestions" : "Display Suggestions"}</button>
                {isDisplay &&
                    <div className="alert alert-light alert-dismissible fade show" role="alert">
                        {currentResult.passed === "passed"
                            ? <h4 className="alert-heading">Could you help them?</h4>
                            : <h4 className="alert-heading">You may find these discussions useful.</h4>
                        }
                        {matchedSessions.length === 0 &&
                            <div>No matched sessions right now. </div>
                        }
                        {matchedSessions.map((session, i) => <SessionList key={i} session={session} problem={problem} clickCallback={clickCallback} />)}
                    </div>
                }
            </>
        }
    </div>
}

function mapStateToProps(state, ownProps) {
    const { intermediateUserState, shareDBDocs, users } = state;
    const { problem } = ownProps;
    const aggregateData = shareDBDocs.i.aggregateData
    const intermediateCodeState: ICodeSolutionState = intermediateUserState.intermediateSolutionState[ownProps.problem.id];
    const { problemDetails } = problem;
    const instructorTests = problemDetails.tests;
    const myuid = users.myuid as string;
    const username = users.allUsers[myuid].username;

    const { currentActiveTest, testResults } = intermediateCodeState;
    let tests = {};
    if (aggregateData) {
        tests = aggregateData.userData[problem.id].tests;
    }

    const instructorTestObjects: ICodeTest[] = Object.values(instructorTests);
    const allTests = Object.assign(JSON.parse(JSON.stringify(tests)), instructorTests);

    const currentTest = allTests.hasOwnProperty(currentActiveTest) ? allTests[currentActiveTest] : instructorTestObjects[0];
    const currentResult = currentTest && testResults[currentTest.id];

    let helpSessions = {};
    if (aggregateData) {
        helpSessions = aggregateData.userData[problem.id].helpSessions
    }
    const helpSessionObjects: IHelpSession[] = Object.values(helpSessions);

    return update(ownProps, { $merge: { problem, helpSessionObjects, helpSessions, currentTest, currentResult, username } });
}
export default connect(mapStateToProps)(HelpMatch);
