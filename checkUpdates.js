const https = require('https');
const fs = require('fs');

const localPackage = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const repo = 'Project-NEXS/WuWa-Discord-RPC'; // Replace with your GitHub username/repo
const options = {
    hostname: 'api.github.com',
    port: 443,
    path: `/repos/${repo}/contents/package.json`,
    method: 'GET',
    headers: { 'User-Agent': 'node.js' }
};

https.get(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        const remotePackage = JSON.parse(Buffer.from(JSON.parse(data).content, 'base64').toString('utf8'));
        if (localPackage.version !== remotePackage.version) {
            console.log('A new version is available: ' + remotePackage.version);
            console.log('Please update to the latest version.');
        } else {
            console.log('You are using the latest version.');
        }
    });
}).on('error', (e) => { console.error(e); });