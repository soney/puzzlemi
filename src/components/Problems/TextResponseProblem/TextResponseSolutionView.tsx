import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import { IPMState } from '../../../reducers';
import { ITextResponseSolution } from '../../../reducers/solutions';
import { selectRandomUserForSolutionView } from '../../../actions/app_actions';

const TextResponseSolutionView = ({ dispatch, problem, currentUser, solutionText, hasSolution }) => {
    const selectRandomUser = () => {
        dispatch(selectRandomUserForSolutionView(problem.id));
    };
    return <div className="row">
        <div className="col">
            <button className="btn btn-outline-secondary btn-sm" onClick={selectRandomUser}>Show random solution</button>
            {
                currentUser && hasSolution &&
                <div>
                    <h4>Solution:</h4>
                    <pre>{solutionText}</pre>
                </div>
            }
            {
                currentUser && !hasSolution && 
                <div className="no_solution">(no solution)</div>
            }
        </div>
    </div>;
}
function mapStateToProps(state: IPMState, ownProps) {
    const { app, shareDBDocs } = state;

    let hasSolution: boolean = false;
    let solutionText: string = '';

    const currentUser = app.selectedUserForSolutionsView;
    if(currentUser) {
        const solutionsData = shareDBDocs.i.solutions;
        const { problem } = ownProps;
        if(solutionsData && solutionsData.allSolutions && solutionsData.allSolutions.hasOwnProperty(problem.id)) {
            const problemSolutions = solutionsData!.allSolutions[problem.id];
            const currentSolution = problemSolutions[currentUser];
            if(currentSolution && currentSolution.hasOwnProperty('response')) {
                solutionText = (currentSolution as ITextResponseSolution).response;
                hasSolution = true;
            }
        }
    }

    return update(ownProps, { $merge: { currentUser, solutionText, hasSolution } })
}
export default connect(mapStateToProps)(TextResponseSolutionView);