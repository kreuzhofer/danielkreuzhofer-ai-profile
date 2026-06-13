import fs from "fs";
import path from "path";
import matter from "gray-matter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Metadata } from "next";

const filePath = path.join(process.cwd(), "content", "legal", "datenschutz.md");

function load() {
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  return { frontmatter: data as { title: string; description?: string }, content };
}

export function generateMetadata(): Metadata {
  const { frontmatter } = load();
  return { title: `${frontmatter.title} | Daniel Kreuzhofer`, description: frontmatter.description };
}

export default function DatenschutzPage() {
  const { content } = load();
  return (
    <article>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </article>
  );
}
