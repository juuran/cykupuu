import cytoscape from './cytoscape/cytoscape.umd.js';
import * as Util from './util.js';
import { InputHakuKentta, ButtonUusiAikuinen, ButtonUusiLapsi } from './view/komponentit.js';
import { luoSuhdeSolmutJaKaaret } from './model/suhde.js';
import { luoHenkiloSolmut } from './model/henkilo.js';
import { createCytoscape, createLayout } from './cytoscape/boilerplate.js';
import { juusoSearch } from './cytoscape/algoritmit.js';

/**
 * Tämä luokka sisältää business-logiikan kovan ytimen ja muuttuvan tilan.
 */

/**
 * Cytoscape instanssi nopeaa saantia varten. Tämä on tyyli, mitä kirjasto itse suosii, siksi näin.
 */
let cy;

class Cykupuu {

    static NAYTON_LEVEYS;  // TODO: Poista tämä, lasketaan automaagisesti!
    static NO_OF_GROUPS;  // TODO: Poista tämä, koska pitäisi laskea automaattisesti!
    static SIVU_MARGIN;
    static SUHTEEN_MARGIN;

    #previouslyRemoved;
    #suhteitaPerSyvyys;
    #statusbar;
    #henkiloData;
    #suhdeData;
    #hakuKentta;
    #uusiAikuinen;
    #uusiLapsi;
    #cy;

    constructor(naytonLeveys, noOfGroups, sivuMargin, suhteenMargin) {
        this.NAYTON_LEVEYS = naytonLeveys;
        this.NO_OF_GROUPS = noOfGroups;
        this.SIVU_MARGIN = sivuMargin;
        this.SUHTEEN_MARGIN = suhteenMargin;
        this.#previouslyRemoved = [];  // säilötään, että voidaan undo'ata!
        this.#suhteitaPerSyvyys = new Map();
        this.#statusbar = document.getElementById("statusbar");
        this.#henkiloData = {};
        this.#suhdeData = {};
        this.#hakuKentta = new InputHakuKentta(this.hakuKentanHakulogiikka, "input", document.getElementById("hakukentanSpan"));
        this.#uusiAikuinen = new ButtonUusiAikuinen(this.uudenAikuisenLogiikka, "button", document.getElementById("graafinMuokkausSpan"));
        this.#uusiLapsi = new ButtonUusiLapsi(this.uudenLapsenLogiikka, "button", document.getElementById("graafinMuokkausSpan"));
        this.#cy = createCytoscape();
        cy = this.#cy;

        // asetetaaan layout
        createLayout("preset").run();

        // asetetaan graafin toimintaan liittyvät kuuntelijat
        cy.nodes().on("tap", this.valitseSolmu());
    }

    valitseSolmu(_event) {
        let valitut = cy.nodes(":selected");
        this.#uusiAikuinen.down();  // muuta tämä että jos erityyppinen kuin viimeksi,
        this.#uusiLapsi.down();     // niin sitten vasta luo

        if (valitut.length === 1) {
            const valittu = valitut[0];

            // DEBUG LOG valituille, voipi olla että turha
            console.log(`solmu "${valittu.id()}" valittu: ${valittu.scratch()._itse.toString()}`);
            const tiedot = valittu.scratch()._itse.toString();
            this.kirjoitaStatusbar(tiedot);

            if (valittu.scratch()._itse.suhde) {
                this.#uusiAikuinen.up("Luo suhteeseen aikuinen");
                this.#uusiLapsi.up("Luo suhteeseen lapsi");
            } else {
                this.#uusiAikuinen.up("Luo uusi vanhempi");
                this.#uusiLapsi.up("Luo uusi lapsi");
            }
        }
        else if (valitut.length > 1) {
            this.kirjoitaStatusbar("Valitse vain yksi solmu näyttääksesi tietoja.");
        } else {
            this.kirjoitaStatusbar("Valitse solmu näyttääksesi tietoja.");
        }
    }

    valitseKaikkiSolmut() {
        cy.elements().select();
    }

    poistaSolmu() {
        const nodet = cy.nodes(":selected");
        this.#previouslyRemoved.push(cy.remove(nodet));  // (käyttää jquery-mäisiä selectoreita, muttei jqueryä - riippuvuukseton)
    }

    poistaKaari() {
        let edget = cy.edges(":selected");
        this.#previouslyRemoved.push(cy.remove(edget));  // bäckspeissillä saa poistaa vain kaaria
    }

    valitseLehdet() {
        cy.nodes().leaves().select();
    }

    selectRoots() {
        cy.nodes(":selected").unselect();
        cy.nodes().roots().select();
    }

    undoPoisto() {
        if (this.#previouslyRemoved.length === 0) {
            return;
        }
        this.#previouslyRemoved.pop().restore();
    }

    kirjoitaStatusbar(teksti, onkoAikaleimallinen = false) {
        let aikaleima = "";
        if (onkoAikaleimallinen) {
            aikaleima = new Date().toLocaleTimeString('fi') + ": ";
        }

        this.#statusbar.textContent = `${aikaleima}${teksti}`;
    }

    nostaHakuKentta() {
        this.#hakuKentta.up();
    }

    laskeHakuKentta() {
        this.#hakuKentta.down();
    }

    getHakuKentta() {
        return this.#hakuKentta;
    }

    hakuKentanHakulogiikka(event) {
        const hakuehto = event.currentTarget.value.toLocaleLowerCase().trim();
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

    uudenAikuisenLogiikka(event) {

    }

    uudenLapsenLogiikka(event) {

    }

    /*
     
     
     
    Funktiot (business-logiikka, "tärkeät funktiot")
    ----------------------------------------------------
     
    */

    lisaaDataGraafiin() {
        const graafinHenkilot = luoHenkiloSolmut(this.#henkiloData, this.#suhdeData, this.#suhteitaPerSyvyys);
        const graafinSuhteet = luoSuhdeSolmutJaKaaret(this.#suhdeData);
        cy.add(graafinHenkilot);
        cy.add(graafinSuhteet);
    }

    jarjestaGraafi() {  // TODO: Korjaa!!!!
        this.selectRoots();
        juusoSearch(this.#suhteitaPerSyvyys);
        // animoiPolut();

        // asetaGraafinPositiot(cy.nodes(), this.#suhdeData);
        // cy.animate({ pan: { x: -50, y: -50 }, zoom: 1, duration: 300, easing: "ease-in-out" });
    }

    async haeData(host) {
        let onnistui = await this.yritaHakeaDataa(host);
        const virheViesti = `❌ Yhteys palvelimeen on katkennut, yritetään uudelleen`;
        let pisteita = ".";

        if (!onnistui) {
            this.kirjoitaStatusbar(`${virheViesti}${pisteita}`, true);
        }

        for (let i = 0; i < 10 && !onnistui; i++) {
            onnistui = await this.yritaHakeaDataa(host);

            if (onnistui) {
                break;
            } else {
                pisteita += ".";
                this.kirjoitaStatusbar(`${virheViesti}${pisteita}`, true);
            }

            await Util.sleep(1);
        }

        if (onnistui) {
            this.kirjoitaStatusbar(`✔️ Tiedot onnistuneesti haettu palvelimelta.`, true);
        } else {
            this.kirjoitaStatusbar(`❌ Yhteytä palvelimelle ei voida tällä hetkellä muodostaa.`, true);
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
            console.error(error);
            return false;
        }
    }

}

export { Cykupuu, cy };
