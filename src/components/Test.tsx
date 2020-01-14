import * as React from 'react';
import { connect } from "react-redux";
import * as showdown from 'showdown';
import { CodeEditor } from './CodeEditor';
import update from 'immutability-helper';
// import { changeTestStatus } from '../actions/sharedb_actions';

import { deleteTest, changeTestStatus } from '../actions/sharedb_actions';

const Test = ({ testResult, dispatch, config, index, testUserInfo, testIndex, test, isAdmin, doc, isInput, totalNum }) => {
    const doDeleteTest = () => {
        dispatch(deleteTest(index, testIndex));
    };
    const doChangeTestStatus = () => {
        dispatch(changeTestStatus(index, testIndex, !test.verified));
    }

    const p = ['problems', index, 'tests', testIndex];
    // const titleSubDoc = doc.subDoc([...p, 'title']);
    // const descriptionSubDoc = doc.subDoc([...p, 'description']);
    let inputSubDocs = [] as any[];
    let outputSubDocs = [] as any[];
    test.input.forEach((variable, i) => {
        const inputVariableSubDoc = doc.subDoc([...p, 'input', i, 'value']);
        inputSubDocs.push(inputVariableSubDoc);
    })
    test.output.forEach((variable, i) => {
        const outputVariableSubDoc = doc.subDoc([...p, 'output', i, 'value']);
        outputSubDocs.push(outputVariableSubDoc);
    })
    // const isLast = totalNum===testIndex+1;

    const total_user_num = testUserInfo ? Object.keys(testUserInfo).length : 0;
    let pass_user_num = 0;
    for (let userID in testUserInfo) {
        if (testUserInfo[userID].passedAll) pass_user_num += 1;
    }
    const pass_rate = total_user_num === 0 ? 0 : pass_user_num / total_user_num * 100;
    const width_style = { width: pass_rate + "%" } as React.CSSProperties;
    // const author_name = test.author.slice(-4);
    const author_name = test.author;
    if (isInput) {
        return <tr>
            <th scope="row">{test.id.slice(-4)}</th>
            {isAdmin && <td>{author_name}</td>}
            <td>{isAdmin
                ? (test.verified
                    ? <button className="btn btn-outline-success btn-sm" onClick={doChangeTestStatus}>Verified</button>
                    : <button className="btn btn-outline-danger btn-sm" onClick={doChangeTestStatus}>Unverified</button>)
                : (test.verified
                    ? <div className="badge badge-success">Verified</div>
                    : <div className="badge badge-danger">Unverified</div>)
            }
            </td>
            <td> <div className="progress">
                <div className="progress-bar progress-bar-striped bg-success" role="progressbar" style={width_style} aria-valuenow={pass_rate} aria-valuemin={0} aria-valuemax={100}>{pass_user_num}/{total_user_num}</div>
            </div>
            </td>
            {test.input.map((variable, i) => <td key={i}>
                <div className="variable-value">
                    {isAdmin
                    ?<CodeEditor shareDBSubDoc={inputSubDocs[i]} value={inputSubDocs[i].getData()} options={{ lineNumbers: false, mode: 'python', lineWrapping: true, height: 30 }} />
                    :<CodeEditor shareDBSubDoc={inputSubDocs[i]} value={inputSubDocs[i].getData()} options={{ lineNumbers: false, mode: 'python', lineWrapping: true, height: 30, readOnly: true }} />
                    }
                </div>
            </td>)}
            {test.output.map((variable, i) => <td key={i}>
                <div className="variable-value">
                    {isAdmin
                    ?<CodeEditor shareDBSubDoc={outputSubDocs[i]} value={outputSubDocs[i].getData()} options={{ lineNumbers: false, mode: 'python', lineWrapping: true, height: 30 }} />
                    :<CodeEditor shareDBSubDoc={outputSubDocs[i]} value={outputSubDocs[i].getData()} options={{ lineNumbers: false, mode: 'python', lineWrapping: true, height: 30, readOnly: true }} />
                    }
                </div>
            </td>)}
            <td><button className="btn btn-outline-danger btn-sm" onClick={doDeleteTest}>Delete</button></td>
        </tr>
    } else {
        const converter = new showdown.Converter();
        const testDescription = { __html: converter.makeHtml(test.description) };
        const passedStatusClass = testResult ? (testResult.passed ? 'alert-success' : 'alert-danger') : 'alert-secondary';
        const passFailMessage = testResult ? (testResult.passed ? 'Passed' : 'Failed') : '';
        return <tr className={['test', passedStatusClass].join(' ')}>
            <td dangerouslySetInnerHTML={testDescription} />
            <td>
                {passFailMessage}
            </td>
        </tr>;
    }
}
function mapStateToProps(state, ownProps) {
    const { index, testIndex } = ownProps;
    const { user, problems, doc, userData } = state;
    const { isAdmin } = user;
    const problem = problems[index];
    const test = problem.tests[testIndex];
    const testUserInfo = userData[problem.id].testData[test.id];
    console.log(testUserInfo)
    const userSolution = user.solutions[problem.id];
    const testResult = userSolution.testResults[test.id];
    const config = problem.config;
    return update(ownProps, { testResult: { $set: testResult }, config: {$set: config}, testUserInfo: { $set: testUserInfo }, isAdmin: { $set: isAdmin }, test: { $set: test }, doc: { $set: doc } });
}
export default connect(mapStateToProps)(Test); 