import * as React from 'react';
import update from 'immutability-helper';
import { connect } from "react-redux";
import { ICodeSolutionState } from '../../../../reducers/intermediateUserState';
import { ICodeTest, CodeTestStatus } from '../../../../reducers/aggregateData';
import { addTest } from '../../../../actions/sharedb_actions';
import { runVerifyTest } from '../../../../actions/runCode_actions';
import TestItem from './TestItem';

const TestList = ({ isAdmin, problem, config, username, myTestObjects, otherTestObjects, dispatch, currentTest, instructorTestObjects, allTestsObjects }) => {
    if (!currentTest) { return null; }

    const doAddInstructorTest = () => {
        dispatch(addTest(problem.id, username, true));
    }
    const doAddUserTest = () => {
        dispatch(addTest(problem.id, username, false));
    }

    const doVerifyAll = () => {
        allTestsObjects.forEach(test => {
            dispatch(runVerifyTest(problem, test))
        })
    }

    return <>
        {(myTestObjects.length > 0 || (config.addTests && !isAdmin)) && <small className="text-muted">My Tests</small> }
        {myTestObjects.length > 0 &&
            <ul className="list-group test-lists">
                { myTestObjects.map((test, i) => <TestItem key={i} test={test} problem={problem} selected={currentTest===test} /> ) }
            </ul>}
        {(config.addTests && !isAdmin) &&  <div className="add-button"> <button className="btn btn-outline-success btn-sm btn-block" onClick={doAddUserTest}>+ Test</button> </div> }

        {instructorTestObjects.length > 0 && <small className="text-muted">Instructor</small> }
        {instructorTestObjects.length > 0 &&
            <ul className="list-group test-lists">
                { instructorTestObjects.map((test, i) => <TestItem key={i} test={test} problem={problem} selected={currentTest===test} /> ) }
            </ul>}
        {isAdmin && <div className="add-button"> <button className="btn btn-outline-success btn-sm btn-block" onClick={doAddInstructorTest}>+ Test</button> </div> }

        {otherTestObjects.length > 0 && <small className="text-muted">Students</small> }
        {otherTestObjects.length > 0 &&
            <ul className="list-group test-lists">
                {otherTestObjects.map((test, i) => <TestItem key={i} test={test} problem={problem} selected={currentTest===test} /> ) }
            </ul>
        }

        {isAdmin &&
            <div className="add-button">
                <button className="btn btn-outline-info btn-sm btn-block" onClick={doVerifyAll}><i className="fas fa-check-circle"></i> Verify All</button>
            </div>
        }
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
    const tests: {[id: string]: ICodeTest} = aggregateData ? aggregateData.userData[problem.id].tests : {};

    const myTestObjects: ICodeTest[] = Object.values(tests).filter((t) => t.author === username);
    const otherTestObjects: ICodeTest[] = Object.values(tests).filter((t) => ((t.author !== username) && ((t.status === CodeTestStatus.PASSED)||isAdmin) ) );
    const instructorTestObjects: ICodeTest[] = Object.values(instructorTests);
    const allTests = Object.assign(JSON.parse(JSON.stringify(tests)), instructorTests);
    const allTestsObjects: ICodeTest[] = Object.values(allTests);

    const currentTest = allTests.hasOwnProperty(currentActiveTest) ? allTests[currentActiveTest] : instructorTestObjects[0];

    return update(ownProps, { $merge: { isAdmin, username, userSolution, tests, myTestObjects, otherTestObjects, aggregateDataDoc, currentTest, problemsDoc, testResults, config, instructorTestObjects, allTestsObjects } })
}

export default connect(mapStateToProps)(TestList);