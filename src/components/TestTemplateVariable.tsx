import * as React from 'react';
import { connect } from "react-redux";
// import * as showdown from 'showdown';
import { CodeEditor } from './CodeEditor';
import update from 'immutability-helper';
import { deleteTestVariable } from '../actions/sharedb_actions';
import { updateVariableType } from '../actions/sharedb_actions';

const TestTemplateVariable = ({ dispatch, index, variableIndex, variable, isAdmin, doc, isInput }) => {
    const doDeleteVariable = () => {
        dispatch(deleteTestVariable(index, variableIndex));
    };
    const doChangeVariableType = (e) => {
        dispatch(updateVariableType(index, variableIndex, e.target.value));
    };
    const p = ['problems', index, 'variables', variableIndex];
    const nameSubDoc = doc.subDoc([...p, 'name']);
    const descriptionSubDoc = doc.subDoc([...p, 'description']);
    return <tr>
        <td>
            <select defaultValue={variable.type} onChange={doChangeVariableType}>
                <option value="input">Input</option>
                <option value="output">Output</option>
            </select>
        </td>
        <td>
            <CodeEditor shareDBSubDoc={nameSubDoc} value={nameSubDoc.getData()} options={{ lineNumbers: false, mode: 'python', lineWrapping: true, height: 40 }} />
        </td>
        <td>
            <CodeEditor shareDBSubDoc={descriptionSubDoc} value={descriptionSubDoc.getData()} options={{ lineNumbers: false, mode: 'markdown', lineWrapping: true, height: 40 }} />
        </td>
        <td>
            <button className="btn btn-outline-danger btn-sm" onClick={doDeleteVariable}>Delete</button>
        </td>
    </tr>;
}
function mapStateToProps(state, ownProps) {
    const { index, variableIndex } = ownProps;
    const { user, problems, doc } = state;
    const { isAdmin } = user;
    const problem = problems[index];
    const variable = problem.variables[variableIndex];

    return update(ownProps, { variable: { $set: variable }, isAdmin: { $set: isAdmin }, doc: { $set: doc } });
}
export default connect(mapStateToProps)(TestTemplateVariable); 