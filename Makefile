include .development.env
export

start: clear_ngrok run_ngrok
	docker-compose up

restart: clear_ngrok run_ngrok
	docker-compose restart

stop: clear_ngrok
	docker-compose stop

rebuild: clear_ngrok remove_image run_ngrok
	docker-compose up --build

remove_image: clean
	docker rmi add-in-api

clean: clear_ngrok
	docker-compose down

run_ngrok:
	docker run --name=api_ngrok -d --net=host -it -e NGROK_AUTHTOKEN=${NGROK_AUTHTOKEN} ngrok/ngrok:latest http ${PORT}

clear_ngrok:
	docker rm api_ngrok -f