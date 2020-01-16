import * as React from 'react';
import { connect } from "react-redux";
import ProblemDescription from './ProblemDescription';
import update from 'immutability-helper';
import { CodeEditor } from '../CodeEditor';
import { setTextResponse } from '../../actions/user_actions';

const TextResponseProblem = ({ index, response, dispatch, isAdmin }) => {
    const doSetResponse = (ev) => {
        const { value } = ev;
        return dispatch(setTextResponse(index, value));
    };
    return <>
            <div className="col">
                <ProblemDescription index={index} />
            </div>
            {   !isAdmin &&
                <div className="col">
                    <CodeEditor value={response} onChange={doSetResponse} options={{lineNumbers: false, mode: 'markdown', lineWrapping: true }} />
                </div>
            }
    </>;
}
function mapStateToProps(state, ownProps) {
    const { index } = ownProps;
    const { user, doc, problems } = state;
    const { id } = problems[index];
    const { isAdmin } = user;
    const { response } = user.solutions[id];

    return update(ownProps, { id: {$set: id}, isAdmin: { $set: isAdmin }, doc: { $set: doc }, response: { $set: response }});
}
export default connect(mapStateToProps)(TextResponseProblem);
