import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import { changeProblemConfig } from '../../../actions/sharedb_actions';

const ConfigPanel = ({ dispatch, problem, config }) => {
    const onSwitch = (e) => {
        const item = e.target.id.split('-')[0];
        dispatch(changeProblemConfig(problem.id, item, e.target.checked));
    }
    return <div className="config-panel">
        <div className="custom-control custom-switch">
            <input type="checkbox" className="custom-control-input" id={"runTests-" + problem.id} onClick={onSwitch} defaultChecked={config.runTests} />
            <label className="custom-control-label" htmlFor={"runTests-" + problem.id}>Run All Test</label>
        </div>
        <div className="custom-control custom-switch">
            <input type="checkbox" className="custom-control-input" id={"addTests-" + problem.id} onClick={onSwitch} defaultChecked={config.addTests} />
            <label className="custom-control-label" htmlFor={"addTests-" + problem.id}>Add New Test</label>
        </div>
        <div className="custom-control custom-switch">
            <input type="checkbox" className="custom-control-input" id={"displayInstructor-" + problem.id} onClick={onSwitch} defaultChecked={config.displayInstructor} />
            <label className="custom-control-label" htmlFor={"displayInstructor-" + problem.id}>Instructor Board</label>
        </div>
        <div className="custom-control custom-switch">
            <input type="checkbox" className="custom-control-input" id={"peerHelp-" + problem.id} onClick={onSwitch} defaultChecked={config.peerHelp} />
            <label className="custom-control-label" htmlFor={"peerHelp-" + problem.id}>Peer Help</label>
        </div>
        <div className="custom-control custom-switch">
            <input type="checkbox" className="custom-control-input" id={"autoVerify-" + problem.id} onClick={onSwitch} defaultChecked={config.autoVerify} />
            <label className="custom-control-label" htmlFor={"autoVerify-" + problem.id}>Verify Tests Automatically</label>
        </div>
    </div>
}

function mapStateToProps(state, ownProps) {
    const { intermediateUserState, shareDBDocs } = state;
    const { problem } = ownProps;
    const { problemDetails } = problem;
    const { config } = problemDetails;
    const { isAdmin } = intermediateUserState;
    const problemsDoc = shareDBDocs.problems;

    return update(ownProps, { $merge: { isAdmin, problemsDoc, config } });
}
export default connect(mapStateToProps)(ConfigPanel);
