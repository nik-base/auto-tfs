# TFS integration for Visual Studio Code

[![GitHub](https://img.shields.io/github/v/release/nik-base/auto-tfs?include_prereleases&style=flat-square)](https://github.com/nik-base/auto-tfs/releases)
[![GitHub](https://img.shields.io/github/license/nik-base/auto-tfs?style=flat-square)](https://github.com/nik-base/auto-tfs/blob/master/LICENSE)
[![Build](https://img.shields.io/github/actions/workflow/status/nik-base/auto-tfs/.github/workflows/ci.yml?style=flat-square)](https://github.com/nik-base/auto-tfs/actions/workflows/ci.yml)
[![CodeQL](https://github.com/nik-base/auto-tfs/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/nik-base/auto-tfs/actions/workflows/codeql-analysis.yml)
[![GitHub](https://img.shields.io/github/issues/nik-base/auto-tfs?style=flat-square)](https://github.com/nik-base/auto-tfs/issues)
[![Dependabot](https://badgen.net/badge/Dependabot/enabled/green?icon=dependabot&style=flat-square)](https://dependabot.com/)
[![Sponsor](https://img.shields.io/badge/Sponsor-auto--tfs-deeppink?logo=github-sponsors)](https://github.com/sponsors/nik-base)
[![Ko-fi](https://img.shields.io/badge/Support%20me-on%20Ko--fi-orange?logo=ko-fi)](https://ko-fi.com/nikhil2203)

## Prerequisites

1. This extension operates with TF API provided by Microsoft. So, you need either  
   a. Have Visual Studio IDE installed with TFS capabilities (i.e. TF.exe installed).  
    OR  
   b. TeamExplorerEverywhere installed (https://github.com/Microsoft/team-explorer-everywhere)
   > **Note:** Possibly, some other 3rd party tools would also work, if they provide the same output and receives the same commands / args  
   > **Note (for TeamExplorerEverywhere):** Possibly, works under Linux-based systems and MacOS, but I have no ability to test it
2. Extension would only work for a workspace already mapped on TFS (Preferably mapped as Server workspace).
3. Visual Studio Code - Minimum version required for extension is 1.95.0.

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

If your installed language in TFS is other than English, Please set the installed language using below configuration

```
    "auto-tfs.tf.language": "<installed-tfs-language>"
```

> This is not the langauge of the extension, but language of the TFS itself, it is needed because this extension relies on TFS command output

> Current only English and Spanish is supported

If you are going to use the `tf.exe` tool embedded into Visual Studio IDE, the value to specify will be similar to -  
`C:\Program Files (x86)\Microsoft Visual Studio 14.0\Common7\IDE\TF.exe`

Recent versions of Visual Studio has changed this path, here is a sample of Visual Studio 2019 (Professional) -  
`C:\Program Files (x86)\Microsoft Visual Studio\2019\Professional\Common7\IDE\CommonExtensions\Microsoft\TeamFoundation\Team Explorer\TF.exe`

For TEE, it will be like this: `C:\Program Files (x86)\TeamExplorerEverywhere\tf.cmd`

Above TF path is mandatory for the extension to function.
Apart from above configuration, the extension also allows configuarations such as automatic checkout/add/delete/rename, confirmation prompts, etc.

## Features

- Configurable automatic checkout, add, delete, rename files on source control.
- Ability to checkout, add, delete, rename files on source control via context menu available in Explorer, Editor, Editor Title.
- Get latest of entire workspace, one or more items from context menus, status bar and SCM view.
- Compare files with latest server version (In Visual Studio Code or Visual Studio)
- In file Quick diff of a checked out file
- Check-In files with or without Visual Studio prompt (Warning: Code review not supported)
- Shelve / Replace shelvesets
- Color coded (along with badges) visualization from changes to a workspace (Same as provided in Git) and also ability to automatically / manually sync (refresh) these changes.
- View all changes in SCM View of Code, with ability to compare, revert, shelve (and much more..) changes along with option to include and exclude items.
- View changes in source control with badges
- Open file on server (browser).
- View history of a work item (Visual Studio Prompt).

## Authorization

- Authorization process, if needed you will be prompted to enter the credentials for your TFS account, where the current workspace is mapped to. Otherwise, a command will be executed silently.

## Available commands

- Add (a file should be saved first in the folder, which is included into mappings in TFS)
- Checkout
- Undo
- Delete
- Get Latest
- Get All Latest
- Sync
- Open on server
- Compare in Visual Studio
- Compare in Code
- View History in Visual Studio Prompt

## About the repository

This repository is inspired from [niberius/z-tf-utils](https://github.com/niberius/z-tf-utils).

## Links

- [AutoTFS extension on GitHub](https://github.com/nik-base/auto-tfs)
- [MIT License](https://github.com/nik-base/auto-tfs/blob/master/LICENSE)

