"use strict";
import { Cykupuu } from './cykupuu.js';
import * as Util from './util.js';

/**
 * Kyseinen "main" tai "fasadi" moduuli hoitaa reitityksen ja delegoinnin. Siis saapuvat kutsut ja lähtevät vastaukset.
*/

const cykupuu = new Cykupuu(1200, 2, 100, 50);

function asetaKuuntelijat() {
    // nappien kuuntelijat
    document.getElementById("randoButton").addEventListener("click", nappuloidenKuuntelija);
    document.getElementById("järjestäButton").addEventListener("click", nappuloidenKuuntelija);
    document.getElementById("omaJärjestysButton").addEventListener("click", nappuloidenKuuntelija);
    document.getElementById("hakukenttaButton").addEventListener("click", nappuloidenKuuntelija);

    // hiiren ja kosketuksen kuuntelijat
    document.addEventListener('mouseup', async () => {
        await Util.sleep(0.01);
        cykupuu.valitseSolmu();
    });
    document.addEventListener('touchend', async () => {
        await Util.sleep(0.15);
        cykupuu.valitseSolmu();
    });

    // hakukentän kuuntelijat
    document.addEventListener("keydown", (e) => {
        if (e.code === "Escape") {
            cykupuu.laskeHakuKentta()
        }
        if (e.code === "KeyF" && (e.ctrlKey && e.shiftKey || e.ctrlKey && e.altKey || e.shiftKey && e.altKey)) {
            cykupuu.nostaHakuKentta();
        }
    });
    kytkeNappainKuuntelija(true);
}

function kytkeNappainKuuntelija(paalle) {
    if (paalle) {
        document.removeEventListener("keydown", nappainKuuntelija);
        document.addEventListener("keydown", nappainKuuntelija);
    }
    else {
        document.removeEventListener("keydown", nappainKuuntelija);
    }
}

function nappainKuuntelija(event) {
    if (event.code === "Delete") {
        cykupuu.poistaSolmu();
    }
    else if (event.code === "Backspace") {
        cykupuu.poistaKaari();
    }

    else if (event.code === "KeyZ" && event.ctrlKey) {
        cykupuu.undoPoisto();
    }

    else if (event.code === "KeyA") {
        cykupuu.valitseKaikkiSolmut();
    }

    else if (event.code === "KeyR") {
        cykupuu.selectRoots();
    }

    else if (event.code === "KeyL") {
        cykupuu.valitseLehdet();
    }

    else if (event.code === "KeyK") {
        cykupuu.valitseLapset();
    }

    else if (event.code === "KeyP") {
        cykupuu.valitseVanhemmat();
    }

    else if (event.code === "KeyJ") {
        cykupuu.juusoSearch();
    }

    else if (event.code === "KeyH") {
        cykupuu.asetaGraafinPositiot(cy.elements());
    }
}

function nappuloidenKuuntelija(event) {
    if (event.currentTarget.id === "randoButton") {
        cykupuu.luoLeiska("random").run();
    }

    if (event.currentTarget.id === "järjestäButton") {
        cykupuu.luoLeiska("breadthfirst").run();
    }

    if (event.currentTarget.id === "omaJärjestysButton") {
        cykupuu.jarjestaGraafi();
    }

    if (event.currentTarget.id === "hakukenttaButton") {
        const hakukentta = cykupuu.getHakuKentta();
        if (hakukentta._isUp()) {
            cykupuu.laskeHakuKentta();
        } else {
            cykupuu.nostaHakuKentta();
        }
    }
}

/**
 * Ohjelman suoritus, aka main.
*/
async function main() {
    asetaKuuntelijat();
    await cykupuu.haeData("http://localhost:8080");
    cykupuu.lisaaDataGraafiin();
    cykupuu.jarjestaGraafi();
}

window.onload = async () => {
    main();
}

export { kytkeNappainKuuntelija as kytkeNappaimenKuuntelija };
