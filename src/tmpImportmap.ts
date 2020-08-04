export async function tmpImportmap(denopkgDeps: {}) {
  const tmpFilePath = await Deno.makeTempFile();
  const deps: { [key: string]: string } = {};
  const depValues = Object.entries(denopkgDeps);
  depValues.forEach((dep) => {
    deps[dep[0]] = dep[1] as string;
  });
  await Deno.writeFile(
    tmpFilePath,
    new TextEncoder().encode(JSON.stringify({ imports: deps })),
  );
  return tmpFilePath;
}
