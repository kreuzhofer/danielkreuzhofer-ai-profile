# AI-Powered Personal Portfolio

An interactive portfolio website featuring an AI chatbot that can answer questions about your professional experience, skills, and projects. Built with Next.js and powered by OpenAI.

## Features

- **AI Chatbot** - Ask questions about experience, skills, and projects in natural language
- **Expandable Content Layers** - Progressive disclosure from quick summaries to deep context
- **Fit Analysis Module** - Paste a job description to get an honest alignment assessment
- **Transparency Dashboard** - Visual representation of core strengths, working knowledge, and explicit gaps
- **Mobile-First Design** - Responsive layout optimized for all devices
- **MDX Content** - Easy-to-edit content files for experiences, projects, and skills

## Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose (for containerized deployment)
- OpenAI API key

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/ai-portfolio.git
cd ai-portfolio
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:
```
OPENAI_API_KEY=sk-your-key-here
```

### 3. Run with Docker (Recommended)

```bash
# Development mode (with hot reload)
docker compose --profile development up -d

# Production mode
docker compose --profile production up -d
```

The site will be available at `http://localhost:8087`

### 4. Run Locally (Without Docker)

```bash
cd frontend
npm install
npm run dev:local
```

## Project Structure

```
├── frontend/               # Next.js application
│   ├── content/           # MDX content files
│   │   ├── experience/    # Work experience entries
│   │   ├── projects/      # Project showcases
│   │   ├── about.mdx      # About section
│   │   ├── contact.mdx    # Contact information
│   │   └── skills.mdx     # Skills & expertise
│   └── src/
│       ├── app/           # Next.js app router pages
│       ├── components/    # React components
│       └── lib/           # Utilities & API clients
├── knowledge/             # Private knowledge files (git submodule)
├── knowledge-examples/    # Sample knowledge files (public)
├── docker-compose.yml     # Docker configuration
└── .env.example          # Environment template
```

## Customizing Your Portfolio

### Content Files (MDX)

Edit the files in `frontend/content/` to customize your portfolio:

- **`about.mdx`** - Your headline, bio, and value proposition
- **`skills.mdx`** - Skill categories with proficiency levels
- **`experience/*.mdx`** - Individual work experience entries
- **`projects/*.mdx`** - Project showcases

### Knowledge Base

The AI chatbot uses knowledge files to answer questions. You have two options:

#### Option A: Simple Setup (Public)

Add `.md` files directly to `knowledge-examples/`. These will be used as fallback content.

#### Option B: Private Knowledge (Recommended)

Use a git submodule for private knowledge:

1. Create a private repository for your knowledge files
2. Add it as a submodule:
   ```bash
   git submodule add git@github.com:YOUR_USERNAME/private-knowledge.git knowledge
   ```
3. Your private knowledge will be used when available, with `knowledge-examples/` as fallback

See [knowledge-examples/README.md](knowledge-examples/README.md) for file format details.

## Deployment

### Portainer (Recommended for Self-Hosting)

Portainer doesn't support git submodules, but you can fetch private knowledge at build time using a GitHub token:

1. **Create a fine-grained personal access token** on GitHub:
   - Go to Settings → Developer settings → Personal access tokens → Fine-grained tokens
   - Create token with "Contents: Read" permission for your private knowledge repo

2. **In Portainer**, create a new stack and set these environment variables:
   ```
   OPENAI_API_KEY=sk-your-key-here
   KNOWLEDGE_REPO=github.com/yourusername/private-knowledge.git
   GITHUB_TOKEN=github_pat_xxxxxxxxxxxx
   ```
   
   Note: `KNOWLEDGE_REPO` accepts both formats:
   - `github.com/user/repo.git`
   - `https://github.com/user/repo.git`

3. Deploy with the `production` profile

The Docker build will automatically clone your private knowledge repo.

### Docker Host (Direct)

If you have direct SSH access and can use submodules:

```bash
git clone --recurse-submodules git@github.com:YOUR_USERNAME/ai-portfolio.git
cd ai-portfolio
cp .env.example .env
# Edit .env with your OPENAI_API_KEY
docker compose --profile production up -d
```

### Updating

```bash
git pull
git submodule update --remote  # If using submodule locally
docker compose --profile production up -d --build
```

## Development

### Running Tests

```bash
npm test --prefix frontend
```

### Code Structure

- **`/frontend/src/lib/knowledge-loader.ts`** - Loads and compiles knowledge for the AI
- **`/frontend/src/lib/llm-client.ts`** - OpenAI API integration
- **`/frontend/src/components/`** - React UI components

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | Yes | - | Your OpenAI API key |
| `OPENAI_MODEL` | No | `gpt-4o-mini` | Model to use for chat |
| `PORT` | No | `8087` | Application port |
| `NODE_ENV` | No | `development` | Environment mode |
| `KNOWLEDGE_REPO` | No | - | Private knowledge repo URL (for Portainer) |
| `GITHUB_TOKEN` | No | - | GitHub token for private repo access |

### Supported OpenAI Models

- `gpt-4o` - Most capable, higher cost
- `gpt-4o-mini` - Good balance of quality and cost (default)
- `gpt-4-turbo` - Fast, high quality
- `gpt-3.5-turbo` - Fastest, lowest cost

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [OpenAI API](https://platform.openai.com/)
- [MDX](https://mdxjs.com/)
