export * from "./api-error";
export * from "./http-response";
export * from "./logger";

export function cn(...inputs: Array<string | false | null | undefined>) {
  return inputs.filter(Boolean).join(" ");
}
