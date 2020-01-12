import * as React from 'react';
import { connect } from "react-redux";
import ProblemDescription from './ProblemDescription';
import update from 'immutability-helper';
import { CodeEditor } from '../CodeEditor';
import { setUserSelectedOptions } from '../../actions/user_actions';
import * as showdown from 'showdown';
import { addMultipleChoiceOption, deleteMultipleChoiceOption, setMultipleChoiceSelectionEnabled, setRevealSolution, setMultipleChoiceOptionCorrect } from '../../actions/sharedb_actions';
import { IMultipleChoiceSolution } from '../../reducers/user';

const MultipleChoiceProblem = ({ index, selectedItems, problem, dispatch, doc, isAdmin }) => {
    const doAddOption = () => {
        dispatch(addMultipleChoiceOption(index));
    }
    const doChangeMultipleChoiceSelectionType = (event) => {
        const { target } = event;
        const { checked } = target;
        dispatch(setMultipleChoiceSelectionEnabled(index, checked));
    }
    const doChangeRevealSolution = (event) => {
        const { target } = event;
        const { checked } = target;
        dispatch(setRevealSolution(index, checked));
    }
    const { selectionType } = problem;
    let optionItems: JSX.Element[];
    if(isAdmin) {
        optionItems = problem.options.map((option, i) => {
            const doDeleteOption = () => {
                dispatch(deleteMultipleChoiceOption(index, i));
            }
            const doChangeOptionCorrectness = (event) => {
                const { target } = event;
                const { checked } = target;
                dispatch(setMultipleChoiceOptionCorrect(index, i, checked));
            }
            const optionSubDoc = doc.subDoc(['problems', index, 'problem', 'options', i, 'description']);
            return <tr key={i}>
                <td><label><input type="checkbox" checked={option.isCorrect} onChange={doChangeOptionCorrectness} /> Correct</label></td>
                <td>
                    <CodeEditor shareDBSubDoc={optionSubDoc} options={{lineNumbers: false, mode: 'python', lineWrapping: true, height: 30}} />
                </td>
                <td>
                    <button className="btn btn-outline-danger btn-sm" onClick={doDeleteOption}>Delete</button>
                </td>
            </tr>;
        });
    } else {
        const converter = new showdown.Converter();
        optionItems = problem.options.map((option, i) => {
            const onSelectionChange = (event) => {
                const { target } = event;
                if(selectionType === 'single') {
                    dispatch(setUserSelectedOptions(index, [i]));
                } else {
                    const { checked } = target;
                    const selectedIndex = selectedItems.indexOf(i);
                    if(selectedIndex >= 0 && !checked) {
                        dispatch(setUserSelectedOptions(index, update(selectedItems, { $splice: [[ selectedIndex, 1]] })));
                    } else if( selectedIndex < 0 && checked) {
                        dispatch(setUserSelectedOptions(index, update(selectedItems, { $push: [i] })));
                    }
                }
            }
            const optionDescription = { __html: converter.makeHtml(option.description) };
            return <tr className={problem.revealSolution ? ("answer-revealed alert " + ((option.isCorrect === (selectedItems.indexOf(i)>=0)) ? "alert-success" : "alert-danger")) : ""} key={i}>
                <td colSpan={3}>
                    <label><input type={selectionType === 'single' ? 'radio' : 'checkbox'} key={i} name={index} value={i} checked={selectedItems.indexOf(i) >= 0} onChange={onSelectionChange} /> <span className='multiple-choice-option' dangerouslySetInnerHTML={optionDescription} /></label>
                </td>
            </tr>;
        });
    }

    return <>
        <div className="row">
            <div className="col">
                <ProblemDescription index={index} />
            </div>
            {
                isAdmin &&
                <div className="col">
                    <label><input type='checkbox' checked={problem.selectionType==='multiple'} onChange={doChangeMultipleChoiceSelectionType} /> Multiple item selection</label>
                    <label><input type='checkbox' checked={problem.revealSolution} onChange={doChangeRevealSolution} /> Reveal Solution</label>
                </div>
            }
            <table className="table multiple-choice-table">
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
            </table>
        </div>
    </>;
}
function mapStateToProps(state, ownProps) {
    const { index } = ownProps;
    const { user, doc, problems, userData } = state;
    const { id } = problems[index];
    const { isAdmin } = user;
    const { selectedItems, passedAll } = user.solutions[id] as IMultipleChoiceSolution;
    // const visible = userData[id] && userData[id].visible;
    const completed: string[] = userData[id] ? userData[id].completed : [];
    const numCompleted = completed ? completed.length : 0;
    const myCompletionIndex = completed ? completed.indexOf(user.id) : -1;
    return update(ownProps, { id: {$set: id}, selectedItems: {$set: selectedItems||[]}, numCompleted: {$set: numCompleted }, myCompletionIndex: { $set: myCompletionIndex}, passedAll: { $set: passedAll }, isAdmin: { $set: isAdmin },
        doc: { $set: doc }});
}
export default connect(mapStateToProps)(MultipleChoiceProblem);
