FROM node:lts-slim
WORKDIR /usr/src/app
COPY . .
RUN npm ci

# EXPOSE 8080
CMD [ "node", "build/src/index.js" ]