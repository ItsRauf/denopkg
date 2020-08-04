import { readLines } from "https://deno.land/std@0.62.0/io/mod.ts";

export async function readCurrentStdinLine() {
  const stdin = readLines(Deno.stdin);
  const line = await stdin.next();
  const answer: string = line.value;
  return answer.trim();
}
