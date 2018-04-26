# Full Cycle React
Front end React web site for the Full Cycle Mining Controller 
(https://github.com/dfoderick/fullcycle)

Check which versions of node and npm are installed in your system.
```
pi@raspberrypi:~ $ node -v
v9.11.1
pi@raspberrypi:~ $ npm -v
5.6.0
```
If older than 9.11 and 5.6 then install the update directly from debian.
```
sudo curl -sL https://deb.nodesource.com/setup_9.x | sudo bash -
sudo apt-get install -y nodejs
```
Install dependencies using the following commands.
```
cd ~/
git clone https://github.com/dfoderick/fullcyclereact.git
cd ~/fullcyclereact/src
sudo npm install
sudo npm install yarn nodemon
cd ~/fullcyclereact/src/client/src
sudo npm install
```
The site can be run with yarn or npm.
```
cd ~/fullcyclereact/src
sudo npm run dev
```
If you can use yarn then do so with the following command...
```
yarn dev
```
The default port is 3000.  


!Important! The web page will be blank or show an error if the back end Full Cycle Mining Controller is not running.

dfoderick@gmail.com
