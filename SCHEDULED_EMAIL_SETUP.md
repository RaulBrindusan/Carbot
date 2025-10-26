# Scheduled Email Setup

This document explains how the daily email report is configured to send automatically at 16:00 Romania time.

## How It Works

The system sends a daily email report with the top 10 most profitable cars from Firebase to `brindusanraull@gmail.com`.

## Files Created

1. **`/app/api/send-daily-report/route.ts`** - API endpoint that fetches cars and sends the email
2. **`vercel.json`** - Vercel Cron configuration
3. **`.env.local`** - Contains CRON_SECRET for security

## Schedule

- **Time**: 16:00 Romania Time (EET/EEST)
- **Cron Schedule**: `0 14 * * *` (14:00 UTC = 16:00 Romania Time in winter)
- **Frequency**: Daily

### Note on Daylight Saving Time

Romania uses:
- **Winter (EET)**: UTC+2 → 16:00 Romania = 14:00 UTC ✅ (Current setting)
- **Summer (EEST)**: UTC+3 → 16:00 Romania = 13:00 UTC

If you need to adjust for summer time, change the cron schedule in `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/send-daily-report",
      "schedule": "0 13 * * *"  // For summer time (EEST)
    }
  ]
}
```

## Deployment Options

### Option 1: Vercel (Recommended)

1. Deploy your Next.js app to Vercel
2. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `EMAIL_PASSWORD`
   - `NEXT_PUBLIC_BREVO_API_KEY`
   - `CRON_SECRET` (optional, for security)

3. Vercel will automatically read `vercel.json` and set up the cron job

**Note**: Vercel Cron is only available on **Pro plans and above**. Free plans do not support cron jobs.

### Option 2: Other Platforms (Alternative)

If deploying elsewhere (Railway, Render, etc.), you can use external cron services:

#### Using cron-job.org (Free)

1. Go to https://cron-job.org
2. Create a free account
3. Create a new cron job:
   - **URL**: `https://your-domain.com/api/send-daily-report`
   - **Schedule**: Daily at 14:00 UTC
   - **Method**: GET
   - **Headers** (optional): `Authorization: Bearer your-cron-secret`

#### Using GitHub Actions (Free)

Create `.github/workflows/daily-email.yml`:

```yaml
name: Send Daily Email Report

on:
  schedule:
    - cron: '0 14 * * *'  # 14:00 UTC = 16:00 Romania (winter)
  workflow_dispatch:  # Allows manual trigger

jobs:
  send-email:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Email API
        run: |
          curl -X GET https://your-domain.com/api/send-daily-report \
               -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

## Testing

### Test the endpoint locally:

```bash
# Start your dev server
npm run dev

# In another terminal, trigger the email:
curl http://localhost:3000/api/send-daily-report
```

### Test in production:

```bash
curl https://your-domain.com/api/send-daily-report
```

The email should be sent to `brindusanraull@gmail.com` with the current top 10 most profitable cars.

## Email Content

The daily email includes:

- **Subject**: Daily Report: Top 10 Most Profitable Cars - [Date]
- **Summary Stats**: Total Profit, Average Profit, Total Cars
- **Top 10 Cars** with:
  - Make/Model and Year
  - Profit amount and percentage
  - Cost and Auction price
  - Auto1 link (if available)
- **CTA Button**: Browse Cars on Auto1
- **Timestamp**: Report generation time in Romania timezone

## Security

The `CRON_SECRET` environment variable adds basic authentication to prevent unauthorized access to the cron endpoint. Make sure to:

1. Set a strong secret value in production
2. Use the same secret in your cron service configuration
3. Never commit `.env.local` to version control

## Troubleshooting

**Email not sending:**
- Check Vercel logs or your server logs
- Verify all environment variables are set correctly
- Test the endpoint manually with curl
- Check Brevo SMTP credentials

**Wrong time:**
- Adjust cron schedule in `vercel.json` for DST
- Verify your deployment platform's timezone settings

**No cars in email:**
- Verify Firebase has cars with profit data
- Check Firebase security rules allow reading from 'cars' collection
