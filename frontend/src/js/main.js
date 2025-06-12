"use strict";
import { Cykupuu, cy } from './cykupuu.js';
import { createLayout } from './cytoscape/boilerplate.js';
import * as Util from './util.js';

/**
 * Kyseinen "main" tai "fasadi" moduuli hoitaa reitityksen ja delegoinnin. Siis saapuvat kutsut ja lähtevät vastaukset.
*/

const zoomausTaso = 2;

const cykupuu = new Cykupuu(1200, 2, 100, 50, 100);

function asetaKuuntelijat() {
    // nappien kuuntelijat
    document.getElementById("randoButton").addEventListener("click", nappuloidenKuuntelija);
    document.getElementById("järjestäButton").addEventListener("click", nappuloidenKuuntelija);
    document.getElementById("omaJärjestysButton").addEventListener("click", nappuloidenKuuntelija);
    document.getElementById("hakukenttaButton").addEventListener("click", nappuloidenKuuntelija);
    document.getElementById("zoomaaSisaan").addEventListener("click", nappuloidenKuuntelija);
    document.getElementById("zoomaaUlos").addEventListener("click", nappuloidenKuuntelija);

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
            cykupuu.laskeHakuKentta();
        }
        if (e.code === "KeyF" && (e.ctrlKey && e.shiftKey || e.ctrlKey && e.altKey || e.shiftKey && e.altKey)) {
            cykupuu.nostaHakuKentta();
        }
    });
    kytkeNappaimienKuuntelija(true);
}

function kytkeNappaimienKuuntelija(paalle) {
    if (paalle) {
        document.removeEventListener("keydown", nappaimienKuuntelija);
        document.addEventListener("keydown", nappaimienKuuntelija);
    }
    else {
        document.removeEventListener("keydown", nappaimienKuuntelija);
    }
}

function nappaimienKuuntelija(event) {
    if (event.code === "Delete") {
        cykupuu.poistaSolmut();
    }
    else if (event.code === "Backspace") {
        cykupuu.poistaKaaret();
    }

    else if (event.code === "KeyZ" && event.ctrlKey) {
        cykupuu.undoPoisto();
    }

    else if (event.code === "KeyA") {
        cykupuu.kirjoitaStatusbar('Painettu näppäintä "A" (all): valitse kaikki solmut.');
        cykupuu.valitseKaikkiSolmut();
    }

    else if (event.code === "KeyR") {
        cykupuu.kirjoitaStatusbar('Painettu näppäintä "R" (roots): valitse juuret.');
        cykupuu.selectRoots();
    }

    else if (event.code === "KeyL") {
        cykupuu.kirjoitaStatusbar('Painettu näppäintä "L" (leaves): valitse lehdet.');
        cykupuu.valitseLehdet();
    }

    else if (event.code === "KeyJ") {
        cykupuu.kirjoitaStatusbar('Painettu näppäintä "J" (Juuso): juuso juuso');
        cykupuu.juusoSearch();
    }

    else if (event.code === "KeyH") {
        cykupuu.jarjestaGraafi();
    }

    else if (event.shiftKey && event.code === "ArrowLeft") {
        cy.panBy({ x: 1.1 * Cykupuu.PIIRTO_STEP, y: 0 });
    }

    else if (event.shiftKey && event.code === "ArrowRight") {
        cy.panBy({ x: -1.1 * Cykupuu.PIIRTO_STEP, y: 0 });
    }

    else if (event.shiftKey && event.code === "ArrowUp") {
        cy.panBy({ x: 0, y: 1.1 * Cykupuu.PIIRTO_STEP });
    }

    else if (event.shiftKey && event.code === "ArrowDown") {
        cy.panBy({ x: 0, y: -1.1 * Cykupuu.PIIRTO_STEP });
    }

    else if (event.shiftKey && event.code === "NumpadAdd") {
        zoomaaSisaan();
    }

    else if (event.shiftKey && event.code === "NumpadSubtract") {
        zoomaaUlos();
    }
}

function nappuloidenKuuntelija(event) {
    if (event.currentTarget.id === "randoButton") {
        createLayout("random").run();
    }

    else if (event.currentTarget.id === "järjestäButton") {
        createLayout("breadthfirst").run();
    }

    else if (event.currentTarget.id === "omaJärjestysButton") {
        cykupuu.jarjestaGraafi();
    }

    else if (event.currentTarget.id === "hakukenttaButton") {
        const hakukentta = cykupuu.getHakuKentta();
        if (hakukentta.isUp()) {
            cykupuu.laskeHakuKentta();
        } else {
            cykupuu.nostaHakuKentta();
        }
    }

    // TODO: Korjaa zoomaamaan keskelle
    else if (event.currentTarget.id === "zoomaaSisaan") {
        zoomaaSisaan();
    }
    else if (event.currentTarget.id === "zoomaaUlos") {
        zoomaaUlos();
    }
}

function zoomaaSisaan() {
    const floatZoomLevel = cy.zoom();
    cy.zoom(floatZoomLevel * zoomausTaso);
}

function zoomaaUlos() {
    const floatZoomLevel = cy.zoom();
    cy.zoom(floatZoomLevel * (1 / zoomausTaso));
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
};

export { kytkeNappaimienKuuntelija, Cykupuu };
