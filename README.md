# Epitome - VOE

## Getting started
## Install Dependencies:
	npm install

## Run:
	npm start

## Push:
	git add --all
	git commit
	git push -u origin master
	
## Pull:
	git pull -v origin master

## Update:
	make pull
	make restart

## pm2-start:
	pm2 start --name $(APP_NAME) index.js

## stop:
	pm2 stop $(APP_NAME) index.js

## restart:
	pm2 restart $(APP_NAME) index.js

## logs:
	pm2 logs $(APP_NAME) index.js
## Getting started

## Add your files

- [ ] [Create](https://gitlab.com/-/experiment/new_project_readme_content:8c80111a7b295eb04dba62b62f3fb8c5?https://docs.gitlab.com/ee/user/project/repository/web_editor.html#create-a-file) or [upload](https://gitlab.com/-/experiment/new_project_readme_content:8c80111a7b295eb04dba62b62f3fb8c5?https://docs.gitlab.com/ee/user/project/repository/web_editor.html#upload-a-file) files
- [ ] [Add files using the command line](https://gitlab.com/-/experiment/new_project_readme_content:8c80111a7b295eb04dba62b62f3fb8c5?https://docs.gitlab.com/ee/gitlab-basics/add-file.html#add-a-file-using-the-command-line) or push an existing Git repository with the following command:

```
cd existing_repo
git remote add origin https://gitlab.com/devsevensquare/epitome-voe.git
git branch -M main
git push -uf origin main
```
## Usage
Use examples liberally, and show the expected output if you can. It's helpful to have inline the smallest example of usage that you can demonstrate, while providing links to more sophisticated examples if they are too long to reasonably include in the README.

## Contributing
State if you are open to contributions and what your requirements are for accepting them.

For people who want to make changes to your project, it's helpful to have some documentation on how to get started. Perhaps there is a script that they should run or some environment variables that they need to set. Make these steps explicit. These instructions could also be useful to your future self.

You can also document commands to lint the code or run tests. These steps help to ensure high code quality and reduce the likelihood that the changes inadvertently break something. Having instructions for running tests is especially helpful if it requires external setup, such as starting a Selenium server for testing in a browser.

## License
For open source projects, say how it is licensed.