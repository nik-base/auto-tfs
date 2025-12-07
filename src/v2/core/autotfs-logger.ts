import { AutoTFSConfiguration } from "./autotfs-configuration";
import { AutoTFSOutputChannel } from "./autotfs-output-channel";

export class AutoTFSLogger {
  public static log(message: string): void {
    if (!AutoTFSConfiguration.isDebugEnabled) {
      return;
    }

    console.log(message);

    AutoTFSOutputChannel.log(message);
  }

  public static debug(message: string): void {
    if (!AutoTFSConfiguration.isDebugEnabled) {
      return;
    }

    console.debug(message);

    AutoTFSOutputChannel.log(message);
  }

  public static warn(message: string): void {
    if (!AutoTFSConfiguration.isDebugEnabled) {
      return;
    }

    console.warn(message);

    AutoTFSOutputChannel.log(message);
  }

  public static error(message: string): void {
    if (!AutoTFSConfiguration.isDebugEnabled) {
      return;
    }

    console.error(message);

    AutoTFSOutputChannel.log(message);
  }

  public static logAny(data: unknown): void {
    if (!AutoTFSConfiguration.isDebugEnabled) {
      return;
    }

    console.log(data);

    AutoTFSOutputChannel.logAny(data);
  }
}
