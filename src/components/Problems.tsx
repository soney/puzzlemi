import * as React from 'react';
import { connect } from "react-redux";
import Problem from './Problem';
import update from 'immutability-helper';
import { addProblem } from '../actions/sharedb_actions';

const Problems = ({ name, isAdmin, dispatch, problems }) => {
    const doAddProblem = (): void => {
        dispatch(addProblem());
    }
    return <ul className='problems'>
        {problems && problems.length
            ? problems.map((problem, index) => {
                return <Problem key={problem.id + `${index}`} index={index} problem={problem} name={name} />;
            })
            : <li className='container no-problems'>(no problems yet)</li>}
        {
            isAdmin &&
            <li className="container">
                <button className="btn btn-outline-success btn-sm btn-block" onClick={doAddProblem}>+ Problem</button>
            </li>
        }
    </ul>
}
function mapStateToProps(state, ownProps) {
    const { problems, user, userData } = state;
    const { isAdmin } = user;
    const filteredProblems = isAdmin ? problems : problems.filter((p) => {
        const { id } = p;
        return userData && userData[id] && userData[id].visible;
    });
    return update(ownProps, { problems: { $set: filteredProblems }, isAdmin: { $set: isAdmin } });
}
export default connect(mapStateToProps)(Problems);
