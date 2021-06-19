FROM node:14

WORKDIR /app

COPY package.json .

RUN npm install\
        && npm install tsc -g
        
COPY . .

RUN tsc

CMD ["node", "./dist/src/index.js"]