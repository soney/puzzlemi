import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import { CodeEditor } from '../../../CodeEditor';

const SolutionPanel = ({ problem, session, index, aggregateDataDoc }) => {
    const p = ['userData', problem.id, 'allSolutions', session.id, 'code'];
    const sharedCodeSubDoc = aggregateDataDoc.subDoc(p);
    return <div>
        <h4>Solution {index + 1}</h4>
        <div className="row">
        <div className="col">
        <CodeEditor shareDBSubDoc={sharedCodeSubDoc} options={{ readOnly: true, lineNumbers: true, height: 300, lineWrapping:true} } flag={index} refreshDoc={index}/>
        </div>
        <div className="col">
        </div>
        </div>
    </div>
}

function mapStateToProps(state, ownProps) {
    const { shareDBDocs } = state;
    const aggregateDataDoc = shareDBDocs.aggregateData;

    return update(ownProps, { $merge: { aggregateDataDoc} });
}
export default connect(mapStateToProps)(SolutionPanel);
