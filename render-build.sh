#!/bin/bash
# Render build script: ensure submodules are updated

git submodule update --init --recursive --remote

# Continue with normal build (npm install, etc)
npm install
