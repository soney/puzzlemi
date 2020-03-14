import * as React from 'react';
import { connect } from "react-redux";
import { CodeEditor } from '../../../CodeEditor';
import update from 'immutability-helper';
// import ProblemNotes from './ProblemNotes';

const LiveCode = ({ index, problem, flag, problemsDoc, result }) => {
    const p = ['allProblems', problem.id];
    const liveCodeSubDoc = problemsDoc.subDoc([...p, 'problemDetails', 'liveCode', 'code']);
    return <div className="row">
        <div className="col live-code-view">
            <CodeEditor shareDBSubDoc={liveCodeSubDoc} flag={flag} options={{ readOnly: true, lineNumbers: true }} />
        </div>
        <div className="col live-code-result">
        {result &&
            <>
                {result.output !== "" &&
                    <pre className={'codeOutput no-error'}>
                        {result.output}
                    </pre>
                }
                <pre className={'codeError' + (result.errors.length > 0 ? ' alert alert-danger' : ' no-error')}>
                    {result.errors.join('\n')}
                </pre>
            </>
        }
        </div>
    </div>;
}

function mapStateToProps(state, ownProps) {
    const { shareDBDocs } = state;
    const { problem } = ownProps;
    const problemsDoc = shareDBDocs.problems;
    const problemsData = shareDBDocs.i.problems;
    const problemData = problemsData.allProblems[problem.id];
    const result = problemData.problemDetails.liveCode.result;
    return update(ownProps, { $merge: { problemsDoc, result } });
}
export default connect(mapStateToProps)(LiveCode);
