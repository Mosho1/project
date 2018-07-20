set -e

npm i
npm run build-browser -- --quiet
npm run serve
