const adminManager = require('./adminManager');
const djCommands = require('./djCommands');
const config = require('./config');
const { getInstance } = require('./botInstanceManager');

let currentDJNick = null; 

function processCommand(event, reply, botInstance) {
    const fullHostmask = `${event.nick}!${event.ident}@${event.hostname}`;
    const messageParts = event.message.split(' ');
    console.log("Procesando comando:", messageParts[0]);

    // Comandos
    switch (messageParts[0]) {
        case '!start':
        case '!+admin':
        case '!-admin':
        case '!+dj':
        case '!-dj':
        case '!+vip':
        case '!-vip':
        case '!list-admins':
        case '!list-djs':
        case '!list-vips':
        case '!djon':
        case '!djoff':
            djCommands.processDJCommands(messageParts, fullHostmask, event, reply);
            adminManager.isAdmin(fullHostmask, (err, isAdm) => {
                if (err) {
                    reply(event.target, `Error al comprobar el estado del administrador: ${err.message}`);
                } else if (!isAdm) {
                    reply(event.target, `${event.nick}, no tienes acceso a mi.`);
                } else {
                    processAdminCommands(messageParts, fullHostmask, event, reply);
                }
            });
            break;
        case '!dj':
            checkDJStatus(event, reply);
            break;
        case '!radio':
            handleRadioCommand(event, reply);
            break;
        case '!song':
            handleSongRequest(messageParts.slice(1), event, reply);
            break;
        default:
            reply(event.target, `Comando desconocido: ${event.message}`);
    }
}

function processAdminCommands(messageParts, hostmask, event, reply) {
    switch (messageParts[0]) {
        case '!start':
            reply(event.target, `${event.nick}, eres reconocido como administrador.`);
            break;
        case '!+admin':
            processAdminAddition(hostmask, messageParts, event, reply);
            break;
        case '!-admin':
            processAdminRemoval(hostmask, messageParts, event, reply);
            break;
        case '!+dj':
            processDJAddition(hostmask, messageParts, event, reply);
            break;
        case '!-dj':
            processDJRemoval(hostmask, messageParts, event, reply);
            break;
        case '!+vip':
            processVIPAddition(hostmask, messageParts, event, reply);
            break;
        case '!-vip':
            processVIPRemoval(hostmask, messageParts, event, reply);
            break;
        case '!list-admins':
            listAdmins(event, reply);
            break;
        case '!list-djs':
            listDJs(event, reply);
            break;
        case '!list-vips':
            listVIPs(event, reply);
            break;
        case '!dj':
            checkDJStatus(event, reply);
            break;
        case '!radio':
            handleRadioCommand(event, reply);
            break;
        case '!song':
            handleSongRequest(messageParts.slice(1), event, reply);
            break;
    }
}

function processAdminAddition(hostmask, messageParts, event, reply) {
    if (messageParts.length !== 2 || !isValidHostmask(messageParts[1])) {
        reply(event.target, 'Uso: !+admin nick!user@hostmask - Para agregar un administrador.');
        return;
    }
    const newAdminHostmask = messageParts.slice(1).join(' ');
    adminManager.isAdmin(newAdminHostmask, (err, isAdmin) => {
        if (err) {
            reply(event.target, `Error al comprobar el estado del administrador: ${err.message}`);
        } else if (isAdmin) {
            reply(event.target, `${newAdminHostmask} ya está registrado como administrador.`);
        } else {
            adminManager.addAdmin(newAdminHostmask, (err) => {
                if (err) {
                    reply(event.target, `No se pudo agregar un nuevo administrador: ${err.message}`);
                } else {
                    reply(event.target, `Nuevo administrador agregado: ${newAdminHostmask}`);
                }
            });
        }
    });
}

