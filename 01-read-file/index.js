const fs = require('fs');
const path = require('path');
pathToFile = path.join(__dirname, 'text.txt')
const readableStream = fs.createReadStream(pathToFile, 'utf-8');
readableStream.on('data', chunk => process.stdout.write(chunk));