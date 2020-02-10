import * as React from 'react';
import { connect } from "react-redux";
import ProblemDescription from '../ProblemDescription';
import update from 'immutability-helper';
import * as classNames from 'classnames';
import { IPMState } from '../../../reducers';
import MultipleChoiceOptions from './MultipleChoiceOptions';
import MultipleChoiceConfigPanel from './MultipleChoiceConfigPanel';

const MultipleChoiceProblem = ({ problem, allCorrect, isAdmin, revealSolution, claimFocus }) => {
    return <>
        <div className={classNames({
            row: true,
            'multiple-choice': true,
            'answer-revealed': revealSolution,
            isCorrect: revealSolution && allCorrect,
            isIncorrect: revealSolution && !allCorrect
        })}>
            <div className="col">
                <ProblemDescription focusOnMount={claimFocus} problem={problem} />
            </div>
            {
                isAdmin &&
                <div className="col config-panel">
                    <MultipleChoiceConfigPanel problem={problem} />
                </div>
            }
            <MultipleChoiceOptions problem={problem} />
        </div>
    </>;
}
function mapStateToProps(state: IPMState, ownProps) {
    const { intermediateUserState } = state;
    const { isAdmin, awaitingFocus } = intermediateUserState;
    const { problem } = ownProps;
    const { problemDetails } = problem;
    const { revealSolution } = problemDetails;

    const claimFocus = awaitingFocus && awaitingFocus.id === problem.id;

    return update(ownProps, { $merge: { isAdmin, revealSolution, claimFocus, allCorrect: false } });
}
export default connect(mapStateToProps)(MultipleChoiceProblem);
