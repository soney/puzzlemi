import * as React from 'react';
import  TestResult from './TestResult';
import { connect } from "react-redux";
import update from 'immutability-helper';
import {changeTargetID} from '../actions/user_actions';

const TestResults = ({ targetID, defaultPass, problem, testResults, passedAll, dispatch, index, doc }) => {
    const total_num = Object.keys(testResults).length;
    let pass_num = 0;
    let failed_tests: string[] = [];
    for(let testID in testResults) {
        if(testResults[testID].passedAll) pass_num += 1;
        else failed_tests.push(testID);
    }


    if(failed_tests.length>0 && (targetID === '' || failed_tests.indexOf(targetID)<0)) {
        dispatch(changeTargetID(problem.id, failed_tests[0]));
    }
    const getTestTitle=(testID):string=>{
        let title = '';
        problem.tests.forEach(test=>{
            if(test.id === testID) title=test.title;
        })
        return title;
    };
    const doChangeTargetID=(e)=>{
        dispatch(changeTargetID(problem.id, e.target.value));
    }
    return <div>
        {(defaultPass && (total_num === 0)) &&
            <div className="alert alert-success" role="alert">
                You passed the default test!
            </div>
        }
        {(!defaultPass && (total_num === 0)) &&
            <div className="alert alert-danger" role="alert">
                You didn't pass the default test!
            </div>
        }
        {(passedAll && (total_num!==0)) &&
            <div className="alert alert-success" role="alert">
                You passed all the tests!
            </div>
        }
        {(!passedAll && (failed_tests.length!==0)) &&
            <div>
            <div className="alert alert-danger" role="alert">
                You failed {total_num - pass_num} of {total_num} tests.
            </div>
            <select className="custom-select" id="test-list" onChange={doChangeTargetID}>
                {failed_tests.map(testID =>
                <option key={testID} value={testID}>{getTestTitle(testID)}</option>)}
            </select>
            {targetID!==''&& <TestResult testID={targetID} index={index}/>}
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

    return update(ownProps, { targetID: {$set: targetID}, defaultPass: {$set: defaultPass}, testResults: {$set: testResults}, problem: {$set: problem}, passedAll: {$set: passedAll}, doc: {$set: doc} });
}
export default connect(mapStateToProps)(TestResults); 