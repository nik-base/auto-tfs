import { Tfs } from "./tfs/tfs";
import { TfsCommand } from "./tfs/tfs_command";

export class CommandRunner {
    public checkOut() : void {
        let tfs = new Tfs();
        tfs.executeCommand(TfsCommand.CHECKOUT);
    }
}