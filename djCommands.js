
// djCommands.js
let config; 
let isDJInSession = false;
let botInstance;
let currentDJNick = null; 


function setBot(bot) {
    botInstance = bot;
}
function setConfig(cfg) { // Add function to set config
    config = cfg;
}

function processDJCommands(messageParts, hostmask, event, reply) {
    switch (messageParts[0]) {
        case '!djon':
            handleDJOn(event, reply);
            break;
        case '!djoff':
            handleDJOff(event, reply);
            break;
        // Add more commands as needed
    }
}

function handleDJOn(event, reply, customMessage) {
    if (isDJInSession) {
        reply(event.target, 'Un/a DJ ya está en sesión. Por favor espera a que termine.');
    } else {
        isDJInSession = true;
        currentDJNick = event.nick;  // Set the current DJ's nickname
        const defaultMessage = config.djSessionStartMessage.replace('{{djNick}}', currentDJNick);
        const message = customMessage || defaultMessage;

        config.channels.forEach(channel => {
            botInstance.say(channel, message);
        });

        reply(event.target, 'Comenzó la sesión de DJ. A disfrutar!');
    }
}

function handleDJOff(event, reply, customMessage) {
    if (isDJInSession) {
        isDJInSession = false;
        const defaultMessage = config.djSessionEndMessage.replace('{{djNick}}', currentDJNick);
        const message = customMessage || defaultMessage;
        config.channels.forEach(channel => {
            botInstance.say(channel, message);
        });
        currentDJNick = null;  // Clear the current DJ's nickname
        reply(event.target, 'La sesión de DJ terminó. ¡Gracias por tu sesión!');
    } else {
        reply(event.target, 'Actualmente no hay ninguna sesión de DJ ONLINE.');
    }
}

module.exports = {
    processDJCommands,
    setBot,
    setConfig,
    isDJInSession: () => isDJInSession,  // Export as a getter if encapsulation is needed
    getCurrentDJNick: () => currentDJNick
};
