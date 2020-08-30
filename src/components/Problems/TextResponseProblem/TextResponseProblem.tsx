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
    response: string;
    isAdmin: boolean;
    claimFocus: boolean;
    dispatch: Dispatch<any>;
    problemsDoc: SDBDoc<IProblems>;
}

const TextResponseProblem = ({ problem, response, problemsDoc, dispatch, isAdmin, claimFocus }: ITextResponseProblemProps) => {
    const doSetResponse = (ev) => {
        const { value } = ev;
        return dispatch(setTextResponse(problem.id, value));
    };
    const exampleCorrectSolutionPath = ['allProblems', problem.id, 'problemDetails', 'exampleCorrectSolution'];
    const exampleCorrectSolutionSubdoc = problemsDoc.subDoc(exampleCorrectSolutionPath) as SDBSubDoc<string>;
    const starterResponsePath = ['allProblems', problem.id, 'problemDetails', 'starterResponse'];
    const starterResponseSubdoc = problemsDoc.subDoc(starterResponsePath) as SDBSubDoc<string>;
    return <>
            <ProblemDescription focusOnMount={claimFocus} problem={problem} />
            { isAdmin &&
            <>
                <div className="row">
                    <div className="col">
                        <strong>Default Response:</strong>
                        <CodeEditor shareDBSubDoc={starterResponseSubdoc} options={{lineNumbers: false, mode: 'markdown', lineWrapping: true}} />
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <strong>Example Correct Solution:</strong>
                        <CodeEditor shareDBSubDoc={exampleCorrectSolutionSubdoc} options={{lineNumbers: false, mode: 'markdown', lineWrapping: true}} />
                    </div>
                </div>
            </>
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
    const response = userSolution ? userSolution.response : '' ;

    const claimFocus = awaitingFocus && awaitingFocus.id === problem.id;

    return update(ownProps, { $merge: { isAdmin, problemsDoc, response, claimFocus } });
}
export default connect(mapStateToProps)(TextResponseProblem);
