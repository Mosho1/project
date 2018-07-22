set -e

# remove unused images and containers
docker ps -aq --no-trunc -f status=exited | xargs docker rm || true
docker images -q --filter dangling=true | xargs docker rmi || true

docker build . --tag fydp --rm
docker run -p 3000:3000 -e NODE_ENV="production" fydp
