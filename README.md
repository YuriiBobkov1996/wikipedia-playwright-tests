# Wikipedia Language Switch (Playwright + TypeScript)

Automation project for verifying that an **authorized Wikipedia user** can change the **interface language** via
**Preferences → User profile → Internationalisation**.

---

## ✅ Automated test case

**Title:** Successful interface language switch by an authorized user

### Preconditions

- User has a valid Wikipedia account.
- User is authorized (logged in).

### Steps

1. Open **Preferences** page.
2. In **User profile** tab, locate **Internationalisation** section.
3. Change **Interface language** from **English** to **Ukrainian**.
4. Click **Save** button.

### Expected result

- Wikipedia interface is displayed in Ukrainian.
- `<html lang>` attribute starts with `uk`.
- UI elements are localized.

---

## 🧰 Tech stack

- Playwright
- TypeScript
- Docker / docker-compose
- Playwright built-in HTML report

---

## 📦 Project setup

### 1️⃣ Install dependencies

```bash
npm ci
```

2️⃣ Create .env file in project root (do not commit)

Example:

```env
BASE_URL=https://en.wikipedia.org
WIKI_USERNAME=your_username
WIKI_PASSWORD=your_password
```

Credentials are read from process.env and must not be committed to the repository.

▶️ Run tests locally

Run all tests:

```bash
npx playwright test
```

Run in headed mode (debug):

```bash
npx playwright test --headed
```

Open HTML report after execution:

```bash
npx playwright show-report
```

🔐 Authentication (storageState)

The project uses globalSetup to perform login once and save authentication state to:

auth/auth.json

This approach speeds up test execution and ensures tests start already authorized.

🐳 Run tests in Docker
Requirements

Docker Desktop (or Docker Engine)

docker-compose

Build image and run tests

```bash
docker-compose up --build
```

If the image is already built and no changes were made:

```bash
docker-compose up
```

Stop containers:

```bash
docker-compose down
```

📊 HTML report on host machine

Playwright generates an HTML report inside the Docker container.
Using Docker volumes, the report is automatically available on the host machine.

After test execution, open:

./playwright-report/index.html

Artifacts such as screenshots, videos, and traces (if enabled) are stored on host in:

./test-results/

🗂️ Project structure (high level)

pages/ — Page Objects

tests/ — Test specifications

scripts/login.setup.ts — Global setup (login + storageState)

playwright.config.ts — Playwright configuration

docker-compose.yml / Dockerfile — Docker configuration

🔒 Security notes

.env file is ignored by git and must not be pushed.

No sensitive data is stored in the repository.

Real credentials should be provided locally via .env file.

✅ Verification of requirement “report copied to host”

When running tests in Docker, the HTML report is generated inside the container at:

/app/playwright-report

Docker volume maps this directory to the host:

./playwright-report

As a result, the report is available locally at:

./playwright-report/index.html
