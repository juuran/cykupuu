import cytoscape from './cytoscape/cytoscape.umd.js';
import * as Util from './util.js';
import { inputHakuKentta } from './view/komponentit.js'
import { Suhde, luoSuhdeSolmutJaKaaret } from './model/suhde.js';
import { Henkilo, haeHenkilonRyhma, luoHenkiloSolmut } from './model/henkilo.js';
import { kytkeNappaimenKuuntelija } from './main.js';
import { createCytoscape, createLayout } from './cytoscape/boilerplate.js';
import { maaritaSyvyydetSolmustaAlavirtaan, korjaaSyvyydetYlavirtaan, maaritaLeveydetSolmustaAlavirtaan, asetaAutoritatiivisetJuuret, animoiPolut, juusoSearch } from './cytoscape/algoritmit.js';
import { asetaGraafinPositiot } from './view/piirtaminen.js';

/**
 * Tämä luokka sisältää business-logiikan kovan ytimen ja muuttuvan tilan.
 */

/**
 * Cytoscape instanssi nopeaa saantia varten. Tämä on tyyli, mitä kirjasto itse suosii, siksi näin.
 */
let cy;
let NAYTON_LEVEYS;
let NO_OF_GROUPS;
let SIVU_MARGIN;
let SUHTEEN_MARGIN;

class Cykupuu {

    // tämä # on JS:n ruma syntaksi private muuttujille...

    #previouslyRemoved;
    #suhteitaPerSyvyys;
    #statusbar;
    #henkiloData;
    #suhdeData;
    #hakuKentta;
    #cy;

    constructor(naytonLeveys, noOfGroups, sivuMargin, suhteenMargin) {
        NAYTON_LEVEYS = naytonLeveys;
        NO_OF_GROUPS = noOfGroups;
        SIVU_MARGIN = sivuMargin;
        SUHTEEN_MARGIN = suhteenMargin;
        this.#previouslyRemoved = [];  // säilötään, että voidaan undo'ata!
        this.#suhteitaPerSyvyys = new Map();
        this.#statusbar = document.getElementById("statusbar");
        this.#henkiloData = {};
        this.#suhdeData = {};
        this.#hakuKentta = new inputHakuKentta(this.hakuKentanHakulogiikka, "keyup", document.getElementById("hakukentanSpan"));
        this.#cy = createCytoscape();
        cy = this.#cy;

        // asetetaaan layout
        createLayout("preset").run();
    }

    valitseSolmu() {
        let valitut = cy.nodes(":selected");
        if (valitut.length === 1) {
            // DEBUG LOG valituille, voipi olla että turha
            console.log(`solmu "${valitut.id()}" valittu: ${valitut.scratch()._itse.toString()}`);
            const tiedot = valitut[0].scratch()._itse.toString();
            this.kirjoitaStatusbar(tiedot);
        }
        else if (valitut.length > 1) {
            this.kirjoitaStatusbar("Valitse vain yksi solmu näyttääksesi tietoja.");
        } else {
            this.kirjoitaStatusbar("Valitse solmu näyttääksesi tietoja.");
        }
    }

    valitseKaikkiSolmut() {
        this.kirjoitaStatusbar('Painettu näppäintä "A" (all): valitse kaikki solmut.');
        cy.elements().select();
    }

    poistaSolmu() {
        const nodet = cy.nodes(":selected");
        PREVIOUSLY_REMOVED.push(cy.remove(nodet));  // (käyttää jquery-mäisiä selectoreita, muttei jqueryä - riippuvuukseton)
    }

    valitseLehdet() {
        this.kirjoitaStatusbar('Painettu näppäintä "L" (leaves): valitse lehdet.');
        cy.nodes().leaves().select();
    }

    selectRoots() {
        let valitut = cy.nodes(":selected");
        if (valitut.length <= 1) {
            this.kirjoitaStatusbar('Painettu näppäintä "R" (roots): valitse juuret.');
            cy.nodes().roots().select();
            return;
        }

        this.kirjoitaStatusbar('Painettu näppäintä "R" (roots) kokoelmalle solmuja: valitaan juuret tälle joukolle.');
        valitut.unselect();
        valitut.roots().select();
    }

    valitseLapset() {
        let valitut = cy.nodes(":selected");
        if (valitut.length === 0) {
            this.kirjoitaStatusbar('Painettu näppäintä "K" (kids): Lasten (ja parisuhteiden) valitseminen on mahdollista vain kun jokin solmu on valittuna!');
            return;
        }

        valitut.outgoers().select();
        this.kirjoitaStatusbar('Painettu näppäintä "K" (kids): valitaan lapset ja parisuhteet valitulle solmulle.');
    }

