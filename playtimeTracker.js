require('colors');
const fs = require('fs');
const path = require('path');

const playtimePath = path.join(__dirname, 'data/playtime.json');

let totalPlaytime;
if (fs.existsSync(playtimePath)) {
    const rawData = fs.readFileSync(playtimePath);
    totalPlaytime = JSON.parse(rawData);
} else {
    totalPlaytime = { hours: 0, minutes: 0, seconds: 0 };
}
console.log(`Your total playtime before this session is ${totalPlaytime.hours}h ${totalPlaytime.minutes}m ${totalPlaytime.seconds}s.`.blue)

let intervalId = null;

function savePlaytimeData() {
    fs.writeFileSync(playtimePath, JSON.stringify(totalPlaytime, null, 2));
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

    savePlaytimeData();
}

function startPlaytimeTracker() {
    if (intervalId !== null) {
        console.log('Playtime tracker is already running.'.yellow);
        return;
    }

    intervalId = setInterval(updatePlaytime, 5000);
    console.log('Playtime tracker started.'.blue);
}

function stopPlaytimeTracker() {
    if (intervalId === null) {
        console.log('Playtime tracker is not running.'.yellow);
        return;
    }

    clearInterval(intervalId);
    intervalId = null;
    console.log('Playtime tracker stopped.'.red);
}

// Exporting the functions to start and stop the playtime tracker
module.exports = { startPlaytimeTracker, stopPlaytimeTracker };