# Wikipedia Language Switch (Playwright + TypeScript)

Automation project for verifying that an **authorized Wikipedia user** can change the **interface language** via
**Preferences → User profile → Internationalisation**.

---

## ✅ Automated test case

**Title:** Successful interface language switch by an authorized user

### Preconditions

- User has a valid Wikipedia account.
- User is authorized (logged in).
- Interface language is English (prepared automatically by the fixture).

### Steps

1. Open **Preferences** page.
2. In **User profile** tab, locate **Internationalisation** section.
3. Change **Interface language** from **English** to **Ukrainian**.
4. Click **Save** button.

### Expected result

- Wikipedia interface is displayed in Ukrainian.
- `<html lang>` attribute starts with `uk`.
- UI elements are localized.

### Cleanup

The fixture restores the account's original interface language after the test,
including when the test fails.

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

🧩 Test fixtures and account state

`fixtures/test.ts` extends Playwright's `test` with a test-scoped `preferencesPage`
fixture. It opens Preferences, checks the active User profile tab, remembers the
original language, and prepares English before handing the page to the test.
Its `finally` block reopens Preferences and restores the original language.
The setter supports Wikipedia language codes beyond English and Ukrainian, so
cleanup can restore another original language as well.

The test itself only switches to Ukrainian and checks the resulting interface
language. Page Object methods perform interactions and synchronization; the
test owns the expected-result assertion.

The User profile tab is checked through its `aria-controls` relationship with the
panel containing the language field, without depending on translated tab names.

The configuration uses `workers: 1` because all tests share an account and change
server-side preferences. Separate browser contexts do not isolate those settings.
Parallel runs would require separate accounts per worker.

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

fixtures/test.ts — Page Object fixture, English precondition, and original-language cleanup

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
