/* global suite, test */

//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
const assert = require('assert');

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
// const vscode = require('vscode');
const myExtension = require('../extension');

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", function() {

    test("Get title from undefined", () => {
        var paster = new myExtension.Paster()
        var URL = "https://google.com"
        var title = paster.processTitle(undefined, URL)
        assert.equal(title, URL)
    })

    test("Get title normally", () => {
        var paster = new myExtension.Paster()
        var URL = "https://google.com"
        var title = "Google"
        var titleProcessed = paster.processTitle(title, URL)
        assert.equal(title, titleProcessed)
    })
});