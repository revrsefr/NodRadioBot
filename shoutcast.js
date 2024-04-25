// shoutcast.js
const fetch = require('node-fetch');
const { parse } = require('fast-xml-parser');

async function fetchSongDetails(shoutcastUrl) {
    try {
        const response = await fetch(shoutcastUrl);
        if (response.ok) {
            const data = await response.text();
            const options = {
                ignoreAttributes: false
            };
            const jsonObj = parse(data, options);
            const streamStatus = jsonObj.SHOUTCASTSERVER.STREAMSTATUS;
            const songTitle = jsonObj.SHOUTCASTSERVER.SONGTITLE;
            const serverUrl = jsonObj.SHOUTCASTSERVER.SERVERURL;
            const songUrl = jsonObj.SHOUTCASTSERVER.SONGURL;

            return `${songTitle} - ${streamStatus} - Listen here: ${serverUrl}, Song details: ${songUrl}`;
        } else {
            return "Error: Unable to fetch music details.";
        }
    } catch (e) {
        return `Error: Issue retrieving music details. ${e.message}`;
    }
}

module.exports = {
    fetchSongDetails
};
