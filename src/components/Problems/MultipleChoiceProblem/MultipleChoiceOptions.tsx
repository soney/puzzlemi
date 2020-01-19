import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import { addMultipleChoiceOption } from '../../../actions/sharedb_actions';
import { IMultipleChoiceSolution } from '../../../reducers/solutions';
import { IPMState } from '../../../reducers';
import MultipleChoiceOption from './MultipleChoiceOption';

const MultipleChoiceOptions = ({ problem, options, dispatch, isAdmin }) => {
    const doAddOption = () => {
        dispatch(addMultipleChoiceOption(problem.id));
    }
    const optionItems: JSX.Element[] = options.map((option, i) => {
        return <MultipleChoiceOption key={`${option.id}-${i}`} problem={problem} option={option} />
    });

    return <table className="table multiple-choice-table">
            {
                isAdmin &&
                <thead>
                    <tr>
                        <th>Correct</th>
                        <th>Description</th>
                        <th>Delete</th>
                    </tr>
                </thead>
            }
            <tbody>
                {optionItems}
                {
                    isAdmin &&
                    <tr>
                        <td colSpan={3}>
                            <button className="btn btn-outline-success btn-sm btn-block" onClick={doAddOption}>+ Option</button>
                        </td>
                    </tr>
                }
            </tbody>
        </table>;
}
function mapStateToProps(state: IPMState, ownProps) {
    const { intermediateUserState, solutions, users } = state;
    const { isAdmin } = intermediateUserState;

    const { problem } = ownProps;
    const { problemDetails } = problem;
    const problemID = problem.id;

    const myuid = users.myuid as string;
    const userSolution = solutions.allSolutions[problemID][myuid] as IMultipleChoiceSolution;
    const { options } = problemDetails;

    const optionIDs = options.map((o) => o.id); // fingerprint

    return update(ownProps, { $merge: { isAdmin, userSolution, options, optionIDs } });
}
export default connect(mapStateToProps)(MultipleChoiceOptions);
