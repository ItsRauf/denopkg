import { Command } from "https://deno.land/x/cmd@v1.2.0/mod.ts";
import { join } from "https://deno.land/std@0.62.0/path/mod.ts";
import { parseDenopkg } from "../parseDenopkg.ts";
import { tmpImportmap } from "../tmpImportmap.ts";

export default new Command("start")
  .command("start")
  .description("Start mod.ts")
  .action(async (...args: any[]) => {
    console.log("denopkg start\n");
    const parsed = await parseDenopkg();
    const tmpFilePath = parsed.deps
      ? await tmpImportmap(parsed.deps)
      : undefined;
    const output = await Deno.run({
      cmd: [
        "deno",
        "run",
        ...(args[1] ? args[1] : []),
        ...(tmpFilePath ? [`--importmap=${tmpFilePath}`, "--unstable"] : []),
        join(Deno.cwd(), "mod.ts"),
      ],
      stdout: "piped",
    }).output();
    console.log(new TextDecoder().decode(output));
  });
