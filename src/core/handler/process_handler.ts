import { Process } from "../process";

export interface ProcessHandler {
    handleOutData(data: string): void;
    handleError(data: string): void;
    handleExit(exitCode: number): void;
    registerHandlers(processOperation: Process): void;
}
