import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import { changeProblemConfig } from '../actions/sharedb_actions';

const ConfigPanel = ({ dispatch, index, config, id}) => {
    const onSwitch = (e) => {
        const item = e.target.id.split('-')[0];
        dispatch(changeProblemConfig(index, item, e.target.checked));
    }
    return <div className="config-panel">
        <div className="custom-control custom-switch">
            <input type="checkbox" className="custom-control-input" id={"runTests-"+id} onClick={onSwitch} defaultChecked={config.runTests} />
            <label className="custom-control-label" htmlFor={"runTests-"+id}>Run All Test</label>
        </div>
        <div className="custom-control custom-switch">
            <input type="checkbox" className="custom-control-input" id={"addTests-"+id} onClick={onSwitch} defaultChecked={config.addTests} />
            <label className="custom-control-label" htmlFor={"addTests-"+id}>Add New Test</label>
        </div>
        <div className="custom-control custom-switch">
            <input type="checkbox" className="custom-control-input" id={"displayInstructor-"+id} onClick={onSwitch} defaultChecked={config.displayInstructor} />
            <label className="custom-control-label" htmlFor={"displayInstructor-"+id}>Instructor Board</label>
        </div>
        <div className="custom-control custom-switch">
            <input type="checkbox" className="custom-control-input" id={"peerHelp-"+id} onClick={onSwitch} defaultChecked={config.peerHelp} />
            <label className="custom-control-label" htmlFor={"peerHelp-"+id}>Peer Help</label>
        </div>
        <div className="custom-control custom-switch">
            <input type="checkbox" className="custom-control-input" id={"autoVerify-"+id} onClick={onSwitch} defaultChecked={config.autoVerify} />
            <label className="custom-control-label" htmlFor={"autoVerify-"+id}>Verify Tests Automatically</label>
        </div>
    </div>
}

function mapStateToProps(state, ownProps) {
    const { index } = ownProps;
    const { problems } = state;
    const problem = problems[index];
    const { id, config } = problem;
    return update(ownProps, { index: { $set: index }, config: { $set: config }, id: { $set: id } });
}
export default connect(mapStateToProps)(ConfigPanel);
