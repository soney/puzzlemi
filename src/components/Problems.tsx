import * as React from 'react';
import { connect } from "react-redux";
import Problem from './Problem';
import { addProblem } from 'src/actions';
import update from 'immutability-helper';

const Problems = ({ isAdmin, sdbDoc, dispatch, problems }) => {

    const doAddProblem = (): void => {
        dispatch(addProblem());
    }
    return <ul className='problems'>
        {problems && problems.length
        ? problems.map((problem, index) => {
            return <Problem key={problem.id + `${index}`} index={index} sdbDoc={sdbDoc} problem={problem} />;
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
function mapStateToProps(state, givenProps) {
    const { problems, user } = state;
    const { isAdmin } = user;
    return update(givenProps, { problems: { $set: problems}, isAdmin: { $set: isAdmin } });
}
export default connect(mapStateToProps)(Problems);
