#!/usr/bin/env node

import { Command } from "commander";

const program = new Command();

program
  .argument("<src>", "source file")
  .argument("<dest>", "destination file")
  .action((src, dest) => {
    console.log({ src, dest });
  });

program.parse();
