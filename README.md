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

The `setup` Playwright project uses the built-in `page` fixture to log in once per run.
It starts with a clean browser context and confirms the session via Wikipedia's
`userinfo` API before saving authentication state to:

auth/auth.json

The `chromium` project depends on `setup` and loads this state, so the language test
starts already authorized. If authentication fails, the language test is skipped.
Both projects are included in the HTML report.

Run only authentication:

```bash
npx playwright test --project=setup
```

To inspect authentication locally with a visible browser:

```bash
npx playwright test --project=setup --headed
```

Normal local and Docker runs are headless. Login must succeed without manual
interaction; if Wikipedia requires CAPTCHA or email verification, resolve that
account challenge manually and rerun. The setup waits up to 30 seconds to confirm
the session, within the overall 60-second test timeout.

Authentication traces and videos are disabled to avoid recording login inputs.
The `.env` file and saved authentication state are ignored by Git.

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

tests/auth.setup.ts — Authentication setup project (login + storageState)

config/auth.ts — Shared authentication state path

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
