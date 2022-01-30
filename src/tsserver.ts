import { spawn } from "child_process";
import { Event, Request, Response } from "typescript/lib/protocol";

export class TsServer {
  private process;
  private buffer: Buffer = Buffer.from(new Uint8Array(0));
  private responseResolveFns = new Map<number, (response: Response) => void>();

  constructor(serverPath: string) {
    this.process = spawn("node", [serverPath]);

    this.process.stdout.on("data", (chunk) => {
      console.log(`stdout (${typeof chunk}): ${chunk}`);
      this.buffer = Buffer.concat([this.buffer, chunk]);

      while (true) {
        const bufferString = this.buffer.toString();
        const headerEndIndex = bufferString.indexOf("\r\n\r\n");
        if (headerEndIndex < 0) {
          break;
        }
        const headerLength = headerEndIndex + 4;
        const headerString = bufferString.substring(0, headerEndIndex);
        const headers = parseHeaders(headerString);
        const contentLengthString = headers.get("content-length");
        if (contentLengthString === undefined) {
          break;
        }
        const contentLength = parseInt(contentLengthString, 10);
        if (this.buffer.length < headerLength + contentLength) {
          break;
        }

        try {
          const message = JSON.parse(
            this.buffer
              .slice(headerLength, headerLength + contentLength)
              .toString()
          );
          if (
            typeof message === "object" &&
            "type" in message &&
            (message.type === "response" || message.type === "event")
          ) {
            this.dispatchMessage(message);
          } else {
            throw new Error(`Unexpected message format: ${message}`);
          }
        } finally {
          this.buffer = this.buffer.slice(headerLength + contentLength);
        }
      }
    });

    this.process.stderr.on("data", (chunk) => {
      console.error(`stderr: ${chunk}`);
    });

    this.process.on("close", (code) => {
      console.log(`child process exited with code ${code}`);
    });

    this.process.on("error", (error) => {
      console.log(`error: ${error}`);
    });
  }

  async sendRequest(request: Request): Promise<Response> {
    return new Promise((resolve) => {
      this.responseResolveFns.set(request.seq, resolve);
      this.process.stdin.write(JSON.stringify(request) + "\r\n");
    });
  }

  private dispatchMessage(message: Event | Response) {
    if (message.type === "response") {
      const requestSeq = message.request_seq;
      const resolveFn = this.responseResolveFns.get(requestSeq);
      if (resolveFn !== undefined) {
        this.responseResolveFns.delete(requestSeq);
        console.log(`dispatchMessage: ${requestSeq}`);
        resolveFn(message);
      }
    }
  }
}

function parseHeaders(headerString: string): Map<string, string> {
  const headers = new Map<string, string>();
  for (const line of headerString.split("\r\n")) {
    const [key, value] = line.split(":");
    headers.set(key.toLowerCase().trim(), value.trim());
  }
  return headers;
}
