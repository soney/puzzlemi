import * as React from 'react';
import { connect } from "react-redux";
import * as showdown from 'showdown';
import { CodeEditor } from '../CodeEditor';
import update from 'immutability-helper';

const ProblemDescription = ({ index, problem, isAdmin, doc }) => {
    if(isAdmin) {
        const p = ['problems', index, 'problem', 'description'];
        const subDoc = doc.subDoc(p);
        return <div className="row">
            <div className="col">
                <h4>Description: </h4>
                <CodeEditor shareDBSubDoc={subDoc} options={{lineNumbers: false, mode: 'markdown', lineWrapping: true, height: 80}} />
            </div>
        </div>;
    } else {
        const converter = new showdown.Converter();
        const problemDescription = { __html: converter.makeHtml(problem.description) };
        return <div className="row">
            <div className="col">
                <p className="problem-description" dangerouslySetInnerHTML={problemDescription} />
            </div>
        </div>;
    }
}
function mapStateToProps(state, ownProps) {
    const { user, problems, doc } = state;
    const { isAdmin } = user;
    const problemInfo = problems[ownProps.index];
    const { problem } = problemInfo;

    return update(ownProps, { isAdmin: {$set: isAdmin}, problem: {$set: problem}, doc: {$set: doc} });
}
export default connect(mapStateToProps)(ProblemDescription);
