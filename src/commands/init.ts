import { Command } from "https://deno.land/x/cmd@v1.2.0/mod.ts";
import { exists } from "https://deno.land/std@0.62.0/fs/mod.ts";
import { join } from "https://deno.land/std@0.62.0/path/mod.ts";
import { readCurrentStdinLine } from "../readCurrentStdinLine.ts";
import { stdout } from "../stdout.ts";
import { stringify } from "../tomlStringifyWithBooleanSupport.ts";
import { yesorno } from "../yesorno.ts";

async function init(path: string) {
  await Deno.mkdir(path, {
    recursive: true,
  }).then(() => console.log(`[CREATE] ${path}`));
  const denopkgPath = join(path, "denopkg");
  const denopkg = await Deno.create(denopkgPath).then((file) => {
    console.log(`[CREATE] ${denopkgPath}`);
    return file;
  });
  const questions: { [key: string]: string[] } = {
    package: ["name", "version", "description"],
  };
  const store: { [key: string]: any } = {
    package: {},
  };
  const segments = Object.keys(questions);
  for (const segment of segments) {
    console.log(`\n[${segment}]`);
    for await (const part of questions[segment]) {
      await stdout(`${part}: `);
      const answer = await readCurrentStdinLine();
      store[segment][part] = answer;
    }
    console.log(stringify(store));
    await stdout("Is this fine? (y/n) ");
    yesorno(
      await readCurrentStdinLine(),
      async () => {
        await denopkg.write(new TextEncoder().encode(stringify(store))).then(
          () => {
            console.log(`[WRITE] ${denopkgPath}`);
          },
        );
      },
      () => {
        init(path);
      },
    );
    const modPath = join(path, "mod.ts");
    await Deno.create(modPath).then((file) => {
      console.log(`[CREATE] ${modPath}`);
      return file;
    });
  }
}

export default new Command("init").command("init [dir]").description(
  "Initialize a deno package",
).action(async (dir: string | undefined) => {
  console.log("denopkg init\n");
  const cwd = Deno.cwd();
  const path = dir ? join(cwd, dir) : cwd;
  console.log(path);
  const dirExists = await exists(path);
  if (dirExists) {
    const existing = dir ? dir : cwd;
    await stdout(
      `${existing} already exists, would you like to overwrite? (y/n) `,
    );
    yesorno(
      await readCurrentStdinLine(),
      async () => {
        await Deno.remove(path, { recursive: true });
        await init(path);
      },
      () => {
        console.error("Aborting!");
        Deno.exit();
      },
    );
  } else {
    await init(path);
  }
});
