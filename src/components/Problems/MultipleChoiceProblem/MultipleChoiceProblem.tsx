import * as React from 'react';
import { connect } from "react-redux";
import ProblemDescription from '../ProblemDescription';
import update from 'immutability-helper';
import { setMultipleChoiceSelectionEnabled, setRevealSolution } from '../../../actions/sharedb_actions';
import * as classNames from 'classnames';
import { IPMState } from '../../../reducers';
import MultipleChoiceOptions from './MultipleChoiceOptions';

const MultipleChoiceProblem = ({ problem, dispatch, allCorrect, isAdmin, selectionType, revealSolution }) => {
    const doChangeMultipleChoiceSelectionType = (event) => {
        const { target } = event;
        const { checked } = target;
        dispatch(setMultipleChoiceSelectionEnabled(problem.id, checked));
    }
    const doChangeRevealSolution = (event) => {
        const { target } = event;
        const { checked } = target;
        dispatch(setRevealSolution(problem.id, checked));
    }
    return <>
        <div className={classNames({
            row: true,
            'multiple-choice': true,
            'answer-revealed': revealSolution,
            isCorrect: revealSolution && allCorrect,
            isIncorrect: revealSolution && !allCorrect
        })}>
            <div className="col">
                <ProblemDescription problem={problem} />
            </div>
            {
                isAdmin &&
                <div className="col">
                    <label><input type='checkbox' checked={selectionType==='multiple'} onChange={doChangeMultipleChoiceSelectionType} /> Multiple item selection</label>
                    <label><input type='checkbox' checked={revealSolution} onChange={doChangeRevealSolution} /> Reveal Solution (and block further edits)</label>
                </div>
            }
            <MultipleChoiceOptions problem={problem} />
        </div>
    </>;
}
function mapStateToProps(state: IPMState, ownProps) {
    const { intermediateUserState } = state;
    const { isAdmin } = intermediateUserState;
    const { problem } = ownProps;
    const { problemDetails } = problem;
    const { selectionType, revealSolution } = problemDetails;

    return update(ownProps, { $merge: { isAdmin, selectionType, revealSolution, allCorrect: false } });
}
export default connect(mapStateToProps)(MultipleChoiceProblem);
