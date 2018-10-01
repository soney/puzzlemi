import * as React from "react";

interface IPMTestDisplayProps {
};

interface IPMTestDisplayState {
};

export class PMProblem extends React.Component<IPMTestDisplayProps, IPMTestDisplayState> {
    public static defaultProps: IPMTestDisplayProps = {
    };
    constructor(props:IPMTestDisplayProps, state:IPMTestDisplayState) {
        super(props, state);
        this.state = {
        };
    };

    public render():React.ReactNode {
        return <div className="container">
            <div className="row">
                <div className="col">
                    abc
                </div>
            </div>
        </div>
    };
};