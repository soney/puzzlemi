import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import { changeProblemConfig, initAllSolutions } from '../../../actions/sharedb_actions';
import { IPMState } from '../../../reducers';

const CodeProblemConfigPanel = ({ dispatch, problem, config }) => {
    const onSwitch = (e) => {
        const item = e.target.id.split('-')[0];
        dispatch(changeProblemConfig(problem.id, item, e.target.checked));
        if(item === "revealSolutions") dispatch(initAllSolutions(problem.id, e.target.checked));
    }
    return <>
        <div className="custom-control custom-switch">
            <input type="checkbox" className="custom-control-input" id={"disableTest-" + problem.id} onClick={onSwitch} defaultChecked={config.disableTest} />
            <label className="custom-control-label" htmlFor={"disableTest-" + problem.id}>Disable Test</label>
        </div>
        <div className="custom-control custom-switch">
            <input type="checkbox" className="custom-control-input" id={"runTests-" + problem.id} onClick={onSwitch} defaultChecked={config.runTests} />
            <label className="custom-control-label" htmlFor={"runTests-" + problem.id}>Run All Tests</label>
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
            <input type="checkbox" className="custom-control-input" id={"revealSolutions-" + problem.id} onClick={onSwitch} defaultChecked={config.revealSolutions} />
            <label className="custom-control-label" htmlFor={"revealSolutions-" + problem.id}>Reveal Solutions</label>
        </div>
    </>
}

function mapStateToProps(state: IPMState, ownProps) {
    const { intermediateUserState, shareDBDocs } = state;
    const { problem } = ownProps;
    const { problemDetails } = problem;
    const { config } = problemDetails;
    const { isAdmin } = intermediateUserState;
    const problemsDoc = shareDBDocs.problems;

    return update(ownProps, { $merge: { isAdmin, problemsDoc, config } });
}
export default connect(mapStateToProps)(CodeProblemConfigPanel);
