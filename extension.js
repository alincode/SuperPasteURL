const vscode = require('vscode');
const copyPaste = require('copy-paste');
const getTitleAtUrl = require('get-title-at-url');
const request = require('request-promise');
let { Position, Range } = vscode;

function activate(context) {
    let paster = new Paster();
    let disposable = vscode.commands.registerCommand('extension.SuperPasteURL', async () => {
        await paster.paste();
    });

    context.subscriptions.push(disposable);
}

exports.activate = activate;

function deactivate() { }
exports.deactivate = deactivate;

const Paster = class Paster {

    constructor() {
        this._statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    }

    async paste() {
        try {
            let content = await copyPaste.paste();
            if (content) {
                await this.generateMarkDownStyleLink(content);
            } else {
                vscode.window.showInformationMessage('[PasteURL]: Not a URL.');
            }
        } catch (error) {
            throw error;
        }
    }

    async generateMarkDownStyleLink(url) {
        var document = vscode.window.activeTextEditor.document;
        var selection = vscode.window.activeTextEditor.selection;
        var selectedText = document.getText(selection);
        var isSelectionEmpty = selectedText.length == 0;

        if (isSelectionEmpty) {
            await this.composeTitleAndSelection(url);
        } else {
            this.replaceSelectionWithTitleURL(selection, url);
        }
    }

    replaceSelectionWithTitleURL(selection, url) {
        var text = vscode.window.activeTextEditor.document.getText(selection);
        var formattedLink = this.getLinkFormatter(text, url);
        vscode.window.activeTextEditor.edit((editBuilder) => {
            editBuilder.replace(selection, formattedLink);
        });
    }

    getLinkFormatter(text, url) {
        return '[' + text + ']' + '(' + url + ')';
    }

    getTitleAtUrl(url) {
        return new Promise(function (resolve, reject) {
            getTitleAtUrl(url, function (title, err) {
                if (err) return reject(err);
                resolve(title);
            });
        });
    }
    
    async composeTitleAndSelection(url) {
        if (!url.startsWith('http')) url = 'http://' + url;
        var fakeTitle = this.getFakeTitle();
        var fakeLink = this.getLinkFormatter(fakeTitle, url);

        // Editing is done async, so we need to make sure previous editing is finished
        await this.writeToEditor(fakeLink);

        let newTitle;
        if (url.indexOf('youtube') != -1) {
            newTitle = await this.getYoutubeTitle(url);
        } else {
            newTitle = await this.getTitleAtUrl(url);
        }
        newTitle = this.formatTitle(newTitle, url);

        this.replaceWith(fakeTitle, newTitle);
    }

    async getYoutubeTitle(_url) {
        const url = `https://www.youtube.com/oembed?url=${_url}&format=json`;
        const options = { url, json: true };
        try {
            let repos = await request(options);
            return `${repos.title} - ${repos.provider_name}`;
        } catch (error) {
            throw error;
        }
    }

    getFakeTitle() {
        var date = new Date();
        var seconds = date.getSeconds();
        var padding = seconds < 10 ? '0' : '';
        var timestamp = date.getMinutes() + ':' + padding + seconds;
        return 'Getting Title at ' + timestamp;
    }

    formatTitle(title, url) {
        if (title == undefined) {
            return url;
        }
        let newTitle = title;
        newTitle = newTitle.replace(/\r\n|\n/g, '');
        newTitle = newTitle.trim();
        return newTitle;
    }

    replaceWith(originalContent, newContent) {
        let document = vscode.window.activeTextEditor.document;
        var range;
        var line;

        for (var i = 0; i < document.lineCount; i++) {
            line = document.lineAt(i).text;
            if (line.includes(originalContent)) {
                range = document.lineAt(i).range;
                break;
            }
        }
        if (range == undefined) return;
        var start = new Position(range.start.line, line.indexOf(originalContent));
        var end = new Position(range.start.line, start.character + originalContent.length);
        var newRange = new Range(start, end);
        vscode.window.activeTextEditor.edit((editBuilder) => {
            editBuilder.replace(newRange, newContent);
        });
    }

    writeToEditor(content) {
        let startLine = vscode.window.activeTextEditor.selection.start.line;
        var selection = vscode.window.activeTextEditor.selection;
        let position = new vscode.Position(startLine, selection.start.character);
        return vscode.window.activeTextEditor.edit((editBuilder) => {
            editBuilder.insert(position, content);
        });
    }
};

exports.Paster = Paster;