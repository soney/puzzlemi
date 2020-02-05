export const test=()=>{
    console.log('example')
};
// import * as React from 'react';
// import { connect } from "react-redux";
// import update from 'immutability-helper';
// import Variable from './Variable';
// // import { addVariable } from '../../../../actions/sharedb_actions';


// const Variables = ({ index, isAdmin, problem, dispatch, variables }) => {
//     const doAddTestVariable = () => {
//         // dispatch(addVariable(problem.id));
//     }

//     return <div className='test-template'>
//         {isAdmin && <div>
//             <table className="table">
//                 <thead>
//                     <tr>
//                         <th>Type</th>
//                         <th>Variable Name</th>
//                         <th>Default Value</th>
//                         <th />
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {variables && variables.length
//                         ? variables.map((variable, i) => <Variable key={i} problem={problem} variableIndex={i} variable={variable} />)
//                         : <tr><td colSpan={6} className='no-tests'>(no variables)</td></tr>
//                     }

//                     <tr>
//                         <td colSpan={6}>
//                             <button className="btn btn-outline-success btn-sm btn-block" onClick={doAddTestVariable}>+ Variable</button>
//                         </td>
//                     </tr>
//                 </tbody>
//             </table>
//         </div>}
//     </div>
// }
// function mapStateToProps(state, ownProps) {
//     const { intermediateUserState, shareDBDocs } = state;
//     const { isAdmin } = intermediateUserState;
//     const problemsDoc = shareDBDocs.problems;
//     const { problem } = ownProps;
//     const { problemDetails } = problem;
//     const { variables } = problemDetails;
//     return update(ownProps, { $merge: { isAdmin, problemsDoc, variables } });
// }
// export default connect(mapStateToProps)(Variables); 