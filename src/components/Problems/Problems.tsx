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

    return <ul className='problems'>
        {problems && problems.length
        ? problems.map((problem, i) => {
                return <Problem key={`${problem.id}-${i}`} problem={problem} />;
            })
        : <li className='container no-problems'>(no problems yet)</li>}
        {
            isAdmin &&
            <li className="container">
                <button className="btn btn-outline-success btn-sm btn-block" onClick={doAddCodeProblem}>+ Code Problem</button>
                <button className="btn btn-outline-success btn-sm btn-block" onClick={doAddMultipleChoiceProblem}>+ Multiple Choice Problem</button>
                <button className="btn btn-outline-success btn-sm btn-block" onClick={doAddTextResponseProblem}>+ Text Response Problem</button>
            </li>
        }
    </ul>
}
function mapStateToProps(state:IPMState, givenProps) {
    const { intermediateUserState, shareDBDocs } = state;
    const { isAdmin } = intermediateUserState;
    const problemsDoc = shareDBDocs.problems;
    const problems = problemsDoc ? problemsDoc.getData() : null;

    const problemsDocReady = problemsDoc && !!(problemsDoc.getData());

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

    return update(givenProps, { $merge: { problems: filteredProblems, isAdmin, problemsDocReady } });

}
export default connect(mapStateToProps)(Problems);
