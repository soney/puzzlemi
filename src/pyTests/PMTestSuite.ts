import * as Sk from 'skulpt';
import { PMAssertEqual, PMAssertion } from './PMTest';

interface ISkVal<E> {
    v: E
};

if(!Sk.externalLibraries) {
    Sk.externalLibraries = {};
}
Sk.externalLibraries['puzzlemi'] = {
    path : 'puzzleme_skulpt_lib.js'
};

export interface IPMTestResult {
    passed: boolean;
    message: string;
}

export interface IPMTestSuiteResults {
    results: IPMTestResult[];
    passedAll: boolean;
}

export class PMTestSuite {
    private testResults: IPMTestResult[] = [];
    private assertions: PMAssertion[] = [];
    private oldAppendTestResult: any;
    public constructor() {
        this.assertions.push(new PMAssertEqual('x', '1', '"x is 1"'));
        this.assertions.push(new PMAssertEqual('x', '2', '"x is 2"'));
    }
    public onBeforeRunningTests(): void {
        this.testResults = [];
        this.oldAppendTestResult = window['appendTestResult'];
        window['appendTestResult'] = this.appendTestResult;
    }
    public onAfterRanTests(): void {
        window['appendTestResult'] = this.oldAppendTestResult;
        delete this.oldAppendTestResult;
    }
    public getTestResults(): IPMTestSuiteResults {
        return { passedAll: this.testResults.every((r) => r.passed), results: this.testResults };
    }
    public getString(): string {
        const spaces = '        ';
        const assertionStrings = this.assertions.map((a) => a.getAssertionString());
        const indentedAssertionStrings = assertionStrings.map((s) => spaces + s);
        return `import puzzlemi
from unittest import TestCase

class PMTestCase(TestCase):
    def __init__(self):
        TestCase.__init__(self)
    
    def testOne(self):
${indentedAssertionStrings.join('\n')}
        return

    def appendResult(self, res, actual, expected, param):
        puzzlemi.doFNCall('appendTestResult', res, actual, expected, param)

    def main(self):
        for func in self.tlist:
            try:
                self.setUp()
                func()
                self.tearDown()
            except Exception as e:
                self.appendResult('Error', None, None, e)
                self.numFailed += 1

PMTestCase().main()
`;
    }
    private appendTestResult = (result: ISkVal<any>, actual: ISkVal<any>, expected: ISkVal<any>, param: ISkVal<string>): void => {
        const passed = Sk.ffi.remapToJs(result);
        const message = Sk.ffi.remapToJs(param);
        this.testResults.push({ passed, message });
    }
}