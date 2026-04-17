import fs from "fs";
import path from "path";
import matter from "gray-matter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Metadata } from "next";

const filePath = path.join(process.cwd(), "content", "downloads", "business-case-one-pager.md");

function loadContent() {
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  return { frontmatter: data as { title: string; description: string }, content };
}

export function generateMetadata(): Metadata {
  const { frontmatter } = loadContent();
  return {
    title: `${frontmatter.title} | Daniel Kreuzhofer`,
    description: frontmatter.description,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function BusinessCaseOnePagerPage() {
  const { content } = loadContent();

  return (
    <article>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </article>
  );
}
