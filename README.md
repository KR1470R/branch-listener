<p align="center">
	<strong>
		<h1 align="center">branch-listener</h1>
	</strong>
</p>
<p align="center">
  <a aria-label="branch-listener version">
    <img alt="" src="https://badgen.net/badge/branch-listener/4.0.0/grey">
  </a>
  <a aria-label="Node.js version">
    <img alt="" src="https://badgen.net/badge/node/>=18/green">
  </a>
  <a aria-label="NPM version">
    <img alt="" src="https://badgen.net/badge/npm/>=8.17/purple">
  </a>
  <a aria-label="Typescript version">
    <img alt="" src="https://badgen.net/badge/typescript/>=4/blue">
  </a>
</p>
<p align="center">
	<a aria-label="Axios version">
	    <img alt="" src="https://badgen.net/badge/axios/>=4/pink">
	  </a>
	  <a aria-label="Express version">
	    <img alt="" src="https://badgen.net/badge/express/>=4.18/red">
	  </a>
	    <a aria-label="Zsh/bash">
	    <img alt="" src="https://badgen.net/badge/bash/zsh/black">
	  </a>
	  </a>
	    <a aria-label="Linux">
	    <img alt="" src="https://badgen.net/badge/linux/any//yellow">
	  </a>
  </p>

The branch-listener will notify you for a new commit of your repository of the branch that you've specified.
If new commit is pushed, it will sound by a catty meow two times.
## Why do you need it?
For instance, when you are working in team and somebody updated main branch, with **branch-listener** you will get notification and you will be aware of it. So you will be able pull remote changes to your working branch on time, thus there will be no any conflicts of merging your working branch to main branch.
## Supported Control Version Systems
<a href="https://github.com">
  <img alt="" src="https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white">
</a><a href="https://bitbucket.org">
  <img alt="" src="https://img.shields.io/badge/bitbucket-%230047B3.svg?style=for-the-badge&logo=bitbucket&logoColor=white">
</a>


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

## License
<img alt="" src="https://camo.githubusercontent.com/982edb824038d4ed388cf47101d10d06c1e9e5cc2b23b32a15ead6185e35430e/68747470733a2f2f7777772e676e752e6f72672f67726170686963732f67706c76332d6f722d6c617465722e706e67">
