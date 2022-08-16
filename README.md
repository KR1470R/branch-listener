
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
 - zsh/bash
## Installation & Configuration
Beforehand you start the configuration you need provide provide such information for **branch-listener** work properly:
For git you will need provide: username, repository name and branch name you want listen to;
For bitbucket: username, app password, workspace name, repository slug and branch name.\
***‼️All your passwords will be stored on your local system without theft‼️***\
 **Let's start**
 
    git clone https://github.com/KR1470R/branch-listener.git
    npm i
    npm run build
    ./setup.sh
After you setup **branch-listener**, you will be able to run it:

    ./start-listener.sh
Here we go, now the branch-listener will notify you for every commit has been pushed.
Logs and full-working state of branch-listener you can find in *./logs/*.
You may update configs manually in *./configs/*, or just run `./setup.sh`.
If you've changed configs or source code(don't forget **rebuild** the project!), you must run this script:

    ./restart-listener.sh

## Automation
Only after you have installed it, you may need run it in background and on autostartup your system.
For such purpose, you can make autorun of the branch-listener on startup system.

    ./autorun-setup.sh
Now, branch-listener is running on background on port 3001 or which you was specified in installation and it will be running at startup system and will notify you about new commits!
