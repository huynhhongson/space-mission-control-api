# --------- Build client ---------
FROM node:lts-alpine AS builder

WORKDIR /app

# Copy package.json của client và cài deps
COPY client/package*.json ./client/
WORKDIR /app/client
RUN npm install --omit=dev

# Copy toàn bộ code client và build
COPY client/ .
RUN npm run build   # => output: /app/client/build


# --------- Build server ---------
FROM node:lts-alpine

WORKDIR /app

# Copy package.json của server và cài deps
COPY server/package*.json ./server/
RUN npm install --omit=dev --prefix server

# Copy toàn bộ code server
COPY server/ server/

# Copy build output của client vào server/public
COPY --from=builder /app/client/build ./server/public

USER node

EXPOSE 8000

CMD ["npm", "start", "--prefix", "server"]
