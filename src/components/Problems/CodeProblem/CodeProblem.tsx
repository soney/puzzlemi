import * as React from 'react';
import { useState } from 'react';
import { connect } from "react-redux";
import ProblemDescription from '../ProblemDescription';
import ProblemNotes from './ProblemNotes';
import update from 'immutability-helper';
import { CodeEditor } from '../../CodeEditor';
import Tests from './Tests';
import Variables from './UnitTest/Variables';
import ConfigPanel from './ConfigPanel';
import Files from './Files';
import MySolution from './MySolution';
import LiveCode from './LiveCode';
import PeerHelp from './PeerHelp';
import VariableTests from './UnitTest/VariableTests';
// import { runCode } from '../../../actions/runCode_actions';
// import { codeChanged } from '../../../actions/user_actions';
// import { ICodeSolution } from '../../../reducers/solutions';
import { ISolutionState, ICodeSolutionState } from '../../../reducers/intermediateUserState';
import { IPMState } from '../../../reducers';
import CodeSolutionView from './CodeSolutionView';

const CodeProblem = ({ problem, isAdmin, problemsDoc, userSolution, dispatch, intermediateCodeState, output, errors, config }) => {
    // const codeSolution = userSolution as ICodeSolution;
    // const graphicsRef = React.createRef<HTMLDivElement>();
    const [count, setCount] = useState(0);

    // const doRunCode = () => {
    //     const graphicsEl = graphicsRef.current;
    //     if (graphicsEl) {
    //         graphicsEl.innerHTML = '';
    //     }
    //     return dispatch(runCode(codeSolution, problem, intermediateCodeState, graphicsEl));
    // };
    // const doSetCode = (ev) => {
    //     const { value } = ev;
    //     return dispatch(codeChanged(problem, value));
    // };

    const refreshCM = () => {
        setCount(count + 1);
    }
    const p = ['allProblems', problem.id];
    const givenCodeSubDoc = problemsDoc.subDoc([...p, 'problemDetails', 'givenCode']);
    const afterCodeSubDoc = problemsDoc.subDoc([...p, 'problemDetails', 'afterCode']);
    const standardCodeSubDoc = problemsDoc.subDoc([...p, 'problemDetails', 'standardCode']);

    if (isAdmin) {
        return <>
            <div className="row">
                <div className="col">
                    <ProblemDescription problem={problem} />
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <nav>
                        <div className="nav nav-tabs instructor-tab" id={"nav-instructor-code-tab-" + problem.id} role="tablist">
                            <a className="nav-item nav-link active" id={"nav-given-tab-" + problem.id} data-toggle="tab" href={"#nav-given-" + problem.id} role="tab" aria-controls={"nav-given-" + problem.id} aria-selected="true">Given Code</a>
                            <a className="nav-item nav-link" id={"nav-after-tab-" + problem.id} data-toggle="tab" href={"#nav-after-" + problem.id} role="tab" aria-controls={"nav-after-" + problem.id} aria-selected="false" onClick={refreshCM}>Run After</a>
                            <a className="nav-item nav-link" id={"nav-standard-tab-" + problem.id} data-toggle="tab" href={"#nav-standard-" + problem.id} role="tab" aria-controls={"nav-standard-" + problem.id} aria-selected="false" onClick={refreshCM}>Standard Code</a>
                        </div>
                    </nav>
                    <div className="tab-content" id={"nav-instructor-code-tabContent-" + problem.id}>
                        <div className="tab-pane fade show active" id={"nav-given-" + problem.id} role="tabpanel" aria-labelledby={"nav-given-tab-" + problem.id}>
                            <CodeEditor shareDBSubDoc={givenCodeSubDoc} />
                        </div>
                        <div className="tab-pane fade" id={"nav-after-" + problem.id} role="tabpanel" aria-labelledby={"nav-after-tab-" + problem.id}>
                            <CodeEditor shareDBSubDoc={afterCodeSubDoc} flag={count} />
                        </div>
                        <div className="tab-pane fade" id={"nav-standard-" + problem.id} role="tabpanel" aria-labelledby={"nav-standard-tab-" + problem.id}>
                            <CodeEditor shareDBSubDoc={standardCodeSubDoc} flag={count} />
                        </div>
                    </div>
                </div>
                <div className="col">
                    <nav>
                        <div className="nav nav-tabs instructor-tab" id={"nav-instructor-note-tab-" + problem.id} role="tablist">
                            <a className="nav-item nav-link active" id={"nav-notes-tab-" + problem.id} data-toggle="tab" href={"#nav-notes-" + problem.id} role="tab" aria-controls={"nav-notes-" + problem.id} aria-selected="true">Notes</a>
                            <a className="nav-item nav-link" id={"nav-draw-tab-" + problem.id} data-toggle="tab" href={"#nav-draw-" + problem.id} role="tab" aria-controls={"nav-draw-" + problem.id} aria-selected="false">Draw</a>
                            <a className="nav-item nav-link" id={"nav-files-tab-" + problem.id} data-toggle="tab" href={"#nav-files-" + problem.id} role="tab" aria-controls={"nav-files-" + problem.id} aria-selected="false">Files</a>
                        </div>
                    </nav>
                    <div className="tab-content" id="nav-instructor-note-tabContent">
                        <div className="tab-pane fade show active" id={"nav-notes-" + problem.id} role="tabpanel" aria-labelledby={"nav-notes-tab-" + problem.id}>
                            <ProblemNotes problem={problem} isRender={false} />
                        </div>
                        <div className="tab-pane fade" id={"nav-draw-" + problem.id} role="tabpanel" aria-labelledby={"nav-draw-tab-" + problem.id}>
                            <ProblemNotes problem={problem} isRender={true} />
                        </div>
                        <div className="tab-pane fade" id={"nav-files-" + problem.id} role="tabpanel" aria-labelledby={"nav-files-tab-" + problem.id}>
                            <Files problem={problem} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <nav>
                        <div className="nav nav-tabs instructor-tab" id={"nav-instructor-config-tab-" + problem.id} role="tablist">
                            <a className="nav-item nav-link active" id={"nav-variables-tab-" + problem.id} data-toggle="tab" href={"#nav-variables-" + problem.id} role="tab" aria-controls={"nav-variables-" + problem.id} aria-selected="true">Variables</a>
                            <a className="nav-item nav-link" id={"nav-config-tab-" + problem.id} data-toggle="tab" href={"#nav-config-" + problem.id} role="tab" aria-controls={"nav-config-" + problem.id} aria-selected="false">Config</a>
                            <a className="nav-item nav-link" id={"nav-tests-tab-" + problem.id} data-toggle="tab" href={"#nav-tests-" + problem.id} role="tab" aria-controls={"nav-tests-" + problem.id} aria-selected="false" onClick={refreshCM}>Tests</a>
                            <a className="nav-item nav-link" id={"nav-variable-tests-tab-" + problem.id} data-toggle="tab" href={"#nav-variable-tests-" + problem.id} role="tab" aria-controls={"nav-variable-tests-" + problem.id} aria-selected="false" onClick={refreshCM}>Variable Tests</a>
                        </div>
                    </nav>
                    <div className="tab-content" id="nav-instructor-config-tabContent">
                        <div className="tab-pane fade show active" id={"nav-variables-" + problem.id} role="tabpanel" aria-labelledby={"nav-variables-tab-" + problem.id}>
                            <Variables problem={problem} />
                        </div>
                        <div className="tab-pane fade" id={"nav-config-" + problem.id} role="tabpanel" aria-labelledby={"nav-config-tab-" + problem.id}>
                            <ConfigPanel problem={problem} />
                        </div>
                        <div className="tab-pane fade" id={"nav-tests-" + problem.id} role="tabpanel" aria-labelledby={"nav-tests-tab-" + problem.id}>
                            <Tests problem={problem} flag={count} />
                        </div>
                        <div className="tab-pane fade" id={"nav-variable-tests-" + problem.id} role="tabpanel" aria-labelledby={"nav-variable-tests-tab-" + problem.id}>
                            <VariableTests problem={problem} flag={count} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <CodeSolutionView problem={problem} />
                </div>
            </div>
        </>
    }
    else {
        return <>
            <div className="row">
                <div className="col">
                    <ProblemDescription problem={problem} />
                </div>
            </div>
            <div className="row">
                <div className="col">
                <nav>
                    <div className="nav nav-tabs student-tab" id={"nav-student-tab-"+problem.id} role="tablist">
                        <a className="nav-item nav-link active" id={"nav-home-tab-"+problem.id} data-toggle="tab" href={"#nav-home-"+problem.id} role="tab" aria-controls={"nav-home-"+problem.id} aria-selected="true" onClick={refreshCM}>My Solution</a>
                        {config.displayInstructor &&
                            <a className="nav-item nav-link" id={"nav-profile-tab-"+problem.id} data-toggle="tab" href={"#nav-profile-"+problem.id} role="tab" aria-controls={"nav-profile-"+problem.id} aria-selected="false" onClick={refreshCM}>Instructor</a>
                        }
                        {config.peerHelp &&
                            <a className="nav-item nav-link" id={"nav-contact-tab-"+problem.id} data-toggle="tab" href={"#nav-contact-"+problem.id} role="tab" aria-controls={"nav-contact-"+problem.id} aria-selected="false">Peers</a>
                        }
                    </div>
                </nav>
                <div className="tab-content" id="nav-student-tabContent">
                    <div className="tab-pane fade show active" id={"nav-home-"+problem.id} role="tabpanel" aria-labelledby={"nav-home-tab-"+problem.id}>
                        <MySolution problem={problem} flag={count}/>
                        <div className="row">
                            <div className="col">
                                {/* <Tests index={index} /> */}
                            </div>
                        </div>
                    </div>
                    {config.displayInstructor &&
                        <div className="tab-pane fade" id={"nav-profile-"+problem.id} role="tabpanel" aria-labelledby={"nav-profile-tab-"+problem.id}>
                            <LiveCode problem={problem} flag={count} />
                        </div>
                    }
                    {config.peerHelp &&
                        <div className="tab-pane fade" id={"nav-contact-"+problem.id} role="tabpanel" aria-labelledby={"nav-contact-tab-"+problem.id}>
                            <PeerHelp problem={problem} />
                        </div>
                    }
                </div>
                </div>
            </div>
        </>
    }
    // return <>
    //     <div className="row">
    //         <div className="col">
    //             <ProblemDescription problem={problem} />
    //         </div>
    //     </div>
    //     <div className="row">
    //         {isAdmin &&
    //             <div className="col">
    //                 <nav>
    //                     <div className="nav nav-tabs instructor-tab" id={"nav-instructor-code-tab-" + problem.id} role="tablist">
    //                         <a className="nav-item nav-link active" id={"nav-given-tab-" + problem.id} data-toggle="tab" href={"#nav-given-" + problem.id} role="tab" aria-controls={"nav-given-" + problem.id} aria-selected="true">Given Code</a>
    //                         <a className="nav-item nav-link" id={"nav-after-tab-" + problem.id} data-toggle="tab" href={"#nav-after-" + problem.id} role="tab" aria-controls={"nav-after-" + problem.id} aria-selected="false" onClick={refreshCM}>Run After</a>
    //                         <a className="nav-item nav-link" id={"nav-standard-tab-" + problem.id} data-toggle="tab" href={"#nav-standard-" + problem.id} role="tab" aria-controls={"nav-standard-" + problem.id} aria-selected="false" onClick={refreshCM}>Standard Code</a>
    //                     </div>
    //                 </nav>
    //                 <div className="tab-content" id={"nav-instructor-code-tabContent-" + problem.id}>
    //                     <div className="tab-pane fade show active" id={"nav-given-" + problem.id} role="tabpanel" aria-labelledby={"nav-given-tab-" + problem.id}>
    //                         <CodeEditor shareDBSubDoc={givenCodeSubDoc} />
    //                     </div>
    //                     <div className="tab-pane fade" id={"nav-after-" + problem.id} role="tabpanel" aria-labelledby={"nav-after-tab-" + problem.id}>
    //                         <CodeEditor shareDBSubDoc={afterCodeSubDoc} flag={count} />
    //                     </div>
    //                     <div className="tab-pane fade" id={"nav-standard-" + problem.id} role="tabpanel" aria-labelledby={"nav-standard-tab-" + problem.id}>
    //                         <CodeEditor shareDBSubDoc={standardCodeSubDoc} flag={count} />
    //                     </div>
    //                 </div>
    //             </div>
    //         }
    //         {!isAdmin &&
    //             <div className="col">
    //                 <CodeEditor value={codeSolution.code} onChange={doSetCode} />
    //                 <button disabled={false} className='btn btn-outline-success btn-sm btn-block' onClick={doRunCode}>Run</button>
    //             </div>
    //         }
    //         <div className="col">
    //             {!isAdmin &&
    //                 <pre className={'codeOutput' + (errors.length > 0 ? ' alert alert-danger' : ' no-error')}>
    //                     {output}
    //                     {errors.join('\n')}
    //                 </pre>
    //             }
    //             {!isAdmin &&
    //                 <div ref={graphicsRef} className='graphics'></div>
    //             }
    //             <Files problem={problem} />
    //         </div>
    //     </div>
    //     <div className="row">
    //         <div className="col">
    //             <div>
    //                 <nav>
    //                     <div className="nav nav-tabs instructor-tab" id={"nav-instructor-config-tab-" + problem.id} role="tablist">
    //                         <a className="nav-item nav-link active" id={"nav-variables-tab-" + problem.id} data-toggle="tab" href={"#nav-variables-" + problem.id} role="tab" aria-controls={"nav-variables-" + problem.id} aria-selected="true">Variables</a>
    //                         <a className="nav-item nav-link" id={"nav-config-tab-" + problem.id} data-toggle="tab" href={"#nav-config-" + problem.id} role="tab" aria-controls={"nav-config-" + problem.id} aria-selected="false">Config</a>
    //                         <a className="nav-item nav-link" id={"nav-tests-tab-" + problem.id} data-toggle="tab" href={"#nav-tests-" + problem.id} role="tab" aria-controls={"nav-tests-" + problem.id} aria-selected="false" onClick={refreshCM}>Tests</a>
    //                     </div>
    //                 </nav>
    //                 <div className="tab-content" id="nav-instructor-config-tabContent">
    //                     <div className="tab-pane fade show active" id={"nav-variables-" + problem.id} role="tabpanel" aria-labelledby={"nav-variables-tab-" + problem.id}>
    //                         <Variables problem={problem} />
    //                     </div>
    //                     <div className="tab-pane fade" id={"nav-config-" + problem.id} role="tabpanel" aria-labelledby={"nav-config-tab-" + problem.id}>
    //                         <ConfigPanel problem={problem} />
    //                     </div>
    //                     <div className="tab-pane fade" id={"nav-tests-" + problem.id} role="tabpanel" aria-labelledby={"nav-tests-tab-" + problem.id}>
    //                         <Tests problem={problem} flag={count} />
    //                     </div>
    //                 </div>
    //             </div>

    //             {/* <Tests problem={problem} /> */}
    //         </div>
    //     </div>
    //     {isAdmin &&
    //         <CodeSolutionView problem={problem} />
    //     }
    // </>;
}

function mapStateToProps(state: IPMState, ownProps) {
    const { intermediateUserState, shareDBDocs, solutions, users } = state;
    const { isAdmin } = intermediateUserState;
    const problemsDoc = shareDBDocs.problems;
    const { problem } = ownProps;
    const { problemDetails } = problem;
    const { config } = problemDetails;

    const myuid = users.myuid as string;

    const userSolution = solutions.allSolutions[ownProps.problem.id][myuid];
    const intermediateCodeState: ISolutionState = intermediateUserState.intermediateSolutionState[ownProps.problem.id];
    const { output, errors } = intermediateCodeState ? intermediateCodeState as ICodeSolutionState : { output: '', errors: [] };

    return update(ownProps, { $merge: { isAdmin, problemsDoc, userSolution, output, errors, intermediateCodeState, config } });
}
export default connect(mapStateToProps)(CodeProblem);
