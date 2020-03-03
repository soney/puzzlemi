import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import { CodeEditor } from '../../../CodeEditor';

const SolutionPanel = ({ problem, session, groupID, groupIndex, solutionIndex, aggregateDataDoc }) => {
    const p = ['userData', problem.id, 'allGroups', groupID, "solutions", session.id, 'code'];
    const sharedCodeSubDoc = aggregateDataDoc.subDoc(p);
    return <div className="col">
        <CodeEditor shareDBSubDoc={sharedCodeSubDoc} options={{ readOnly: true, lineNumbers: true, height: 300, lineWrapping: true }} flag={{ groupIndex, solutionIndex }} refreshDoc={{ groupIndex, solutionIndex }} />
    </div>
}

function mapStateToProps(state, ownProps) {
    const { shareDBDocs } = state;
    const aggregateDataDoc = shareDBDocs.aggregateData;
    return update(ownProps, { $merge: { aggregateDataDoc } });
}
export default connect(mapStateToProps)(SolutionPanel);
