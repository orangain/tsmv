import path from "path";
import { TsServer } from "./tsserver";
import { TsClient } from "./tsclient";

export async function renameFiles(src: string, dest: string) {
  const serverPath = path.join(
    path.dirname(__dirname),
    "node_modules/typescript/lib/tsserver.js"
  );
  const server = new TsServer(serverPath);
  const client = new TsClient(server);

  client.configure({}); // don't await
  const srcPath = path.resolve(src);
  const destPath = path.resolve(dest);
  await renameFile(client, srcPath, destPath);
}

async function renameFile(client: TsClient, src: string, dest: string) {
  client.updateOpen({
    openFiles: [{ file: src }],
  }); // don't await
  const response = await client.getEditsForFileRename({
    oldFilePath: src,
    newFilePath: dest,
  });
  for (const fileCodeEdit of response.body) {
    console.log(JSON.stringify(fileCodeEdit, undefined, 2)); // WIP
  }
}
