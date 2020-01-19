import * as React from 'react';
import { connect } from "react-redux";
import ProblemDescription from './ProblemDescription';
import update from 'immutability-helper';
import { CodeEditor } from '../CodeEditor';
import { setTextResponse } from '../../actions/user_actions';
import { IPMState } from '../../reducers';
import { ITextResponseSolution } from '../../reducers/solutions';

const TextResponseProblem = ({ problem, userSolution, dispatch, isAdmin }) => {
    const { response } = userSolution;
    const doSetResponse = (ev) => {
        const { value } = ev;
        return dispatch(setTextResponse(problem.id, value));
    };
    return <>
            <div className="col">
                <ProblemDescription problem={problem} />
            </div>
            {   !isAdmin &&
                <div className="col">
                    <CodeEditor value={response} onChange={doSetResponse} options={{lineNumbers: false, mode: 'markdown', lineWrapping: true }} />
                </div>
            }
    </>;
}
function mapStateToProps(state: IPMState, ownProps) {
    const { intermediateUserState, shareDBDocs, solutions, users } = state;
    const { isAdmin } = intermediateUserState;
    const problemsDoc = shareDBDocs.problems;

    const myuid = users.myuid as string;
    const userSolution = solutions.allSolutions[ownProps.problem.id][myuid] as ITextResponseSolution;

    return update(ownProps, { $merge: { isAdmin, problemsDoc, userSolution } });
}
export default connect(mapStateToProps)(TextResponseProblem);
