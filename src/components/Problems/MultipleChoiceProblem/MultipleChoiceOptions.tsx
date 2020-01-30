import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import { addMultipleChoiceOption } from '../../../actions/sharedb_actions';
import { IMultipleChoiceSolution } from '../../../reducers/solutions';
import { IPMState } from '../../../reducers';
import MultipleChoiceOption from './MultipleChoiceOption';
import { IMultipleChoiceSolutionAggregate } from '../../../reducers/aggregateData';
import { IMultipleChoiceOption } from '../../../reducers/problems';

const MultipleChoiceOptions = ({ problem, options, dispatch, isAdmin, aggregateData }) => {
    const doAddOption = () => {
        dispatch(addMultipleChoiceOption(problem.id));
    }
    const optionItems: JSX.Element[] = options.map((option, i) => {
        return <MultipleChoiceOption key={`${option.id}-${i}`} problem={problem} option={option} numSelected={aggregateData[option.id]||0} />
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
    const { intermediateUserState, solutions, users, shareDBDocs } = state;
    const { isAdmin } = intermediateUserState;

    const { problem } = ownProps;
    const { problemDetails } = problem;
    const { revealSolution }  = problemDetails;
    const problemID = problem.id;

    const myuid = users.myuid as string;
    const userSolution = solutions.allSolutions[problemID][myuid] as IMultipleChoiceSolution;
    const { options } = problemDetails;

    let aggregateData: {[optionID: string]: number} = {};
    try {
        if(revealSolution) {
            const aggData = shareDBDocs.i.aggregateData;
            const problemSelectionData = aggData!.userData[problem.id] as IMultipleChoiceSolutionAggregate;
            const optionSelectionData = problemSelectionData.selected;

            options.forEach((o: IMultipleChoiceOption) => {
                const optionID = o.id;
                aggregateData[optionID] = optionSelectionData[optionID] ? optionSelectionData[optionID].length : 0;
            });
        }
    } catch(e) {
        console.error(e);
    }

    return update(ownProps, { $merge: { isAdmin, userSolution, options, aggregateData } });
}
export default connect(mapStateToProps)(MultipleChoiceOptions);
