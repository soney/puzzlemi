import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import { setMultipleChoiceSelectionEnabled, setRevealSolution } from '../../../actions/sharedb_actions';
import { IPMState } from '../../../reducers';
import { IMultipleChoiceSelectionType } from '../../../reducers/problems';

const MultipleChoiceProblemConfigPanel = ({ problem, dispatch, selectionType, revealSolution }) => {
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
        <div className="custom-control custom-switch">
            <input id={`multiple-item-selection-${problem.id}`} className="custom-control-input" type='checkbox' checked={selectionType===IMultipleChoiceSelectionType.Multiple} onChange={doChangeMultipleChoiceSelectionType} />
            <label htmlFor={`multiple-item-selection-${problem.id}`} className="custom-control-label">Multiple Item Selection</label>
        </div>
        <div className="custom-control custom-switch">
            <input id={`reveal-solution-${problem.id}`} className="custom-control-input" type='checkbox' checked={revealSolution} onChange={doChangeRevealSolution} />
            <label htmlFor={`reveal-solution-${problem.id}`} className="custom-control-label">Reveal Solution (and block futher edits)</label>
        </div>
    </>;
}
function mapStateToProps(state: IPMState, ownProps) {
    const { problem } = ownProps;
    const { problemDetails } = problem;
    const { selectionType, revealSolution } = problemDetails;

    return update(ownProps, { $merge: { selectionType, revealSolution } });
}
export default connect(mapStateToProps)(MultipleChoiceProblemConfigPanel);
