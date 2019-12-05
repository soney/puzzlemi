import * as React from 'react';
import { connect } from "react-redux";
import * as showdown from 'showdown';
import { CodeEditor } from './CodeEditor';
import update from 'immutability-helper';
import { deleteTest, changeTestStatus } from '../actions/sharedb_actions';

const Test = ({ testResult, dispatch, index, testIndex, test, isAdmin, doc, isInput, totalNum }) => {
    const doDeleteTest = () => {
        dispatch(deleteTest(index, testIndex));
    };
    const doChangeTestStatus = () => {
        dispatch(changeTestStatus(index, testIndex, !test.verified));
    }
    const p = ['problems', index, 'tests', testIndex];
    const titleSubDoc = doc.subDoc([...p, 'title']);
    const descriptionSubDoc = doc.subDoc([...p, 'description']);
    let inputSubDocs = [] as any[];
    let outputSubDocs = [] as any[];
    test.input.forEach((variable, i)=> {
        const inputVariableSubDoc = doc.subDoc([...p, 'input', i, 'value']);
        inputSubDocs.push(inputVariableSubDoc);
    })
    test.output.forEach((variable, i)=> {
        const outputVariableSubDoc = doc.subDoc([...p, 'output', i, 'value']);
        outputSubDocs.push(outputVariableSubDoc);
    })
    const isLast = totalNum===testIndex+1;

    const width_style = {width: test.rate+"%"} as React.CSSProperties;
    const author_name = test.author.slice(-4);
    if(isInput) {
        return <div className = "card">
            <div className="card-header" id={"heading"+testIndex}>
                <div className="row">
                    <div className="col-6">
                    <button className={isLast?"btn btn-link":"btn btn-link collapsed"} type="button" data-toggle="collapse" data-target={"#collapse"+testIndex} aria-expanded="true" aria-controls={"collapse"+testIndex}>
                    #{testIndex} {test.title}
                    </button>
                    </div>
                    <div className="col-sm test-head">
                    {author_name}
                    </div>
                    <div className="col-sm test-head">
                    {isAdmin
                ? (test.verified
                    ? <button className="btn btn-outline-success btn-sm" onClick={doChangeTestStatus}>Verified</button>
                    : <button className="btn btn-outline-danger btn-sm" onClick={doChangeTestStatus}>Unverified</button>)
                : (test.verified
                    ?<div className="badge badge-success">Verified</div>
                    :<div className="badge badge-danger">Unverified</div>)
                }
                    </div>
                    <div className="col-sm test-head">
                        <div className="progress">
                            <div className="progress-bar" role="progressbar" style={width_style} aria-valuenow={test.rate} aria-valuemin={0} aria-valuemax={100}>{test.rate}%</div>
                        </div>  
                    </div>
                    <div className="col-sm">
                        <button className="btn btn-outline-danger btn-sm" onClick={doDeleteTest}>Delete</button>
                    </div>
                </div>
            </div>
            <div id={"collapse"+testIndex} className={isLast?"collapse show":"collapse"} aria-labelledby={"heading"+testIndex} data-parent="#testlist">
            <div className="card-body">
                <div className="row">
                <div className="col-6 test-info">
                    <h5>Title:</h5>
                    <CodeEditor shareDBSubDoc={titleSubDoc} value={titleSubDoc.getData()} options={{lineNumbers: false, mode:'markdown', lineWrapping: true, height: 30}} />
                    <h5>Description:</h5>
                    <CodeEditor shareDBSubDoc={descriptionSubDoc} value={descriptionSubDoc.getData()} options={{lineNumbers: false, mode:'markdown', lineWrapping: true, height: 30}} />
                </div>
                <div className="col-6 test-value">
                <h5>Input Variables:</h5>
                <ul className="list-group test-variables">
                    {test.input.map((variable, i)=><li className="list-group-item" key={i}>
                    <span>{variable.name}=</span>
                    <div className="variable-value">
                    <CodeEditor shareDBSubDoc={inputSubDocs[i]} value={inputSubDocs[i].getData()} options={{lineNumbers: false, mode: 'python', lineWrapping: true, height: 30}}/>
                    </div>
                    </li>)}
                </ul>
                <h5>Output Variables:</h5>
                <ul className="list-group test-variables">
                    {test.output.map((variable, i)=><li className="list-group-item" key={i}>
                    <span>{variable.name}=</span>
                    <div className="variable-value">
                    <CodeEditor shareDBSubDoc={outputSubDocs[i]} value={outputSubDocs[i].getData()} options={{lineNumbers: false, mode: 'python', lineWrapping: true, height: 30}}/>
                    </div>
                    </li>)}
                </ul>

                </div>
                </div>
            </div>
            </div>
        </div>
    } else {
        const converter = new showdown.Converter();
        const testDescription = { __html: converter.makeHtml(test.description) };
        const passedStatusClass = testResult ? ( testResult.passed ? 'alert-success' : 'alert-danger') : 'alert-secondary';
        const passFailMessage = testResult ? ( testResult.passed ? 'Passed' : 'Failed') : '';
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
    const { user, problems, doc } = state;
    const { isAdmin } = user;
    const problem = problems[index];
    const test = problem.tests[testIndex];
    const userSolution = user.solutions[problem.id];
    const testResult = userSolution.testResults[test.id]; 

    return update(ownProps, { testResult: {$set: testResult}, isAdmin: {$set: isAdmin}, test: {$set: test}, doc: {$set: doc} });
}
export default connect(mapStateToProps)(Test); 