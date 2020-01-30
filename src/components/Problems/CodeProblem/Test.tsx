import * as React from 'react';
import { connect } from "react-redux";
import * as showdown from 'showdown';
import { CodeEditor } from '../../CodeEditor';
import update from 'immutability-helper';
import { deleteTest } from '../../../actions/sharedb_actions';
import { IPMState } from '../../../reducers';

const Test = ({ testResult, dispatch, problem, testIndex, test, isAdmin, description, problemsDoc }) => {
    const doDeleteTest = () => {
        dispatch(deleteTest(problem.id, test.id));
    };
    const p = ['allProblems', problem.id, 'problemDetails', 'tests', testIndex];
    const actualSubDoc = problemsDoc.subDoc([...p, 'actual']);
    const expectedSubDoc = problemsDoc.subDoc([...p, 'expected']);
    const descriptionSubDoc = problemsDoc.subDoc([...p, 'description']);
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
        const testDescription = { __html: converter.makeHtml('**Meta Test** ' + description) };
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
function mapStateToProps(state: IPMState, ownProps) {
    const { problem, test } = ownProps;
    const { intermediateUserState, shareDBDocs } = state;
    const { isAdmin, intermediateSolutionState } = intermediateUserState;
    const problemsDoc = shareDBDocs.problems;
    const intermediateProblemState = intermediateSolutionState[problem.id];
    const testResult = intermediateProblemState!.testResults[test.id]; 
    const description = test.description;

    return update(ownProps, { $merge: { isAdmin, problemsDoc, testResult, description } });
}
export default connect(mapStateToProps)(Test); 