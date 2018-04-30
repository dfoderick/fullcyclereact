FROM resin/rpi-raspbian:latest
#FROM resin/raspberrypi3-node

# Install Node.js and other dependencies
RUN sudo apt-get update && \
    sudo apt-get -y install curl && \
    sudo curl -sL https://deb.nodesource.com/setup_9.x | sudo bash - && \
    sudo apt-get -y install python build-essential nodejs
#RUN sudo npm install -g nodemon
RUN sudo npm install -g serve

#first copy just the package and install dependencies
WORKDIR /usr/src/fullcyclereact/src/web/
COPY package*.json ./
RUN npm install
RUN npm install material-ui@next

#then copy source
COPY . .
RUN npm run build

EXPOSE 3000

#CMD npm run start
CMD serve -p 3000 build
