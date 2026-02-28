# Submission checklist

## 1. Push to GitHub

Create a new repository on GitHub (e.g. `bitespeed-identity-reconciliation`), then run:

```bash
cd "c:\Users\ariks\BiteSpeed assignment"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your GitHub username and repo name.

## 2. Deploy to Render.com

1. Go to [Render Dashboard](https://dashboard.render.com).
2. **New → MySQL** – create a database. Copy **Internal Host**, **Username**, **Password**, **Database** (and Port if different from 3306).
3. **New → Web Service** – connect your GitHub account and select this repo.
4. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment** → Add:
     - `NODE_ENV` = `production`
     - `DB_HOST` = (Internal Host from step 2)
     - `DB_PORT` = `3306`
     - `DB_USER` = (MySQL username)
     - `DB_PASSWORD` = (MySQL password)
     - `DB_NAME` = (MySQL database name)
5. **Deploy.** After the first deploy, open the service → **Shell** and run:
   ```bash
   npx sequelize-cli db:migrate
   ```
   Or in **Settings → Release Command** set: `npx sequelize-cli db:migrate`
6. Copy your service URL (e.g. `https://bitespeed-identity-xxxx.onrender.com`).

## 3. Update README

In `README.md`, replace the Hosted Endpoint placeholder with your live URL, e.g.:

**Base URL:** `https://bitespeed-identity-xxxx.onrender.com`

Then commit and push:

```bash
git add README.md
git commit -m "docs: add hosted endpoint URL"
git push
```

## 4. Submit the task

1. Open: **https://forms.gle/hsQBJQ8tzbsp53D77**
2. Submit:
   - **GitHub repository URL** (e.g. `https://github.com/YOUR_USERNAME/YOUR_REPO_NAME`)
   - **Hosted /identify endpoint** (e.g. `https://bitespeed-identity-xxxx.onrender.com/identify`)
3. Use **JSON body** for requests, not form-data.

Example request to your live endpoint:

```bash
curl -X POST https://YOUR-APP.onrender.com/identify -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"phoneNumber\":\"123456\"}"
```
