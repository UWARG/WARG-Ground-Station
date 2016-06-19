#!/bin/bash          

VERSION=$(node -pe 'JSON.parse(process.argv[1]).version' "$(cat package.json)")

rm -rf ./docs

jsdoc -c jsdoc.json

cd docs/WARG-Ground-Station/$VERSION

git init

git remote add origin git@github.com:UWARG/WARG-Ground-Station.git

echo 'api.gs.uwarg.com' > CNAME

git add .

git commit -m "Updated documentation for version $VERSION"

git push origin master:gh-pages --force
