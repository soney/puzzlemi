import * as React from 'react';
import { connect } from "react-redux";
import { CodeEditor } from './CodeEditor';
import SketchOverlay from './SketchOverlay';
import update from 'immutability-helper';
import ProblemNotes from './ProblemNotes';

const LiveCode = ({ index, problem, uid, flag, doc }) => {
    const p = ['problems', index];
    const givenCodeSubDoc = doc.subDoc([...p, 'givenCode']);
    // const whiteboardCodeSubDoc = doc.subDoc([...p, 'whiteboardCode'])
    return <div>
        <div className="row">
            <div className="col">
                <div>
                    <p>Instructor's Code</p>
                    <CodeEditor shareDBSubDoc={givenCodeSubDoc} options={{ readOnly: true, lineNumbers: true }} />
                    
                </div>
            </div>
            <div className="col">
                <p>Instructor's editing history</p>
                <ProblemNotes index={index} />
                <SketchOverlay index={index} isAdmin={false}/>
            </div>
        </div>
    </div>
}

function mapStateToProps(state, ownProps) {
    const { index, flag } = ownProps;
    const { user, doc, problems } = state;
    const problem = problems[index];
    const uid = user.id;
    return update(ownProps, { index: { $set: index }, flag: {$set: flag}, problem: { $set: problem }, uid: { $set: uid }, doc: { $set: doc } });
}
export default connect(mapStateToProps)(LiveCode);
