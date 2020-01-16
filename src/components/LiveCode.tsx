import * as React from 'react';
import { connect } from "react-redux";
import { CodeEditor } from './CodeEditor';
import update from 'immutability-helper';
import ProblemNotes from './ProblemNotes';

const LiveCode = ({ index, problem, uid, flag, doc }) => {
    const p = ['problems', index];
    const givenCodeSubDoc = doc.subDoc([...p, 'givenCode']);

    return <div>
        <div className="row">
            <div className="col">
                <CodeEditor shareDBSubDoc={givenCodeSubDoc} flag={flag} options={{ readOnly: true, lineNumbers: true }} />
            </div>
            <div className="col">
                <ProblemNotes index={index} />
            </div>
        </div>
    </div>
}

function mapStateToProps(state, ownProps) {
    const { index, flag } = ownProps;
    const { user, doc, problems } = state;
    const problem = problems[index];
    const uid = user.id;
    return update(ownProps, { index: { $set: index }, flag: { $set: flag }, problem: { $set: problem }, uid: { $set: uid }, doc: { $set: doc } });
}
export default connect(mapStateToProps)(LiveCode);
