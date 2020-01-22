import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import { IPMState } from '../../../reducers';
import { ICodeSolution } from '../../../reducers/solutions';
import { selectRandomUserForSolutionView, selectRandomCorrectUserForSolutionView, selectRandomIncorrectUserForSolutionView } from '../../../actions/app_actions';

const CodeSolutionView = ({ dispatch, problem, currentUser, solutionText }) => {
    const selectRandomUser = () => {
        dispatch(selectRandomUserForSolutionView(problem.id));
    };
    const selectRandomCorrectUser = () => {
        dispatch(selectRandomCorrectUserForSolutionView(problem.id));
    };
    const selectRandomIncorrectUser = () => {
        dispatch(selectRandomIncorrectUserForSolutionView(problem.id));
    };
    return <div className="row">
        <div className="col">
            <div className="btn-group" role="group" aria-label="random solutions">
                <button className="btn btn-outline-secondary btn-sm" onClick={selectRandomUser}>Random solution</button>
                <button className="btn btn-outline-secondary btn-sm" onClick={selectRandomCorrectUser}>Random correct solution</button>
                <button className="btn btn-outline-secondary btn-sm" onClick={selectRandomIncorrectUser}>Random incorrect solution</button>
            </div>
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
        if(currentSolution && currentSolution.hasOwnProperty('code')) {
            solutionText = (currentSolution as ICodeSolution).code;
        }
    }

    return update(ownProps, { $merge: { currentUser, solutionText } })
}
export default connect(mapStateToProps)(CodeSolutionView);