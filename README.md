
<p align="center">
	<strong>
		<h1 align="center">branch-listener</h1>
	</strong>
</p>
<p align="center">
  <a aria-label="branch-listener version"
    <img alt="" src="https://badgen.net/badge/branch-listener/7.1.0/grey">
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

The branch-listener will notify you for a new commit of your repository of the branch that you've specified.\
If new commit is pushed, it will push a notification.

## Content

1. [Why do you need it? ][1]
2. [Supported Control Version Systems][2]
3. [Installation and Configuration][3]
    1) [Automation][3.1]
4. [Uninstall][4]
5. [CVS Request requirements][5]
6. [License][6]
7. [To do][7]

## Why do you need it?
For instance, when you are working in team and somebody updated main branch, with **branch-listener** you will get notification and you will be aware of it.\
So you will be able pull remote changes to your working branch on time, thus there will be no any conflicts of merging your working branch to main branch.
## Supported Control Version Systems
<a href="https://github.com">
  <img alt="" src="https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white">
</a><a href="https://bitbucket.org">
  <img alt="" src="https://img.shields.io/badge/bitbucket-%230047B3.svg?style=for-the-badge&logo=bitbucket&logoColor=white">
</a><a href="https://gitlab.com">
  <img alt="" src="https://img.shields.io/badge/gitlab-%23181717.svg?style=for-the-badge&logo=gitlab&logoColor=white">
</a>


## Installation and Configuration
Beforehand you start the configuration you need to provide such information for **branch-listener** work properly:
For git you will need provide: username, repository name and branch name you want listen to;\
For bitbucket: username, app password, workspace name, repository slug and branch name.\
For gitlab: project id, token and branch name;\
***‼️All your passwords will be stored on your local system without theft‼️ And stay encrypted.***\
 **Let's start**
 
    git clone https://github.com/KR1470R/branch-listener.git
    npm i
    npm run build
    ./branch-listener setup
After you setup **branch-listener**, you will be able to run it:

    ./branch-listener run
⚠️⚠️⚠️Attention⚠️⚠️⚠️\
The branch-listener will block your attempt to run the server if you activate over-limited amount listeners.\
So you have to keep on mind the [CVS Request requirements][5] before you start it.\

Here we go, now the branch-listener will notify you for every commit has been pushed.\
Logs and full-working state of branch-listener you can find in *./logs/*.\
You may update configs manually in *./configs/*, or just run `./branch-listener setup`.\
If you've changed configs or source code(don't forget **rebuild** the project!), you must run this script:

    ./branch-listener restart

## Automation
After you have built it, you may need run it in background and on autostartup your system.\
For such purpose, you can make autorun of the branch-listener on startup system.

    ./autorun-setup.sh
Now, branch-listener is running on background on port 3001 or which you was specified at installation and it will be running at startup system and will notify you about new commits!\
After this you will be able to use **branch-listener** as util.\
Here is full a list of commands:
```
Usage: branch-listener [setup] [run] [add]  [start]
                                  [restart] [stop] [remove] 
                                  [list] [edit] [kill] [status]
                                  [uninstall] [help] <args>

                setup       Setups branch-listener configs. No args needed;

                run         Runs Branch-listener server. No args needed;

                add         Adds listener for specified CVS. Second arg is name of cvs;

                start       Starts listeners. If args was not specified - runs all listeners,
                            to start specified listener you have to write cvs name of listener
                            as the first argument and id of the config of listener as the second;

                restart     Restarts branch-listener server. No args needed;

                stop        Stops listeners. The arguments works as well as for start command;

                remove      Removes listeners. The arguments works as well as for start command;

                list        Shows table with listeners information. 
                            If args was not specified - shows all listeners tables.
                            To show specified cvs listeners you need to specify cvs name as the second arg;

                edit        Edits listener configs.
                            Example: branch-listener edit gitlab 0 token ********************;
                            You need to restart the branch-listener to get you changes to work as well;

                kill        Kills branch-listener. 
                            Stops the branch-listener server and all listeners. No args needed;

                status      Outputs status of branch-listener's server. No args needed;

                uninstall   Uninstalls branch-listener and removes all configs and logs. No args needed;

                help        Shows this page. No args needed;
```

## Uninstall
To uninstall branch-listener and remove all configs and settings: 

    branch-listener uninstall

## CVS Request requirements
| CVS | <img alt="" src="https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white">	| <img alt="" src="https://img.shields.io/badge/bitbucket-%230047B3.svg?style=for-the-badge&logo=bitbucket&logoColor=white"> | <img alt="" src="https://img.shields.io/badge/gitlab-%23181717.svg?style=for-the-badge&logo=gitlab&logoColor=white"> |
|----------------------------|-------|-------|-------|
| Requests per-hour limit    | 1000  | 1000  | 1000  |
| Need token or app password | Yes   | Yes   | Yes   |

## License
<img alt="" src="https://camo.githubusercontent.com/982edb824038d4ed388cf47101d10d06c1e9e5cc2b23b32a15ead6185e35430e/68747470733a2f2f7777772e676e752e6f72672f67726170686963732f67706c76332d6f722d6c617465722e706e67">

[1]:https://github.com/KR1470R/branch-listener#why-do-you-need-it
[2]:https://github.com/KR1470R/branch-listener#supported-control-version-systems
[3]:https://github.com/KR1470R/branch-listener#installation-and-configuration
[3.1]:https://github.com/KR1470R/branch-listener#automation
[4]:https://github.com/KR1470R/branch-listener#uninstall
[5]:https://github.com/KR1470R/branch-listener#cvs-request-requirements
[6]:https://github.com/KR1470R/branch-listener#license
[7]:https://github.com/KR1470R/branch-listener#to-do
