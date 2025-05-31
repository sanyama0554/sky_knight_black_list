# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Granblue Fantasy (グランブルーファンタジー) blacklist management system built with Next.js 15, TypeScript, and Supabase. The application allows users to manage a blacklist of players with search, sort, and pagination features.

## Commands

```bash
# Development
npm run dev          # Start development server with Turbo mode

# Build & Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
```

## Architecture

### Tech Stack
- **Framework**: Next.js 15.3.2 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **Database/Auth**: Supabase
- **State Management**: Zustand
- **UI Components**: Radix UI primitives via shadcn/ui

### Key Patterns

1. **Client Components**: All interactive components use `"use client"` directive
2. **Custom Hooks**: Business logic is encapsulated in hooks:
   - `useAuth`: Authentication and user management
   - `useBlacklist`: Blacklist CRUD operations with pagination
   - `useProfile`: User profile management
3. **Error Handling**: Consistent try-catch patterns with toast notifications
4. **Japanese UI**: All user-facing text is in Japanese

### Data Flow
```
Supabase ← → Custom Hooks ← → Components ← → UI
```

### Authentication Flow
- Email/password authentication via Supabase
- Email confirmation required for new accounts
- Password reset via email
- Auth state persisted and synced across tabs

## Database Schema

The application expects these Supabase tables:
- `blacklist`: Stores blacklisted players (id, player_id, player_name, reason, created_at, user_id)
- `profiles`: User profile information

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Key Features Implementation

1. **Blacklist Management** (`src/components/BlacklistManager.tsx`):
   - Add/delete entries
   - Search by player ID, name, or reason
   - Sort by player name or creation date
   - Pagination (10 items per page)
   - Player detail modal with link to Granblue Fantasy profile

2. **Authentication** (`src/hooks/useAuth.ts`):
   - Sign up with email confirmation
   - Sign in/out
   - Password reset
   - Real-time auth state updates

3. **Dashboard** (`src/components/Dashboard.tsx`):
   - Tab-based navigation
   - Blacklist management
   - Profile settings

## Development Guidelines

- Follow existing component patterns in `src/components/`
- Use shadcn/ui components from `src/components/ui/`
- Maintain Japanese language for all UI text
- Handle errors with try-catch and show user feedback via toast
- Keep client-side logic in custom hooks
- Use Supabase client from `src/lib/supabase.ts`

## Common Tasks

### Adding a new UI component
1. Check if shadcn/ui has the component
2. Follow existing patterns in `src/components/ui/`
3. Use Tailwind classes for styling

### Working with Supabase
- Client instance: `import { supabase } from "@/lib/supabase"`
- Always check for auth before database operations
- Use RLS (Row Level Security) policies in Supabase

### State Management
- Local component state: useState
- Shared state: Create custom hooks with Zustand
- Server state: Supabase real-time subscriptions

## Notes
- No test files exist in the current codebase
- The project uses Next.js App Router (not Pages Router)
- All dates are displayed in Japanese locale format