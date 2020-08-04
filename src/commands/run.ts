import { Command } from "https://deno.land/x/cmd@v1.2.0/mod.ts";
import { parseDenopkg } from "../parseDenopkg.ts";
import { tmpImportmap } from "../tmpImportmap.ts";

export default new Command("run <scriptName>")
  .description("Runs a script from the denopkg file")
  .action(async (scriptName: string, ...args: any[]) => {
    const parsed = await parseDenopkg();
    const script = parsed.scripts[scriptName];
    console.log(script);
    const tmpFilePath = await tmpImportmap(parsed.deps);
    const scriptArgs = script.cmd.split(" ");
    const lastScriptArg = scriptArgs.pop();
    const output = await Deno.run({
      cmd: [
        ...scriptArgs,
        ...(script.importmap
          ? [`--importmap=${tmpFilePath}`, "--unstable"]
          : []),
        lastScriptArg,
        ...(args[1] ? args[1] : []),
      ],
      stdout: "piped",
    }).output();
    console.log(new TextDecoder().decode(output));
  });
