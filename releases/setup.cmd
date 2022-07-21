@echo off
title V14 Discord.JS Template
curl https://raw.githubusercontent.com/OguzhanUmutlu/DJSTemplate/main/releases/setup.js -o setup.js
npm init -y
cls
echo "Downloading ZIP dependency..."
npm install zip
cls
node setup.js
cls
echo "Downloading the template dependencies..."
npm install
cls
node index.js