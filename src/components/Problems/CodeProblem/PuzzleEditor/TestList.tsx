import * as React from 'react';
import update from 'immutability-helper';
import { connect } from "react-redux";
import { ICodeTest, CodeTestStatus } from '../../../../reducers/aggregateData';
import { addTest, changeProblemConfig } from '../../../../actions/sharedb_actions';
import { runVerifyTest } from '../../../../actions/runCode_actions';
import TestItem from './TestItem';
import uuid from '../../../../utils/uuid';
import { StudentTestConfig } from '../../../../reducers/problems';

const TestList = ({ problemsDoc, isAdmin, problem, config, username, myuid, myTestObjects, otherTestObjects, dispatch, instructorTestObjects, allTestsObjects, doSelectCallback, currentTest, disable, testResults }) => {
    const myWIP = myTestObjects.filter(o => o.status !== CodeTestStatus.VERIFIED).length;
    const p_prb = ['allProblems', problem.id];
    const standardCodeSubDoc = problemsDoc.subDoc([...p_prb, 'problemDetails', 'standardCode']);

    const doAddInstructorTest = () => {
        const testID = uuid();
        dispatch(addTest(problem.id, username, true, testID)).then(() => {
            doSelectCallback(testID);
        });
    }
    const doAddUserTest = () => {
        const testID = uuid();

        dispatch(addTest(problem.id, username, false, testID)).then(() => {
            doSelectCallback(testID)
        });
    }

    const doVerifyAll = () => {
        let solution = standardCodeSubDoc.getData();
        if (solution === '# standard solution') return;
        allTestsObjects.forEach(test => {
            if (test.author !== 'default') dispatch(runVerifyTest(problem, test))
        })
    }

    const onSwitchChangeStudentTests = (e) => {
        const { value } = e.target;
        dispatch(changeProblemConfig(problem.id, 'studentTests', value));
    }

    return <>
        {currentTest &&
            <div>
                {(myTestObjects.length > 0 || (config.addTests && !isAdmin)) && <small className="text-muted">My Tests</small>}
                {myTestObjects.length > 0 &&
                    <ul className="list-group test-lists">
                        {myTestObjects.map((test, i) => <TestItem key={i} test={test} problem={problem} selected={currentTest === test} doSelectCallback={doSelectCallback} currentTest={currentTest} testResults={testResults} />)}
                    </ul>}
                {((config.studentTests === StudentTestConfig.ENABLED || config.studentTests === StudentTestConfig.REQUIRED) && !isAdmin && !disable) &&
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
                        {instructorTestObjects.map((test, i) => <TestItem key={i} test={test} problem={problem} selected={currentTest === test} doSelectCallback={doSelectCallback} currentTest={currentTest} testResults={testResults} />)}
                    </ul>}
            </div>
        }
        {isAdmin && <div className="add-button"> <button className="btn btn-outline-success btn-sm btn-block" onClick={doAddInstructorTest}>+ Test</button> </div>}

        {otherTestObjects.length > 0 && <small className="text-muted">Students</small>}
        {otherTestObjects.length > 0 &&
            <ul className="list-group test-lists">
                {otherTestObjects.map((test, i) => <TestItem key={i} test={test} problem={problem} selected={currentTest === test} doSelectCallback={doSelectCallback} currentTest={currentTest} testResults={testResults} />)}
            </ul>
        }
        {isAdmin &&
            <div className="add-button">
                <button className="btn btn-outline-info btn-sm btn-block" onClick={doVerifyAll}><i className="fas fa-check-circle"></i> Verify All</button>
            </div>
        }
        {isAdmin &&
            <>
                <label htmlFor={"studentTests-" + problem.id}>Student tests:</label>
                <select className="form-control" id={"studentTests-" + problem.id} onChange={onSwitchChangeStudentTests} defaultValue={config.studentTests}>
                    <option value={`${StudentTestConfig.DISABLED}`}>Disabled</option>
                    <option value={`${StudentTestConfig.ENABLED}`}>Enabled</option>
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
    const userSolution = solutions.allSolutions[problem.id][myuid];
    const tests: { [id: string]: ICodeTest } = aggregateData ? aggregateData.userData[problem.id].tests : {};

    const myTestObjects: ICodeTest[] = Object.values(tests).filter((t) => t.author === username);
    const otherTestObjects: ICodeTest[] = Object.values(tests).filter((t) => ((t.author !== username) && ((t.status === CodeTestStatus.VERIFIED) || isAdmin)));
    const instructorTestObjects: ICodeTest[] = Object.values(instructorTests);
    const allTests = Object.assign(JSON.parse(JSON.stringify(tests)), instructorTests);
    const allTestsObjects: ICodeTest[] = Object.values(allTests);

    return update(ownProps, { $merge: { isAdmin, username, userSolution, tests, myTestObjects, otherTestObjects, myemail, aggregateDataDoc, allTests, problemsDoc, config, instructorTestObjects, allTestsObjects, myuid } })
}

export default connect(mapStateToProps)(TestList);