import { ProcessHandler } from "../process_handler";
import { Process } from "../../process";
import { CredentialsHelper } from "../../ui/credentials_helper";
import { Credentials } from "../../credentials/credentials";
import { Message } from "../../ui/message";
import { Configuration } from "../../configuration";
import { Logger } from "../../logger";

export abstract class AbstractProcessHandler implements ProcessHandler {
    protected process: Process;
    protected message = new Message();
    protected configuration = new Configuration();
    protected logger = new Logger();
    private credentialsHelper = new CredentialsHelper();
    private suppressedErrors = ["local echo", "Access denied"];
    private credentialsPromise: Promise<Credentials>;

    public handleStdOutData(data: string): void {
        this.logger.logDebugData(`StdOut: ${data}`);
        this.handleAuthorize(data);
    }

    public handleStdErrData(data: string): void {
        this.logger.logDebugData(`StdErr: ${data}`);
        if (!this.isSuppressedError(data)) {
            this.message.error(`TF command "${this.process.getCommandName()}" error: ${data}`);
        }
    }

    public handleExit(exitCode: number): void {
        this.logger.logDebugData(`Exit code: ${exitCode}`);
        if (exitCode == 0) {
            this.message.info(`TF command "${this.process.getCommandName()}" is successfully done`);
        }
    }

    public handleError(error: any): void {
        this.logger.logDebugData(`Error: ${error}`);
        if (error.code == "ENOENT") {
            this.message.error("The TF command can't be found. Please, check the property z-tf-util.tf.path in VS Code settings");
        }
    }

    public registerHandlers(process: Process) {
        this.process = process;
        process.registerStdOutDataHandler(this.handleStdOutData.bind(this));
        process.registerStdErrDataHandler(this.handleStdErrData.bind(this));
        process.registerExitHandler(this.handleExit.bind(this));
        process.registerErrorHandler(this.handleError.bind(this));
    }

    protected handleAuthorize(processStdOutData: string) {
        this.handleUserNameAndObtainCredentials(processStdOutData);
        this.handlePassword(processStdOutData);
    }

    private handleUserNameAndObtainCredentials(processStdOutData: string) {
        if (processStdOutData.indexOf("Username") > -1) {
            this.message.warning("Please, provide your TFS credentials for proceeding");
            this.credentialsPromise = this.credentialsHelper.obtainCredentials();
            this.credentialsPromise.then((credentials) => {
                this.process.writeLn(credentials.getUserName());
            });
        }
    }

    private handlePassword(processStdOutData: string) {
        if (processStdOutData.indexOf("Password") > -1) {
            this.credentialsPromise.then((credentials) => {
                this.process.writeLn(credentials.getPassword());
            });
        }
    }

    private isSuppressedError(processStdOutData: string): boolean {
        return this.suppressedErrors.some(item => processStdOutData.indexOf(item) > -1);
    }
}