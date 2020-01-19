import * as React from 'react';
import { connect } from "react-redux";
import ProblemDescription from '../ProblemDescription';
import update from 'immutability-helper';
import { CodeEditor } from '../../CodeEditor';
import Tests from './Tests';
import Files from './Files';
import { runCode } from '../../../actions/runCode_actions';
import { codeChanged } from '../../../actions/user_actions';
import { ICodeSolution } from '../../../reducers/solutions';
import { ISolutionState, ICodeSolutionState } from '../../../reducers/intermediateUserState';
import { IPMState } from '../../../reducers';

const CodeProblem = ({ problem, isAdmin, problemsDoc, userSolution, dispatch, intermediateCodeState, output, errors }) => {
    const codeSolution = userSolution as ICodeSolution;
    const graphicsRef = React.createRef<HTMLDivElement>();
    const doRunCode = () => {
        const graphicsEl = graphicsRef.current;
        if(graphicsEl) {
            graphicsEl.innerHTML = '';
        }
        return dispatch(runCode(codeSolution, problem, intermediateCodeState, graphicsEl));
    };
    const doSetCode = (ev) => {
        const { value } = ev;
        return dispatch(codeChanged(problem, value));
    };

    const p = ['allProblems', problem.id];
    const givenCodeSubDoc = problemsDoc.subDoc([...p, 'problemDetails', 'givenCode']);
    const afterCodeSubDoc = problemsDoc.subDoc([...p, 'problemDetails', 'afterCode']);

    return <>
        <div className="row">
            <div className="col">
                <ProblemDescription problem={problem} />
            </div>
        </div>
         <div className="row">
             {   isAdmin &&
                 <div className="col">
                     <h4>Given Code:</h4>
                     <CodeEditor shareDBSubDoc={givenCodeSubDoc} />
                     <h4>Run After:</h4>
                     <CodeEditor shareDBSubDoc={afterCodeSubDoc} />
                 </div>
             }
            {   !isAdmin &&
                <div className="col">
                    <CodeEditor value={codeSolution.code} onChange={doSetCode} />
                    <button disabled={false} className='btn btn-outline-success btn-sm btn-block' onClick={doRunCode}>Run</button>
                </div>
            }
            <div className="col">
                {   !isAdmin &&
                    <pre className={'codeOutput' + (errors.length > 0 ? ' alert alert-danger' : ' no-error')}>
                        {output}
                        {errors.join('\n')}
                    </pre>
                }
                {   !isAdmin && 
                    <div ref={graphicsRef} className='graphics'></div>
                }
                <Files problem={problem} />
            </div>
        </div>
        <div className="row">
            <div className="col">
                <Tests problem={problem} />
            </div>
        </div>
    </>;
}

function mapStateToProps(state: IPMState, ownProps) {
    const { intermediateUserState, shareDBDocs, solutions, users } = state;
    const { isAdmin } = intermediateUserState;
    const problemsDoc = shareDBDocs.problems;

    const myuid = users.myuid as string;

    const userSolution = solutions.allSolutions[ownProps.problem.id][myuid];
    const intermediateCodeState: ISolutionState = intermediateUserState.intermediateSolutionState[ownProps.problem.id];
    const { output, errors } = intermediateCodeState as ICodeSolutionState;

    return update(ownProps, { $merge: { isAdmin, problemsDoc, userSolution, output, errors, intermediateCodeState } });
}
export default connect(mapStateToProps)(CodeProblem);
