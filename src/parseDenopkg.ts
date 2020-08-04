import { join } from "https://deno.land/std@0.62.0/path/mod.ts";
import { parse } from "https://deno.land/std@0.62.0/encoding/toml.ts";

export async function parseDenopkg() {
  const cwd = Deno.cwd();
  const denopkgPath = join(cwd, "denopkg");
  const denopkg = await Deno.open(denopkgPath);
  const parsed: { [key: string]: any } = parse(
    new TextDecoder().decode(await Deno.readAll(denopkg)),
  );
  return parsed;
}
