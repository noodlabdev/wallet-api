FROM node:14-alpine as base

WORKDIR /src
COPY package*.json /
RUN npm install
EXPOSE 3000
COPY . /
CMD ["npm", "run", "dev"]