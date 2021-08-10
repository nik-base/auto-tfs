import { Tfs } from '../../tfs';
import { ProcessHandler } from '../process-handler';
import { AbstractProcessHandler } from './abstract-process-handler';

export class CheckinProcessHandler extends AbstractProcessHandler implements ProcessHandler {

    public override handleExit(exitCode: number): void {
        super.handleExit(exitCode);
        new Tfs().autoSync();
    }
}