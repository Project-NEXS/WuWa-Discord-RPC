const fs = require('fs');
const path = require('path');
require('colors');

const playtimePath = path.join(__dirname, '../data/playtime.json');
const backupPlaytimePath = path.join(__dirname, '../data/backup_playtime.json');

let totalPlaytime;
let backupPlaytime;

function loadPlaytimeData(filePath) {
    try {
        const rawData = fs.readFileSync(filePath);
        return JSON.parse(rawData);
    } catch (error) {
        return { hours: 0, minutes: 0, seconds: 0 };
    }
}

totalPlaytime = loadPlaytimeData(playtimePath);
backupPlaytime = loadPlaytimeData(backupPlaytimePath);

let intervalId = null;
let backupIntervalId = null;

function savePlaytimeData(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function updatePlaytime() {
    totalPlaytime.seconds += 5;

    if (totalPlaytime.seconds >= 60) {
        totalPlaytime.seconds -= 60;
        totalPlaytime.minutes += 1;
    }
    if (totalPlaytime.minutes >= 60) {
        totalPlaytime.minutes -= 60;
        totalPlaytime.hours += 1;
    }

    savePlaytimeData(playtimePath, totalPlaytime);
}

function backupPlaytimeData() {
    backupPlaytime = totalPlaytime;
    savePlaytimeData(backupPlaytimePath, backupPlaytime);
}

function startPlaytimeTracker() {
    if (intervalId !== null) {
        console.log('Playtime tracker is already running.'.yellow);
        return;
    }

    intervalId = setInterval(updatePlaytime, 5000);
    backupIntervalId = setInterval(backupPlaytimeData, 300000); // 5 minutes
    console.log('Playtime tracker started.'.blue);
}

function stopPlaytimeTracker() {
    if (intervalId === null) {
        console.log('Playtime tracker is not running.'.yellow);
        return;
    }

    clearInterval(intervalId);
    clearInterval(backupIntervalId);
    intervalId = null;
    backupIntervalId = null;
    console.log('Playtime tracker stopped.'.red);
    console.log(`Your total playtime after this session is ` + `${totalPlaytime.hours}h`.red + ` ${totalPlaytime.minutes}m`.blue + ` ${totalPlaytime.seconds}s.`.green);
}

function verifyAndRestoreData() {
    let isPlaytimeValid = true;
    let isBackupValid = true;

    try {
        JSON.parse(fs.readFileSync(playtimePath));
    } catch (error) {
        isPlaytimeValid = false;
    }

    try {
        JSON.parse(fs.readFileSync(backupPlaytimePath));
    } catch (error) {
        isBackupValid = false;
    }

    if (!isPlaytimeValid && isBackupValid) {
        totalPlaytime = backupPlaytime;
        savePlaytimeData(playtimePath, totalPlaytime);
        console.log('Main playtime data was corrupted. Restored from backup.'.yellow);
    } else if (isPlaytimeValid && !isBackupValid) {
        backupPlaytime = totalPlaytime;
        savePlaytimeData(backupPlaytimePath, backupPlaytime);
        console.log('Backup playtime data was corrupted. Restored from main data.'.yellow);
    } else if (!isPlaytimeValid && !isBackupValid) {
        totalPlaytime = { hours: 0, minutes: 0, seconds: 0 };
        backupPlaytime = { hours: 0, minutes: 0, seconds: 0 };
        savePlaytimeData(playtimePath, totalPlaytime);
        savePlaytimeData(backupPlaytimePath, backupPlaytime);
        console.log('Both main and backup playtime data were corrupted. Reset to zero.'.red);
    }
}

// Verify and restore data before starting the playtime tracker
verifyAndRestoreData();

console.log(`Your total playtime before this session is ` + `${totalPlaytime.hours}h`.red + ` ${totalPlaytime.minutes}m`.blue + ` ${totalPlaytime.seconds}s.`.green);

// Exporting the functions to start and stop the playtime tracker
module.exports = { startPlaytimeTracker, stopPlaytimeTracker };