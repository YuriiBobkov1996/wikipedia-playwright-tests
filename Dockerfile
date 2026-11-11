FROM mcr.microsoft.com/playwright:v1.57.0-jammy

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

RUN mkdir -p /app/playwright-report /app/test-results /app/auth

CMD ["npx", "playwright", "test"]