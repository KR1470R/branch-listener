#!/bin/bash

echo "checking is listener alive..."
if [ "$(lsof -t -i:3001 -sTCP:LISTEN)" ]; then
    kill -9 "$(lsof -t -i:3001 -sTCP:LISTEN)"
    echo "listener has been killed"
else 
    echo "listener is not alive at 3001"
fi
