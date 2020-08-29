import * as React from 'react';
import { connect } from "react-redux";
import ProblemDescription from '../ProblemDescription';
import update from 'immutability-helper';
import { CodeEditor } from '../../CodeEditor';
import { setTextResponse } from '../../../actions/user_actions';
import { IPMState } from '../../../reducers';
import { ITextResponseSolution } from '../../../reducers/solutions';
import TextResponseSolutionView from './TextResponseSolutionView';
import { IProblem, IProblems } from '../../../reducers/problems';
import { Dispatch } from 'redux';
import { SDBDoc, SDBSubDoc } from 'sdb-ts';

interface ITextResponseProblemOwnProps {
    problem: IProblem;
}
interface ITextResponseProblemProps extends ITextResponseProblemOwnProps {
    userSolution: ITextResponseSolution;
    isAdmin: boolean;
    claimFocus: boolean;
    dispatch: Dispatch<any>;
    problemsDoc: SDBDoc<IProblems>;
}

const TextResponseProblem = ({ problem, userSolution, problemsDoc, dispatch, isAdmin, claimFocus }: ITextResponseProblemProps) => {
    const { response } = userSolution;
    const doSetResponse = (ev) => {
        const { value } = ev;
        return dispatch(setTextResponse(problem.id, value));
    };
    const p = ['allProblems', problem.id, 'problemDetails', 'exampleCorrectSolution'];
    const subDoc = problemsDoc.subDoc(p) as SDBSubDoc<string>;
    return <>
            <ProblemDescription focusOnMount={claimFocus} problem={problem} />
            { isAdmin &&
                <div className="row">
                    <div className="col">
                        <strong>Example Correct Solution:</strong>
                        <CodeEditor shareDBSubDoc={subDoc} options={{lineNumbers: false, mode: 'markdown', lineWrapping: true}} />
                    </div>
                </div>
            }
            { isAdmin &&
                <TextResponseSolutionView problem={problem} />
            }
            {   !isAdmin &&
                <div className="row">
                    <div className="col">
                        <CodeEditor value={response} onChange={doSetResponse} options={{lineNumbers: false, mode: 'text', lineWrapping: true }} />
                    </div>
                </div>
            }
    </>;
}
function mapStateToProps(state: IPMState, ownProps) {
    const { intermediateUserState, shareDBDocs, solutions, users } = state;
    const { isAdmin, awaitingFocus } = intermediateUserState;
    const { problem } = ownProps;
    const problemsDoc = shareDBDocs.problems;

    const myuid = users.myuid as string;
    const userSolution = solutions.allSolutions[problem.id][myuid] as ITextResponseSolution;

    const claimFocus = awaitingFocus && awaitingFocus.id === problem.id;

    return update(ownProps, { $merge: { isAdmin, problemsDoc, userSolution, claimFocus } });
}
export default connect(mapStateToProps)(TextResponseProblem);
