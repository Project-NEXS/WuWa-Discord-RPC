require('colors');
const fs = require('fs');
const path = require('path');
const RPC = require('discord-rpc');
const process = require('process');
const { startPlaytimeTracker, stopPlaytimeTracker } = require('./playtimeTracker.js');

const clientId = '1243236756011094106';
let rpc = new RPC.Client({ transport: 'ipc' });

RPC.register(clientId);

const activityLogPath = path.join(__dirname, 'data/records.json');

let activities = [];
let current_activity = null;
let checkInterval;
let rpcActive = false;

if (fs.existsSync(activityLogPath)) {
    const rawData = fs.readFileSync(activityLogPath);
    activities = JSON.parse(rawData);
}

function formatTime(date) {
    const options = { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-US', options).replace(',', '');
}

function saveActivityData() {
    fs.writeFileSync(activityLogPath, JSON.stringify(activities, null, 2));
}

const rpc_data = {
    details: 'On an adventure~',
    state: 'Exploring the unknown lands...',
    startTimestamp: new Date(),
    largeImageKey: 'wuwa',
    largeImageText: 'Wuthering Waves 1.0',
    instance: false,
    buttons: [
        { label: 'Join as Rover', url: 'https://wutheringwaves.kurogames.com/en/' }
    ]
};

async function isProcessRunning(processName) {
    const psList = await import('ps-list');
    const processes = await psList.default();
    return processes.some(p => p.name === processName);
}

function startRpcClient() {
    rpc = new RPC.Client({ transport: 'ipc' });
    rpc.on('ready', () => {
        console.log('Rich Presence is active.'.green);
        rpc.setActivity(rpc_data);
        console.log('Rich Presence updated!'.green);

        // Record the initial activity
        const activity = {
            details: rpc_data.details,
            state: rpc_data.state,
            startTimestamp: formatTime(rpc_data.startTimestamp),
            endTimestamp: null
        }
        activities.push(activity);
        current_activity = activity;
        saveActivityData();
        startPlaytimeTracker();
    });

    rpc.on('disconnected', () => {
        console.error('Disconnected from Discord RPC'.red);
        // Update the end time of the last activity when disconnected
        const endTimestamp = new Date();
        if (activities.length > 0) {
            activities[activities.length - 1].endTimestamp = formatTime(endTimestamp);
            saveActivityData();
        }
        current_activity = null;
    });

    rpc.on('error', (error) => {
        console.error('Discord RPC error:'.red, error);

        const endTimestamp = new Date();
        if (activities.length > 0) {
            activities[activities.length - 1].endTimestamp = formatTime(endTimestamp);
            saveActivityData();
        }
    });

    rpc.login({ clientId }).then(() => {
        rpcActive = true;
    }).catch((error) => {
        console.error('Failed to log in to Discord RPC:'.red, error);
    });
}

function disconnectRpcClient() {
    // Update the end time of the last activity
    const endTimestamp = new Date();
    if (activities.length > 0 && current_activity) {
        activities[activities.length - 1].endTimestamp = formatTime(endTimestamp);
        saveActivityData();
    }
    // Disconnect RPC client
    rpc.destroy().then(() => {
        console.log('Disconnecting RPC client.'.yellow);
        rpcActive = false;
        stopPlaytimeTracker();
        console.log('RPC client disconnected.'.red);
        process.exit(0); // Exit the process
    }).catch((err) => {
        console.error('Error disconnecting RPC client:', err);
        process.exit(1); // Exit the process with an error
    });
}

// Listen for process exit events
process.on('exit', disconnectRpcClient);
process.on('SIGINT', () => {
    console.log('SIGINT received.'.bgRed);
    disconnectRpcClient();
});
process.on('SIGTERM', () => {
    console.log('SIGTERM received.'.bgRed);
    disconnectRpcClient();
});

(async () => {
    checkInterval = setInterval(async () => {
        try {
            const isRunning = await isProcessRunning('Wuthering Waves.exe');
            if (isRunning && !rpcActive) {
                console.log('Wuthering Waves.exe started. Starting RPC client.'.blue);
                startRpcClient();
            } else if (!isRunning && rpcActive) {
                console.log('Wuthering Waves.exe stopped. Disconnecting RPC client.'.yellow);
                disconnectRpcClient();
            }
        } catch (error) {
            console.error('Failed to check if process is running:'.red, error);
            clearInterval(checkInterval);
            process.exit(1);
        }
    }, 5000);
})();