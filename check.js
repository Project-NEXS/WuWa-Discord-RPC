const update = require('./client/updates.js')

async function run(){
    try{
        await update();
        console.log('Starting Rich Presence...'.cyan)
        require('./app.js')
    } catch (err) {
        console.error('Something went wrong!'.red);
        console.error(err);
    }
}

run();