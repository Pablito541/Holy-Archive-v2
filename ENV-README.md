# Environment Variables Setup

For local development and deployment, you need to set the following environment variables:

## Required Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Getting Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the "Project URL" and paste it as `NEXT_PUBLIC_SUPABASE_URL`
4. Copy the "anon/public" key and paste it as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Vercel Deployment

When deploying to Vercel, add these environment variables in the Vercel dashboard:
- Project Settings > Environment Variables
- Add each variable with its value
- Make sure to add them for Production, Preview, and Development environments
