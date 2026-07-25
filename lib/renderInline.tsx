import { Fragment, type ReactNode } from "react";

export function renderInline(input: string): ReactNode[] {
  const parts = input.split("**");
  const balanced = parts.length % 2 === 1;
  if (!balanced && process.env.NODE_ENV !== "production") {
    console.warn(`[renderInline] unbalanced "**" in input; rendering as plain text: ${input}`);
  }
  const nodes: ReactNode[] = [];
  for (let i = 0; i < parts.length; i += 1) {
    const part = parts[i];
    if (part === "") continue;
    const isBold = balanced && i % 2 === 1;
    nodes.push(
      isBold ? (
        <strong key={i}>{part}</strong>
      ) : (
        <Fragment key={i}>{part}</Fragment>
      )
    );
  }
  return nodes;
}
