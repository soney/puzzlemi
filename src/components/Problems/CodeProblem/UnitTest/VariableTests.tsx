import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import VariableTest from './VariableTest';
import { addVariableTest } from '../../../../actions/sharedb_actions';
import uuid from '../../../../utils/uuid';

const VariableTests = ({ index, problem, username, flag, variableTests, variables, isAdmin, userInfo, doc, dispatch, uid }) => {
    const doAddTest = () => {
        const newTest = {
            author: username,
            verified: isAdmin,
            id: uuid(),
            input: variables.filter(i=>i.type==='input'),
            output: variables.filter(i=>i.type==='output')
        }
        dispatch(addVariableTest(problem.id, newTest));
    }
    const inputVariables = variables.filter(i=>i.type==='input');
    const outputVariables = variables.filter(i=>i.type==='output');

    return <div className='tests'>
        {isAdmin &&
            <div>
                {variableTests.length !== 0 &&
                    <table className="table table-sm">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col" data-field="name">
                                    <div>Name</div>
                                </th>
                                <th scope="col">Status</th>
                                <th scope="col">Progress</th>
                                {inputVariables.map((inp_var, i) => <th scope="col" key={i}>{inp_var.name}</th>)}
                                {outputVariables.map((out_var, i) => <th scope="col" key={i}>{out_var.name}</th>)}
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {variableTests.map((test, i) => <VariableTest key={test.id + `${i}`} problem={problem} variable={variables[0]} test={test} testIndex={i} isInput={true} totalNum={variableTests.length} flag={flag}/>)}
                        </tbody>
                    </table>
                }
                <button className="btn btn-outline-success btn-sm btn-block" onClick={doAddTest}>+ Test</button>
            </div>
        }
        {!isAdmin && variableTests.length !== 0 &&
        <>
        </>
            // <div>
            //     <h4>My Tests</h4>
            //     <table className="table table-sm">
            //         <thead>
            //             <tr>
            //                 <th scope="col">#</th>
            //                 {/* <th scope="col">Name</th> */}
            //                 <th scope="col">Status</th>
            //                 <th scope="col">Progress</th>
            //                 {inputVariables.map((inp_var, i) => <th scope="col" key={i}>{inp_var.name}</th>)}
            //                 {outputVariables.map((out_var, i) => <th scope="col" key={i}>{out_var.name}</th>)}
            //                 <th scope="col">Action</th>
            //             </tr>
            //         </thead>
            //         <tbody>
            //             {myTests.map(({ test, i }) => <Test key={test.id + `${i}`} index={index} testIndex={i} isInput={true} totalNum={inputTests.length} />)}
            //         </tbody>
            //     </table>
            // </div>
        }
    </div>
}
function mapStateToProps(state, ownProps) {
    const { intermediateUserState, shareDBDocs, users } = state;
    const { isAdmin } = intermediateUserState;
    const myuid = users.myuid as string;

    const username = myuid === "testuid" ? "testuser" : users.allUsers[myuid].username;

    const problemsDoc = shareDBDocs.problems;
    const { problem } = ownProps;
    const { problemDetails } = problem;
    const { variableTests, variables } = problemDetails;
    return update(ownProps, { $merge: {isAdmin, problemsDoc, variables, variableTests, username }});
}
export default connect(mapStateToProps)(VariableTests); 