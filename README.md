# Node Express Postgres Docker ToDo Project

[![Coverage Status](https://coveralls.io/repos/github/jtwebman/node-express-postgres-docker-todo/badge.svg?branch=master)](https://coveralls.io/github/jtwebman/node-express-postgres-docker-todo?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/jtwebman/node-express-postgres-docker-todo/badge.svg?targetFile=package.json)](https://snyk.io/test/github/jtwebman/node-express-postgres-docker-todo?targetFile=package.json)
[![MIT Licence](https://badges.frapsoft.com/os/mit/mit.svg?v=103)](https://opensource.org/licenses/mit-license.php)

This is just a simple Node.js Express Docker app that starts and has basic login API with some simple routes for a ToDo app. I use it to start new projects as well as to just test docker and kubernetes deployments.

I try to keep it up to date with the latest but there is no guarantee.

To run locally or run the tests you will need to run `docker-compose up -d` to start the containers including postgres, redis, mailhog (to fake sending emails locally).

Here is a list of things this projects has:

- Full support for postgres migrations with a npm script that can be part of your deployments before you start switching out containers.
- Full support for a username and password login with a user record via API calls
- Full support for the login flow including verifing emails and forgot email via API calls with an abstraction using mailgun but can easly be switched out for any other transactional email service.
- A simple role based permission system to support managing users as well as only being able to update your own ToDo items. There is a default admin user with the username admin and password admin. **You should change the admin password via config in a production environment**
