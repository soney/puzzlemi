import * as React from 'react';
import { connect } from "react-redux";
// import * as showdown from 'showdown';
import { CodeEditor } from '../../../CodeEditor';
import update from 'immutability-helper';
import { deleteVariable, changeVariableType } from '../../../../actions/sharedb_actions';
// import { updateVariableType } from '../actions/sharedb_actions';

const Variable = ({ dispatch, problem, variableIndex, variable, isAdmin, problemsDoc, isInput }) => {
    const doDeleteVariable = () => {
        dispatch(deleteVariable(problem.id, variableIndex));
    };
    const doChangeVariableType = (e) => {
        dispatch(changeVariableType(problem.id, variableIndex, e.target.value));
    };
    const p = ['allProblems', problem.id, 'problemDetails', 'variables', variableIndex];
    const nameSubDoc = problemsDoc.subDoc([...p, 'name']);
    const valueSubDoc = problemsDoc.subDoc([...p, 'value']);
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
            <CodeEditor shareDBSubDoc={valueSubDoc} value={valueSubDoc.getData()} options={{ lineNumbers: false, mode: 'python', lineWrapping: true, height: 40 }} />
        </td>
        <td>
            <button className="btn btn-outline-danger btn-sm" onClick={doDeleteVariable}>Delete</button>
        </td>
    </tr>;
}
function mapStateToProps(state, ownProps) {
    const { intermediateUserState, shareDBDocs } = state;
    const { isAdmin } = intermediateUserState;
    const problemsDoc = shareDBDocs.problems;

    return update(ownProps, { $merge: {isAdmin, problemsDoc }});
}
export default connect(mapStateToProps)(Variable); 