import * as React from 'react';
import { connect } from "react-redux";
import * as showdown from 'showdown';
import update from 'immutability-helper';
import SketchOverlay from './SketchOverlay';
import { CodeEditor } from '../../../CodeEditor';

const ProblemNotes = ({ problem, problemsDoc, notes, isRender, isAdmin, flag }) => {
    if (isAdmin) {
        if (isRender) {
            const converter = new showdown.Converter();
            const problemNotes = { __html: converter.makeHtml(notes) };
            return <div>
                <div className="row">
                    <div className="col">
                        <p className="problem-notes" dangerouslySetInnerHTML={problemNotes} />
                        <SketchOverlay problem={problem} id={problem.id} />
                    </div>
                </div>
            </div>;
        } else {
            const p = ['allProblems', problem.id];
            const subDoc = problemsDoc.subDoc([...p, 'problemDetails', 'notes']);
            return <div className="row">
                <div className="col">
                    <CodeEditor shareDBSubDoc={subDoc} options={{ lineNumbers: false, mode: 'markdown', lineWrapping: true }} flag={flag} />
                </div>
            </div>;
        }
    } else {
        const converter = new showdown.Converter();
        const problemNotes = { __html: converter.makeHtml(notes) };
        return <div className="row">
            <div className="col" style={{ height: '300px', overflowY: 'auto', border: 'solid 1px #eeeeee', marginLeft: '15px', marginRight: '15px' }}>
                <p className="problem-notes" dangerouslySetInnerHTML={problemNotes} />
                <SketchOverlay problem={problem} id={problem.id} />
            </div>
        </div>;
    }
}
function mapStateToProps(state, ownProps) {
    const { intermediateUserState, shareDBDocs } = state;
    const { problem } = ownProps;
    const { problemDetails } = problem;
    const { notes } = problemDetails;
    const { isAdmin } = intermediateUserState;
    const problemsDoc = shareDBDocs.problems;

    return update(ownProps, { $merge: { isAdmin, problemsDoc, notes } });
}
export default connect(mapStateToProps)(ProblemNotes);
