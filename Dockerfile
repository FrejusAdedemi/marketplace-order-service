FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY order-service/ ./order-service/
EXPOSE 3004
CMD ["npm", "start"]