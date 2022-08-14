#!/bin/bash

if [ -n "$1" ]; then
    BRANCH_LISTENER_INDEX_PATH="$1"
else 
    BRANCH_LISTENER_INDEX_PATH="./dist/src/index.js"
fi

node $BRANCH_LISTENER_INDEX_PATH
