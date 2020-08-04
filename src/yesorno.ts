export function yesorno(answer: string, yes: () => void, no: () => void) {
  switch (answer) {
    case "y":
      yes();
      break;

    case "n":
      no();
      break;

    default:
      break;
  }
}
