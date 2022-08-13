
# branch-listener
The branch-listener will notify you for a new commit of your repository of the branch that you've specified.
If new commit is pushed, it will sound by a catty meow two times.
***‼️All your user information, tokens, etc saving on your local system and stay private without stealing‼️***
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
 **Let's start**
 
    npm install && npm run build && npm run setup
After you setup **branch-listener**, you will be able to run it:

    npm run listener
Here we go, now the branch-listener will notify you every commit has been pushed.

## Automation
After you install it, you may be need run it in background and on autostartup your system.
For such purpose, you can make autorun of the branch-listener on startup system.

