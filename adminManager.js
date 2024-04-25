const sqlite3 = require('sqlite3').verbose();

// Database setup
const db = new sqlite3.Database('./admins.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the admin database.');
    db.run('CREATE TABLE IF NOT EXISTS admins (id INTEGER PRIMARY KEY, hostmask TEXT UNIQUE)');
    db.run('CREATE TABLE IF NOT EXISTS djs (id INTEGER PRIMARY KEY, hostmask TEXT UNIQUE)');
    db.run('CREATE TABLE IF NOT EXISTS vips (id INTEGER PRIMARY KEY, hostmask TEXT UNIQUE)');
});

function isAdmin(hostmask, callback) {
    db.get('SELECT id FROM admins WHERE hostmask = ?', [hostmask], (err, row) => {
        callback(err, !!row);
    });
}

function addAdmin(hostmask, callback) {
    db.run('INSERT INTO admins (hostmask) VALUES (?)', [hostmask], function(err) {
        callback(err);
    });
}

function removeAdmin(hostmask, callback) {
    db.run('DELETE FROM admins WHERE hostmask = ?', [hostmask], function(err) {
        callback(err);
    });
}

function addDJ(hostmask, callback) {
    db.run('INSERT INTO djs (hostmask) VALUES (?)', [hostmask], function(err) {
        callback(err);
    });
}

function isDJ(hostmask, callback) {
    db.get('SELECT id FROM djs WHERE hostmask = ?', [hostmask], (err, row) => {
        callback(err, !!row);
    });
}

function removeDJ(hostmask, callback) {
    db.run('DELETE FROM djs WHERE hostmask = ?', [hostmask], function(err) {
        callback(err);
    });
}

function addVIP(hostmask, callback) {
    db.run('INSERT INTO vips (hostmask) VALUES (?)', [hostmask], function(err) {
        callback(err);
    });
}

function removeVIP(hostmask, callback) {
    db.run('DELETE FROM vips WHERE hostmask = ?', [hostmask], function(err) {
        callback(err);
    });
}

function isVIP(hostmask, callback) {
    db.get('SELECT id FROM vips WHERE hostmask = ?', [hostmask], (err, row) => {
        callback(err, !!row);
    });
}

function getAllAdmins(callback) {
    db.all('SELECT hostmask FROM admins', (err, rows) => {
        if (err) {
            callback(err, null);
            return;
        }
        const adminNicks = rows.map(row => row.hostmask.split('!')[0]); // Extracting nicknames
        callback(null, adminNicks);
    });
}

function getAllDJs(callback) {
    db.all('SELECT hostmask FROM djs', (err, rows) => {
        if (err) {
            callback(err, null);
            return;
        }
        const djNicks = rows.map(row => row.hostmask.split('!')[0]); // Extracting nicknames
        callback(null, djNicks);
    });
}

function getAllVIPs(callback) {
    db.all('SELECT hostmask FROM vips', (err, rows) => {
        if (err) {
            callback(err, null);
            return;
        }
        const vipNicks = rows.map(row => row.hostmask.split('!')[0]); // Extracting nicknames
        callback(null, vipNicks);
    });
}

module.exports = {
    isAdmin,
    addAdmin,
    removeAdmin,
    addDJ,
    removeDJ,
    isDJ,
    isVIP,
    addVIP,
    removeVIP,
    getAllAdmins,
    getAllDJs,
    getAllVIPs,
};