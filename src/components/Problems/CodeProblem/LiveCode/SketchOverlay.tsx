import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import { updateSketch } from '../../../../actions/sharedb_actions';
import { CompactPicker } from 'react-color';
const SketchOverlay = ({ dispatch, problemsDoc, isAdmin, sketch, problem, isInstructor }) => {
    const [activated, setActivated] = React.useState(false);
    const [erasing, setErasing] = React.useState(false);
    const [sketchData, setSketchData] = React.useState(sketch);
    const [color, setColor] = React.useState('#000000');
    const [displayColorPicker, setDisplayColorPicker] = React.useState(false);

    const toggleErase = (e) => {
        if(e.target.id === "erase") setErasing(true);
        if(e.target.id === "pen") setErasing(false);
    }

    const handleColorClick = () => {
        setDisplayColorPicker(!displayColorPicker);
    }

    const handleColorClose = () => {
        setDisplayColorPicker(false);
    }

    const handleColorChange = (color) => {
        setColor(color.hex)
    }

    const sketchClear = () => {
        setSketchData([]);
        dispatch(updateSketch(problem.id, []));
    }
    const renderDots = () => {
        if (isInstructor) {
            return sketchData.map((val, idx) => {
                if (sketchData[idx + 1] !== false && sketchData[idx + 1] !== undefined) {
                    let val2 = sketchData[idx + 1]
                    return <line x1={val[0]} y1={val[1]} x2={val2[0]} y2={val2[1]} stroke={val[2]} stoke-width="1" key={'line_' + idx.toString()} />
                } else {
                    return undefined
                }

            })
        } else {
            return sketchData.map((val, idx) => {
                if (sketchData[idx + 1] !== false && sketchData[idx + 1] !== undefined) {
                    let val2 = sketchData[idx + 1]
                    return <line x1={val[0]} y1={val[1]} x2={val2[0]} y2={val2[1]} stroke={val[2]} stoke-width="1" key={'line_' + idx.toString()} />
                } else {
                    return undefined
                }
            })
        }
    }

    const svgOnMouseMove = (e) => {
        if (activated && isInstructor) {
            if (erasing === false) {
                let newSketch = sketchData.slice(0)
                newSketch.push([e.nativeEvent.offsetX, e.nativeEvent.offsetY, color])
                setSketchData(newSketch)
            } else {
                let newSketch = sketchData.slice(0)
                for (var i = newSketch.length - 1; i >= 0; i--) {
                    var point = newSketch[i]
                    var diff1 = point[0] - e.nativeEvent.offsetX
                    var diff2 = point[1] - e.nativeEvent.offsetY
                    if (diff1 * diff1 + diff2 * diff2 < 100) {
                        if (newSketch[i - 1] === false || newSketch[i + 1] === false) {
                            newSketch.splice(i, 1)
                        } else {
                            newSketch[i] = false
                        }

                    }
                }
                setSketchData(newSketch);
            }
        }
    }

    const svgOnMouseUp = () => {
        if (activated && isInstructor) {
            var newSketch = sketchData.slice(0)
            if (erasing === false) {
                newSketch.push(false)
            }
            setSketchData(newSketch);
            setActivated(false);
            dispatch(updateSketch(problem.id, sketchData));
        }
    }

    const svgOnMouseDown = (e) => {
        if (!activated && isInstructor) {
            if (erasing === false) {
                let newSketch = sketchData.slice(0)
                if (newSketch[newSketch.length - 1] !== false) {
                    newSketch.push(false)
                }
                newSketch.push([e.nativeEvent.offsetX, e.nativeEvent.offsetY, color])
                setSketchData(newSketch);
                setActivated(true);
            } else {
                setActivated(true);
            }

        }

    }
    return <div style={{ top: '0', height: '100%', position: 'absolute' }} className={(isInstructor ? 'sketchContainerAdmin' : 'sketchContainerStudent')} >
        <svg
            className={(isInstructor ? 'sketchAdmin' : 'sketchStudent') + (isInstructor ? ' sketchMode' : '')}
            onMouseDown={svgOnMouseDown} onMouseUp={svgOnMouseUp} onMouseMove={svgOnMouseMove}>
            {renderDots()}
        </svg>
        {isInstructor &&
            <div className="instructor-sketch-tools btn-group btn-group-toggle" style={{ float: 'right', top: 'calc(100% - 17px)' }}>
                <label className={"btn btn-sm " + (!erasing ? "btn-primary" : "btn-outline-primary")} onClick={toggleErase}>
                    <input type="radio" name="pen_erase" id="pen" defaultChecked/> Pen
                        </label>
                <label className={"btn btn-sm " + (erasing ? "btn-secondary" : "btn-outline-secondary")} onClick={toggleErase}>
                    <input type="radio" name="pen_erase" id="erase" /> Erase
                        </label>
                <div className='colorSwatch' onClick={handleColorClick}>
                    <div className='colorBox' style={{ backgroundColor: color }}></div>
                </div>
                <button className='btn btn-sm btn-danger' onClick={sketchClear}>
                    Clear Sketch
                </button>
                {displayColorPicker &&
                    <div className='popoverColor'>
                        <div className='coverColor' onClick={handleColorClose} />
                        <CompactPicker color={color} onChangeComplete={handleColorChange} />
                    </div>
                }
            </div>
        }
    </div>
}

function mapStateToProps(state, ownProps) {
    const { intermediateUserState, shareDBDocs, users } = state;
    const { problem } = ownProps;
    const { problemDetails } = problem;
    const { liveCode } = problemDetails;
    const { sketch } = liveCode;
    const { isAdmin } = intermediateUserState;
    const problemsDoc = shareDBDocs.problems;
    const myuid = users.myuid as string;
    const { isInstructor } = users.allUsers[myuid];

    return update(ownProps, { $merge: { isAdmin, problemsDoc, sketch, isInstructor } });
}
export default connect(mapStateToProps)(SketchOverlay);