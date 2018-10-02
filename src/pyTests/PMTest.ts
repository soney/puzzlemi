export interface ISerializedAssertion {
    type: string,
    description: string,
    data: any
}


export abstract class PMAssertion {
    public static deserialize(sa: ISerializedAssertion): PMAssertion | null {
        const { type, data, description } = sa;
        if(type === 'equal') {
            const { actual, expected } = data;
            return new PMAssertEqual(actual, expected, description);
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
    constructor(private actualExpression: string, private expectedExpression: string, description: string) {
        super(description);
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
                actual: this.getActualExpression(),
                expected: this.getExpectedExpression()
            },
            description: this.getDescription(),
            type: 'equal'
        };
    }
}