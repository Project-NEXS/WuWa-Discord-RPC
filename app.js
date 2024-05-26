const { exec, spawn } = require('child_process');
const update = require('./client/updates.js');

async function main() {
    try {
        const rbtrayProcess = await startRBTray();
        console.log('Use ' + 'ctrl + alt + down'.bgBlue + ' to minimize!');

        // setInterval(update, 3 * 60 * 1000);

        require('./client/client.js')

        process.on('exit', () => {
            rbtrayProcess.kill();
        });
    } catch (error) {
        console.error('Error starting RBTray or the main application.'.red);
        console.error(error);
    }
}

main();

async function isProcessRunning(processName) {
    const psList = await import('ps-list');
    const processes = await psList.default();
    return processes.some(p => p.name === processName);
}
async function startRBTray() {
    const isRunning = await isProcessRunning('RBTray.exe');
    if (isRunning) {
        console.log('RBTray is already running..'.blue);
    } else if (!isRunning) {
        return new Promise((resolve, reject) => {
            const rbtray = spawn('assets/RBTray/RBTray.exe', [], { stdio: 'ignore' });
            rbtray.on('error', (err) => {
                console.error('Failed to start RBTray.'.red);
                reject(err);
            });
            rbtray.on('close', (code) => {
                console.log(`RBTray exited with code ${code}`.yellow);
            });
            resolve(rbtray);
        });
    }
}