#! /bin/bash

if [ $(lsof -t -i:3001 -sTCP:LISTEN) ]; then
    kill -9 "$(lsof -t -i:3001 -sTCP:LISTEN)"
fi

./autorun.sh
