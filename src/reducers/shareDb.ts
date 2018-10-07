import { EventTypes, EmptyProblem } from '../actions'
import update from 'immutability-helper';
import { SDBClient, SDBDoc } from 'sdb-ts';
import { IPuzzleSet } from '../components/App';

const ws: WebSocket = new WebSocket(`ws://localhost:8000`);
// const ws: WebSocket = new WebSocket(`ws://${window.location.host}`);
const sdbClient: SDBClient = new SDBClient(ws);
const sdbDoc: SDBDoc<IPuzzleSet> = sdbClient.get('puzzles', 'p');

sdbDoc.createIfEmpty({
    problems: []
});
sdbDoc.subscribe((type: string, ops: any[]) => {
    if(type === null) {
        // const data = sdbDoc.getData();
        // setState({ problems: data.problems });
    } else if (type === 'op') {
        ops.forEach((op) => {
            const { p } = op;
            const relPath = SDBDoc.relative(['problems'], p);
            if(relPath) {
                // const data = sdbDoc.getData();
                // this.setState({ problems: data.problems });
            }
        });
    }
});

export const shareDb = (state: SDBDoc<IPuzzleSet>, action: any) => {
    switch(action.type) {
        case EventTypes.ADD_PROBLEM:
            // modify sharedb
            const newProblem = update(EmptyProblem, {});
            state.submitListPushOp(['problems'], newProblem);
        default:
            return state;
    }
}

// export default shareDb