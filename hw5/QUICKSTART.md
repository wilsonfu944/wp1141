# Quick Start Guide

Get the X social platform running in **under 10 minutes**.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL installed and running
- Basic familiarity with terminal/command line

## 1. Install Dependencies

```bash
npm install
```

## 2. Setup Database

### Start PostgreSQL (if not running)

```bash
# macOS (with Homebrew)
brew services start postgresql

# Or check if running
brew services list
```

### Create Database

```bash
createdb x_social
```

## 3. Configure Environment

Create `.env` file in project root:

```env
# Required for basic functionality
DATABASE_URL="postgresql://localhost:5432/x_social"
NEXTAUTH_SECRET="test-secret-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# OAuth - Use test credentials or skip for now
GOOGLE_CLIENT_ID="your-google-id"
GOOGLE_CLIENT_SECRET="your-google-secret"
GITHUB_ID="your-github-id"
GITHUB_SECRET="your-github-secret"
FACEBOOK_CLIENT_ID="your-facebook-id"
FACEBOOK_CLIENT_SECRET="your-facebook-secret"

# Pusher - Can use free tier
NEXT_PUBLIC_PUSHER_KEY="your-key"
NEXT_PUBLIC_PUSHER_CLUSTER="us2"
PUSHER_APP_ID="your-app-id"
PUSHER_SECRET="your-secret"
```

### Quick Environment Setup

#### **Option A: Minimum Setup (Skip OAuth)**

For testing without OAuth (won't work but structure is there):

```env
DATABASE_URL="postgresql://localhost:5432/x_social"
NEXTAUTH_SECRET="development-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

#### **Option B: Full Setup (15 minutes)**

Follow [ENV_SETUP.md](./ENV_SETUP.md) for complete OAuth and Pusher setup.

**Quick Pusher Setup** (5 min):
1. Go to [pusher.com](https://pusher.com/) → Sign up
2. Create app → Copy credentials
3. Add to `.env`

**Quick OAuth** (choose one, 5 min):
- **GitHub** (easiest):
  1. [github.com/settings/developers](https://github.com/settings/developers)
  2. New OAuth App
  3. Callback: `http://localhost:3000/api/auth/callback/github`
  4. Copy Client ID and Secret

## 4. Initialize Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) View database
npx prisma studio
```

## 5. Run Development Server

```bash
npm run dev
```

Visit: [http://localhost:3000](http://localhost:3000)

## 6. Test the App

### Create First User

1. Click "Sign in"
2. Use GitHub OAuth (or whichever you configured)
3. Enter userID (e.g., `testuser1`)
4. You're in! 🎉

### Test Features

**Create Post:**
- Click blue "Post" button in sidebar
- Type: `Hello X! Testing @testuser1 and #nextjs`
- Click "Post"

**Test Interactions:**
- Open app in another browser (or incognito)
- Sign in as different user (`testuser2`)
- Find first user's post
- Try like, repost, comment

**Test Real-time:**
- Keep both browsers open side-by-side
- Like a post in one browser
- Watch count update in other browser instantly!

## Troubleshooting

### Database Connection Error

```bash
# Check PostgreSQL is running
brew services list

# Check database exists
psql -l | grep x_social

# Recreate database
dropdb x_social
createdb x_social
npx prisma migrate dev
```

### OAuth Not Working

```
Error: Invalid redirect URI
```

**Fix**: Update OAuth app callback URL to exactly:
```
http://localhost:3000/api/auth/callback/[provider]
```

### Pusher Not Working

```
Error: Pusher key invalid
```

**Quick Fix**: Real-time will be disabled but app still works. Update Pusher credentials when ready.

### Port 3000 Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

## Next Steps

- Read [README.md](./README.md) for full feature documentation
- See [TESTING.md](./TESTING.md) for complete testing checklist
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for Vercel deployment
- Review [ENV_SETUP.md](./ENV_SETUP.md) for OAuth details

## Demo Data (Optional)

### Seed Database with Test Data

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create test user (you'll need to sign in first to get a real user ID)
  console.log('Seed your data here');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run:
```bash
npx prisma db seed
```

## Common Commands

```bash
# Start development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# View database
npx prisma studio

# Reset database (caution: deletes all data)
npx prisma migrate reset

# Check for errors
npm run lint

# Format code
npx prettier --write .
```

## File Structure

```
x-social/
├── app/
│   ├── (main)/          # Protected routes
│   │   ├── home/        # Feed
│   │   ├── post/[id]/   # Post detail
│   │   └── profile/     # Profiles
│   ├── api/             # API routes
│   └── auth/            # Auth pages
├── components/          # React components
├── lib/                 # Utilities
├── prisma/              # Database
│   └── schema.prisma
└── .env                 # Environment variables
```

## Getting Help

**Issues?**
1. Check terminal for error messages
2. Check browser console (F12)
3. Review [TESTING.md](./TESTING.md)
4. Check [ENV_SETUP.md](./ENV_SETUP.md)

**Works on localhost but not deployed?**
- See [DEPLOYMENT.md](./DEPLOYMENT.md)
- Update OAuth redirect URIs for production
- Verify environment variables in Vercel

## Features Checklist

After setup, you should be able to:

- [x] Sign in with OAuth
- [x] Create userID
- [x] Post content (with character counting)
- [x] Like/unlike posts
- [x] Repost
- [x] Comment (recursive)
- [x] Delete own posts
- [x] View/edit profile
- [x] Follow/unfollow users
- [x] See "All" and "Following" feeds
- [x] Real-time updates (with Pusher)
- [x] Draft system

## Production Checklist

Before deploying:

- [ ] Configure all OAuth providers
- [ ] Setup Pusher
- [ ] Create production database
- [ ] Generate strong `NEXTAUTH_SECRET`
- [ ] Update OAuth redirect URIs
- [ ] Test all features locally
- [ ] Follow [DEPLOYMENT.md](./DEPLOYMENT.md)

## Contact & Support

For course-specific questions:
- Check course materials
- Ask in class/office hours
- Review assignment requirements

For technical issues:
- Next.js: [nextjs.org/docs](https://nextjs.org/docs)
- Prisma: [prisma.io/docs](https://prisma.io/docs)
- NextAuth: [next-auth.js.org](https://next-auth.js.org/)
- Pusher: [pusher.com/docs](https://pusher.com/docs)






