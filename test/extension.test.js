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
suite('Extension Tests', function () {
    
    test('get google title', async () => {
        let url = 'https://www.google.com.tw/';
        var paster = new myExtension.Paster();
        var actualTitle = await paster.getYoutubeTitle(url);
        assert.equal(actualTitle, 'How to Talk Like a Native Speaker | Marc Green | TEDxHeidelberg - YouTube');
    });

    test('get youtube title', async () => {
        let url = 'https://www.youtube.com/watch?v=Ti_gFEe1XNY';
        var paster = new myExtension.Paster();
        var actualTitle = await paster.getYoutubeTitle(url);
        assert.equal(actualTitle, 'How to Talk Like a Native Speaker | Marc Green | TEDxHeidelberg - YouTube');
    });
});