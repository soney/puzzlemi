import * as React from 'react';
import { connect } from "react-redux";
import * as showdown from 'showdown';
import { CodeEditor } from '../../../CodeEditor';
import update from 'immutability-helper';
// import { changeTestStatus } from '../actions/sharedb_actions';

import { deleteVariableTest, changeVariableTestStatus } from '../../../../actions/sharedb_actions';

const VariableTest = ({ testResult, problem, dispatch, flag, index, testUserInfo, testIndex, test, isAdmin, problemsDoc, isInput, totalNum }) => {
    const doDeleteTest = () => {
        dispatch(deleteVariableTest(problem.id, testIndex));
    };
    const doChangeTestStatus = () => {
        dispatch(changeVariableTestStatus(problem.id, testIndex, !test.verified));
    }

    const p = ['allProblems', problem.id, 'problemDetails', 'variableTests', testIndex];
    // const titleSubDoc = doc.subDoc([...p, 'title']);
    // const descriptionSubDoc = doc.subDoc([...p, 'description']);
    let inputSubDocs = [] as any[];
    let outputSubDocs = [] as any[];
    test.input.forEach((variable, i) => {
        const inputVariableSubDoc = problemsDoc.subDoc([...p, 'input', i, 'value']);
        inputSubDocs.push(inputVariableSubDoc);
    })
    test.output.forEach((variable, i) => {
        const outputVariableSubDoc = problemsDoc.subDoc([...p, 'output', i, 'value']);
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
                        ? <CodeEditor shareDBSubDoc={inputSubDocs[i]} value={inputSubDocs[i].getData()} options={{ lineNumbers: false, mode: 'python', lineWrapping: true, height: 30 }} flag={flag} />
                        : <CodeEditor shareDBSubDoc={inputSubDocs[i]} value={inputSubDocs[i].getData()} options={{ lineNumbers: false, mode: 'python', lineWrapping: true, height: 30, readOnly: true }} />
                    }
                </div>
            </td>)}
            {test.output.map((variable, i) => <td key={i}>
                <div className="variable-value">
                    {isAdmin
                        ? <CodeEditor shareDBSubDoc={outputSubDocs[i]} value={outputSubDocs[i].getData()} options={{ lineNumbers: false, mode: 'python', lineWrapping: true, height: 30 }} flag={flag} />
                        : <CodeEditor shareDBSubDoc={outputSubDocs[i]} value={outputSubDocs[i].getData()} options={{ lineNumbers: false, mode: 'python', lineWrapping: true, height: 30, readOnly: true }} />
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
    const { intermediateUserState, shareDBDocs } = state;
    const { isAdmin } = intermediateUserState;
    const problemsDoc = shareDBDocs.problems;
    const { problem } = ownProps;
    const { problemDetails } = problem;
    const { variableTests, variables } = problemDetails;
    return update(ownProps, { $merge: { isAdmin, problemsDoc, variables, variableTests } });
}
export default connect(mapStateToProps)(VariableTest); 