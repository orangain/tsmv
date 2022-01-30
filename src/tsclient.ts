import assert from "assert";
import {
  CommandTypes,
  ConfigureRequestArguments,
  GetEditsForFileRenameRequestArgs,
  GetEditsForFileRenameResponse,
  Response,
  UpdateOpenRequestArgs,
} from "typescript/lib/protocol";
import { TsServer } from "./tsserver";
export class TsClient {
  private seq: number = 0;
  constructor(public server: TsServer) {}

  private async sendRequest(command: string, args: any): Promise<Response> {
    return await this.server.sendRequest({
      seq: this.seq++,
      type: "request",
      command,
      arguments: args,
    });
  }

  async configure(args: ConfigureRequestArguments) {
    const response = await this.sendRequest(CommandTypes.Configure, args);
    assert(response.command === CommandTypes.Configure);
    return response;
  }

  async updateOpen(args: UpdateOpenRequestArgs) {
    const response = await this.sendRequest(CommandTypes.UpdateOpen, args);
    assert(response.command === CommandTypes.UpdateOpen);
    return response;
  }

  async getEditsForFileRename(args: GetEditsForFileRenameRequestArgs) {
    const response = await this.sendRequest(
      CommandTypes.GetEditsForFileRename,
      args
    );
    assert(response.command === CommandTypes.GetEditsForFileRename);
    return response as GetEditsForFileRenameResponse;
  }
}
