# RileysCrush — single-image build: compiles the client and runs the Express
# server (tsx, no separate compile step) which serves both the API and the
# built static assets on one port.

FROM node:20-alpine AS build
WORKDIR /app

COPY package.json ./
COPY client/package.json client/package.json
COPY server/package.json server/package.json
RUN npm install

COPY . .
RUN npm run build --workspace=client

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000

COPY --from=build /app /app

EXPOSE 4000
VOLUME ["/app/data"]

CMD ["npm", "run", "start", "--workspace=server"]