    valitseVanhemmat() {
        let valitut = cy.nodes(":selected");
        if (valitut.length === 0) {
            this.kirjoitaStatusbar('Painettu näppäintä "P" (parents): Vanhempien (ja vanhempisuhteiden) valitseminen on mahdollista vain kun jokin solmu on valittuna!');
            return;
        }

        valitut.incomers().select();
        this.kirjoitaStatusbar('Painettu näppäintä "P" (parents): valitaan vanhemmat ja vanhempisuhteet valitulle solmulle.');
    }

    poistaKaari() {
        let edget = cy.edges(":selected");
        PREVIOUSLY_REMOVED.push(cy.remove(edget));  // bäckspeissillä saa poistaa vain kaaria
    }

    undoPoisto() {
        if (this.#previouslyRemoved.length === 0) {
            return;
        }
        this.#previouslyRemoved.pop().restore();
    }

    kirjoitaStatusbar(teksti, onkoAikaleimallinen = false) {
        let aikaleima;
        if (onkoAikaleimallinen) {
            aikaleima = new Date().toLocaleTimeString('fi');
        }

        this.#statusbar.textContent = `${aikaleima}: ${teksti}`
    }

    nostaHakuKentta() {
        this.#hakuKentta.up();
    }

    laskeHakuKentta() {
        this.#hakuKentta.down();
    }

    getHakuKentta() {
        if (this.#hakuKentta) {
            return this.#hakuKentta;
        }
        return null;
    }

    hakuKentanHakulogiikka() {
        const hakuehto = this.#hakuKentta.domElement.value.toLocaleLowerCase().trim();
        if (hakuehto.length < 3) {
            return;
        }

        for (const solmu of cy.nodes()) {
            if (!solmu.scratch()._itse.henkilo) {  // vain henkilöt kiinnostaa
                return;
            }

            const hakuehdot = hakuehto.split(" ");
            const henk = solmu.scratch()._itse.henkilo;
            const kokonimiLowercase = henk.etunimet.toLocaleLowerCase() + " " + henk.sukunimet.toLocaleLowerCase();

            let kaikkiLoytyi = true;
            for (const ehto of hakuehdot) {
                if (!kokonimiLowercase.includes(ehto)) {
                    kaikkiLoytyi = false;
                }
            }

            if (kaikkiLoytyi) {
                cy.nodes(":selected").unselect();
                solmu.select();
                return;
            }
        }
    }


    /*
     
     
     
    Funktiot (business-logiikka, "tärkeät funktiot")
    ----------------------------------------------------
     
    */

    lisaaDataGraafiin() {
        graafinHenkilot = luoHenkiloSolmut(this.#henkiloData, this.#suhdeData, this.#suhteitaPerSyvyys);
        graafinSuhteet = luoSuhdeSolmutJaKaaret(this.#suhdeData);
        cy.add(graafinHenkilot);
        cy.add(graafinSuhteet);
    }

    jarjestaGraafi() {  // TODO: Korjaa!!!!
        this.selectRoots();
        juusoSearch(this.#suhteitaPerSyvyys);
        animoiPolut();

        asetaGraafinPositiot(cy.nodes(), this.#suhdeData);
        cy.animate({ pan: { x: -50, y: -50 }, zoom: 1, duration: 300, easing: "ease-in-out" });
    }

    async haeData(host) {
        let onnistui = await this.yritaHakeaDataa(host);
        const virheViesti = `❌ Yhteys palvelimeen on katkennut, yritetään uudelleen`;
        let pisteita = ".";

        if (!onnistui) {
            this.kirjoitaStatusbar(`${virheViesti}${pisteita}`, true);
        }

        for (let i = 0; i < 10 && !onnistui; i++) {
            aikaleima = new Date().toLocaleTimeString('fi');
            onnistui = await yritaHakeaDataa();

            if (onnistui) {
                break;
            } else {
                pisteita += ".";
                this.kirjoitaStatusbar(`${virheViesti}${pisteita}`);
            }

            await Util.sleep(1);
        }

        if (onnistui) {
            this.kirjoitaStatusbar(`✔️ Tiedot onnistuneesti haettu palvelimelta.`);
        } else {
            this.kirjoitaStatusbar(`❌ Yhteytä palvelimelle ei voida tällä hetkellä muodostaa.`);
        }
    }

    async yritaHakeaDataa(host) {
        try {
            let henkilot = await Util.haeDataaServerilta(`${host}/api/henkilot`);
            let suhteet = await Util.haeDataaServerilta(`${host}/api/suhteet`);

            console.dir(henkilot);
            console.dir(suhteet);

            this.#henkiloData = henkilot;
            this.#suhdeData = suhteet;

            return true;
        } catch (error) {
            console.error("Virhe hakiessa tietoja serveriltä:")
            console.dir(error);
            return false;
        }
    }

}

export { Cykupuu, cy, NAYTON_LEVEYS, NO_OF_GROUPS, SIVU_MARGIN, SUHTEEN_MARGIN };
