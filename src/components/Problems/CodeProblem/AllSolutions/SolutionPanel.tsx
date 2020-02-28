import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import { CodeEditor } from '../../../CodeEditor';

const SolutionPanel = ({ problem, session, index }) => {
    console.log(session)
    return <div>
        <h4>Solution {index + 1}</h4>
        <div className="row">
        <div className="col">
        <CodeEditor value={session.code} options={{ readOnly: true, lineNumbers: true, height: 300, lineWrapping:true, flag:index } } />
        </div>
        <div className="col">
        </div>
        </div>
    </div>
}

function mapStateToProps(state, ownProps) {

    return update(ownProps, { $merge: { } });
}
export default connect(mapStateToProps)(SolutionPanel);
