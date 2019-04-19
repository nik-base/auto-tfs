import { ProcessHandler } from "../handler/process_handler";

export interface TfsCommand {
    getCommandAndArgs() : string[];
    getConsoleDataHandler() : ProcessHandler;
}