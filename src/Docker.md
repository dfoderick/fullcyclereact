#Docker install on Raspberry Pi
```
sudo apt-get install -y apt-transport-https
```
sudo systemctl enable docker
```
sudo usermod -aG docker pi
```
You will need to logout and log back in for permission to take effect.

```
docker info
```

Get bash prompt inside container!
```
docker run -it dfoderick/fullcyclereact /bin/bash
```

Build:
clone
docker login
cd fullcyclereact/src/api
docker build -t fullcycle/api .
docker push fullcycle/api:latest
cd ~/fullcyclereact/src/web
docker build -t fullcycle/web .
docker push fullcycle/web:latest

Install:
docker stop fullcycleapi fullcycleweb
docker pull fullcycle/api
docker pull fullcycle/web


!don't think -i should be passed here
docker run --name fullcycleapi -d --network=host --restart unless-stopped fullcycle/api
docker run --name fullcycleweb -d --network=host --restart unless-stopped fullcycle/web
