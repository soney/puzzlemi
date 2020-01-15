import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';

const Result = ({ result, tag, id, failedTest }) => {
    const failed_results = result.results.filter(i => i.passed === false);
    const messages = failed_results.map(i => i.message);
    return <div>
        {(tag === "default") &&
            <div>
                {result.passedAll === true &&
                    <div className="alert alert-success" role="alert">
                        You passed the default test!
                    </div>
                }
                {(result.output || result.errors.length > 0 || messages.length > 0) &&
                    <div>
                        <pre className={'codeOutput' + ((result.errors.length > 0 || messages.length > 0) ? ' alert alert-danger' : ' no-error')}>
                            {result.output}
                            {result.errors.join('\n')}
                            {messages.length > 0 ? "You failed the default test." : ""}
                            {/* {messages.join('\n')} */}
                        </pre>
                    </div>
                }
            </div>
        }
        {(tag === "test") &&
            <div >
                {/* <h5 >
                    Test #{id.slice(-4)}
                </h5> */}
                <div className="card">
                    <h5 className="card-header">
                        Test #{id.slice(-4)}
                    </h5>
                    <ul className="list-group list-group-flush">
                        <li className="list-group-item">
                            <div>Given Variables</div>
                            {failedTest.input.map((variable, i) => <div key={i}>{variable.name} = {variable.value}</div>)}
                        </li>
                        <li className="list-group-item">
                            <div>Expected Variables</div>
                            {failedTest.output.map((variable, i) =>
                                <div key={i}>
                                    {result.results[i] && result.results[i].passed
                                        ? <div className="result-success">{variable.name} = {variable.value}</div>
                                        : <div className="result-fail">{variable.name} = {variable.value}</div>
                                    }
                                </div>)}
                        </li>
                        {(result.output || result.errors.length > 0) &&
                            <li className="list-group-item">
                                <pre className={'codeOutput' + (result.errors.length > 0 ? ' alert alert-danger' : ' no-error')}>
                                    {result.output}
                                    {result.errors.join('\n')}
                                </pre>
                            </li>
                        }
                    </ul>
                </div>
            </div>
        }
    </div>;
}
function mapStateToProps(state, ownProps) {
    return update(ownProps, {});
}
export default connect(mapStateToProps)(Result); 