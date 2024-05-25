require('colors');
const https = require('https');
const fs = require('fs');
const { exec } = require('child_process');

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
                console.log(`The version you are using (${localPackage.version}) is either modified or removed by the author.`.red);
                console.log('Please use the latest version available on GitHub.'.yellow);
            } else {
                console.log(`A new version is available: ${remotePackage.version}`.green);
                console.log('Trying to auto update...'.blue);
                
                // Check if Git is installed
                exec('git --version', (err, stdout, stderr) => {
                    if (err) {
                        console.error('Git is not installed or not in the PATH. Please install Git to enable automatic updates.'.red);
                        console.log('Please update to the latest version amnually.'.yellow);
                        return;
                    }
                    exec('git init');
                    // Perform git pull to update
                    exec('git pull', (err, stdout, stderr) => {
                        if (err) {
                            console.error('Failed to pull the latest updates. Please check the error messages above.'.red);
                            console.error(stderr);
                            return;
                        }
                        console.log('Successfully pulled the latest updates from the repository.'.green);
                        console.log(stdout);
                    });
                });
            }
        } else {
            console.log('You are using the latest version.'.green);
        }
    });
}).on('error', (e) => { console.error(e); });
