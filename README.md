# Keyboard Speed Typer

*Master the art of typing with precision and speed.*

**By Noximity**

---

## What It Does

A clean, focused typing trainer that helps you improve your words per minute through timed practice sessions. Choose your duration, start typing, and watch your speed improve.

## Quick Start

```bash
# Install dependencies
npm install

# Set up your database
echo 'DB_URL="postgresql://username:password@host:port/database"' > .env.local

# Initialize database
npm run db:push

# Start typing
npm run dev
```

Open [localhost:3000](http://localhost:3000) and start practicing.

## Features

- **15, 30, 60 second** practice sessions
- **Real-time WPM** calculation
- **Global leaderboard** with persistent scores
- **Clean interface** designed for focus

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run db:push` | Update database schema |
| `npm run studio` | Open database browser |

## Tech Stack

Built with Next.js 15, React 19, TypeScript, Tailwind CSS, and Prisma.

## License

MIT License - see [LICENSE](LICENSE) file.

---

*Happy typing!* ⌨️