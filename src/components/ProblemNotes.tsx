import * as React from 'react';
import { connect } from "react-redux";
import * as showdown from 'showdown';
// import { CodeEditor } from './CodeEditor';
import update from 'immutability-helper';
import SketchOverlay from './SketchOverlay';
import {CodeEditor} from './CodeEditor';

const ProblemNotes = ({ index, problem, isRender, isAdmin, doc }) => {
    if (isAdmin) {
        if(isRender) {
            const converter = new showdown.Converter();
            const problemNotes = { __html: converter.makeHtml(problem.notes) };
            return <div>
             <div className="row">
                <div className="col">
                    <p id='problem-notes' className={"problem-notes"+((isAdmin)?' problem-notes-admin':'')} dangerouslySetInnerHTML={problemNotes} />
                    <SketchOverlay index={index} />
                </div>
            </div>
            </div>;
        } else {
            const p = ['problems', index, 'notes'];
            const subDoc = doc.subDoc(p);
            return <div className="row">
                <div className="col">
                    <CodeEditor shareDBSubDoc={subDoc} options={{ lineNumbers: false, mode: 'markdown', lineWrapping: true}} />
                </div>
            </div>;    
        }
    }  else {
        const converter = new showdown.Converter();
        const problemNotes = { __html: converter.makeHtml(problem.notes) };
        return <div className="row">
            <div className="col" style={{overflowY: 'auto', border: 'solid 1px #eeeeee', marginLeft:'15px', marginRight: '15px'}}>
                <p className="problem-notes" dangerouslySetInnerHTML={problemNotes} />
                <SketchOverlay index={index} />
            </div>
        </div>;
    }
}
function mapStateToProps(state, ownProps) {
    const { user, problems, doc } = state;
    const { isAdmin } = user;
    const problem = problems[ownProps.index];

    return update(ownProps, { isAdmin: { $set: isAdmin }, problem: { $set: problem }, doc: { $set: doc } });
}
export default connect(mapStateToProps)(ProblemNotes);
