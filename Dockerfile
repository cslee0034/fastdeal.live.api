FROM node:lts-alpine as build

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .
RUN npm run build

FROM node:lts-alpine

RUN npm install -g pm2

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist

EXPOSE 4000
CMD ["npm", "run", "pm2:prod"]
