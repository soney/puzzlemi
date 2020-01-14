import * as React from 'react';
import Result from './Result';
import { connect } from "react-redux";
import update from 'immutability-helper';
import { updateActiveFailedTestID } from '../actions/user_actions';

const TestResults = ({ activeFailedTestID, failedTestResult, passedAllTests, problem, testResults, dispatch, index, doc }) => {
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
        {(passedAllTests === true) &&
            <div className="alert alert-success" role="alert">
                You passed all the tests!
            </div>
        }
        {(passedAllTests === false) &&
            <div className="alert alert-danger" role="alert">
                You failed {total_num - pass_num} of {total_num} tests.
            </div>
        }
        {(failedTestResult !== undefined) &&
            <div>
                <Result result={failedTestResult} tag="test" id={activeFailedTestID} />
                <nav aria-label="Page navigation example">
                    <ul className="pagination">
                        {failed_tests.map((test, i) =>
                            <li className={test.id === activeFailedTestID ? "page-item active" : "page-item"} key={i}>
                                <div className="page-link" data-value={i} onClick={onSwitchPage}>{i + 1}</div>
                            </li>
                        )}
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
    const { passedAllTests, activeFailedTestID, testResults } = userSolution;
    const failedTestResult = testResults[activeFailedTestID];
    return update(ownProps, { activeFailedTestID: { $set: activeFailedTestID }, failedTestResult: { $set: failedTestResult }, passedAllTests: { $set: passedAllTests }, testResults: { $set: testResults }, problem: { $set: problem }, doc: { $set: doc } });
}
export default connect(mapStateToProps)(TestResults); 