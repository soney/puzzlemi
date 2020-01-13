import * as React from 'react';
import TestResult from './TestResult';
import { connect } from "react-redux";
import update from 'immutability-helper';
// import { changeTargetID } from '../actions/user_actions';

const TestResults = ({ targetID, defaultPass, problem, testResults, passedAll, dispatch, index, doc }) => {
    const total_num = Object.keys(testResults).length;
    let pass_num = 0;
    let failed_tests:any[] =[];
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

    return <div>
        {(defaultPass && (total_num === 0)) &&
            <div className="alert alert-success" role="alert">
                You passed the default test!
            </div>
        }
        {(defaultPass===false && (total_num === 0)) &&
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
                <table className="table table-sm">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Author</th>
                            <th scope="col">Progress</th>
                            {failed_tests[0].input.map((inp_var, i) => <th scope="col" key={i}>{inp_var.name}</th>)}
                            {failed_tests[0].output.map((out_var, i) => <th scope="col" key={i}>{out_var.name}</th>)}
                            {/* <th scope="col">Message</th> */}
                        </tr>
                    </thead>
                    <tbody>
                        {failed_tests.map((test, i)=><TestResult test={test} index={index} key={i}/>)}
                        
                        {/* {myTests.map(({ test, i }) => <Test key={test.id + `${i}`} index={index} testIndex={i} isInput={true} totalNum={inputTests.length} />)} */}
                    </tbody>
                </table>

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
    const targetID = userSolution.targetID;
    return update(ownProps, { targetID: { $set: targetID }, defaultPass: { $set: defaultPass }, testResults: { $set: testResults }, problem: { $set: problem }, passedAll: { $set: passedAll }, doc: { $set: doc } });
}
export default connect(mapStateToProps)(TestResults); 