// Bare keys may only contain ASCII letters,
// ASCII digits, underscores, and dashes (A-Za-z0-9_-).
function joinKeys(keys: string[]): string {
  // Dotted keys are a sequence of bare or quoted keys joined with a dot.
  // This allows for grouping similar properties together:
  return keys
    .map((str: string): string => {
      return str.match(/[^A-Za-z0-9_-]/) ? `"${str}"` : str;
    })
    .join(".");
}

class Dumper {
  maxPad = 0;
  srcObject: object;
  output: string[] = [];
  constructor(srcObjc: object) {
    this.srcObject = srcObjc;
  }
  dump(): string[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.output = this._parse(this.srcObject as any);
    this.output = this._format();
    return this.output;
  }
  _parse(obj: Record<string, unknown>, keys: string[] = []): string[] {
    const out = [];
    const props = Object.keys(obj);
    const propObj = props.filter((e: string): boolean => {
      if (obj[e] instanceof Array) {
        const d: unknown[] = obj[e] as unknown[];
        return !this._isSimplySerializable(d[0]);
      }
      return !this._isSimplySerializable(obj[e]);
    });
    const propPrim = props.filter((e: string): boolean => {
      if (obj[e] instanceof Array) {
        const d: unknown[] = obj[e] as unknown[];
        return this._isSimplySerializable(d[0]);
      }
      return this._isSimplySerializable(obj[e]);
    });
    const k = propPrim.concat(propObj);
    for (let i = 0; i < k.length; i++) {
      const prop = k[i];
      const value = obj[prop];
      if (value instanceof Date) {
        out.push(this._dateDeclaration([prop], value));
      } else if (typeof value === "string" || value instanceof RegExp) {
        out.push(this._strDeclaration([prop], value.toString()));
      } else if (typeof value === "number") {
        out.push(this._numberDeclaration([prop], value));
      } else if (typeof value === "boolean") {
        out.push(this._boolDeclaration([prop], value));
      } else if (
        value instanceof Array &&
        this._isSimplySerializable(value[0])
      ) {
        // only if primitives types in the array
        out.push(this._arrayDeclaration([prop], value));
      } else if (
        value instanceof Array &&
        !this._isSimplySerializable(value[0])
      ) {
        // array of objects
        for (let i = 0; i < value.length; i++) {
          out.push("");
          out.push(this._headerGroup([...keys, prop]));
          out.push(...this._parse(value[i], [...keys, prop]));
        }
      } else if (typeof value === "object") {
        out.push("");
        out.push(this._header([...keys, prop]));
        if (value) {
          const toParse = value as Record<string, unknown>;
          out.push(...this._parse(toParse, [...keys, prop]));
        }
        // out.push(...this._parse(value, `${path}${prop}.`));
      }
    }
    out.push("");
    return out;
  }
  _isSimplySerializable(value: unknown): boolean {
    return (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      value instanceof RegExp ||
      value instanceof Date ||
      value instanceof Array
    );
  }
  _header(keys: string[]): string {
    return `[${joinKeys(keys)}]`;
  }
  _headerGroup(keys: string[]): string {
    return `[[${joinKeys(keys)}]]`;
  }
  _declaration(keys: string[]): string {
    const title = joinKeys(keys);
    if (title.length > this.maxPad) {
      this.maxPad = title.length;
    }
    return `${title} = `;
  }
  _arrayDeclaration(keys: string[], value: unknown[]): string {
    return `${this._declaration(keys)}${JSON.stringify(value)}`;
  }
  _strDeclaration(keys: string[], value: string): string {
    return `${this._declaration(keys)}"${value}"`;
  }
  _boolDeclaration(keys: string[], value: boolean): string {
    return `${this._declaration(keys)}${value}`;
  }
  _numberDeclaration(keys: string[], value: number): string {
    switch (value) {
      case Infinity:
        return `${this._declaration(keys)}inf`;
      case -Infinity:
        return `${this._declaration(keys)}-inf`;
      default:
        return `${this._declaration(keys)}${value}`;
    }
  }
  _dateDeclaration(keys: string[], value: Date): string {
    function dtPad(v: string, lPad = 2): string {
      return v.padStart(lPad, "0");
    }
    const m = dtPad((value.getUTCMonth() + 1).toString());
    const d = dtPad(value.getUTCDate().toString());
    const h = dtPad(value.getUTCHours().toString());
    const min = dtPad(value.getUTCMinutes().toString());
    const s = dtPad(value.getUTCSeconds().toString());
    const ms = dtPad(value.getUTCMilliseconds().toString(), 3);
    // formated date
    const fData = `${value.getUTCFullYear()}-${m}-${d}T${h}:${min}:${s}.${ms}`;
    return `${this._declaration(keys)}${fData}`;
  }
  _format(): string[] {
    const rDeclaration = /(.*)\s=/;
    const out = [];
    for (let i = 0; i < this.output.length; i++) {
      const l = this.output[i];
      // we keep empty entry for array of objects
      if (l[0] === "[" && l[1] !== "[") {
        // empty object
        if (this.output[i + 1] === "") {
          i += 1;
          continue;
        }
        out.push(l);
      } else {
        const m = rDeclaration.exec(l);
        if (m) {
          out.push(l.replace(m[1], m[1].padEnd(this.maxPad)));
        } else {
          out.push(l);
        }
      }
    }
    // Cleaning multiple spaces
    const cleanedOutput = [];
    for (let i = 0; i < out.length; i++) {
      const l = out[i];
      if (!(l === "" && out[i + 1] === "")) {
        cleanedOutput.push(l);
      }
    }
    return cleanedOutput;
  }
}

export function stringify(srcObj: object): string {
  return new Dumper(srcObj).dump().join("\n");
}
