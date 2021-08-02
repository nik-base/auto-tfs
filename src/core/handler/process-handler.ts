import { Process } from '../process';

export interface ProcessHandler {
    data: any;
    showMessageOnUI: boolean;
    handleStdOutData(data: string): void;
    handleStdErrData(data: string): void;
    handleExit(exitCode: number): void;
    handleError(error: any): void;
    registerHandlers(processOperation: Process): void;
}
