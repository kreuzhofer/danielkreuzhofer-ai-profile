import React from "react";

/**
 * Test stub for the ESM-only `react-markdown` (jest doesn't transform the ESM
 * dep tree). Renders the markdown source as text so tests can still assert on
 * content; markdown-to-HTML structure is out of scope for these unit tests.
 */
export default function ReactMarkdown({ children }: { children?: React.ReactNode }) {
  return <div data-testid="markdown-content">{children}</div>;
}
