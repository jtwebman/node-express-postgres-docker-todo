#!/bin/bash

# Windows WSL requires legecy watcher mac and windows straight doesn't 

[[ -z "${WSLENV}"]] && nodemon -L server || nodemon server