# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

RickMortyQuizverse is a Wordle-style guessing game based on Rick and Morty. It has two components:

- **Frontend**: Angular 20 SPA in `Quizverse.Frontend/` (port 4200)
- **Backend**: ASP.NET Core 8.0 API in `Quizverse.Backend/` (port 8081)
- **Database**: PostgreSQL (port 5432, db: `quizverse_users`, user/pass: `postgres`/`postgres`)

### Running services

1. **PostgreSQL** must be started first:
   ```
   sudo pg_ctlcluster 16 main start
   ```

2. **Backend API** requires env vars for DB connection:
   ```
   export HOST=localhost DATABASE=quizverse_users USERNAME=postgres PASSWORD=postgres
   cd Quizverse.Backend/QuizVerse.Api && dotnet run --environment Development
   ```
   Swagger UI available at `http://localhost:8081/swagger` in Development mode.

3. **Frontend dev server**:
   ```
   cd Quizverse.Frontend && npx ng serve --host 0.0.0.0 --port 4200
   ```

### Build commands

- **Frontend**: `npm run build` in `Quizverse.Frontend/`
- **Backend**: `dotnet build` in `Quizverse.Backend/`

### Testing

- **Backend tests**: `dotnet test` in `Quizverse.Backend/` — note that existing tests have pre-existing issues: `LoginControllerTests.LoginUser` is an integration test requiring a running server at `localhost:7295`, and `RegisterControllerTests` has an uninitialized `_userAppService` field. Both tests fail even with a correct setup.
- **Frontend tests**: `npm test` in `Quizverse.Frontend/` (Karma + Jasmine, requires a browser)
- No ESLint config exists; TypeScript strict mode is enforced via `tsconfig.json`.

### Gotchas

- The backend reads DB credentials from environment variables (`HOST`, `DATABASE`, `USERNAME`, `PASSWORD`), not from `appsettings.json`. The `DbConnection` class in `QuizVerse.Platform/Infrastructure/Database/DbConnection.cs` constructs the connection string from these env vars.
- The Kestrel endpoint is configured as `http://0.0.0.0:8081` in `appsettings.json` (labeled "Https" but actually HTTP).
- Frontend fetches character data directly from the public Rick and Morty API (`https://rickandmortyapi.com/api/character`), requiring internet access.
