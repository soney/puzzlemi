import * as React from 'react';
import { connect } from "react-redux";
import Problem from './Problem';
import update from 'immutability-helper';
import { addCodeProblem, addMultipleChoiceProblem, addTextResponseProblem } from '../../actions/sharedb_actions';
import { IProblem } from '../../reducers/problems';
import { IPMState } from '../../reducers';
// import Hotkeys from 'react-hot-keys';

interface IProblemsOwnProps {
}
interface IProblemsProps extends IProblemsOwnProps {
    isAdmin: boolean;
    dispatch: React.Dispatch<any>;
    problems: IProblem[];
}
const Problems = ({ isAdmin, dispatch, problems }: IProblemsProps): React.ReactElement => {
    const doAddCodeProblem = (): void => {
        dispatch(addCodeProblem());
    };
    const doAddMultipleChoiceProblem = (): void => {
        dispatch(addMultipleChoiceProblem());
    };
    const doAddTextResponseProblem = (): void => {
        dispatch(addTextResponseProblem());
    };

    return <>
        <ul className='problems'>
            {problems && problems.length
            ? problems.map((problem, i) =>
                    <Problem key={`${problem.id}-${i}`} problem={problem} tabIndex={0} />
            )
            : <li className='container no-problems'>(no problems yet)</li>}
        </ul>
        {
            isAdmin &&
            <div className="row">
                {/* <Hotkeys keyName="ctrl+shift+c" onKeyUp={doAddCodeProblem} filter={()=>true}></Hotkeys>
                <Hotkeys keyName="ctrl+shift+m" onKeyUp={doAddMultipleChoiceProblem} filter ={()=>true}></Hotkeys>
                <Hotkeys keyName="ctrl+shift+t" onKeyUp={doAddTextResponseProblem} filter ={()=>true}></Hotkeys> */}
                <div className="btn-group btn-block" role="group">
                    <button className="btn btn-outline-success btn-sm" onClick={doAddCodeProblem}>
                        <i className="fas fa-plus"></i> Code
                    </button>
                    <button className="btn btn-outline-success btn-sm" onClick={doAddMultipleChoiceProblem}>
                        <i className="fas fa-plus"></i> Multiple Choice
                    </button>
                    <button className="btn btn-outline-success btn-sm" onClick={doAddTextResponseProblem}>
                        <i className="fas fa-plus"></i> Text Response
                    </button>
                </div>
            </div>
        }
        <div className="feedback">
            <a className="btn btn-outline-secondary" role="alert" rel="noopener noreferrer" target="_blank" href="https://forms.gle/6Gh4r8qiCtSRAEVo9">PuzzleMI site feedback</a>
        </div>
    </>
}
function mapStateToProps(state:IPMState, givenProps: IProblemsOwnProps): IProblemsProps {
    const { intermediateUserState, shareDBDocs } = state;
    const { isAdmin } = intermediateUserState;
    const problems = shareDBDocs.i.problems;

    let filteredProblems: IProblem[] = [];
    if(problems) {
        const { order, allProblems } = problems;
        const filteredOrder = order.filter((problemID: string) => {
            if(isAdmin) { return true; }
            else { return allProblems[problemID].visible; }
        });
        filteredProblems = filteredOrder.map((problemID: string) => {
            return allProblems[problemID];
        });
    }

    return update(givenProps, { $merge: { problems: filteredProblems, isAdmin } }) as IProblemsProps;

}
export default connect(mapStateToProps)(Problems);
