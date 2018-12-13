# SuperPasteURL README

SuperPasteURL is a simple extension that generating Markdown style link when pasting URL.

![](usage.gif)

## Features

A Markdown inline-style link will be generated when pasting a URL into the file with corresponding active language.

For example, you copied the below URL:

```
https://code.visualstudio.com
```

When pasting with Paste URL, you will get:

```
[Visual Studio Code - Code Editing. Redefined](https://code.visualstudio.com)
```

### Usage
For Ubuntu Linux make sure that xclip package is installed, see http://github.com/xavi-/node-copy-paste for details.

```
Hit "Control + Alt + P"
```

Selection will be used as the title if possible.

You can change the default shortcut to whatever you like by editing the `Code > Preferences > Keyboard Shortcuts (File > Preferences > Keyboard Shortcuts` on Windows):

```
[
    {"key": "ctrl+alt+p", "command": "extension.SuperPasteURL"}
]
```

### release plugin

```
vsce package
```

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 0.0.1

generating Markdown style link

### 0.0.2

Fixed bug

### 0.0.3

improve readme

### For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)
