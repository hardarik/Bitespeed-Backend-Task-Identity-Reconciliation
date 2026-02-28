# BiteSpeed Backend Task: Identity Reconciliation

Identity reconciliation service for linking customer contacts across orders (e.g. FluxKart.com). Links contacts by shared **email** or **phoneNumber**, keeps the oldest contact as **primary** and the rest as **secondary**.

## Tech Stack

- **Runtime:** Node.js  
- **Framework:** Express.js  
- **ORM:** Sequelize  
- **Database:** MySQL (local) / PostgreSQL (Render)  
- **API:** REST (JSON body)

## Contact Model

| Field           | Type                      |
|----------------|----------------------------|
| id             | Int (PK)                   |
| phoneNumber    | String (nullable)          |
| email          | String (nullable)          |
| linkedId       | Int (nullable, FK to Contact) |
| linkPrecedence | `"primary"` \| `"secondary"` |
| createdAt      | DateTime                   |
| updatedAt      | DateTime                   |
| deletedAt      | DateTime (nullable)        |

## API

### POST /identify

**Request (JSON body):**

```json
{
  "email": "string (optional)",
  "phoneNumber": "string or number (optional)"
}
```

At least one of `email` or `phoneNumber` is required.

**Response (200):**

```json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["lorraine@hillvalley.edu", "mcfly@hillvalley.edu"],
    "phoneNumbers": ["123456"],
    "secondaryContactIds": [23]
  }
}
```

- `emails`: primary contact’s email first, then others (unique).  
- `phoneNumbers`: primary contact’s phone first, then others (unique).  
- `secondaryContactIds`: all secondary contact IDs for this identity.

**Behaviour:**

- No matching contact → create new **primary** contact.  
- Match on email or phone with new info → create **secondary** linked to primary.  
- Request links two primaries → oldest stays primary, newer becomes secondary.  
- Duplicate (same email+phone already in cluster) → no new row, return consolidated contact.

## Local Setup

1. **Prerequisites:** Node.js, MySQL (e.g. MySQL80 on localhost:3306).

2. **Clone and install:**

   ```bash
   git clone <your-repo-url>
   cd bitespeed-identity-reconciliation
   npm install
   ```

3. **Environment:** Copy `.env.example` to `.env` and set:

   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=bitespeed_identity
   DB_NAME_TEST=bitespeed_identity_test
   ```

4. **Create DB and run migrations:**

   **MySQL (local):**
   ```bash
   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS bitespeed_identity CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS bitespeed_identity_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   npx sequelize-cli db:migrate
   ```
   **PostgreSQL (Render):** Use `npx sequelize-cli db:migrate` in the Render Shell (migrations work for both MySQL and Postgres). Raw reference schemas: `schema.sql` (MySQL), `schema-postgres.sql` (PostgreSQL).

5. **Start server:**

   ```bash
   npm start
   ```

   Server runs at `http://localhost:3000`.

6. **Test page:** Open `http://localhost:3000` in a browser to use the simple Identify test form.

7. **Run tests:**

   ```bash
   npm test
   ```

## Hosted Endpoint

**Base URL:** _Replace with your Render URL after deployment (e.g. `https://bitespeed-identity-xxxx.onrender.com`)_

**Identify endpoint:**  
`POST <YOUR_RENDER_URL>/identify`

Example after deploy:
```bash
curl -X POST https://YOUR-APP.onrender.com/identify -H "Content-Type: application/json" -d '{"email":"mcfly@hillvalley.edu","phoneNumber":"123456"}'
```
Use **JSON body** (not form-data).

## Deploy to Render.com

1. **Push this repo to GitHub** (see [SUBMIT.md](SUBMIT.md) for exact commands).
2. **Create PostgreSQL on Render:** Dashboard → New → PostgreSQL. Create a database (free tier available). Copy **Internal Database URL** or link it to the Web Service so `DATABASE_URL` is set automatically.
3. **Create Web Service:** In [Render](https://render.com): New → Web Service, connect the repo. Build: `npm install`, Start: `npm start`.
4. **Environment** → Connect your PostgreSQL so `DATABASE_URL` is set, or add `DATABASE_URL` with the Internal Database URL. Ensure `NODE_ENV`=production.
5. **Migrations:** In the service Shell run `npx sequelize-cli db:migrate`, or set Release Command to that.  
6. Put the live URL in this README under “Hosted Endpoint” and in the submission form.

## Submission

- Code on GitHub with small, clear commits.  
- `/identify` exposed and documented.  
- App hosted (e.g. Render); endpoint URL in this README.  
- Requests use **JSON body**, not form-data.  
- Submit via: [BiteSpeed - Frontend Task Submission](https://forms.gle/hsQBJQ8tzbsp53D77)
