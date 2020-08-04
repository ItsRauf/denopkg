export function stdout(message: string) {
  return Deno.write(
    Deno.stdout.rid,
    new TextEncoder().encode(message),
  );
}
