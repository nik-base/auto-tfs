import { SourceControl } from 'vscode';
import { OutputChannel } from '../../output-channel';
import { Tfs } from '../../tfs';
import { ProcessHandler } from '../process-handler';
import { AbstractProcessHandler } from './abstract-process-handler';

export class ShelveProcessHandler extends AbstractProcessHandler implements ProcessHandler {

    public sourceControl?: SourceControl;

    public override handleStdErrData(data: string): void {
        super.handleStdErrData(data);
        const shelveName = this.sourceControl?.inputBox?.value;
        if (!shelveName) {
            return;
        }
        if (!data.includes(shelveName) || !data.includes('already exists')) {
            return;
        }
        const tfs = new Tfs();
        tfs.confirmShelveReplace(shelveName).then((selectedItem: string | undefined) => {
            if (selectedItem === 'Yes' ) {
                OutputChannel.log(`Replacing shelve '${shelveName}'...`);
                tfs.replaceShelve(this.sourceControl!);
            }
        });
    }
}