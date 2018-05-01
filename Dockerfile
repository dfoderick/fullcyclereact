#setup for web server that will serve api as well as static bundled react
FROM arm32v7/node:9

RUN apt-get update && \
    apt-get -y install curl && \
    apt-get -y install python build-essential
#RUN npm install -g nodemon
RUN npm install serve-static

#first copy package and install dependencies
WORKDIR /usr/src/fullcyclereact/src/api/
COPY api/package*.json ./
RUN npm install

#then copy source
COPY api/. .

WORKDIR /usr/src/fullcyclereact/src/web/
COPY web/package*.json ./
RUN npm install
RUN npm install material-ui@next
#then copy source and build it, bundled output in build dir
COPY web/. .
RUN npm run build

WORKDIR /usr/src/fullcyclereact/src/api

EXPOSE 3000

#serve up express api with static content
CMD npm run prod
