export abstract class PMAssertion {
    public abstract getAssertionString(): string;
}
export class PMAssertEqual extends PMAssertion {
    constructor(private expectedExpression: string, private actualExpression: string, private description: string) {
        super();
    }
    public getExpectedExpression(): string { return this.expectedExpression; }
    public getActualExpression(): string { return this.actualExpression; }
    public getDescription(): string { return this.description; }
    public getAssertionString(): string {
        return `self.assertEqual(${this.getExpectedExpression()}, ${this.getActualExpression()}, ${this.getDescription()})`;
    }
}