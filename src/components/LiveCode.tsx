import * as React from 'react';
import { connect } from "react-redux";
import { CodeEditor } from './CodeEditor';
import update from 'immutability-helper';

const LiveCode = ({ index, problem, uid, doc}) => {
    const p = ['problems', index];
    const givenCodeSubDoc = doc.subDoc([...p, 'givenCode']);
    return <div>
        <div className="row">  
            <div className="col">   
            <div>
            <CodeEditor shareDBSubDoc={givenCodeSubDoc} options={{readOnly: true, lineNumbers: true}}/>
            </div>
            </div>
            <div className="col">
                <p>Instructor's editing history</p>
            </div>
        </div>
        </div>
}

function mapStateToProps(state, ownProps) {
    const { index } = ownProps;
    const { user, doc, problems} = state;
    const problem = problems[index];
    const uid = user.id;
    return update(ownProps, { index: {$set: index}, problem: {$set: problem}, uid:{$set: uid}, doc: { $set: doc }});
}
export default connect(mapStateToProps)(LiveCode);
