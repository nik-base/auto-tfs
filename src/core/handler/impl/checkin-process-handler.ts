import { SourceControl } from 'vscode';
import { Tfs } from '../../tfs';
import { ProcessHandler } from '../process-handler';
import { AbstractProcessHandler } from './abstract-process-handler';

export class CheckinProcessHandler extends AbstractProcessHandler implements ProcessHandler {

    public sourceControl?: SourceControl;

    public override handleExit(exitCode: number): void {
        super.handleExit(exitCode);
        if (this.sourceControl && exitCode === 0) {
            this.sourceControl.inputBox.value = '';
        }
        new Tfs().autoSync();
    }
}