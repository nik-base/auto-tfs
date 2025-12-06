import { ExtensionContext } from 'vscode';
import { activateV2 } from './v2/extension';

export function activate(context: ExtensionContext) {
    activateV2(context);
}

export function deactivate() {}