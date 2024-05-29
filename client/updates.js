require('colors');
const https = require('https');
const fs = require('fs');
const semver = require('semver');
const { exec } = require('child_process');

const repo = 'Project-NEXS/WuWa-Discord-RPC';
const repoUrl = `https://github.com/${repo}.git`;
const options = {
    hostname: 'api.github.com',
    port: 443,
    path: `/repos/${repo}/contents/package.json`,
    method: 'GET',
    headers: { 'User-Agent': 'node.js' }
};

async function update(periodic) {
    try {
        const localPackage = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        const remotePackage = await fetchRemotePackage();
        if(periodic){
            if (localPackage.version !== remotePackage.version) {
                if (localPackage.version < remotePackage.version) {
                    try{
                        console.log(`A new version is available: ${remotePackage.version}`.green);
                        console.log('Trying to auto update...'.blue);
                        await ensureGitInstalled();
                        await initializeGitRepo();
                        await setRemoteAndPull();
                    } catch(error){
                        console.error(error.message.red)
                    }
                }
            }
        } else {
            if (semver.lt(localPackage.version, remotePackage.version)) {
                console.log(`A new version is available: ${remotePackage.version}`.green);
                console.log('Trying to auto update...'.blue);
                await ensureGitInstalled();
                await initializeGitRepo();
                await setRemoteAndPull();
            } else if (semver.gt(localPackage.version, remotePackage.version)) {
                console.log(`The version you are using (${localPackage.version}) is either modified or removed by the author.`.red);
                console.log('Please use the latest version available on GitHub.'.yellow);
            } else {
                console.log('You are using the latest version.'.green);
            }
        }
        console.log(remotePackage.message)
    } catch (error) {
        console.error(error.message.red);
    }
}

function fetchRemotePackage() {
    return new Promise((resolve, reject) => {
        https.get(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const content = JSON.parse(Buffer.from(JSON.parse(data).content, 'base64').toString('utf8'));
                    resolve(content);
                } catch (error) {
                    reject(new Error('Failed to parse remote package.json.'));
                }
            });
        }).on('error', (e) => reject(e));
    });
}

function ensureGitInstalled() {
    return new Promise((resolve, reject) => {
        exec('git --version', (err, stdout, stderr) => {
            if (err) {
                reject(new Error('Git is not installed or not in the PATH. Please install Git to enable automatic updates.'));
            } else {
                resolve();
            }
        });
    });
}

function initializeGitRepo() {
    return new Promise((resolve, reject) => {
        exec('git rev-parse --is-inside-work-tree', (err, stdout, stderr) => {
            if (err) {
                console.log('Initializing git repository...'.blue);
                exec('git init', (err, stdout, stderr) => {
                    if (err) {
                        reject(new Error('Failed to initialize git repository.'));
                    } else {
                        console.log('Git repository initialized.'.green);
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    });
}

function setRemoteAndPull() {
    return new Promise((resolve, reject) => {
        exec('git remote', (err, stdout, stderr) => {
            if (err) {
                reject(new Error('Failed to check git remotes.'));
                return;
            }

            const addOrUpdateRemote = stdout.includes('origin')
                ? `git remote set-url origin ${repoUrl}`
                : `git remote add origin ${repoUrl}`;

            exec(addOrUpdateRemote, (err, stdout, stderr) => {
                if (err) {
                    reject(new Error('Failed to add/set remote origin.'));
                } else {
                    exec('git fetch origin main && git reset --hard FETCH_HEAD', (err, stdout, stderr) => {
                        if (err) {
                            reject(new Error('Failed to pull the latest updates.'));
                        } else {
                            console.log('Successfully pulled the latest updates from the repository.'.green);
                            resolve();
                        }
                    });
                }
            });
        });
    });
}

module.exports = update;