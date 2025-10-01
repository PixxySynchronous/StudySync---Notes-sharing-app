## Deploying StudySync Backend to Render

### 1. Prerequisites
- GitHub repository pushed (you have it: StudySync---Notes-sharing-app)
- MongoDB Atlas connection string (already in `.ENV`, remove trailing semicolon)
- A strong `JWT_SECRET`

### 2. Clean Up Local `.ENV`
Example (do NOT commit this file):
```
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster.xyz.mongodb.net/studysync?retryWrites=true&w=majority
JWT_SECRET=<generate a long random string>
FRONTEND_URL=https://your-frontend.onrender.com
PORT=10000
```
Render will inject these as environment variables. Delete any trailing `;` from values.

### 3. Update Scripts (done)
`package.json` now has:
```
"dev": "nodemon server.js"
"start": "node server.js"
```
Render uses `npm start`.

### 4. Create Render Web Service
1. Dashboard → New + → Web Service
2. Select the GitHub repo
3. Root directory: `backend`
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Node version (optional): add environment variable `NODE_VERSION=20`

### 5. Environment Variables (Render UI)
| Key | Value |
|-----|-------|
| MONGO_URI | <your atlas uri> |
| JWT_SECRET | <long random secret> |
| FRONTEND_URL | https://your-frontend.onrender.com |
| PORT | 10000 (or leave blank; Render assigns) |

If you deploy the frontend separately (e.g. Render Static Site), use its final URL for `FRONTEND_URL`.

### 6. CORS Notes
`server.js` dynamically allows:
- Local dev origins
- Your configured `FRONTEND_URL`
- Any `*.render.com` preview origin

### 7. Health Check
Render auto pings `/`. Endpoint returns JSON:
```
{ message: 'StudySync Backend API is running!', timestamp: '...' }
```

### 8. File Uploads
Uploads currently stored on ephemeral disk at `/uploads`. For production durability consider:
- AWS S3 bucket + `multer-s3`
- Or accept ephemerality (files lost on redeploy)

### 9. Security Checklist
- NEVER commit `.ENV`
- Regenerate a strong `JWT_SECRET`
- Restrict MongoDB Atlas network to Render egress IPs (optional) or use access lists

### 10. Frontend Adjustments
In the frontend `api.ts` ensure `API_BASE_URL` points to `https://your-backend.onrender.com/api` when building prod. Implement via Vite env var (`VITE_API_BASE_URL`).

### 11. Optional: Add Vite Env Support
Create `.env.production` in frontend with:
```
VITE_API_BASE_URL=https://your-backend.onrender.com/api
```

### 12. Redeploy Workflow
Push to `main` → Render auto builds → Test `/` and `/api/auth/login`.

---
Need S3 integration or frontend deployment steps? Ask and we’ll extend this.