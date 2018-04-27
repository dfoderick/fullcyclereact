FROM resin/rpi-raspbian:latest

# Install Node.js and other dependencies
RUN sudo apt-get update && \
    sudo apt-get -y install curl && \
    sudo curl -sL https://deb.nodesource.com/setup_9.x | sudo bash - && \
    sudo apt-get -y install python build-essential nodejs
RUN sudo npm install -g nodemon

#first copy package and install dependencies
WORKDIR /usr/src/fullcyclereact/src/api/
COPY package*.json ./
RUN npm install

#then copy source
COPY . .

EXPOSE 5000

CMD npm run prod
