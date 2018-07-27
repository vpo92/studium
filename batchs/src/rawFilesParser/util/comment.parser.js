// @flow

export function isComment(value: string): boolean {

  return (value != null && value.startsWith("/") && (!value.startsWith("//")));
}
