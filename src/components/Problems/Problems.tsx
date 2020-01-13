import * as React from 'react';
import { connect } from "react-redux";
import Problem from './Problem';
import update from 'immutability-helper';
import { addCodeProblem, addMultipleChoiceProblem } from '../../actions/sharedb_actions';

const Problems = ({ isAdmin, dispatch, problems }) => {
    const doAddCodeProblem = (): void => {
        dispatch(addCodeProblem());
    };
    const doAddMultipleChoiceProblem = (): void => {
        dispatch(addMultipleChoiceProblem());
    };

    return <ul className='problems'>
        {problems && problems.length
        ? problems.map((problem, index) => {
            return <Problem key={`${problem.id}${index}`} problem={problem} />;
            })
        : <li className='container no-problems'>(no problems yet)</li>}
        {
            isAdmin &&
            <li className="container">
                <button className="btn btn-outline-success btn-sm btn-block" onClick={doAddCodeProblem}>+ Code Problem</button>
                <button className="btn btn-outline-success btn-sm btn-block" onClick={doAddMultipleChoiceProblem}>+ Multiple Choice Problem</button>
            </li>
        }
    </ul>
}
function mapStateToProps(state, givenProps) {
    const { problems, user, userData } = state;
    const { isAdmin } = user;
    const filteredProblems = isAdmin ? problems : problems.filter((p) => {
        const { id } = p;
        return userData && userData[id] && userData[id].visible;
    });
    return update(givenProps, { problems: { $set: filteredProblems}, isAdmin: { $set: isAdmin } });
}
export default connect(mapStateToProps)(Problems);
