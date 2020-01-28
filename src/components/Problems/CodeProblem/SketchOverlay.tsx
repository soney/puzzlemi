import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import { updateSketch } from '../../../actions/sharedb_actions';
import { CompactPicker } from 'react-color';

interface SketchOverlayProps {
    sketch?: any[];
    isAdmin: boolean;
    id: string;
    dispatch: any;
}

interface SketchOverlayState {
    sketch: any[];
    drawing: boolean;
    activated: boolean;
    erasing: boolean;
    color: string;
    displayColorPicker: boolean;
}

class SketchOverlay extends React.Component<SketchOverlayProps, SketchOverlayState>{
    public static defaultProps: SketchOverlayProps = {
        sketch: [],
        isAdmin: false,
        id: '-1',
        dispatch: undefined,
    }

    constructor(props: SketchOverlayProps, state: SketchOverlayState) {
        super(props, state);
        this.state = {
            sketch: [],
            drawing: true,
            activated: false,
            erasing: false,
            color: '#000000',
            displayColorPicker: false,
        };
    };

    svgOnMouseDown(e) {
        if (!this.state.activated && this.props.isAdmin) {
            if (this.state.erasing === false) {
                var sketch = this.state.sketch.slice(0)
                sketch.push([e.nativeEvent.offsetX, e.nativeEvent.offsetY, this.state.color])
                this.setState({ activated: true, sketch: sketch })
            } else {
                this.setState({ activated: true, })
            }

        }

    }

    svgOnMouseMove(e) {
        if (this.state.activated && this.props.isAdmin) {
            if (this.state.erasing === false) {
                var sketch = this.state.sketch.slice(0)
                sketch.push([e.nativeEvent.offsetX, e.nativeEvent.offsetY, this.state.color])
                this.setState({ sketch: sketch })
            } else {
                var sketch_t = this.state.sketch.slice(0)
                for (var i = sketch_t.length - 1; i >= 0; i--) {
                    var point = sketch_t[i]
                    var diff1 = point[0] - e.nativeEvent.offsetX
                    var diff2 = point[1] - e.nativeEvent.offsetY
                    if (diff1 * diff1 + diff2 * diff2 < 100) {
                        sketch_t.splice(i, 1)
                    }
                }

                this.setState({ sketch: sketch_t })
            }
        }
    }

    svgOnMouseUp() {
        if (this.state.activated && this.props.isAdmin) {
            this.setState({ activated: false })
            this.props.dispatch(updateSketch(this.props.id, this.state.sketch))
        }
    }
    toggleErase(val) {
        this.setState({ erasing: val })
    }

    handleColorClick() {
        this.setState({ displayColorPicker: !this.state.displayColorPicker })
    }

    handleColorClose() {
        this.setState({ displayColorPicker: false })
    }

    handleColorChange(color) {
        this.setState({ color: color.hex })
    }

    sketchClear() {
        this.setState({ sketch: [] })
        this.props.dispatch(updateSketch(this.props.id,[]))
    }

    renderDots() {
        if (this.props.isAdmin) {
            return this.state.sketch.map((val, idx) => {
                return <circle cx={val[0]} cy={val[1]} fill={val[2]} r="1" key={'dot_' + idx.toString()} />
            })
        } else {
            return this.props['problem']['problemDetails']['sketch'].map((val, idx) => {
                return <circle cx={val[0]} cy={val[1]} fill={val[2]} r="1" key={'dot_' + idx.toString()} />
            })
        }
    }

    public componentDidMount() {
        if (this.props.isAdmin) {
            this.setState({ sketch: this.props['problem']['problemDetails']['sketch'] })
        }
    }

    public render(): React.ReactNode {
        return <div><svg className={((this.props.isAdmin) ? 'sketchAdmin' : 'sketchStudent') + ((this.props.isAdmin) ? ' sketchMode' : '')}
            onMouseDown={this.svgOnMouseDown.bind(this)} onMouseUp={this.svgOnMouseUp.bind(this)} onMouseMove={this.svgOnMouseMove.bind(this)}>
            {this.renderDots()}

        </svg>
            {this.props.isAdmin &&
                <div className="btn-group btn-group-toggle" data-toggle="buttons" style={{ float: 'right', top: '300px' }}>
                    <label className={"btn btn-sm " + (!this.state.erasing ? "btn-primary" : "btn-outline-primary")} onClick={this.toggleErase.bind(this, false)}>
                        <input type="radio" name="pen_erase" id="pen" /> Pen
                    </label>
                    <label className={"btn btn-sm " + (this.state.erasing ? "btn-secondary" : "btn-outline-secondary")} onClick={this.toggleErase.bind(this, true)}>
                        <input type="radio" name="pen_erase" id="erase" /> Erase
                    </label>
                    <div className='colorSwatch' onClick={this.handleColorClick.bind(this)}>
                        <div className='colorBox' style={{ backgroundColor: this.state.color }}></div>
                    </div>
                    <div className='btn btn-sm btn-danger' onClick={this.sketchClear.bind(this)}>
                        Clear Sketch
                    </div>
                    {this.state.displayColorPicker && <div className='popoverColor'>
                        <div className='coverColor' onClick={this.handleColorClose.bind(this)} />
                        <CompactPicker color={this.state.color} onChangeComplete={this.handleColorChange.bind(this)} />
                    </div>}
                </div>}
        </div>
    }
}

function mapStateToProps(state, ownProps) {
    const { intermediateUserState, shareDBDocs } = state;
    const { problem } = ownProps;
    const { problemDetails } = problem;
    const { sketch } = problemDetails;
    const { isAdmin } = intermediateUserState;
    const problemsDoc = shareDBDocs.problems;

    return update(ownProps, { $merge: { isAdmin, problemsDoc, sketch } });
}
export default connect(mapStateToProps)(SketchOverlay);