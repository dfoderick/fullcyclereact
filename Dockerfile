#setup for web server that will serve api as well as static bundled react
FROM arm32v7/node:9

#RUN apt-get update && \
#    apt-get -y install curl && \
#    apt-get -y install python build-essential
RUN npm cache clean
#RUN npm install -g nodemon
RUN npm install serve-static

#first copy package and install dependencies
WORKDIR /usr/src/fullcyclereact/src/api/
COPY src/api/package*.json ./
RUN npm install

#then copy source
COPY src/api/. .

WORKDIR /usr/src/fullcyclereact/src/web/
COPY src/web/package*.json ./
RUN npm install
RUN npm install material-ui@next
#then copy source and build it, bundled output in build dir
COPY src/web/. .
RUN npm run build

WORKDIR /usr/src/fullcyclereact/src/api

EXPOSE 3000

#serve up express api with static content
CMD npm run prod
