import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';

const TestResult = ({ testResult, testUserInfo, testID, test, dispatch, index, doc }) => {
    const result = testResult['results'];
    const total_user_num = testUserInfo?Object.keys(testUserInfo).length: 0;
    let pass_user_num = 0;
    for(let userID in testUserInfo) {
        if(testUserInfo[userID].passedAll) pass_user_num += 1;
    }
    const pass_rate = total_user_num === 0? 0: pass_user_num / total_user_num * 100;
    const width_style = {width: pass_rate+"%"} as React.CSSProperties;

    return <div>
        {test&&
        <div className="card testResult">
            <div className="card-header">
                <div className="row">
                    <div className="col-6">{test.title}</div>
                    <div className="col-3">{test.author.slice(-4)}</div>
                    <div className="col-3"><div className="progress">
                        <div className="progress-bar progress-bar-striped bg-success" role="progressbar" style={width_style} aria-valuenow={pass_rate} aria-valuemin={0} aria-valuemax={100}>{pass_user_num}/{total_user_num}</div>
                    </div></div>
                </div>
            </div>
            <div className="card-body">
                <p className="card-text">{test.description}</p>
                <div className="row">
                    <table className="table">
                    <thead><tr>
                    <th scope="col">Input</th>
                    <th scope="col">Value</th>
                    </tr></thead>
                    <tbody>
                    {test.input.map(i=><tr key={i.name}><th scope="row">{i.name}</th><td>{i.value}</td></tr>)}
                    </tbody>
                    </table>
                </div>
                <div className="row">
                    <table className="table">
                    <thead><tr>
                    <th scope="col">Output</th>
                    <th scope="col">Value</th>
                    <th scope='col'>Message</th>
                    </tr></thead>
                    <tbody>
                    {test.output.map((i, idx)=>
                    <tr key={i.name}><th scope="row">{i.name}</th><td>{i.value}</td>
                    <td>{result[idx] && !result[idx].passed?result[idx].message:'pass'}</td>
                    </tr>)}
                    </tbody>
                    </table>
                </div>
            </div>
        </div>
        }
    </div>
}
function mapStateToProps(state, ownProps) {
    const { index, testID } = ownProps;
    const { problems, doc, user, userData } = state;
    const problem = problems[index];
    const test = problem.tests.filter(test=> test.id===testID)[0];
    const testUserInfo = userData[problem.id].testData[test.id];
    const userSolution = user.solutions[problem.id];
    const testResult = test?userSolution.testResults[test.id]:null; 
    return update(ownProps, { test: {$set: test}, testResult:{$set: testResult}, testUserInfo:{$set:testUserInfo}, problem: {$set: problem}, doc: {$set: doc} });
}
export default connect(mapStateToProps)(TestResult); 