FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY tsconfig.json ./
COPY src/ ./src/

RUN npm install -g ts-node typescript && npm install

ENTRYPOINT ["npx", "ts-node", "src/cli.ts"]
CMD ["config.json"]
