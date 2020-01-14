import * as React from 'react';
import TestResult from './TestResult';
import { connect } from "react-redux";
import update from 'immutability-helper';
import {updateActiveFailedTestID} from '../actions/user_actions';
// import { changeTargetID } from '../actions/user_actions';

const TestResults = ({ activeFailedTestID, defaultPass, problem, testResults, passedAll, dispatch, index, doc }) => {
    const total_num = Object.keys(testResults).length;
    let pass_num = 0;
    let failed_tests: any[] = [];
    const getTest = (testID) => {
        let myTest;
        problem.tests.forEach(test => {
            if (test.id === testID) myTest = test;
        })
        return myTest;
    }

    for (let testID in testResults) {
        if (testResults[testID].passedAll) pass_num += 1;
        else {
            let thisTest = getTest(testID);
            failed_tests.push(thisTest);
        }
    }
    const onSwitchPage = (e) => {
        const failedTestIndex = e.target.getAttribute('data-value');
        const failedTestID = failed_tests[failedTestIndex].id;
        dispatch(updateActiveFailedTestID(problem.id, failedTestID));
    }

    return <div>
        {(defaultPass === true && (total_num === 0)) &&
            <div className="alert alert-success" role="alert">
                You passed the default test!
            </div>
        }
        {(defaultPass === false && (total_num === 0)) &&
            <div className="alert alert-danger" role="alert">
                You didn't pass the default test!
            </div>
        }
        {(passedAll && (total_num !== 0)) &&
            <div className="alert alert-success" role="alert">
                You passed all the tests!
            </div>
        }
        {(!passedAll && (failed_tests.length !== 0)) &&
            <div>
                <div className="alert alert-danger" role="alert">
                    You failed {total_num - pass_num} of {total_num} tests.
                </div>
                <TestResult index={index} />
                
                <nav aria-label="Page navigation example">
                    <ul className="pagination">
                        {/* <li className="page-item">
                            <div className="page-link" aria-label="Previous">
                                <span aria-hidden="true">&laquo;</span>
                            </div>
                        </li> */}
                        {failed_tests.map((test, i) =>
                             <li className={test.id === activeFailedTestID?"page-item active":"page-item"} key={i}>
                            <div className="page-link" data-value={i} onClick={onSwitchPage}>{i+1}</div>
                            </li>
                        )}
                        {/* <li className="page-item">
                            <div className="page-link" aria-label="Next">
                                <span aria-hidden="true">&raquo;</span>
                            </div>
                        </li> */}
                    </ul>
                </nav>
            </div>
        }
    </div>
}
function mapStateToProps(state, ownProps) {
    const { index } = ownProps;
    const { user, problems, doc } = state;
    const problem = problems[index];
    const userSolution = user.solutions[problem.id];
    const testResults = userSolution.testResults;
    const passedAll = userSolution.passedAll;
    const defaultPass = userSolution.defaultPass;
    const activeFailedTestID = userSolution.activeFailedTestID;
    return update(ownProps, { activeFailedTestID: { $set: activeFailedTestID }, defaultPass: { $set: defaultPass }, testResults: { $set: testResults }, problem: { $set: problem }, passedAll: { $set: passedAll }, doc: { $set: doc } });
}
export default connect(mapStateToProps)(TestResults); 