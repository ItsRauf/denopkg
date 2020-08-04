import { Command } from "https://deno.land/x/cmd/mod.ts";
const cli = new Command("denopkg");

if (import.meta.main) {
  const denopkgDir = import.meta.url.slice(8, -7);
  for await (const dirEntry of Deno.readDir(`./src/commands`)) {
    if (dirEntry.isFile) {
      const { default: Command } = await import(
        `./src/commands/${dirEntry.name}`
      );
      cli.addCommand(Command);
    }
  }
  cli.parse(Deno.args);
}
