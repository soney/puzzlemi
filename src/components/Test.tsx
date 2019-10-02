import * as React from 'react';
import { connect } from "react-redux";
import * as showdown from 'showdown';
import { CodeEditor } from './CodeEditor';
import update from 'immutability-helper';
import { deleteTest } from '../actions/sharedb_actions';

const Test = ({ testResult, dispatch, index, testIndex, test, isAdmin, doc }) => {
    const doDeleteTest = () => {
        dispatch(deleteTest(index, testIndex));
    };
    const p = ['problems', index, 'tests', testIndex];
    const actualSubDoc = doc.subDoc([...p, 'actual']);
    const expectedSubDoc = doc.subDoc([...p, 'expected']);
    const descriptionSubDoc = doc.subDoc([...p, 'description']);
    if(isAdmin) {
        return <tr>
            <td>
                <CodeEditor shareDBSubDoc={actualSubDoc} options={{lineNumbers: false, mode: 'python', lineWrapping: true, height: 30}} />
            </td>
            <td>
                <CodeEditor shareDBSubDoc={expectedSubDoc} options={{lineNumbers: false, mode: 'python', lineWrapping: true, height: 30}} />
            </td>
            <td>
                <CodeEditor shareDBSubDoc={descriptionSubDoc} options={{lineNumbers: false, mode: 'markdown', lineWrapping: true, height: 30}} />
            </td>
            <td>
                <button className="btn btn-outline-danger btn-sm" onClick={doDeleteTest}>Delete</button>
            </td>
        </tr>;
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