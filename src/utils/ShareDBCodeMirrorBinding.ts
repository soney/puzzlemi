import { SDBSubDoc, } from "sdb-ts";

class ShareDBCodeMirrorBinding {
    private editorDoc: CodeMirror.Doc;
    private suppressChanges: boolean = false;
    constructor(private codeMirror: CodeMirror.Editor, private doc: SDBSubDoc<string>) {
        this.editorDoc = codeMirror.getDoc();
        this.doc.subscribe(this.onSDBDocEvent);
        this.codeMirror.on('change', this.onCodeMirrorChange);
    }

    public destroy(): void {
        this.codeMirror.off('change', this.onCodeMirrorChange);
        this.doc.unsubscribe(this.onSDBDocEvent);
    }

    private onSDBDocEvent = (type, ops, source): void => {
        if(type === null) {
            const data = this.doc.getData() as string;
            this.codeMirror.setValue(data);
        } else if(type === 'op') {
            if(source !== this) {
                ops.forEach((op) => this.applyOp(op));
            }
        }
    };

    private onCodeMirrorChange = (codeMirror: CodeMirror.Editor, change: CodeMirror.EditorChange): void => {
        if(!this.suppressChanges) {
            const ops = this.createOpFromChange(change);
            // const docOp = [{p: [], t: 'text', o: op}];
            this.doc.submitOp(ops, this);
        }
    }

    private assertValue(): void {
        const editorValue = this.codeMirror.getValue();
        const expectedValue = this.doc.getData() as string;
        if(editorValue !== expectedValue) {
            console.error(`Expected value (${expectedValue}) did not match editor value (${editorValue})`);
            this.codeMirror.setValue(expectedValue);
        }
    };

    private applyOp(op): void {
        this.suppressChanges = true;
        const editorDoc = this.editorDoc;
        const {si, sd, p} = op;
        const [ index ] = p;

        if(si) {
            editorDoc.replaceRange(si, editorDoc.posFromIndex(index));
        } else if(sd) {
            const from = editorDoc.posFromIndex(index);
            const to = editorDoc.posFromIndex(index + sd.length);
            editorDoc.replaceRange('', from, to);
        }
        this.assertValue();
        this.suppressChanges = false;
    }

    private createOpFromChange(change) {
        const op: any[] = [];
        let textIndex: number = 0;
        const startLine = change.from.line;

        for (let i: number = 0; i < startLine; i++) {
            textIndex += this.codeMirror.lineInfo(i).text.length + 1; // + 1 for '\n'
        }

        textIndex += change.from.ch;


        if (change.to.line !== change.from.line || change.to.ch !== change.from.ch) {
            const removed  = change.removed.join('\n');
            op.push({p: [textIndex], sd: removed});
        }

        if (change.text) {
            const text = change.text.join('\n');
            if (text) {
                op.push({p: [textIndex], si: text });
            }
        }

        return op;
    };
}

export default ShareDBCodeMirrorBinding;