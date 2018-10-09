import * as React from 'react';
import { connect } from "react-redux";
import Problem from './Problem';

const Problems = ({ sdbDoc, problems }) => {
    return <ul className='problems'>
        {problems && problems.length
        ? problems.map((problem, index) => {
            return <Problem key={problem.id + `${index}`} index={index} sdbDoc={sdbDoc} problem={problem} />;
            })
        : <li className='container no-problems'>(no problems yet)</li>}
    </ul>
}
function mapStateToProps(state) {
    const { problems } = state;
    return { problems };
}
export default connect(mapStateToProps)(Problems);
