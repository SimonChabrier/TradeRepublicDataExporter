# Repository Guidelines

This project follows a lightweight clean architecture.

- **Entry points**
  - `main.js` launches the export process.
  - `server.js` starts the Express web server.
- **Structure** (inside `src/`)
  - `domain/` – pure business logic
  - `application/` – orchestration/use cases
  - `infrastructure/` – Trade Republic API access
  - `interfaces/http/` – Express server, routes and views

## Development

- Use environment variables for credentials. See `.env.example` for required names.
- After modifying dependencies, run `npm install` and `npm audit` before committing.
- Keep modules focused on a single responsibility and avoid mixing concerns.
