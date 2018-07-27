// @flow

export function isComment(value: string): boolean {
  return (value != null && value.startsWith("/") && (!value.startsWith("//")));
}

export function isLink(value: string): boolean {
  return (value != null && value.startsWith("//"));
}
