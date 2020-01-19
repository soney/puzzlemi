import { ICodeTest } from "../reducers/problems";

export interface ISerializedAssertion {
    type: string,
    data: ICodeTest
}

export abstract class PMAssertion {
    public static deserialize(sa: ISerializedAssertion): PMAssertion | null {
        const { type, data } = sa;
        if(type === 'equal') {
            const { actual, expected, description, id } = data;
            return new PMAssertEqual(id, actual, expected, description);
        }
        return null;
    }
    constructor(private description: string) { }
    public abstract getAssertionString(): string;
    public abstract getActualExpression(): string;
    public abstract setActualExpression(e: string): void;
    public abstract getExpectedExpression(): string;
    public abstract setExpectedExpression(e: string): void;
    public abstract serialize(): ISerializedAssertion;
    public getDescription(): string { return this.description; }
    public setDescription(description: string): void {
        this.description = description;
    }
    protected escapeString(s: string): string {
        return s.replace(new RegExp('"', 'g'), '\\"');
    }
}
export class PMAssertEqual extends PMAssertion {
    constructor(private id: string, private actualExpression: string, private expectedExpression: string, description: string) {
        super(description);
    }
    public getID(): string {
        return this.id;
    }
    public getExpectedExpression(): string { return this.expectedExpression; }
    public setExpectedExpression(expected: string): void {
        this.expectedExpression = expected;
    }
    public getActualExpression(): string { return this.actualExpression; }
    public setActualExpression(actual: string): void {
        this.actualExpression = actual;
    }
    public getAssertionString(): string {
        return `self.assertEqual(${this.getExpectedExpression()}, ${this.getActualExpression()}, "${this.escapeString(this.getDescription())}")`;
    }
    public serialize(): ISerializedAssertion {
        return {
            data: {
                id: this.getID(),
                description: this.getDescription(),
                actual: this.getActualExpression(),
                expected: this.getExpectedExpression()
            },
            type: 'equal'
        };
    }
}