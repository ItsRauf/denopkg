import * as commands from "./src/commands/commands.ts";

import { Command } from "https://deno.land/x/cmd@v1.2.0/mod.ts";

const cli = new Command("denopkg");

if (import.meta.main) {
  Object.values(commands).forEach((cmd) => {
    cli.addCommand(cmd.default);
  });
  cli.parse(Deno.args);
}
