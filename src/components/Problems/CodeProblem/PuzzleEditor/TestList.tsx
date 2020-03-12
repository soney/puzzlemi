import * as React from 'react';
import update from 'immutability-helper';
import { connect } from "react-redux";
import { ICodeSolutionState } from '../../../../reducers/intermediateUserState';
import { ICodeTest, CodeTestStatus } from '../../../../reducers/aggregateData';
import { addTest, changeProblemConfig } from '../../../../actions/sharedb_actions';
import { runVerifyTest } from '../../../../actions/runCode_actions';
import TestItem from './TestItem';
import uuid from '../../../../utils/uuid';
import { setActiveTest } from '../../../../actions/user_actions';
import { logEvent } from '../../../../utils/Firebase';
import { StudentTestConfig } from '../../../../reducers/problems';

const TestList = ({ isAdmin, problem, config, username, myuid, myTestObjects, otherTestObjects, dispatch, currentTest, instructorTestObjects, allTestsObjects }) => {
    const myWIP = myTestObjects.filter(o => o.status !== CodeTestStatus.VERIFIED).length;

    const doAddInstructorTest = () => {
        const testID = uuid();
        dispatch(addTest(problem.id, username, true, testID)).then(() => {
            dispatch(setActiveTest(testID, problem.id))
        });
        logEvent("add_test", {testID}, problem.id, myuid);
        logEvent("focus_test", {testID}, problem.id, myuid);
    }
    const doAddUserTest = () => {
        const testID = uuid();

        dispatch(addTest(problem.id, username, false, testID)).then(() => {
            dispatch(setActiveTest(testID, problem.id))
        });
        logEvent("add_test", {testID}, problem.id, myuid);
        logEvent("focus_test", {testID}, problem.id, myuid);
    }

    const doVerifyAll = () => {
        logEvent("verify_test_all", {}, problem.id, myuid);
        allTestsObjects.forEach(test => {
            if (test.author !== 'default') dispatch(runVerifyTest(problem, test))
        })
    }

    // const onSwitchAllowAdding = (e) => {
    //     const item = e.target.id.split('-')[0];
    //     dispatch(changeProblemConfig(problem.id, item, e.target.checked));
    //     logEvent("instructor_toggle_adding_tests", {status: e.target.checked}, problem.id, myuid);
    // }

    // const onSwitchRequireTests = (e) => {
    //     const item = e.target.id.split('-')[0];
    //     dispatch(changeProblemConfig(problem.id, item, e.target.checked));
    //     logEvent("instructor_toggle_require_tests", {status: e.target.checked}, problem.id, myuid);
    // }

    const onSwitchChangeStudentTests = (e) => {
        const { value } = e.target;
        dispatch(changeProblemConfig(problem.id, 'studentTests', value));
        logEvent("instructor_change_student_tests", {status: value}, problem.id, myuid);
    }

    return <>
        {currentTest &&
            <div>
                {(myTestObjects.length > 0 || (config.addTests && !isAdmin)) && <small className="text-muted">My Tests</small>}
                {myTestObjects.length > 0 &&
                    <ul className="list-group test-lists">
                        {myTestObjects.map((test, i) => <TestItem key={i} test={test} problem={problem} selected={currentTest === test} />)}
                    </ul>}
                {((config.studentTests===StudentTestConfig.ENABLED||config.studentTests===StudentTestConfig.REQUIRED) && !isAdmin) &&
                    <div className="add-button">
                        {myWIP > 2
                            ? <button className="btn btn-outline-success btn-sm btn-block" disabled >+ Test</button>
                            : <button className="btn btn-outline-success btn-sm btn-block" onClick={doAddUserTest} >+ Test</button>
                        }
                    </div>

                }

                {instructorTestObjects.length > 0 && <small className="text-muted">Instructor</small>}
                {instructorTestObjects.length > 0 &&
                    <ul className="list-group test-lists">
                        {instructorTestObjects.map((test, i) => <TestItem key={i} test={test} problem={problem} selected={currentTest === test} />)}
                    </ul>}
            </div>
        }
        {isAdmin && <div className="add-button"> <button className="btn btn-outline-success btn-sm btn-block" onClick={doAddInstructorTest}>+ Test</button> </div>}

        {otherTestObjects.length > 0 && <small className="text-muted">Students</small>}
        {otherTestObjects.length > 0 &&
            <ul className="list-group test-lists">
                {otherTestObjects.map((test, i) => <TestItem key={i} test={test} problem={problem} selected={currentTest === test} />)}
            </ul>
        }
        {isAdmin &&
            <div className="add-button">
                <button className="btn btn-outline-info btn-sm btn-block" onClick={doVerifyAll}><i className="fas fa-check-circle"></i> Verify All</button>
            </div>
        }
        {isAdmin &&
            <>
                <label htmlFor={"studentTests-"+problem.id}>Student tests:</label>
                <select id={"studentTests-"+problem.id} onChange={onSwitchChangeStudentTests} defaultValue={config.studentTests}>
                    <option value={`${StudentTestConfig.DISABLED}`}>Disabled</option>
                    <option value={`${StudentTestConfig.ENABLED}` }>Enabled</option>
                    <option value={`${StudentTestConfig.REQUIRED}`}>Mandatory</option>
                </select>
            </>
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
    const myemail = users.allUsers[myuid].email;
    const username = users.allUsers[myuid].username;
    const intermediateCodeState: ICodeSolutionState = intermediateUserState.intermediateSolutionState[ownProps.problem.id];
    const { currentActiveTest, testResults } = intermediateCodeState;
    const userSolution = solutions.allSolutions[problem.id][myuid];
    const tests: { [id: string]: ICodeTest } = aggregateData ? aggregateData.userData[problem.id].tests : {};

    const myTestObjects: ICodeTest[] = Object.values(tests).filter((t) => t.author === username);
    const otherTestObjects: ICodeTest[] = Object.values(tests).filter((t) => ((t.author !== username) && ((t.status === CodeTestStatus.VERIFIED) || isAdmin)));
    const instructorTestObjects: ICodeTest[] = Object.values(instructorTests);
    const allTests = Object.assign(JSON.parse(JSON.stringify(tests)), instructorTests);
    const allTestsObjects: ICodeTest[] = Object.values(allTests);

    const currentTest = allTests.hasOwnProperty(currentActiveTest) ? allTests[currentActiveTest] : instructorTestObjects[0];

    return update(ownProps, { $merge: { isAdmin, username, userSolution, tests, myTestObjects, otherTestObjects, myemail, aggregateDataDoc, currentTest, problemsDoc, testResults, config, instructorTestObjects, allTestsObjects, myuid } })
}

export default connect(mapStateToProps)(TestList);