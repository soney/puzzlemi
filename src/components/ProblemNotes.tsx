import * as React from 'react';
import { connect } from "react-redux";
import * as showdown from 'showdown';
import { CodeEditor } from './CodeEditor';
import update from 'immutability-helper';

const ProblemNotes = ({ index, problem, isRender, isAdmin, doc }) => {
    if (isAdmin) {
        if(isRender) {
            const converter = new showdown.Converter();
            const problemNotes = { __html: converter.makeHtml(problem.notes) };
            return <div className="row">
                <div className="col">
                    <p className="problem-notes" dangerouslySetInnerHTML={problemNotes} />
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
            <div className="col">
                <p className="problem-notes" dangerouslySetInnerHTML={problemNotes} />
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
