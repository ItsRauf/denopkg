import { Command } from "https://deno.land/x/cmd@v1.2.0/mod.ts";
import { join } from "https://deno.land/std@0.62.0/path/mod.ts";
import { parseDenopkg } from "../parseDenopkg.ts";
import { stringify } from "../tomlStringifyWithBooleanSupport.ts";

export default new Command("add-dep <name> <url>")
  .alias("add")
  .description("Add a dependency")
  .action(async (name: string, url: string) => {
    console.log("denopkg add-dep\n");
    const parsed = await parseDenopkg();
    parsed.deps = parsed.deps ? parsed.deps : {};
    parsed.deps[`${name}/`] = url;
    const denopkgPath = join(Deno.cwd(), "denopkg");
    await Deno.writeFile(
      denopkgPath,
      new TextEncoder().encode(stringify(parsed)),
    ).then(() => {
      console.log(`[WRITE] ${denopkgPath}`);
      console.log(`[DEPS+] ${name}: ${url}`);
    });
  });
