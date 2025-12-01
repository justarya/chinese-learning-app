# Whitelist Management Guide

This guide explains how to manage user access to your Chinese Learning App through the whitelist system.

## Overview

The whitelist system restricts access to the application. Users can sign in with Google OAuth, but they must be whitelisted in the database to access the app features.

## How It Works

1. **User Signs In**: Users authenticate via Google OAuth
2. **Whitelist Check**: The system checks if the user's `is_whitelisted` flag is `true`
3. **Access Granted/Denied**:
   - ✅ Whitelisted users: Full access to the app
   - ❌ Non-whitelisted users: See a "Whitelist Wall" with instructions to contact you

## Managing the Whitelist

### Method 1: Using PostgreSQL CLI (psql)

```bash
# Connect to your database
psql -h localhost -U postgres -d chinese_learning_app

# View all users and their whitelist status
SELECT id, email, name, is_whitelisted, created_at FROM users;

# Whitelist a user by email
UPDATE users SET is_whitelisted = true WHERE email = 'user@example.com';

# Whitelist a user by ID
UPDATE users SET is_whitelisted = true WHERE id = 'user-uuid-here';

# Remove a user from whitelist
UPDATE users SET is_whitelisted = false WHERE email = 'user@example.com';

# View all whitelisted users
SELECT email, name, created_at FROM users WHERE is_whitelisted = true;

# View all non-whitelisted users
SELECT email, name, created_at FROM users WHERE is_whitelisted = false;
```

### Method 2: Using a Database GUI Tool

You can use tools like:
- **pgAdmin**: Popular PostgreSQL GUI
- **DBeaver**: Universal database tool
- **TablePlus**: Modern database GUI
- **DataGrip**: JetBrains database IDE

Connect to your database and:
1. Navigate to the `users` table
2. Find the user by email
3. Set `is_whitelisted` to `true`
4. Save the changes

### Method 3: Using TypeORM Query Runner (Advanced)

If you want to create a script to whitelist users:

```typescript
// scripts/whitelist-user.ts
import { DataSource } from 'typeorm';
import { User } from './src/user/user.entity';

const whitelistUser = async (email: string) => {
  const dataSource = new DataSource({
    // ... your database config
  });

  await dataSource.initialize();

  const userRepository = dataSource.getRepository(User);
  const user = await userRepository.findOne({ where: { email } });

  if (user) {
    user.isWhitelisted = true;
    await userRepository.save(user);
    console.log(`✅ User ${email} has been whitelisted`);
  } else {
    console.log(`❌ User ${email} not found`);
  }

  await dataSource.destroy();
};

whitelistUser('user@example.com');
```

## Workflow for Adding New Users

1. **User Requests Access**: They email you at justaryaid@gmail.com
2. **Verify User**: Review their request
3. **Whitelist in Database**: Run the SQL command to set `is_whitelisted = true`
4. **Notify User**: Tell them they can now access the app
5. **User Logs In**: They'll have full access after refreshing

## Pre-whitelisting Users

If you want to whitelist users before they sign in for the first time:

```sql
-- This won't work for new users who haven't signed in yet
-- Users must sign in at least once to create their account

-- After they sign in for the first time, immediately whitelist them:
UPDATE users SET is_whitelisted = true WHERE email = 'expected-user@example.com';
```

**Note**: Users must sign in at least once before they appear in the database. You cannot pre-whitelist email addresses that haven't signed in yet.

## Bulk Whitelisting

To whitelist multiple users at once:

```sql
-- Whitelist specific emails
UPDATE users
SET is_whitelisted = true
WHERE email IN (
  'user1@example.com',
  'user2@example.com',
  'user3@example.com'
);

-- Whitelist all users (not recommended for production)
UPDATE users SET is_whitelisted = true;
```

## Security Best Practices

1. **Regular Audits**: Periodically review your whitelist
2. **Documentation**: Keep a record of why users were whitelisted
3. **Removal Process**: Have a process to remove access if needed
4. **Monitoring**: Log whitelist changes for security

## Contact Information

Users who aren't whitelisted will see a message to contact:
- **Email**: justaryaid@gmail.com

To change this email:
1. Update `backend/src/auth/guards/whitelist.guard.ts`
2. Update `frontend/src/components/WhitelistWall.jsx`

## Troubleshooting

### User says they're whitelisted but still sees the wall

1. Check the database: `SELECT is_whitelisted FROM users WHERE email = 'user@example.com';`
2. Ask user to clear browser cache and localStorage
3. Ask user to log out and log back in
4. Verify the JWT token is being refreshed

### Database column doesn't exist

Run the migration:
```bash
cd backend
npm run migration:run
```

### User can't sign in at all

This is different from the whitelist. Check:
- Google OAuth configuration
- JWT secret is set
- Backend is running
