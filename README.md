# VS Code extension for TFS for helping with some operations

[![GitHub](https://img.shields.io/github/v/release/nik-base/auto-tfs?include_prereleases&style=flat-square)](https://github.com/nik-base/auto-tfs/releases)
[![GitHub](https://img.shields.io/github/license/nik-base/auto-tfs?style=flat-square)](https://github.com/nik-base/auto-tfs/blob/master/LICENSE)
[![Build](https://img.shields.io/github/workflow/status/nik-base/auto-tfs/NodeJS%20with%20Webpack?style=flat-square)](https://github.com/nik-base/auto-tfs/actions/workflows/webpack.yml)
[![CodeQL](https://github.com/nik-base/auto-tfs/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/nik-base/auto-tfs/actions/workflows/codeql-analysis.yml)
[![David](https://img.shields.io/david/nik-base/auto-tfs?style=flat-square)](https://github.com/nik-base/auto-tfs)
[![David](https://img.shields.io/david/dev/nik-base/auto-tfs?style=flat-square)](https://github.com/nik-base/auto-tfs?type=dev)

## Prerequisites
This extension operates with TF API provided by Microsoft. So, you need either
1. Have Visual Studio IDE installed with TFS capabilities (i.e. TF.exe installed).  
or
2. TeamExplorerEverywhere installed (https://github.com/Microsoft/team-explorer-everywhere)
> **Note:** Possibly, some other 3rd party tools would also work, if they provide the same output and receives the same commands / args

> **Note (for TeamExplorerEverywhere):** Possibly, works under Linux-based systems and MacOS, but I have no ability to test it

## Additional Prerequisites
- Extension would only work for a workspace already mapped on TFS (Preferably mapped as Server workspace).  
- Visual Studio Code - Minimum version required for extension is 1.58.2.  

## Installation

1. Open up VS Code
2. Type **`F1`**
3. Type `ext` in command palette.
4. Select `Extensions: Install Extension` and hit **`ENTER`**
5. Type `auto-tfs`
6. Select **`Auto TFS`** extension and hit **`ENTER`**

## Configuration

A full path to TF tool should be specified in Settings (**File > Preferences > Settings**).  
(Recommended configuring in Workspace settings if only used for limited workspaces to avoid conflicts with git workspaces)  
The following entry is needed:

```
    "auto-tfs.tf.path": "<path-to-tf-command-line>"
```

If you are going to use the `tf.exe` tool embedded into Visual Studio IDE, the value to specify will be similar to -  
`C:\Program Files (x86)\Microsoft Visual Studio 14.0\Common7\IDE\TF.exe`  

Recent versions of Visual Studio has changed this path, here is a sample of Visual Studio 2019 (Professional) -  
`C:\Program Files (x86)\Microsoft Visual Studio\2019\Professional\Common7\IDE\CommonExtensions\Microsoft\TeamFoundation\Team Explorer\TF.exe`  

For TEE, it will be like this: `C:\Program Files (x86)\TeamExplorerEverywhere\tf.cmd`  

## Features

- Compare file with the latest server version either in Visual Studio Code itself or in Visual Studio.
- Sync workspace to get color coded changes with badges (for modified, renamed, deleted, added, renamed & modified) as you get it Git
- Check-In files with or without Visual Studio prompt (Warning: Code review not supported)
- Quick Diff - In line diff in open editor
- Shelve / Replace shelve
- Include / Exclude during shelve and checkin
- View changes in source control with badges
- Open file on server (browser).
- Compare, View, Revert, Open on server directly from Source Control Manager.
- Get Changes Count on SCM View
- Revert All / Get All on SCM
- Status with Get All and Sync buttons
- Editor title icons for Compare (in code itself), get latest and open on server.
- Get latest of one or more files or folders (Recursive) or entire workspace.
- Configurable Automatic operations.
- Configurable confirmation of automatic operations.
- Auto Checkout on Save
- Auto Checkout on Change
- Auto Add to source control on Add
- Auto Delete from source control on Delete
- Auto Rename on source control on Rename (Known issue - works but throws exception)
- Add, Checkout and Undo operation can be performed via context menu in Explorer (multiple), Editor and Editor Tile.


## Authorization

* Authorization process, if needed. This is performed by command bar. If necessary, you will be prompted to enter the credentials for your TFS account, where the current workspace is mapped to. Otherwise, a command will be executed silently.

## Available commands

* Add (a file should be saved first in the folder, which is included into mappings in TFS)
* Checkout
* Undo
* Delete
* Get Latest
* Get All Latest
* Sync
* Open on server
* Compare in Visual Studio
* Compare in Code

## About the fork

This is a fork of [niberius/z-tf-utils](https://github.com/niberius/z-tf-utils). The changes are:

- Compare file with the latest server version, either in Visual Studio Code itself or in Visual Studio.
- Sync workspace to get color coded changes with badges (for modified, renamed, deleted, added, renamed & modified) as you get it Git
- Checkin files with or without Visual Studio prompt (Warning: Code review not supported)
- Quick Diff - In line diff in open editor
- Shelve / Replace shelve
- Include / Exclude during shelve and checkin
- View changes in source control with badges
- Open file on server (browser).
- Compare, View, Revert, Open on server directly from Source Control Manager.
- Get Changes Count on SCM View
- Revert All / Get All on SCM
- Status with Get All and Sync buttons
- Editor title icons for Compare (in code itself), get latest and open on server.
- Get latest of one or more files or folders (Recursive).
- Configurable Automatic operations.
- Configurable confirmation of automatic operations.
- Auto Checkout on Save
- Auto Checkout on Change
- Auto Add to source control on Add
- Auto Delete from source control on Delete
- Auto Rename on source control on Rename (Throw error cannot find file since already renamed - Known issue)
- Add, Checkout and Undo operation can be performed via context menu in Explorer (multiple), Editor and Editor Tile.

## Links

- [AutoTFS extension on GitHub](https://github.com/nik-base/auto-tfs)
- [MIT License](https://github.com/nik-base/auto-tfs/blob/master/LICENSE)
