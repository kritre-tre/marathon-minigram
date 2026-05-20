# Marathon Mini Program Backend

This is a Node.js/Express backend for the Marathon WeChat mini program. It uses MySQL and the tables supplied in the system design.

## Setup

```bash
cd server
npm install
copy .env.example .env
npm start
```

Edit `.env` before starting. Do not commit real database passwords or server passwords.

Required database settings:

- `DB_HOST`: MySQL host, for example `81.70.214.183`
- `DB_USER`: database user, for example `kritre`
- `DB_PASSWORD`: database password
- `DB_NAME`: migrated database name

## Important Schema Notes

The supplied DDL has a few issues that should be fixed on the server database:

- `user_database` primary key should be `UserID`, not `adminID`.
- `User_database` and `user_database` casing should be consistent.
- `user_database` is missing a comma before `PRIMARY KEY`.
- Columns named `start-time` and `signup-endtime` require backticks in SQL. The backend handles this, but names like `startTime` and `signupEndTime` are easier to maintain.
- Plain-text passwords are unsafe. This backend stores bcrypt hashes in the existing password columns.

## API Shape

All JSON responses use:

```json
{ "success": true, "data": {} }
```

or:

```json
{ "success": false, "message": "error message" }
```

Protected routes require:

```http
Authorization: Bearer <token>
```

