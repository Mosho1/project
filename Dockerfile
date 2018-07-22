FROM node:10

WORKDIR /tmp/code/

COPY package.json .

RUN npm i

COPY . .

RUN npm run build-browser

EXPOSE 3000

CMD ["npm", "run", "serve"]
