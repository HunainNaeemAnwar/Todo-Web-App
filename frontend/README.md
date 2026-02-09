# AI Task Manager - Frontend

A modern, responsive React/Next.js frontend for the AI Conversational Todo Manager.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5.0+
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State**: React Context API
- **HTTP Client**: Axios with interceptors
- **Authentication**: Better Auth (cookie-based JWT)

## Features

- Responsive dashboard with task statistics
- Create, read, update, delete (CRUD) tasks
- Task filtering (15+ filter options)
- Calendar view with task grouping
- Analytics dashboard with charts
- AI chat assistant integration
- Dark/light theme support
- Real-time notifications

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Configure environment variables
# See .env.example for required variables
```

### Development

```bash
# Start development server
npm run dev

# Run linting
npm run lint

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage
```

### Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
frontend/
├── src/
│   ├── app/           # Next.js App Router pages
│   │   ├── api/       # API proxy routes
│   │   ├── analytics/ # Analytics dashboard
│   │   ├── calendar/  # Calendar view
│   │   ├── chat/      # AI chat interface
│   │   └── user/      # User profile
│   ├── components/    # React components
│   │   ├── analytics/
│   │   ├── calendar/
│   │   ├── chat/
│   │   ├── common/
│   │   ├── notifications/
│   │   ├── theme/
│   │   └── user/
│   ├── contexts/     # React contexts
│   ├── lib/          # Utilities & config
│   ├── services/     # API services
│   ├── types/        # TypeScript types
│   └── utils/        # Helper functions
├── public/           # Static assets
└── tests/           # Test files
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL | Yes |
| `BETTER_AUTH_SECRET` | JWT signing secret | Yes |
| `BETTER_AUTH_URL` | Frontend URL | Yes |

## API Integration

The frontend communicates with the FastAPI backend via:

1. **Next.js Rewrites** (`next.config.js`): `/api/*` → `localhost:8000/api/*`
2. **Axios Client**: Configured with `withCredentials: true` for cookie-based auth
3. **Auth Context**: Manages user session state

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Context](https://react.dev/learn/passing-data-deeply-with-context)
- [Axios](https://axios-http.com/docs/intro)
