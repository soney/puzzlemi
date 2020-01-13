import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import Test from './Test';
import { addTest } from '../actions/sharedb_actions';

const Tests = ({ index, inputTests, inputVariables, outputVariables,verifiedTests, isAdmin, userInfo, doc, dispatch, uid }) => {
    const doAddTest = () => {
        dispatch(addTest(index, uid, isAdmin));
    }

    let myTests = [] as any[];
    inputTests.forEach(({ test, i }) => {
        if (test.author === userInfo.username) myTests.push({ test, i });
    })

    return <div className='tests'>
        {isAdmin &&
            <div>
                <h4>Tests</h4>
                {inputTests.length!==0 &&
                <table className="table table-sm">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col" data-field="name">
                                <div>Name</div>
                                {/* <div className="filter-control">
                                    <input type="text" className="form-control bootstrap-table-filter-control-name" />
                                </div> */}
                            </th>
                            <th scope="col">Status</th>
                            <th scope="col">Progress</th>
                            {inputVariables.map((inp_var, i) => <th scope="col" key={i}>{inp_var.name}</th>)}
                            {outputVariables.map((out_var, i) => <th scope="col" key={i}>{out_var.name}</th>)}
                            <th scope="col">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inputTests.map(({ test, i }) => <Test key={test.id + `${i}`} index={index} testIndex={i} isInput={true} totalNum={inputTests.length} />)}
                    </tbody>
                </table>
                }
                {/* <div className="accordion" id="testlist">
            {inputTests && inputTests.length
            ? inputTests.map(({test, i})=> <Test key={test.id+`${i}`} index={index} testIndex={i} isInput={true} totalNum={inputTests.length}/>)
            : <div className='no-tests'>(no tests)</div>                
            }
            </div>     */}
                <button className="btn btn-outline-success btn-sm btn-block" onClick={doAddTest}>+ Test</button>
            </div>
        }
        {!isAdmin && myTests.length!==0 &&
            <div>
                <h4>My Tests</h4>
                <table className="table table-sm">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            {/* <th scope="col">Name</th> */}
                            <th scope="col">Status</th>
                            <th scope="col">Progress</th>
                            {inputVariables.map((inp_var, i) => <th scope="col" key={i}>{inp_var.name}</th>)}
                            {outputVariables.map((out_var, i) => <th scope="col" key={i}>{out_var.name}</th>)}
                            <th scope="col">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {myTests.map(({ test, i }) => <Test key={test.id + `${i}`} index={index} testIndex={i} isInput={true} totalNum={inputTests.length} />)}
                    </tbody>
                </table>
                {/* <div className="accordion" id="testlist">
        {myTests && myTests.length
        ? myTests.map(({test, i})=> <Test key={test.id+`${i}`} index={index} testIndex={i} isInput={true} totalNum={myTests.length}/>)
        : <div className='no-tests'>(no tests)</div>                
        }
        </div>     */}
                {/* <button className="btn btn-outline-success btn-sm btn-block" onClick={doAddTest}>+ Test</button> */}
            </div>
        }
    </div>
}
function mapStateToProps(state, ownProps) {
    const { user, problems, doc } = state;
    const { isAdmin, userInfo } = user;
    const problem = problems[ownProps.index];
    const { tests, variables } = problem;
    let verifiedT: any[] = [];
    tests.forEach((test, i) => {
        if (test.verified === true) verifiedT.push({ i, test });
    });

    let inputT: any[] = [];
    if (isAdmin) {
        tests.forEach((test, i) => {
            inputT.push({ i, test });
        })
    }
    else {
        tests.forEach((test, i) => {
            if (test.author === user.userInfo.username) inputT.push({ i, test });
        })
    }

    let inputV: any[] = [];
    let outputV: any[] = [];
    variables.forEach(variable => {
        if(variable.type==='input') inputV.push(variable);
        if(variable.type==='output') outputV.push(variable);
    })
    const verifiedTests = verifiedT;
    const inputTests = inputT;
    const uid = user.id;
    const inputVariables = inputV;
    const outputVariables = outputV;

    return update(ownProps, { uid: { $set: uid }, userInfo: {$set: userInfo}, isAdmin: { $set: isAdmin }, inputVariables:{$set: inputVariables}, outputVariables:{$set: outputVariables}, verifiedTests: { $set: verifiedTests }, inputTests: { $set: inputTests }, doc: { $set: doc } });
}
export default connect(mapStateToProps)(Tests); 