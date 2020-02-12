import * as React from 'react';
import update from 'immutability-helper';
import { connect } from "react-redux";
import { ICodeSolutionState } from '../../../../reducers/intermediateUserState';
import { setActiveTest } from '../../../../actions/user_actions';
import { CodeTestType, CodeTestStatus } from '../../../../reducers/aggregateData';

const PuzzleEditor = ({ isAdmin, problem, test, username, dispatch, selected, testResults }) => {
    const doSetCurrentTest = (e) => {
        dispatch(setActiveTest(test.id, problem.id))
    }

    const baseClasses = "list-group-item list-group-item-action test-list-item " + (test.type === CodeTestType.INSTRUCTOR ? 'instructor' : 'student');
    const activeClass = selected ? " active " : " ";
    const result = testResults[test.id];
    const isEditClass = test.author === username ? " isedit " : " ";
    let validClass;
    switch (test.status) {
        case CodeTestStatus.PASSED:
            validClass = " verified ";
            break;
        case CodeTestStatus.FAILED:
            validClass = " not-verified ";
            break;
        case CodeTestStatus.UNVERIFIED:
            validClass = " unverified ";
            break;
    }
    const adminClass = isAdmin ? " isadmin " : " ";
    const passClass = result && result.hasOwnProperty('passed') && result.passed ? 'passed' : '';
    const classValue = baseClasses + activeClass + isEditClass + validClass + adminClass + passClass;

    return <li data-tag={testResults.id} className={classValue} onClick={doSetCurrentTest}>{test.name}</li>;
}

function mapStateToProps(state, ownProps) {
    const { intermediateUserState, solutions, users } = state;
    const { isAdmin } = intermediateUserState;
    const { problem } = ownProps;
    const { problemDetails } = problem;
    const { config } = problemDetails;

    const myuid = users.myuid as string;
    const username = myuid.slice(0, 7) === "testuid" ? "testuser-" + myuid.slice(-4) : users.allUsers[myuid].username;
    const intermediateCodeState: ICodeSolutionState = intermediateUserState.intermediateSolutionState[ownProps.problem.id];
    const { currentActiveTest, testResults } = intermediateCodeState;
    const userSolution = solutions.allSolutions[problem.id][myuid];
    const selected = currentActiveTest === ownProps.test.id;

    return update(ownProps, { $merge: { isAdmin, username, userSolution, testResults, config, selected } })
}

export default connect(mapStateToProps)(PuzzleEditor);