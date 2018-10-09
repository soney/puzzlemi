import * as React from 'react';
import { connect } from "react-redux";
import * as showdown from 'showdown';
import { CodeEditor } from './CodeEditor';
import update from 'immutability-helper';
import { descriptionChanged, deleteTest } from '../actions';

const Test = ({ dispatch, index, testIndex, test, isAdmin, doc }) => {
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
                <CodeEditor shareDBSubDoc={actualSubDoc} options={{lineNumbers: false, mode: 'python', lineWrapping: true}} />
            </td>
            <td>
                <CodeEditor shareDBSubDoc={expectedSubDoc} options={{lineNumbers: false, mode: 'python', lineWrapping: true}} />
            </td>
            <td>
                <CodeEditor shareDBSubDoc={descriptionSubDoc} options={{lineNumbers: false, mode: 'markdown', lineWrapping: true}} />
            </td>
            <td>
                <button className="btn btn-outline-danger btn-sm" onClick={doDeleteTest}>Delete</button>
            </td>
        </tr>;
    } else {
        const converter = new showdown.Converter;
        const problemDescription = { __html: converter.makeHtml(test.description) };
        return <tr>
            <td colSpan={4} dangerouslySetInnerHTML={problemDescription} />
        </tr>;
    }
}
function mapStateToProps(state, ownProps) {
    const { index, testIndex } = ownProps;
    const { isAdmin, problems, doc } = state;
    const test = problems[index].tests[testIndex];

    return update(ownProps, { isAdmin: {$set: isAdmin}, test: {$set: test}, doc: {$set: doc} });
}
export default connect(mapStateToProps)(Test); 