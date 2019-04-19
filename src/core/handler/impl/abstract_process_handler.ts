import { ProcessHandler } from "../process_handler";
import { Process } from "../../process";

export abstract class AbstractProcessHandler implements ProcessHandler {
    protected ioOperation: Process;
    
    abstract handleOutData(data : string) : void;
    abstract handleError(data : string) : void;
    abstract handleExit(exitCode : number) : void;

    public registerHandlers(processOperation : Process) {
        processOperation.registerOutDataHandler(this.handleOutData.apply(this));
        processOperation.registerErrorHandler(this.handleError.apply(this));
        processOperation.registerExitHandler(this.handleExit.apply(this));
    }
}