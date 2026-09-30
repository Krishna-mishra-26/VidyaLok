# Production Deployment Checklist

Use this guide to launch VidyaLok for real users with secure authentication and data persistence.

## 1. Environment Variables

Set the following keys on your hosting platform (Vercel, Netlify, Render, etc.). Never commit real secrets to source control.

| Variable | Purpose | Notes |
|----------|---------|-------|
| `DATABASE_URL` | Prisma + NextAuth database connection | Point to your managed MongoDB cluster (e.g., MongoDB Atlas). Include username, password, and connection options. |
| `MONGO_URI` | Legacy Mongo client access | Keep identical to `DATABASE_URL` unless you separate read/write URIs. |
| `NEXTAUTH_SECRET` | NextAuth JWT/session signing key | Generate a 32-byte secret: `openssl rand -base64 32`. |
| `NEXTAUTH_URL` | Public HTTPS base URL | Example: `https://app.vidyalok.ai`. Required for callbacks and cookies. |
| `JWT_SECRET` | Server-side JWT signing key | Use another 32-byte secret distinct from `NEXTAUTH_SECRET`. |
| `ENCRYPTION_KEY` | Symmetric encryption key (custom features) | Generate a 32-byte hex or base64 string. |
| `ADMIN_REGISTRATION_CODE` | Secure admin onboarding code | Share privately with IT/admin leadership only. |

Optional: add mail/SMS provider credentials when enabling notifications (e.g., `SENDGRID_API_KEY`, `TWILIO_ACCOUNT_SID`).

## 2. Database Preparation

1. Provision a MongoDB Atlas cluster (or equivalent) and whitelist your hosting provider’s IPs.
2. Create a database user limited to the VidyaLok database.
3. Ensure the cluster (or local instance) runs as a **replica set**—Prisma requires replica semantics for MongoDB writes. For local testing, start MongoDB with:

   ```powershell
   mongod --dbpath C:\data\db --replSet vidyalok-rs
   ```

   Then initialize it once:

   ```powershell
   mongosh --eval "rs.initiate({_id: 'vidyalok-rs', members: [{ _id: 0, host: '127.0.0.1:27017' }]})"
   ```

   Atlas clusters are replica-ready by default.

4. Update `DATABASE_URL` with the new credentials or replica URI.
5. Apply the Prisma schema:

   ```powershell
   npx prisma db push
   ```

6. Seed an initial admin account using the register form (with your secure `ADMIN_REGISTRATION_CODE`) or via a one-off script using Prisma.

## 3. Build & Verification

Run locally before deploying:

```powershell
npm install
npm run lint
npm run build
```

Address lint errors where practical; document any known exceptions.

## 4. Deployment Steps

1. Push code to your main branch.
2. Configure environment variables on the hosting platform.
3. Trigger a production build (`npm run build` executed by the host).
4. Verify login, registration, and protected routes (`/student`, `/admin`).
5. Monitor the deployment logs for Prisma or NextAuth issues.

## 5. Operational Hardening

- Enable HTTPS and custom domain routing for `NEXTAUTH_URL`.
- Set up automated database backups (Atlas continuous backup).
- Configure uptime and error monitoring (e.g., Vercel Analytics, Sentry).
- Rotate secrets regularly (quarterly or sooner if shared credentials change).
- Maintain a break-glass admin account in case standard auth fails.

## 6. Post-Launch Checklist

- Confirm session persistence across browsers and devices.
- Validate that middleware correctly redirects unauthorized users.
- Review admin dashboard mock data and replace with real analytics endpoints when available.
- Train staff on the admin registration code workflow and password hygiene.

Keep this document updated as infrastructure evolves.
