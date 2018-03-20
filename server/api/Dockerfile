FROM node:carbon

WORKDIR /src
COPY src/package.json /src
RUN npm install

COPY src /src

EXPOSE 8080
EXPOSE 12345

CMD [ "npm", "start" ]
