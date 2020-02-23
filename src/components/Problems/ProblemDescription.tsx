import * as React from 'react';
import { connect } from "react-redux";
import * as showdown from 'showdown';
import { CodeEditor } from '../CodeEditor';
import update from 'immutability-helper';
import { IPMState } from '../../reducers';
import { IProblem, IProblems } from '../../reducers/problems';
import { SDBDoc, SDBSubDoc } from 'sdb-ts';

interface IProblemDescriptionOwnProps {
    problem: IProblem;
    focusOnMount: boolean;
}
interface IProblemDescriptionProps extends IProblemDescriptionOwnProps {
    isAdmin: boolean;
    description: string;
    problemsDoc: SDBDoc<IProblems>;
}
const ProblemDescription = ({ problem, isAdmin, problemsDoc, description, focusOnMount }: IProblemDescriptionProps): React.ReactElement => {
    if(isAdmin) {
        const p = ['allProblems', problem.id, 'problemDetails', 'description'];
        const subDoc = problemsDoc.subDoc(p) as SDBSubDoc<string>;
        return <div className="row">
            <div className="col">
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

function mapStateToProps(state: IPMState, givenProps: IProblemDescriptionOwnProps): IProblemDescriptionProps {
    const { problem } = givenProps;
    const { intermediateUserState, shareDBDocs } = state;
    const { isAdmin } = intermediateUserState;
    const problemsDoc = shareDBDocs.problems!;
    const problems = shareDBDocs.i.problems!;

    const description = problems.allProblems[problem.id].problemDetails.description;

    return update(givenProps, { $merge: { isAdmin, problemsDoc, description } as any }) as IProblemDescriptionProps;
}

export default connect(mapStateToProps)(ProblemDescription);