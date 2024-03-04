import {
  ArgumentValue,
  ValidationError,
} from "https://deno.land/x/cliffy@v1.0.0-rc.3/command/mod.ts";

export function urlType({ label, name, value }: ArgumentValue): URL {
  try {
    return new URL(value);
  } catch {
    throw new ValidationError(
      `${label} "${name}" must be a valid url, but got "${value}".`,
    );
  }
}
