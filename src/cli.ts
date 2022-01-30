#!/usr/bin/env node

import { Command } from "commander";
import { renameFiles } from "./refactoring";

const program = new Command();

program
  .argument("<src>", "source file")
  .argument("<dest>", "destination file")
  .action(async (src, dest) => {
    console.log({ src, dest });
    await renameFiles(src, dest);
    process.exit();
  });

program.parse();
