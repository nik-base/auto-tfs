# VS Code extension for TFS for helping with some operations
## Prerequisites
This extension operates with TF API provided by Microsoft. So, you need either
1. Have Visual Studion IDE installed
or
2. TeamExplorerEverywhere installed (https://github.com/Microsoft/team-explorer-everywhere)
> **Note:** Possibly, some other 3rd party tools are also would be work, if they provide the same output and receives the same commands / args

> **Note (for TeamExplorerEverywhere):** Possibly, works under Linux-based systems and MacOS, but I have no ability to test it

## Installation

1. Open up VS Code
2. Type **`F1`**
3. Type `ext` in command palette.
4. Select `Extensions: Install Extension` and hit **`ENTER`**
5. Type `z-tf`
6. Select **`Z-TF Utils`** extension and hit **`ENTER`**

## Configuration

A full path to TF tool should be spicified in Settings (**File > Preferences > Settings**).
The following entry is needed:

```
    "z-tf-util.tf.path": "<path-to-tf-command-line>"
```

If you are going to use the `tf.exe` tool ebmbdded into Visual Studio IDE, the value to specify will be similar to `C:\\Program Files (x86)\\Microsoft Visual Studio 14.0\\Common7\\IDE\\TF.exe`. For TEE, it will be like this: `C:\\Program Files (x86)\\TeamExplorerEverywhere\\tf.cmd`

Another supported setting serves for logging information into Output. To enable this, just add following option to VS Code Settings:
```
    "z-tf-util.debug": true
```

## Usage
1. Invoke the command bar (`Ctrl+Shift+P`)
2. Start typing some of the command listed below or just Z-TF. The full names of commands:
``` Z-TF Util: Checkout current file
Z-TF Util: Undo changes for current file
Z-TF Util: Add current file to TFS
Z-TF Util: Delete current file
```

## Features

* Authorization process, if needed. This is performed by command bar. In case of the necessivity, you will be prompted to enter the credentials from your TFS account, where the current file is mapped to. Otherwise, a command will be executed silently.

## Available commands

* Add (a file should be saved first in the folder, which is included into mappings in TFS)
* Checkout
* Undo
* Delete