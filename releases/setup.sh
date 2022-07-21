curl https://raw.githubusercontent.com/OguzhanUmutlu/DJSTemplate/main/releases/setup.js -o setup.js
npm init -y
clear
echo "Downloading ZIP dependency..."
npm install zip
clear
node setup.js
clear
echo "Downloading the template dependencies..."
npm install
clear
node index.js