# Crypto Shooters Trading Signals Platform

A professional trading signals management platform built with React, TypeScript, and Supabase, featuring real-time Telegram notifications.

## Features

### Signal Management
- Create and manage trading signals (Market/Limit orders)
- Support for Spot, Long, and Short positions
- Multiple entries, stop losses, and take profits
- Real-time signal status updates
- Comprehensive signal history tracking

### Telegram Integration
- Instant notifications for new signals
- Status change notifications (activation, take profit hits, etc.)
- Signal modification alerts
- Automated signal list updates
- Reply-based notification threading

### User Features
- Secure email authentication via Supabase
- Customizable usernames for Telegram notifications
- Personal signal history tracking
- Real-time data synchronization

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- Lucide React for icons
- React Router for navigation
- Zustand for state management

### Backend & Database
- Supabase for backend services
- PostgreSQL database with RLS
- Real-time subscriptions
- Secure authentication

## Project Structure

```
src/
├── components/           # React components
│   ├── auth/            # Authentication components
│   ├── history/         # Signal history components
│   ├── navigation/      # Navigation components
│   ├── ui/              # Reusable UI components
│   └── user/            # User-specific components
├── config/              # Configuration files
├── hooks/               # Custom React hooks
├── services/            # API services
├── store/               # State management
├── types/               # TypeScript types
└── utils/               # Utility functions
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Telegram Configuration
   VITE_TELEGRAM_BOT_TOKEN=your_bot_token
   VITE_TELEGRAM_CHAT_ID=your_chat_id
   VITE_TELEGRAM_TOPIC_ID=your_topic_id
   VITE_TELEGRAM_ACTIVATION_TOPIC_ID=your_activation_topic_id
   VITE_TELEGRAM_SIGNAL_LIST_TOPIC_ID=your_signal_list_topic_id
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

## Database Schema

### Profiles Table
```sql
create table public.profiles (
  id uuid references auth.users primary key,
  username text unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### Signals Table
```sql
create table public.signals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) not null,
  pair text not null,
  type text not null check (type in ('Limit', 'Market')),
  position text not null check (position in ('Long', 'Short', 'Spot')),
  leverage numeric,
  entries jsonb not null default '[]'::jsonb,
  stop_losses jsonb not null default '[]'::jsonb,
  take_profits jsonb not null default '[]'::jsonb,
  comments text,
  trading_view_url text,
  risk_reward text,
  created_at timestamptz default now(),
  status text not null check (
    status in ('active', 'pending', 'completed', 'partial profits', 'stopped') or
    status ~ '^take-profit-\d+$' or
    status ~ '^stop-loss-\d+$' or
    status ~ '^entry-\d+$'
  ),
  telegram_message_id integer,
  last_modification_id integer
);
```

## Security Features

- Row Level Security (RLS) ensures users can only access their own data
- Secure email authentication via Supabase
- Environment variables for sensitive configuration
- PostgreSQL functions and triggers for data integrity

## Signal Status Flow

1. New Signal Creation
   - Market orders → Active status
   - Limit orders → Pending status

2. Signal Activation
   - Manual activation with custom price
   - Automatic activation at entry price

3. Take Profit/Stop Loss Hits
   - Multiple take profit levels tracking
   - Automatic status updates
   - History tracking for completed signals

4. Signal History
   - Completed signals
   - Partial profits tracking
   - Stopped signals
   - Full signal history with all modifications

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.