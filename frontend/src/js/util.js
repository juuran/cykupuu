/**
 * Util sisältää apufunktiota, jotka eivät sisällä tärkeää business-logiikkaa. Ne ovat puhtaita funktioita (eivät sisällä tilaa).
 */

/**
 * Jos tarvitsee synkronisesti nukkua tässä suorituksen aikana. Muista käyttää "await" avainsanan kanssa, esim. "await sleep(2);"
 * @param {*} secs Uniaika annettuna sekunteina
 */
function sleep(secs) {
    return new Promise(r => setTimeout(r, secs * 1000));
}

function isNumber(value) {
    return typeof value === 'number';
}

async function haeDataaServerilta(url) {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Virhettä pukkaa, kuten: ${response.status}.`);
        }

        return response.text();
    } catch (error) {
        throw error;
    }
}

async function vieDataaServerille(url, data) {
    // implementoi
}

export { sleep, isNumber, haeDataaServerilta };
