FROM resin/rpi-raspbian:latest

# Install Node.js and other dependencies
RUN sudo apt-get update && \
    sudo apt-get -y install curl && \
    sudo curl -sL https://deb.nodesource.com/setup_9.x | sudo bash - && \
    sudo apt-get -y install python build-essential nodejs
RUN sudo npm install -g nodemon

WORKDIR /usr/src/fullcyclereact/src
COPY src/package*.json ./
RUN npm install

WORKDIR /usr/src/fullcyclereact/src/client
COPY src/client/package*.json ./
RUN npm install

WORKDIR /usr/src/fullcyclereact/
COPY . .
#RUN ls -l -R
WORKDIR /usr/src/fullcyclereact/src

EXPOSE 3000

CMD npm run prod
