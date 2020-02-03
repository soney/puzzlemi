import * as React from 'react';
import { connect } from "react-redux";
import { CodeEditor } from '../../../CodeEditor';
import update from 'immutability-helper';
import ProblemNotes from './ProblemNotes';

const LiveCode = ({ index, problem, flag, problemsDoc }) => {
    const p = ['allProblems', problem.id];
    const liveCodeSubDoc = problemsDoc.subDoc([...p, 'problemDetails', 'liveCode']);

    return <div>
        <div className="row">
            <div className="col">
                <CodeEditor shareDBSubDoc={liveCodeSubDoc} flag={flag} options={{ readOnly: true, lineNumbers: true }} />
            </div>
            <div className="col">
                <ProblemNotes problem={problem} />
            </div>
        </div>
    </div>
}

function mapStateToProps(state, ownProps) {
    const { shareDBDocs } = state;
    const problemsDoc = shareDBDocs.problems;

    return update(ownProps, { $merge: { problemsDoc } });
}
export default connect(mapStateToProps)(LiveCode);
