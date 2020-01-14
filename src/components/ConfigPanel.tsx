import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import { changeProblemConfig } from '../actions/sharedb_actions';

const ConfigPanel = ({ dispatch, index, config }) => {
    const onSwitch = (e) => {
        dispatch(changeProblemConfig(index, e.target.id, e.target.checked));
    }
    return <div className="config-panel">
        <h4>Config</h4>
        <div className="custom-control custom-switch">
            <input type="checkbox" className="custom-control-input" id="runTests" onClick={onSwitch} defaultChecked={config.runTests} />
            <label className="custom-control-label" htmlFor="runTests">Run All Test</label>
        </div>
        <div className="custom-control custom-switch">
            <input type="checkbox" className="custom-control-input" id="addTests" onClick={onSwitch} defaultChecked={config.addTests} />
            <label className="custom-control-label" htmlFor="addTests">Add New Test</label>
        </div>
        <div className="custom-control custom-switch">
            <input type="checkbox" className="custom-control-input" id="displayInstructor" onClick={onSwitch} defaultChecked={config.displayInstructor} />
            <label className="custom-control-label" htmlFor="displayInstructor">Instructor Board</label>
        </div>
        <div className="custom-control custom-switch">
            <input type="checkbox" className="custom-control-input" id="peerHelp" onClick={onSwitch} defaultChecked={config.peerHelp} />
            <label className="custom-control-label" htmlFor="peerHelp">Peer Help</label>
        </div>
        <div className="custom-control custom-switch">
            <input type="checkbox" className="custom-control-input" id="autoVerify" onClick={onSwitch} defaultChecked={config.autoVerify} />
            <label className="custom-control-label" htmlFor="autoVerify">Verify Tests Automatically</label>
        </div>
    </div>
}

function mapStateToProps(state, ownProps) {
    const { index } = ownProps;
    const { problems } = state;
    const problem = problems[index];
    const config = problem.config;
    return update(ownProps, { index: { $set: index }, config: { $set: config } });
}
export default connect(mapStateToProps)(ConfigPanel);
