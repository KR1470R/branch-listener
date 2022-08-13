#! /bin/bash

kill -9 "$(lsof -t -i:3001 -sTCP:LISTEN)"
