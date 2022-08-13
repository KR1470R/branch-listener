
# branch-listener
The branch-listener will notify you for a new commit of your repository of the branch that you've specified.
If new commit is pushed, it will sound by a catty meow two times.
## Why do you need it?
For instance, when you are working in team and somebody updated main branch, with **branch-listener** you will get notification and you will be aware of it. So you will be able pull remote changes to your working branch on time, thus there will be no any conflicts of merging your working branch to main branch.
## Supported Control Version Systems
 - Git
 - Bitbucket
## Supported Systems
**Linux only**
## Requirements
 - Node.js >= 18;
 - TypeScript >= 4;
 - Axios >= 0.27.0;
 - Express >= 4.18.0;

## Installation & Configuration
Beforehand you start the configuration you need provide provide such information for **branch-listener** work properly:
For git you will need provide: username, repository name and branch name you want listen to;
For bitbucket: username, app password, workspace name, repository slug and branch name.
***‼️All your passwords will be stored on your local system without theft‼️***
 **Let's start**
 
    git clone https://github.com/KR1470R/branch-listener.git
    npm run build
    ./setup.sh
After you setup **branch-listener**, you will be able to run it:

    ./run-listener.sh

Here we go, now the branch-listener will notify you for every commit has been pushed.
You may update configs manually in *./configs/*, or just run `./setup.sh`.
Logs and full-working state of branch-listener you can find in *./logs/*.

## Automation
After you have installed it, you may need run it in background and on autostartup your system.
For such purpose, you can make autorun of the branch-listener on startup system.
You will need type your system password to configure branch-listener properly.

    ./autorun-setup.sh
Now, branch-listener is running on background via systemd service(**./branch-listener.service**).
If you need, you can customize branch-listener.service and re-run autorun-setup.sh to keep your changes.
If you want to update configs, do it manually in *~/.config/branch-listener/configs/* or run `bash ~/.config/branch-listener/setup.sh`
After you have updated this config, run this one:

    sudo systemctl restart branch-listener.service

Logs and full-working state of branch-listener you can find in *~/.config/branch-listener/logs*.

To check the branch-listener daemon status:

    sudo systemctl status branch-listener.service

Or to remove totally branch-listener daemon:

    sudo systemctl stop branch-listener.service
    sudo systemctl disable branch-listener.service
    sudo rm /etc/systemd/system/branch-listener.service
    sudo rm /usr/lib/systemd/system/branch-listener.service
    sudo systemctl daemon-reload
    sudo systemctl reset-failed
