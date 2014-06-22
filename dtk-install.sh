#!/bin/sh
echo "================================================================"
echo "\nCopy this script and run it from the parent directory you want to clone the api viewer to (remember the ref docs need to be configured appropriately)."
echo "This script runs clones, so cannot clone to a non-empty directory"
echo "Set the install folder if you want to change it in this script via DAPI_DIR variable"
echo "\nIf this script doesn't work, just manually follow the simple steps in this script to install\n\n"

DAPI_DIR="dapi"
read -p "Continue (y/n)?" CONT
if [ "$CONT" != "y" ]; then
  exit;
fi

# mkdir to a dapi directory you want to run this from, cd to it then run this script.
echo "Create directory in directory '$DAPI_DIR'?"
read -p "Continue (y/n)?" CONT
if [ "$CONT" != "y" ]; then
  exit;
fi
mkdir $DAPI_DIR
cd $DAPI_DIR
# clone dapi
git clone --recursive https://github.com/lbod/dapi.git .

#npm install --production # this needs grunt-cli
npm install

# get site data and legacy html
git clone https://github.com/lbod/dojo-site-api.git
#  move datasources
mv dojo-site-api/data/* public/data
#  untar and move legacy html
tar -x -f dojo-site-api/legacyhtml.tar.gz -C public/api

# start the application
node app

### note theres an error with renamed files i.e. goto api 1.7 click dojox/grid it should look for grid_ns.html  instead