function processAdminRemoval(hostmask, messageParts, event, reply) {
    if (messageParts.length !== 2 || !isValidHostmask(messageParts[1])) {
        reply(event.target, 'Uso: !-admin nick!user@hostmask');
        return;
    }
    const removeAdminHostmask = messageParts[1];
    adminManager.isAdmin(removeAdminHostmask, (err, isAdmin) => {
        if (err) {
            reply(event.target, `Error al comprobar el estado del administrador: ${err.message}`);
        } else {
            if (isAdmin) {
                adminManager.removeAdmin(removeAdminHostmask, (err, removed) => {
                    if (err) {
                        reply(event.target, `Error al eliminar administrador: ${err.message}`);
                    } else {
                        reply(event.target, `Admin ${removeAdminHostmask} borrado!`);
                    }
                });
            } else {
                reply(event.target, `Admin ${removeAdminHostmask} no encontrado en la DB.`);
            }
        }
    });
}

function processDJAddition(hostmask, messageParts, event, reply) {
    if (messageParts.length !== 2 || !isValidHostmask(messageParts[1])) {
        reply(event.target, 'Uso: !+dj nick!user@hostmask');
        return;
    }
    const newDJHostmask = messageParts.slice(1).join(' ');
    adminManager.isDJ(newDJHostmask, (err, isDJ) => {
        if (err) {
            reply(event.target, `Error al comprobar el estado del DJ: ${err.message}`);
        } else if (isDJ) {
            reply(event.target, `${newDJHostmask} Ya esta registrado como DJ.`);
        } else {
            adminManager.addDJ(newDJHostmask, (err) => {
                if (err) {
                    reply(event.target, `No se pudo agregar nuevo DJ: ${err.message}`);
                } else {
                    reply(event.target, `Nuevo DJ agregado: ${newDJHostmask}`);
                }
            });
        }
    });
}

function processDJRemoval(hostmask, messageParts, event, reply) {
    if (messageParts.length !== 2 || !isValidHostmask(messageParts[1])) {
        reply(event.target, 'Uso: !-dj nick!user@hostmask');
        return;
    }
    const removeDJHostmask = messageParts[1];
    adminManager.isDJ(removeDJHostmask, (err, isDJ) => {
        if (err) {
            reply(event.target, `Error al comprobar el estado del DJ: ${err.message}`);
        } else {
            if (isDJ) {
                adminManager.removeDJ(removeDJHostmask, (err, removed) => {
                    if (err) {
                        reply(event.target, `Error al eliminar DJ: ${err.message}`);
                    } else {
                        reply(event.target, `DJ ${removeDJHostmask} borrado!`);
                    }
                });
            } else {
                reply(event.target, `DJ ${removeDJHostmask} no encontrado en la DB.`);
            }
        }
    });
}

function processVIPAddition(hostmask, messageParts, event, reply) {
    if (messageParts.length !== 2 || !isValidHostmask(messageParts[1])) {
        reply(event.target, 'Uso: !+vip nick!user@hostmask');
        return;
    }
    const newVIPHostmask = messageParts.slice(1).join(' ');
    adminManager.isVIP(newVIPHostmask, (err, isVIP) => {
        if (err) {
            reply(event.target, `Error al comprobar el estado VIP: ${err.message}`);
        } else if (isVIP) {
            reply(event.target, `${newVIPHostmask} Ya esta registrado como VIP.`);
        } else {
            adminManager.addVIP(newVIPHostmask, (err) => {
                if (err) {
                    reply(event.target, `No se pudo agregar un nuevo VIP: ${err.message}`);
                } else {
                    reply(event.target, `Nuevo VIP agregado: ${newVIPHostmask}`);
                }
            });
        }
    });
}

function processVIPRemoval(hostmask, messageParts, event, reply) {
    if (messageParts.length !== 2 || !isValidHostmask(messageParts[1])) {
        reply(event.target, 'Uso: !-vip nick!user@hostmask');
        return;
    }
    const removeVIPHostmask = messageParts[1];
    adminManager.isVIP(removeVIPHostmask, (err, isVIP) => {
        if (err) {
            reply(event.target, `Error al comprobar el estado VIP: ${err.message}`);
        } else {
            if (isVIP) {
                adminManager.removeVIP(removeVIPHostmask, (err, removed) => {
                    if (err) {
                        reply(event.target, `Error al eliminar VIP: ${err.message}`);
                    } else {
                        reply(event.target, `VIP ${removeVIPHostmask} borrado!`);
                    }
                });
            } else {
                reply(event.target, `VIP ${removeVIPHostmask} no encontrado.`);
            }
        }
    });
}

