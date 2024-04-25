const Irc = require('irc-framework');
const config = require('./config');
const commands = require('./commands');
const adminManager = require('./adminManager');  // Ensure this module is implemented correctly
const djCommands = require('./djCommands'); // Import djCommands.js
const botInstanceManager = require('./botInstanceManager');



djCommands.setConfig(config); 


const bot = new Irc.Client();
botInstanceManager.setInstance(bot);


bot.connect({
    host: config.server,
    port: config.port,
    nick: config.nick,
    channels: config.channels,
});

bot.on('registered', () => {
    console.log('Connected to IRC!');
    config.channels.forEach(channel => bot.join(channel));
    djCommands.setBot(bot); // Call setBot from djCommands.js
    bot.join(config.djChannel)
});


bot.on('close', () => {
    console.log('La conexión al IRC ha sido cerrada..');
});

bot.on('join', (event) => {
    greetUser(event);
});

bot.on('message', (event) => {
    
    if (event.message.startsWith('!')) {
        // Process the command, passing the event and a callback for the response
        commands.processCommand(event, (channel, message) => {
            if (typeof message !== 'undefined') {
                // Use event.target to ensure the response goes to the right channel
                bot.say(event.target, message);
            } else {
                console.error('El mensaje no está definido.', event.target);
            }
        },bot);
    }
});

function greetUser(event) {
    const fullHostmask = `${event.nick}!${event.ident}@${event.hostname}`;

    // First, check if the user is an admin
    adminManager.isAdmin(fullHostmask, (err, isAdm) => {
        if (err) {
            console.error(`Error al comprobar el estado del administrador: ${err.message}`);
            return;
        }

        if (isAdm) {
            // If the user is an admin, send a welcome message immediately
            bot.say(event.channel, `Bienvenido a nuestro administrador/a, ${event.nick}!`);
        } else {
            // If not an admin, check if the user is a DJ
            adminManager.isDJ(fullHostmask, (err, isDJ) => {
                if (err) {
                    console.error(`Error al comprobar el estado del DJ: ${err.message}`);
                    return;
                }

                if (isDJ) {
                    // If the user is a DJ, send a welcome message
                    bot.say(event.channel, `Bienvenido a nuestro dj, ${event.nick}!`);
                } else {
                    // If not a DJ, check if the user is a VIP
                    adminManager.isVIP(fullHostmask, (err, isVIP) => {
                        if (err) {
                            console.error(`Error al comprobar el estado VIP: ${err.message}`);
                            return;
                        }

                        if (isVIP) {
                            // If the user is a VIP, send a welcome message
                            bot.say(event.channel, `Bienvenido a nuestro usuario/a VIP, ${event.nick}!`);
                        }
                    });
                }
            });
        }
    });
}

bot.on('ctcp', (event) => {
    if (event.type === 'VERSION') {
        bot.ctcpResponse(event.nick, 'VERSION', 'Nod Radiobot para shoutcast. V1.0.1');
    }
});


bot.on('error', (error) => {
    console.error('Error:', error);
});

module.exports = bot; // Only if you need to export it for use elsewhere