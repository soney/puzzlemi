import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';

const Result = ({ result, tag, id }) => {
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
                            {messages.join('\n')}
                        </pre>
                    </div>
                }
            </div>
        }
        {(tag === "test") &&
            <div >
                <h5 >
                    Test #{id.slice(-4)}
                </h5>
                <div >
                    {(result.output || result.errors.length > 0 || messages.length > 0) &&
                        <div>
                            <pre className={'codeOutput' + ((result.errors.length > 0 || messages.length > 0) ? ' alert alert-danger' : ' no-error')}>
                                {result.output}
                                {result.errors.join('\n')}
                                {messages.join('\n')}
                            </pre>
                        </div>
                    }
                </div>
            </div>
        }
    </div>;
}
function mapStateToProps(state, ownProps) {
    return update(ownProps, {});
}
export default connect(mapStateToProps)(Result); 