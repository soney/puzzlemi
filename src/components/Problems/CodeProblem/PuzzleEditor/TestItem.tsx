import * as React from 'react';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import update from 'immutability-helper';
import { connect } from "react-redux";
import { ICodeSolutionState, CodePassedState } from '../../../../reducers/intermediateUserState';
import { setActiveTest } from '../../../../actions/user_actions';
import { CodeTestType, CodeTestStatus, ICodeTest } from '../../../../reducers/aggregateData';
import { logEvent } from '../../../../utils/Firebase';

const PuzzleEditor = ({ isAdmin, problem, test, username, dispatch, selected, testResults, myuid }) => {
    const doSetCurrentTest = (e) => {
        dispatch(setActiveTest(test.id, problem.id))
        logEvent("focus_test", {testID: test.id}, problem.id, myuid);
    }

    const baseClasses = "list-group-item list-group-item-action test-list-item " + (test.type === CodeTestType.INSTRUCTOR ? 'instructor' : 'student');
    const activeClass = selected ? " active " : " ";
    const result = testResults[test.id];
    const isEditClass = test.author === username ? " isedit " : " ";
    let validClass;
    let validContent: string = "";

    switch (test.status) {
        case CodeTestStatus.VERIFIED:
            validClass = " verified ";
            validContent = "The test is valid.";
            break;
        case CodeTestStatus.VERIFICATION_FAILED:
            validClass = " not-verified ";
            validContent = "The test is invalid.";
            break;
        case CodeTestStatus.UNVERIFIED:
            validClass = " unverified ";
            validContent = "The test is waiting to be verified.";
            break;
    }
    const adminClass = isAdmin ? " isadmin " : " ";
    let passClass = 'pending';
    let passContent = "The result is pending.";
    if(result && result.hasOwnProperty('passed')) {
        const { passed } = result;
        if(passed === CodePassedState.PASSED) {
            passClass = 'passed';
            passContent = "The result is passeed.";
        } else if(passed === CodePassedState.FAILED) {
            passClass = 'failed';
            passContent = "The result is failed.";
        } else if(passed === CodePassedState.PENDING) {
            passClass = 'pending';
            passContent = "The result is pending.";
        }
    }
    const classValue = baseClasses + activeClass + isEditClass + validClass + adminClass + passClass;
    const tippyContent = validContent + " " + passContent;
    tippy('[data-tippy-content]');

    tippy('li', {
        duration: 0,
        arrow: false,
        delay: [1000, 200]
      });

    return <li data-tag={testResults.id} data-tippy-content={tippyContent} className={classValue} onClick={doSetCurrentTest}><p>{test.name}</p></li>;
}

function mapStateToProps(state, ownProps) {
    const { shareDBDocs, intermediateUserState, solutions, users } = state;
    const { isAdmin } = intermediateUserState;
    const { problem } = ownProps;
    const { problemDetails } = problem;
    const { config } = problemDetails;

    const myuid = users.myuid as string;
    const username = users.allUsers[myuid].username;
    const intermediateCodeState: ICodeSolutionState = intermediateUserState.intermediateSolutionState[ownProps.problem.id];
    const { currentActiveTest, testResults } = intermediateCodeState;
    const userSolution = solutions.allSolutions[problem.id][myuid];

    const instructorTests = problemDetails.tests;
    const aggregateData = shareDBDocs.i.aggregateData;
    const tests: {[id: string]: ICodeTest} = aggregateData ? aggregateData.userData[problem.id].tests : {};
    const instructorTestObjects: ICodeTest[] = Object.values(instructorTests);
    const allTests = Object.assign(JSON.parse(JSON.stringify(tests)), instructorTests);
    const currentTest = allTests.hasOwnProperty(currentActiveTest) ? allTests[currentActiveTest] : instructorTestObjects[0];

    const selected = currentTest && (currentTest.id === ownProps.test.id);

    return update(ownProps, { $merge: { isAdmin, username, userSolution, testResults, config, selected, myuid } })
}

export default connect(mapStateToProps)(PuzzleEditor);