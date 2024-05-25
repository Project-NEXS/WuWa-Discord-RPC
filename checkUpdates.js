require('colors');
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
            if(localPackage.version > remotePackage.version){
                console.log(`The version you are using (${remotePackage.version}) is either modified or removed by author.`.red);
                console.log('Please use the latest version available on GitHub.'.yellow);
            } else {
                console.log(`A new version is available: ${remotePackage.version}`.green);
                console.log('Please update to the latest version.'.yellow);
            }
        } else {
            console.log('You are using the latest version.'.green);
        }
    });
}).on('error', (e) => { console.error(e); });