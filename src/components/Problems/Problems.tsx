import * as React from 'react';
import { connect } from "react-redux";
import Problem from './Problem';
import update from 'immutability-helper';
import { addCodeProblem, addMultipleChoiceProblem, addTextResponseProblem } from '../../actions/sharedb_actions';
import { IProblem } from '../../reducers/problems';
import { IPMState } from '../../reducers';

const Problems = ({ isAdmin, dispatch, problems }) => {
    const doAddCodeProblem = (): void => {
        dispatch(addCodeProblem());
    };
    const doAddMultipleChoiceProblem = (): void => {
        dispatch(addMultipleChoiceProblem());
    };
    const doAddTextResponseProblem = (): void => {
        dispatch(addTextResponseProblem());
    };

    return <>
        <ul className='problems'>
            {problems && problems.length
            ? problems.map((problem, i) =>
                    <Problem key={`${problem.id}-${i}`} problem={problem} />
            )
            : <li className='container no-problems'>(no problems yet)</li>}
        </ul>
        {
            isAdmin &&
            <div className="row">
                <div className="btn-group btn-block" role="group">
                    <button className="btn btn-outline-success btn-sm" onClick={doAddCodeProblem}>+ Code</button>
                    <button className="btn btn-outline-success btn-sm" onClick={doAddMultipleChoiceProblem}>+ Multiple Choice</button>
                    <button className="btn btn-outline-success btn-sm" onClick={doAddTextResponseProblem}>+ Text Response</button>
                </div>
            </div>
        }
    </>
}
function mapStateToProps(state:IPMState, givenProps) {
    const { intermediateUserState, shareDBDocs } = state;
    const { isAdmin } = intermediateUserState;
    const problems = shareDBDocs.i.problems;

    let filteredProblems: IProblem[] = [];
    if(problems) {
        const { order, allProblems } = problems;
        const filteredOrder = order.filter((problemID: string) => {
            if(isAdmin) { return true; }
            else { return allProblems[problemID].visible; }
        });
        filteredProblems = filteredOrder.map((problemID: string) => {
            return allProblems[problemID];
        });
    }

    return update(givenProps, { $merge: { problems: filteredProblems, isAdmin } });

}
export default connect(mapStateToProps)(Problems);
