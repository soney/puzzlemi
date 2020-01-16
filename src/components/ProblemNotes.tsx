import * as React from 'react';
import { connect } from "react-redux";
import * as showdown from 'showdown';
// import { CodeEditor } from './CodeEditor';
import update from 'immutability-helper';

const ProblemNotes = ({ index, problem, isAdmin, doc }) => {
    if (isAdmin) {
        const converter = new showdown.Converter();
        const problemNotes = { __html: converter.makeHtml(problem.notes) };
        return <div>
            <h4 style={{width: '100%'}}>Notes: </h4>
            <div className="col" style={{height: '300px', overflowY: 'auto', border: 'solid 1px #eeeeee'}}>
                <p className="problem-notes" dangerouslySetInnerHTML={problemNotes} />
            </div>
        </div>;
    } else {
        const converter = new showdown.Converter();
        const problemNotes = { __html: converter.makeHtml(problem.notes) };
        return <div className="row">
            <div className="col" style={{height: '300px', overflowY: 'auto', border: 'solid 1px #eeeeee', marginLeft:'15px', marginRight: '15px'}}>
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
