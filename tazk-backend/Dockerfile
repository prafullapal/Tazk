FROM node:20-alpine3.19
WORKDIR /app

COPY package*.json /app
RUN npm ci --only=production
COPY . /app

EXPOSE 8747
CMD ["npm", "start"]