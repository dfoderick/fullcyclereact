# Full Cycle Web and API site
This project is the front end (UI) React web site for the Full Cycle Bitcoin Mining Controller.
Installation of the back end is required and can be found at https://github.com/dfoderick/fullcycle
# Installation
The web sites can be installed on the same Raspberry Pi as the Full Cycle Controller
or they can be installed on a separate computer.

By far the easiest option is to install Docker on the Raspberry Pi
and run the sites inside Docker containers.  

# Docker install on Raspberry Pi
If you do not have Docker installed on your Raspberry Pi then follow these
instructions.
```
sudo apt-get install -y apt-transport-https
sudo curl -sSL https://get.docker.com | sudo sh
sudo systemctl enable docker
sudo usermod -aG docker pi
```
You will need to logout and log back in for permission to take effect. When you
log back in then check your Docker installation.

```
docker info
```
If you get information about your Docker program then you are ready to go.
# Install as Docker containers

The Full Cycle web sites are hosted on Docker Hub (https://hub.docker.com/r/fullcycle/web/) and can be installed using
these commands.
```
docker run --name fullcycleweb -d --network=host --restart unless-stopped fullcycle/web
```
(Note that API and static pages have been combined into one site in production.)  
 Once installed, test the API to make sure it responds. Browse to http://raspberrypi.local:5000/api/hello
and it should respond with
```
{"express":"Welcome to Full Cycle Mining"}
```
(Replace `raspberrypi.local` with the ip address of your raspberrypi
if your pi does not have a network name.)  

Then browse to the Web site `http://raspberrypi.local:5000/`.

!Important! The web page will be blank or show an error if the back end Full Cycle Mining Controller is not running. (Install from https://github.com/dfoderick/fullcycle) If everything is working then you will see the web site
similar to the screenshots below.  

![Full Cycle React](src/client/src/images/FullCycleReact.png?raw=true "Full Cycle React")
![Full Cycle Switch Pool](src/client/src/images/fullcycle_switch.png?raw=true "Full Cycle Switch Pool")
![Full Cycle Reset Miner](src/client/src/images/fullcycle_reset.png?raw=true "Full Cycle Reset Miner")

If you have problems installing or want to give feed back then
add an issue to this project.  

Dave Foderick  
dfoderick@gmail.com  

# Install directly on the Operating system
If you cannot install using Docker then follow these steps.

Check which versions of node and npm are installed in your system.
```
node -v
v9.11.1
npm -v
5.6.0
```
If older than 9.11 and 5.6 then install the update for Node directly from Debian.
```
sudo curl -sL https://deb.nodesource.com/setup_9.x | sudo bash -
sudo apt-get install -y nodejs
```
Install dependencies using the following commands.
```
cd ~/
git clone https://github.com/dfoderick/fullcyclereact.git
cd ~/fullcyclereact/src/api
sudo npm install
sudo npm install nodemon
sudo npm run prod
```
You will need to log in to another session then run these commands.
```
sudo npm install -g serve
cd ~/fullcyclereact/src/web
sudo npm install
npm run build
serve -p 3000 build
```
