#!/bin/bash

if [[ "$0" = "${BASH_SOURCE[0]}" ]]; then
    echo "the script must be runned by source. exit";
    exit 1;
fi

if ! [ -d ./dist ]; then
    echo "dist folder not found! Please build branch-listener.";
    return 1
fi

if [ "$(lsof -t -i:3001 -sTCP:LISTEN)" ]; then
    kill -9 "$(lsof -t -i:3001 -sTCP:LISTEN)"
fi

MAIN_DIR="$HOME/.config/branch-listener"

if [ "$(echo "$SHELL" | grep '/zsh')" ]; then
    SHELL_RC="$HOME/.zshrc"
elif [ "$(echo "$SHELL" | grep '/bash')" ]; then
    SHELL_RC="$HOME/.bashrc"
else 
    echo "unsupportable shell! exit"
    return 1
fi

if ! [ "$(echo "$PATH" | grep "$MAIN_DIR")" ]; then
    export PATH="$PATH":"$MAIN_DIR"
fi

if ! [ "$(sudo cat $SHELL_RC | grep $MAIN_DIR)" ]; then
    echo "export PATH=$PATH:$MAIN_DIR" | tee -a "$SHELL_RC"
fi

if [ -z "$BRANCH_LISTENER_MAIN_DIR" ]; then
    export BRANCH_LISTENER_MAIN_DIR="$MAIN_DIR"
fi

if ! [ "$(cat  $SHELL_RC | grep 'BRANCH_LISTENER_MAIN_DIR='$BRANCH_LISTENER_MAIN_DIR)" ]; then
    echo "export BRANCH_LISTENER_MAIN_DIR=$MAIN_DIR" | tee -a "$SHELL_RC"
fi

if [ -d "$MAIN_DIR" ]; then
    rm -rf "$MAIN_DIR"
fi

mkdir -p "$MAIN_DIR/dist"
cp -r ./dist/* "$MAIN_DIR/dist"
cp -r  ./configs "$MAIN_DIR"
cp -r ./node_modules "$MAIN_DIR"
cp -r ./assets "$MAIN_DIR"
cp ./start-listener.sh "$MAIN_DIR"
cp ./restart-listener.sh "$MAIN_DIR"
cp ./setup.sh "$MAIN_DIR"
mkdir "$MAIN_DIR/logs"
touch "$MAIN_DIR/logs/output.log"

if ! [ "$(cat  $SHELL_RC | grep 'branch-listener-autorun')" ]; then
    echo "branch-listener-autorun" | tee -a "$SHELL_RC"
fi

branch-listener-autorun

echo "autorun of branch-listener configured successfully.";
return 0
