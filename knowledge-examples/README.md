# Knowledge Examples

This folder contains example knowledge files demonstrating the expected format for the AI chatbot's knowledge base.

## How It Works

The AI chatbot loads knowledge from the `knowledge/` directory. If that directory is empty or missing (e.g., when the private submodule isn't available), the system automatically falls back to these example files.

## File Format

Knowledge files are Markdown (`.md`) files. The content is loaded as-is and provided to the LLM as context for answering questions.

### Recommended Structure

Each file should focus on a specific topic:
- `cv-[name].md` - Resume/CV information
- `[company]-[role].md` - Detailed experience at a specific company
- `[topic].md` - Any other relevant knowledge

### Example Content Structure

```markdown
# Topic Title

## Overview
Brief summary of the topic.

## Key Points
- Point 1
- Point 2

## Details
More detailed information that helps the AI answer questions accurately.
```

## Creating Your Own Knowledge Base

1. Create a `knowledge/` directory (or use a private git submodule)
2. Add your `.md` files with personal/professional information
3. The chatbot will automatically use these files as context

## Privacy Note

The `knowledge/` directory is designed to be kept private (via git submodule or .gitignore). These example files are public and contain only fictional/sample data.
