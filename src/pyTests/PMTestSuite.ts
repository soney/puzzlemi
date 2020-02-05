// tslint:disable:ordered-imports
// import * as Sk from 'skulpt';
export const test=()=>{
    console.log('test')
}
// import { PMAssertion } from './PMTest';
// import '../js/skulpt/skulpt.min.js';
// import '../js/skulpt/skulpt-stdlib.js';
// declare var Sk;

// interface ISkVal<E> {
//     v: E
// };

// if(!Sk.externalLibraries) {
//     Sk.externalLibraries = {};
// }
// Sk.externalLibraries['puzzlemi'] = {
//     path : 'puzzleme_skulpt_lib.js'
// };

export interface IPMTestResult {
    passed: boolean;
    message: string;
}

// export interface IPMTestSuiteResults {
//     results: IPMTestResult[];
//     passedAll: boolean;
// }

// export class PMTestSuite {
//     private static NONE = {};
//     private testResults: IPMTestResult[] = [];
//     private assertions: PMAssertion[] = [];
//     private oldAppendTestResult: any;
//     private oldDisableOutput: any;
//     private oldGetEditorText: any;
//     private oldGetOutput: any;
//     private beforeTests: string = '';
//     private isRunningTests: boolean = false;

//     public constructor(private editorText: string, private outputs: string[]) {

//     }

//     public setBeforeTests(bt: string): void {
//         this.beforeTests = bt;
//     }
//     public addTest(assertion: PMAssertion): void {
//         this.assertions.push(assertion);
//     }
//     public onBeforeRunningTests(): void {
//         this.testResults = [];

//         this.oldAppendTestResult = window.hasOwnProperty('appendTestResult') ? window['appendTestResult'] : PMTestSuite.NONE;
//         window['appendTestResult'] = this.appendTestResult;

//         this.oldDisableOutput = window.hasOwnProperty('disableOutput') ? window['disableOutput'] : PMTestSuite.NONE;
//         window['disableOutput'] = this.disableOutput;

//         this.oldGetEditorText = window.hasOwnProperty('getEditorText') ? window['getEditorText'] : PMTestSuite.NONE;
//         window['getEditorText'] = this.getEditorText.bind(this);

//         this.oldGetOutput = window.hasOwnProperty('getOutput') ? window['getOutput'] : PMTestSuite.NONE;
//         window['getOutput'] = this.getOutput.bind(this);
//     }
//     public getEditorText() {
//         return this.editorText;
//     }
//     public getOutput() {
//         return this.outputs.join('');
//     }
//     public onAfterRanTests(): void {
//         this.isRunningTests = false;
//         if(this.oldDisableOutput === PMTestSuite.NONE) {
//             delete window['disableOutput'];
//         } else {
//             window['disableOutput'] = this.oldDisableOutput;
//         }
//         delete this.oldDisableOutput;

//         if(this.oldAppendTestResult === PMTestSuite.NONE) {
//             delete window['appendTestResult'];
//         } else {
//             window['appendTestResult'] = this.oldAppendTestResult;
//         }
//         delete this.oldAppendTestResult;

//         if(this.oldGetEditorText === PMTestSuite.NONE) {
//             delete window['getEditorText'];
//         } else {
//             window['getEditorText'] = this.oldGetEditorText;
//         }
//         delete this.oldGetEditorText;

//         if(this.oldGetOutput === PMTestSuite.NONE) {
//             delete window['getOutput'];
//         } else {
//             window['getOutput'] = this.oldGetOutput;
//         }
//         delete this.oldGetOutput;
//     }
//     public getTestResults(): IPMTestSuiteResults {
//         return { passedAll: this.testResults.length === this.assertions.length && this.testResults.every((r) => r.passed), results: this.testResults };
//     }
//     public getTests(): PMAssertion[] {
//         return this.assertions;
//     }
//     public setAssertions(assertions: PMAssertion[]): void {
//         this.assertions = assertions;
//     }
//     public getLatestResult(assertionIndex: number): IPMTestResult | null {
//         // const assertionIndex = this.assertions.indexOf(assertion);
//         if(assertionIndex >= 0) {
//             if(this.testResults.length > assertionIndex) {
//                 return this.testResults[assertionIndex];
//             }
//         }
//         return null;
//     }
//     public currentlyRunning(): boolean {
//         return this.isRunningTests;
//     }
//     public getString(): string {
//         const spaces = '        ';
//         const assertionStrings = this.assertions.map((a) => a.getAssertionString());
//         const indentedAssertionStrings = assertionStrings.map((s) => spaces + s);
//         return `import puzzlemi
// from unittest import TestCase

// ${this.beforeTests}

// class PMTestCase(TestCase):
//     def __init__(self):
//         TestCase.__init__(self)
    
//     def testOne(self):
// ${indentedAssertionStrings.join('\n')}
//         return

//     def appendResult(self, res, actual, expected, param):
//         puzzlemi.doFNCall('appendTestResult', res, actual, expected, param)
    
//     def getEditorText(self):
//         return puzzlemi.doFNCallReturnString('getEditorText')

//     def getOutput(self):
//         return puzzlemi.doFNCallReturnString('getOutput')

//     def main(self):
//         for func in self.tlist:
//             try:
//                 self.setUp()
//                 func()
//                 self.tearDown()
//             except Exception as e:
//                 self.appendResult('Error', None, None, e)
//                 self.numFailed += 1

// puzzlemi.doFNCall('disableOutput', True)
// PMTestCase().main()
// puzzlemi.doFNCall('disableOutput', False)
// `;
//     }
//     private disableOutput = (en: ISkVal<any>): void => {
//         this.isRunningTests = Sk.ffi.remapToJs(en);
//     }
//     private appendTestResult = (result: ISkVal<any>, actual: ISkVal<any>, expected: ISkVal<any>, param: ISkVal<string>): void => {
//         const res = Sk.ffi.remapToJs(result);
//         const message: string = Sk.ffi.remapToJs(param);
//         const passed: boolean = res === 'Error' ? false : !!res;

//         this.testResults.push({ passed, message });
//     }
// }