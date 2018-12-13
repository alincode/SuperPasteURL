const vscode = require('vscode');
const copyPaste = require('copy-paste');
const getTitle = require('get-title');
const request = require('request');
const hyperquest = require('hyperquest');

let { Position, Range } = vscode;
let baseRequest;

function activate(context) {
    configureHttpRequest();
    vscode.workspace.onDidChangeConfiguration(e => configureHttpRequest());

    let paster = new Paster();
    let disposable = vscode.commands.registerCommand('extension.AwesomePasteURL', function () {
        vscode.window.showInformationMessage('Hello World!');
        paster.paste();
    });

    context.subscriptions.push(disposable);
}

function configureHttpRequest() {
    let httpSettings = vscode.workspace.getConfiguration('http');
    if (httpSettings != undefined) {
        let proxy = `${httpSettings.get('proxy')}`

        if (proxy != undefined && proxy.length != 0) {
            if (!proxy.startsWith("http")) {
                proxy = "http://" + proxy
            }
            baseRequest = request.defaults({ 'proxy': proxy });
        }
    }

    if (baseRequest == undefined) {
        baseRequest = hyperquest;
    }
}

exports.activate = activate;

function deactivate() { }

exports.deactivate = deactivate;

class MarkdownLinkFormatter {
    formatLink(text, url) {
        return '[' + text + ']' + '(' + url + ')';
    }
}

const Paster = class Paster {

    constructor() {
        this._statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    }

    paste() {
        copyPaste.paste((error, content) => {
            if (content) {
                this.generateMarkDownStyleLink(content)
            } else {
                this.showMessage('[PasteURL]: Not a URL.')
            }
        })
    }
    showMessage(content) {
        this._statusBarItem.text = "Paste URL: " + content
        this._statusBarItem.show()
        setTimeout(() => {
            this._statusBarItem.hide()
        }, 3000);
    }
    generateMarkDownStyleLink(url) {
        var document = vscode.window.activeTextEditor.document;
        var selection = vscode.window.activeTextEditor.selection;
        var selectedText = document.getText(selection);
        var isSelectionEmpty = selectedText.length == 0;

        if (isSelectionEmpty) {
            this.composeTitleAndSelection(url);
        } else {
            this.replaceSelectionWithTitleURL(selection, url);
        }
    }

    replaceSelectionWithTitleURL(selection, url) {
        var text = vscode.window.activeTextEditor.document.getText(selection)
        var formattedLink = this.getLinkFormatter().formatLink(text, url)
        vscode.window.activeTextEditor.edit((editBuilder) => {
            editBuilder.replace(selection, formattedLink);
        })
    }
    getLinkFormatter() {
        return new MarkdownLinkFormatter();
    }
    
    composeTitleAndSelection(url) {
        var _this = this
        var headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Safari/604.1.38"
        }
        if (!url.startsWith("http")) {
            url = "http://" + url
        }

        var date = new Date()
        var seconds = date.getSeconds()
        var padding = seconds < 10 ? '0' : ''
        var timestamp = date.getMinutes() + ':' + padding + seconds
        var fetchingTitle = 'Getting Title at ' + timestamp
        var formattedLink = this.getLinkFormatter().formatLink(fetchingTitle, url)
        _this.writeToEditor(formattedLink).then(function (result) {
            // Editing is done async, so we need to make sure previous editing is finished
            const stream = baseRequest(url, { headers: headers }, function (err, response) {
                if (err) _this.replaceWith(fetchingTitle, 'Error Happened')
            })

            getTitle(stream).then(title => {
                title = _this.processTitle(title, url)
                _this.replaceWith(fetchingTitle, title)
            })
        });
    }

    processTitle(title, url) {
        if (title == undefined) {
            return url
        }
        return title
    }

    replaceWith(originalContent, newContent) {
        let document = vscode.window.activeTextEditor.document
        var range;
        var line;
        for (var i = 0; i < document.lineCount; i++) {
            line = document.lineAt(i).text

            if (line.includes(originalContent)) {
                range = document.lineAt(i).range
                break
            }
        }

        if (range == undefined) {
            return
        }

        var start = new Position(range.start.line, line.indexOf(originalContent));
        var end = new Position(range.start.line, start.character + originalContent.length);
        var newRange = new Range(start, end);
        vscode.window.activeTextEditor.edit((editBuilder) => {
            editBuilder.replace(newRange, newContent);
        })
    }

    writeToEditor(content) {
        let startLine = vscode.window.activeTextEditor.selection.start.line;
        var selection = vscode.window.activeTextEditor.selection
        let position = new vscode.Position(startLine, selection.start.character);
        return vscode.window.activeTextEditor.edit((editBuilder) => {
            editBuilder.insert(position, content);
        });
    }
}

exports.Paster = Paster;