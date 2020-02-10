import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import { CodeEditor } from '../../CodeEditor';
import { setUserSelectedOptions } from '../../../actions/user_actions';
import * as showdown from 'showdown';
import { deleteMultipleChoiceOption, setMultipleChoiceOptionCorrect, moveMultipleChoiceOptionDown, moveMultipleChoiceOptionUp } from '../../../actions/sharedb_actions';
import { IMultipleChoiceSolution } from '../../../reducers/solutions';
import * as classNames from 'classnames';
import { IPMState } from '../../../reducers';

const MultipleChoiceOption = ({ option, selectedItems, selectionType, revealSolution, optionIndex, problem, description, dispatch, problemsDoc, isAdmin, isCorrect, numSelected, selectedByCurrentUser, claimFocus }) => {
    const doMoveOptionUp = () => {
        dispatch(moveMultipleChoiceOptionUp(problem.id, option.id));
    }
    const doMoveOptionDown = () => {
        dispatch(moveMultipleChoiceOptionDown(problem.id, option.id));
    }
    const doDeleteOption = () => {
        dispatch(deleteMultipleChoiceOption(problem.id, option.id));
    }
    const doChangeOptionCorrectness = (event) => {
        const { target } = event;
        const { checked } = target;
        dispatch(setMultipleChoiceOptionCorrect(problem.id, option.id, checked));
    }
    const onSelectionChange = (event) => {
        const { target } = event;
        if(selectionType === 'single') {
            dispatch(setUserSelectedOptions(problem.id, [option.id]));
        } else {
            const { checked } = target;
            const selectedIndex = selectedItems.indexOf(option.id);
            if(selectedIndex >= 0 && !checked) {
                dispatch(setUserSelectedOptions(problem.id, update(selectedItems, { $splice: [[ option.id, 1]] })));
            } else if( selectedIndex < 0 && checked) {
                dispatch(setUserSelectedOptions(problem.id, update(selectedItems, { $push: [option.id] })));
            }
        }
    }
    if(isAdmin) {
        const optionSubDoc = problemsDoc.subDoc(['allProblems', problem.id, 'problemDetails', 'options', optionIndex, 'description']);
        return <tr className={classNames({ 'alert-primary': selectedByCurrentUser })}>
            <td>
                <CodeEditor shareDBSubDoc={optionSubDoc} focusOnMount={claimFocus} selectOnFocus={true} captureTabs={false} options={{lineNumbers: false, mode: 'python', lineWrapping: true, height: 30}} />
            </td>
            <td><label><input type="checkbox" checked={isCorrect} onChange={doChangeOptionCorrectness} /> Correct</label></td>
            <td className='selectionCount'>{numSelected}</td>
            <td>
                <div className="btn-group btn-group-toggle" data-toggle="buttons">
                    <button className="btn btn-outline-secondary btn-sm" onClick={doMoveOptionUp}>
                        <i className="fas fa-arrow-up"></i>
                    </button>
                    <button className="btn btn-outline-secondary btn-sm" onClick={doMoveOptionDown}>
                        <i className="fas fa-arrow-down"></i>
                    </button>
                    <button className="btn btn-outline-danger btn-sm" onClick={doDeleteOption}>
                        <i className="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>;
    } else {
        const converter = new showdown.Converter();
        const userCorrect = isCorrect === (selectedItems.indexOf(option.id)>=0);
        const optionDescription = { __html: converter.makeHtml(description) };

        return <tr className={classNames({ 'alert-danger': revealSolution && !userCorrect })}>
            <td colSpan={revealSolution ? 2 : 3}>
                <label><input disabled={revealSolution} type={selectionType === 'single' ? 'radio' : 'checkbox'} key={option.id} name={problem.id} value={option.id} checked={selectedItems.indexOf(option.id) >= 0} onChange={onSelectionChange} /> <span className='multiple-choice-option' dangerouslySetInnerHTML={optionDescription} /></label>
            </td>
            {
                revealSolution &&
                <td className='selectionCount'>{numSelected}</td>
            }
        </tr>;
    }
}

function mapStateToProps(state: IPMState, ownProps) {
    const { app, intermediateUserState, shareDBDocs, solutions, users } = state;
    const { isAdmin, awaitingFocus } = intermediateUserState;
    const problemsDoc = shareDBDocs.problems;
    // const { aggregateData } = shareDBDocs.i;

    const { problem, option } = ownProps;
    const { problemDetails } = problem;
    const { selectionType, revealSolution }  = problemDetails;

    const myuid = users.myuid as string;
    const userSolution = solutions.allSolutions[ownProps.problem.id][myuid] as IMultipleChoiceSolution;
    const { selectedItems } = userSolution;

    const { isCorrect, description } = option;

    const claimFocus = awaitingFocus && awaitingFocus.id === option.id;

    const currentUser = app.selectedUserForSolutionsView;
    let selectedByCurrentUser: boolean = false;

    if(currentUser) {
        const solutionsData = shareDBDocs.i.solutions;
        const { problem } = ownProps;
        if(solutionsData && solutionsData.allSolutions && solutionsData.allSolutions.hasOwnProperty(problem.id)) {
            const problemSolutions = solutionsData!.allSolutions[problem.id];
            const currentSolution = problemSolutions[currentUser];
            if(currentSolution && currentSolution.hasOwnProperty('selectedItems')) {
                selectedByCurrentUser = (currentSolution as IMultipleChoiceSolution).selectedItems.indexOf(option.id) >= 0;
            }
        }
    }

    let optionIndex: number = -1;
    for(let i: number = 0, len = problemDetails.options.length; i<len; i++) {
        if(problemDetails.options[i].id === option.id) {
            optionIndex = i;
            break;
        }
    }

    return update(ownProps, { $merge: { isAdmin, problemsDoc, selectedItems, selectionType, revealSolution, description, optionIndex, isCorrect, selectedByCurrentUser, claimFocus } });
}
export default connect(mapStateToProps)(MultipleChoiceOption);
