import { ProcessHandler } from '../process-handler';
import { Process } from '../../process';
import { CredentialsHelper } from '../../ui/credentials-helper';
import { Credentials } from '../../credentials/credentials';
import { Message } from '../../ui/message';
import { Configuration } from '../../configuration';
import { Logger } from '../../logger';
import { OutputChannel } from '../../output-channel';

export abstract class AbstractProcessHandler implements ProcessHandler {
    public data: any;
    public showMessageOnUI = true;
    protected process!: Process;
    protected message = new Message();
    protected configuration = new Configuration();
    protected logger = new Logger();
    private credentialsHelper = new CredentialsHelper();
    private suppressedErrors = ['local echo', 'Access denied'];
    private credentialsPromise!: Promise<Credentials>;

    public handleStdOutData(data: string): void {
        const message = `StdOut: ${data}`;
        this.logger.logDebugData(message);
        OutputChannel.log(message);
        this.handleAuthorize(data);
    }

    public handleStdErrData(data: string): void {
        const message = `StdErr: ${data}`;
        this.logger.logDebugData(message);
        OutputChannel.log(message);
        if (!this.isSuppressedError(data)) {
            const command = this.process.getCommandName();
            const error = `TF command '${command}' error: ${data}`;
            if (this.showMessageOnUI) {
                this.message.error(error);
            }
            OutputChannel.log(error);
        }
    }

    public handleExit(exitCode: number): void {
        const message = `Exit code: ${exitCode}`;
        this.logger.logDebugData(message);
        if (exitCode === 0) {
            const info = `TF command '${this.process.getCommandName()}' is successfully done`;
            if (this.showMessageOnUI) {
                this.message.info(info);
            }
            OutputChannel.log(info);
        }
    }

    public handleError(error: any): void {
        this.logger.logDebugData(`Error: ${error}`);
        OutputChannel.logJson(error);
        if (error.code === 'ENOENT') {
            const message = 'The TF command can\'t be found. Please, check the property auto-tfs.tf.path in VS Code settings';
            this.message.error(message);
            OutputChannel.log(message);
        }
    }

    public registerHandlers(process: Process) {
        this.process = process;
        process.registerStdOutDataHandler(this.handleStdOutData.bind(this));
        process.registerExitHandler(this.handleExit.bind(this));
        process.registerStdErrDataHandler(this.handleStdErrData.bind(this));
        process.registerErrorHandler(this.handleError.bind(this));
    }

    protected handleAuthorize(processStdOutData: string) {
        this.handleUserNameAndObtainCredentials(processStdOutData);
        this.handlePassword(processStdOutData);
    }

    private handleUserNameAndObtainCredentials(processStdOutData: string) {
        if (processStdOutData.indexOf('Username') > -1) {
            const warn = 'Please, provide your TFS credentials for proceeding';
            this.message.warning(warn);
            OutputChannel.log(warn);
            this.credentialsPromise = this.credentialsHelper.obtainCredentials();
            this.credentialsPromise.then((credentials) => {
                this.process.writeLn(credentials.getUserName() || '');
            });
        }
    }

    private handlePassword(processStdOutData: string) {
        if (processStdOutData.indexOf('Password') > -1) {
            this.credentialsPromise.then((credentials) => {
                this.process.writeLn(credentials.getPassword() || '');
            });
        }
    }

    private isSuppressedError(processStdOutData: string): boolean {
        return this.suppressedErrors.some(item => processStdOutData.indexOf(item) > -1);
    }
}