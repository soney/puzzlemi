import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import { IPMState } from '../../../reducers';
import { ICodeSolution } from '../../../reducers/solutions';
import { selectRandomUserForSolutionView, selectRandomCorrectUserForSolutionView, selectRandomIncorrectUserForSolutionView } from '../../../actions/app_actions';

const CodeSolutionView = ({ dispatch, problem, currentUser, solutionText, hasSolution, problemSolutions }) => {
    const selectRandomUser = () => {
        dispatch(selectRandomUserForSolutionView(problem.id));
    };
    const selectRandomCorrectUser = () => {
        dispatch(selectRandomCorrectUserForSolutionView(problem.id));
    };
    const selectRandomIncorrectUser = () => {
        dispatch(selectRandomIncorrectUserForSolutionView(problem.id));
    };
    return <div className="solution">
        <div>
            <div className="random-solution-selection">
                <div>{Object.keys(problemSolutions).length} solutions loaded</div>
                <div className="btn-group" role="group" aria-label="random solutions">
                    <button className="btn btn-outline-secondary btn-sm" onClick={selectRandomUser}>Random solution</button>
                    <button className="btn btn-outline-secondary btn-sm" onClick={selectRandomCorrectUser}>Random correct solution</button>
                    <button className="btn btn-outline-secondary btn-sm" onClick={selectRandomIncorrectUser}>Random incorrect solution</button>
                </div>
                {
                    currentUser && hasSolution &&
                    <div className="solution-details">
                        <h4>Solution:</h4>
                        <pre>{solutionText}</pre>
                    </div>
                }
                {
                    currentUser && !hasSolution &&
                    <div className="no_solution">(no solution)</div>
                }
            </div>
        </div>
    </div>;
}
function mapStateToProps(state: IPMState, ownProps) {
    const { app, shareDBDocs } = state;

    let hasSolution: boolean = false;
    let solutionText: string = '';
    const solutionsData = shareDBDocs.i.solutions;
    const { problem } = ownProps;
    let problemSolutions = {};

    if (solutionsData && solutionsData.allSolutions && solutionsData.allSolutions.hasOwnProperty(problem.id)) problemSolutions = solutionsData!.allSolutions[problem.id];

    const currentUser = app.selectedUserForSolutionsView;
    if (currentUser) {
        const currentSolution = problemSolutions[currentUser];
        if (currentSolution && currentSolution.hasOwnProperty('code')) {
            solutionText = (currentSolution as ICodeSolution).code;
            hasSolution = true;
        }
    }

    return update(ownProps, { $merge: { currentUser, solutionText, hasSolution, problemSolutions } })
}
export default connect(mapStateToProps)(CodeSolutionView);