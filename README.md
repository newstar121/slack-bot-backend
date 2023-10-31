# Project Title

Add-in API

## Description

An in-depth paragraph about your project and overview of use.

## Getting Started

### Dependencies

* npm
* pm2 https://pm2.keymetrics.io/docs/usage/quick-start/

### Installing

#### Local dev environment installation steps:
* Make sure you have installed [docker](https://docs.docker.com/engine/install) and [docker-compose](https://docs.docker.com/compose/install) 
* Make sure you have .development.env file with env variables
* Open terminal and type `make`
* Open new terminal window and enter 
api container bash: `docker exec -it add-in-api bash`
* Run db migrations if already didn't run `npm run typeorm:run-migrations`

That's all. This will create mysql database 
and API local server connected to this db and inserted migrations. 
Now you can continue developing in local environment
If you want to put webhook route for stripe visit ngrok dashboard:
http://localhost:4040

After you have added endpoint to stripe dashboard also 
do not forget update your webhook 
secret in .development.env and restart API container

#### Remote prod or dev installation steps:
* Clone [repository](https://github.com/appsdowonders/addin-api)
* Run `sudo npm install` if you have not installed dependencies
* Make sure you have .production.env file with all valid production credentials
* Create build folder `sudo npm run build`
* pm2 start dist/src/main.js --name api-dev(or whatever you want)

That's all api is live.
You can check logs `pm2 logs api-dev`