function listAdmins(event, reply) {
    adminManager.getAllAdmins((err, admins) => {
        if (err) {
            reply(event.target, `Error al recuperar la lista de administradores: ${err.message}`);
        } else {
            if (admins.length === 0) {
                reply(event.target, `No hay administradores.`);
            } else {
                const adminNicks = admins.map(admin => admin.split('!')[0]); // Extrae el nick 
                const adminList = adminNicks.join(', ');
                reply(event.target, `Lista de administradores: ${adminList}`);
            }
        }
    });
}

function listDJs(event, reply) {
    adminManager.getAllDJs((err, djs) => {
        if (err) {
            reply(event.target, `Error al recuperar la lista de DJ: ${err.message}`);
        } else {
            if (djs.length === 0) {
                reply(event.target, `No hay DJ.`);
            } else {
                const djNicks = djs.map(dj => dj.split('!')[0]); // Extrae el nick 
                const djList = djNicks.join(', ');
                reply(event.target, `Lista de DJ: ${djList}`);
            }
        }
    });
}

function listVIPs(event, reply) {
    adminManager.getAllVIPs((err, vips) => {
        if (err) {
            reply(event.target, `Error al obtener la lista VIP: ${err.message}`);
        } else {
            if (vips.length === 0) {
                reply(event.target, `No hay VIP.`);
            } else {
                const vipNicks = vips.map(vip => vip.split('!')[0]); // Extrae el nick 
                const vipList = vipNicks.join(', ');
                reply(event.target, `Lista de VIP: ${vipList}`);
            }
        }
    });
}

function checkDJStatus(event, reply) {
    if (djCommands.isDJInSession()) {
        const djNick = djCommands.getCurrentDJNick();
        reply(event.target, `Actualmente hay una sesión de DJ activa, organizada por ${djNick}.`);
    } else {
        reply(event.target, "No hay ninguna sesión de DJ activa actualmente.");
    }
}

function handleRadioCommand(event, reply) {
    const djCommands = require('./djCommands'); // Ensure this is also correctly imported if needed here
    const djNick = djCommands.getCurrentDJNick() || 'no DJ currently';
    const message = `Hola, ven a escuchar a nuestros DJs aqui: ${config.radioUrl}. El/la DJ actual es ${djNick}!`;
    reply(event.target, message);
}

function handleSongRequest(songParts, event, reply) {
    const botInstance = getInstance();
    if (!botInstance) {
        reply(event.target, "Error: la instancia del bot no está disponible.");
        return;
    }

    const djCommands = require('./djCommands');
    if (djCommands.isDJInSession()) {
        const songRequest = songParts.join(' ');
        const currentDJ = djCommands.getCurrentDJNick(); // Ensure this method correctly retrieves the DJ's nickname

        if (currentDJ) {
            const requestMessage = `${event.nick} ha hecho el siguiente pedido: ${songRequest}`;
            // Correct method to send a private message using irc-framework
            botInstance.say(currentDJ, requestMessage);
            reply(event.target, `Tu petición '${songRequest}' ha sido enviada al DJ.`);
        } else {
            reply(event.target, "No hay ningún DJ en línea actualmente.");
        }
    } else {
        reply(event.target, "Actualmente no hay ninguna sesión de DJ activa.");
    }
}


function isValidHostmask(hostmask) {
    // SACA EL USER Y HOSTMASK DE LAS LISTAS
    const regex = /^[^\s!]+![^\s@]+@[^\s@]+$/;
    return regex.test(hostmask);
}


function setCurrentDJNick(nick) {
    currentDJNick = nick; // Provide a way to update the DJ's nickname
}

function getCurrentDJNick() {
    return currentDJNick; // Return the current DJ's nickname
}

module.exports = {
    processCommand,
    getCurrentDJNick,
    setCurrentDJNick
};

