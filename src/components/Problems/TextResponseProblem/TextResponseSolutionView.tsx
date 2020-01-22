import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import { IPMState } from '../../../reducers';
import { ITextResponseSolution } from '../../../reducers/solutions';
import { selectRandomUserForSolutionView } from '../../../actions/app_actions';

const TextResponseSolutionView = ({ dispatch, problem, currentUser, solutionText }) => {
    const selectRandomUser = () => {
        dispatch(selectRandomUserForSolutionView(problem.id));
    };
    return <div className="row">
        <div className="col">
            <button className="btn btn-outline-secondary btn-sm" onClick={selectRandomUser}>Show random solution</button>
            {
                currentUser && 
                <div>
                    <h4>Solution:</h4>
                    <pre> {solutionText} </pre>
                </div>
            }
        </div>
    </div>;
}
function mapStateToProps(state: IPMState, ownProps) {
    const { app, shareDBDocs } = state;

    let solutionText: string = '';

    const currentUser = app.selectedUserForSolutionsView;
    if(currentUser) {
        const solutionsData = shareDBDocs.i.solutions;
        const { problem } = ownProps;
        const problemSolutions = solutionsData!.allSolutions[problem.id];
        const currentSolution = problemSolutions[currentUser];
        if(currentSolution && currentSolution.hasOwnProperty('response')) {
            solutionText = (currentSolution as ITextResponseSolution).response;
        }
    }

    return update(ownProps, { $merge: { currentUser, solutionText } })
}
export default connect(mapStateToProps)(TextResponseSolutionView);