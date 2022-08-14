#!/bin/bash

if [[ "$0" = "$BASH_SOURCE" ]]; then
    echo "the script must be runned by source. exit";
    exit 1;
fi

MAIN_DIR="$HOME/.config/branch-listener"

if ! [ -d ./dist ]; then
    echo "dist folder not found! Please build branch-listener.";
    return 1
fi

if [ -d "$MAIN_DIR" ]; then
    rm -rf "$MAIN_DIR"
fi

mkdir -p "$MAIN_DIR/dist"
cp -r ./dist/* "$MAIN_DIR/dist"
cp -r  ./configs "$MAIN_DIR"
cp -r ./node_modules "$MAIN_DIR"
cp -r ./assets "$MAIN_DIR"
cp ./run-listener.sh "$MAIN_DIR"
cp ./setup.sh "$MAIN_DIR"
mkdir "$MAIN_DIR/logs"
touch "$MAIN_DIR/logs/output.log"

if [ -z "$BRANCH_LISTENER_MAIN_DIR" ]; then
    export BRANCH_LISTENER_MAIN_DIR="$MAIN_DIR"
fi

if ! [ "$(sudo cat  /etc/environment | grep "BRANCH_LISTENER_MAIN_DIR")" ]; then
    echo "BRANCH_LISTENER_MAIN_DIR=$MAIN_DIR" | sudo tee -a /etc/environment
fi

if [ -f /usr/bin/branch-listener-autorun.sh ]; then
    sudo rm /usr/bin/branch-listener-autorun.sh
fi
sudo cp ./autorun.sh /usr/bin/branch-listener-autorun.sh

if [ -f /etc/systemd/system/branch-listener.service ]; then
    sudo systemctl stop branch-listener.service
    sudo systemctl disable branch-listener.service
    sudo rm /etc/systemd/system/branch-listener.service
    sudo rm /usr/lib/systemd/system/branch-listener.service
    sudo systemctl daemon-reload
    systemctl reset-failed
fi
sudo cp ./branch-listener.service /etc/systemd/system

sudo systemctl enable branch-listener
sudo systemctl start branch-listener

echo "autorun of branch-listener configured successfully.";
return 0
