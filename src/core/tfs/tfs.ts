import * as vscode from 'vscode';
import { IOOperation } from '../iooperation';
import { CredentialsHelper } from '../ui/credentials_helper';
import { TfsCommand } from "../tfs/tfs_command";

export class Tfs {

	private tfPath = vscode.workspace.getConfiguration("tfs").get("location") as string;
	private activeFileName = vscode.window.activeTextEditor.document.fileName;
	private activeFileAbsolutePath = vscode.window.activeTextEditor.document.uri.fsPath;
	private credentialsHelper = new CredentialsHelper();

	public executeCommand(command: TfsCommand) {
		let ioOperation = new IOOperation(this.tfPath, ["checkout", this.activeFileAbsolutePath], ["Username", this.activeFileName]);
		let outValue = ioOperation.getStdOutValue(()=>{});
		if (outValue.indexOf("Username") > -1) {
			let credentials = this.credentialsHelper.obtainCredentials();
			ioOperation.writeLn(credentials.getUserName());
			ioOperation.writeLn(credentials.getPassword());
		}
		if (outValue.indexOf(this.activeFileName)) {
			ioOperation.finish();
			return;
		}
		ioOperation.finish();
	}
}