import * as React from 'react';
import { connect } from "react-redux";
import * as showdown from 'showdown';
import { CodeEditor } from '../CodeEditor';
import update from 'immutability-helper';
import { IPMState } from '../../reducers';

const ProblemDescription = ({ problem, isAdmin, problemsDoc, description, focusOnMount }) => {
    if(isAdmin) {
        const p = ['allProblems', problem.id, 'problemDetails', 'description'];
        const subDoc = problemsDoc.subDoc(p);
        return <div className="row">
            <div className="col">
                <h4>Description:</h4>
                <CodeEditor focusOnMount={focusOnMount} shareDBSubDoc={subDoc} options={{lineNumbers: false, mode: 'markdown', lineWrapping: true, height: 80}} />
            </div>
        </div>;
    } else {
        const converter = new showdown.Converter();
        const problemDescription = { __html: converter.makeHtml(description) };
        return <div className="row">
            <div className="col">
                <p className="problem-description" dangerouslySetInnerHTML={problemDescription} />
            </div>
        </div>;
    }
}

function mapStateToProps(state: IPMState, ownProps) {
    const { intermediateUserState, shareDBDocs } = state;
    const { isAdmin } = intermediateUserState;
    const problemsDoc = shareDBDocs.problems;
    const problems = shareDBDocs.i.problems;

    const description = problems!.allProblems[ownProps.problem.id].problemDetails.description;

    return update(ownProps, { $merge: { isAdmin, problemsDoc, description } })
}

export default connect(mapStateToProps)(ProblemDescription);
