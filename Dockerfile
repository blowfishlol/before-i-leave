FROM mcr.microsoft.com/playwright:v1.60.0-jammy

WORKDIR /app

COPY package*.json ./
RUN npm ci

# Playwright browsers are pre-installed in the base image, but we need to
# point it at the system-installed Chromium that comes with the image.
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

COPY . .

EXPOSE 3333

CMD ["node", "src/server.js"]
