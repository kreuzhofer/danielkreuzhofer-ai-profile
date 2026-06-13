/**
 * Handlebars template loader with a module-level cache.
 *
 * Templates live in `frontend/email-templates/*.hbs` and are read at runtime via
 * process.cwd() — the same fs pattern the app already uses for `content/` and
 * `knowledge/`. Each template is read + compiled once, then cached.
 */

import { promises as fs } from "fs";
import path from "path";
import Handlebars from "handlebars";

const TEMPLATE_DIR = path.join(process.cwd(), "email-templates");

const cache = new Map<string, HandlebarsTemplateDelegate>();

export async function loadTemplate(name: string): Promise<HandlebarsTemplateDelegate> {
  const cached = cache.get(name);
  if (cached) return cached;

  const raw = await fs.readFile(path.join(TEMPLATE_DIR, `${name}.hbs`), "utf8");
  const compiled = Handlebars.compile(raw);
  cache.set(name, compiled);
  return compiled;
}
