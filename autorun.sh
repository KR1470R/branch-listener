#!/bin/bash

LOG_FOLDER=$BRANCH_LISTENER_MAIN_DIR/logs
LOG_FILE=output.log

if ! [ -d "$BRANCH_LISTENER_MAIN_DIR" ]; then
    echo "main dir($BRANCH_LISTENER_MAIN_DIR) not found! you need setup branch-listener properly!";
    exit 1;
fi

if ! [ -d "$BRANCH_LISTENER_MAIN_DIR/dist" ]; then
    echo "src folder not found! Please build branch-listener.";
    exit 1;
fi

if ! [ -f "$LOG_FOLDER/$LOG_FILE" ]; then
    mkdir "$LOG_FOLDER";
    touch "$LOG_FOLDER/$LOG_FILE";
fi

echo "$BRANCH_LISTENER_MAIN_DIR/dist/src/index.js"

run_listener="$BRANCH_LISTENER_MAIN_DIR/run-listener.sh"
index_path="$BRANCH_LISTENER_MAIN_DIR/dist/src/index.js"

nohup bash "$run_listener" "$index_path" &> "$LOG_FOLDER/$LOG_FILE"
