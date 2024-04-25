// botInstanceManager.js
let instance = null;

function setInstance(bot) {
    instance = bot;
}

function getInstance() {
    return instance;
}

module.exports = { setInstance, getInstance };
