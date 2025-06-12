import * as Util from './util.js';
import { InputHakuKentta, ButtPainike, FormHenkiloa, FormSuhdetta } from './view/komponentit.js';
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
/**
 * Hieman hack, mutta pakko käyttää että eri moduulissa asetetut kuuntelijat pääsevät
 * käsiksi ohjelman kontekstiin. Käytetään siis vain komponenttien kuuntelijoissa.
 */
var that;

class Cykupuu {

    static NAYTON_LEVEYS;  // TODO: Poista tämä, lasketaan automaagisesti!
    static NO_OF_GROUPS;  // TODO: Poista tämä, koska pitäisi laskea automaattisesti!
    static SIVU_MARGIN;
    static SUHTEEN_MARGIN;
    static PIIRTO_STEP;

    previouslyRemoved;
    #suhteitaPerSyvyys;
    #statusbar;
    #henkiloData;
    #suhdeData;
    #edellinenValittu;
    #hakuKentta;
    #uusiAikuinen;
    #uusiLapsi;
    #poistaSolmu;
    #muokkaaHenkiloa;
    #muokkaaSuhdetta;
    #ekaaKertaaPoistan;
    #cy;

    constructor(naytonLeveys, noOfGroups, sivuMargin, suhteenMargin, piirtoStep) {
        that = this;

        Cykupuu.NAYTON_LEVEYS = naytonLeveys;
        Cykupuu.NO_OF_GROUPS = noOfGroups;
        Cykupuu.SIVU_MARGIN = sivuMargin;
        Cykupuu.SUHTEEN_MARGIN = suhteenMargin;
        Cykupuu.PIIRTO_STEP = piirtoStep;
        this.previouslyRemoved = [];  // säilötään, että voidaan undo'ata!
        this.#suhteitaPerSyvyys = new Map();
        this.#statusbar = document.getElementById("statusbar");
        this.#henkiloData = {};
        this.#suhdeData = {};
        this.#edellinenValittu = null;

        const span = document.getElementById("graafinMuokkausSpan");
        this.#hakuKentta = new InputHakuKentta(this.hakuKentanHakulogiikka, "input", document.getElementById("hakukentanSpan"));
        this.#poistaSolmu = new ButtPainike(this.poistaSolmut, "click", span);
        this.#uusiAikuinen = new ButtPainike(this.uudenAikuisenLogiikka, "click", span);
        this.#uusiLapsi = new ButtPainike(this.uudenLapsenLogiikka, "click", span);
        this.#muokkaaHenkiloa = new FormHenkiloa(this.muokkaaHenkilonTietoja, "input", document.getElementById("tietojenMuokkaus"));
        this.#muokkaaSuhdetta = new FormSuhdetta(this.muokkaaSuhteenTietoja, "input", document.getElementById("tietojenMuokkaus"));
        this.#ekaaKertaaPoistan = true;
        this.#cy = createCytoscape();
        cy = this.#cy;

        // asetetaaan layout
        createLayout("preset").run();

        // asetetaan graafin toimintaan liittyvät kuuntelijat
        cy.nodes().on("tap", this.valitseSolmu());
    }

    valitseSolmu(_event) {
        const valitut = cy.nodes(":selected"); // katsotaan vain solmuja, ei kaaria!

        if (valitut.length === 1) {
            const valittu = valitut[0];
            const edellinen = this.#edellinenValittu;
            this.#edellinenValittu = valittu;

            if (this.edellinenValittuVastaavanlainen(edellinen, valittu)) {
                return;
            }

            this.#uusiAikuinen.down(true);
            this.#uusiLapsi.down(true);
            this.#poistaSolmu.down(true);

            // DEBUG LOG valituille, voipi olla että turha
            console.log(`solmu "${valittu.id()}" valittu: ${valittu.scratch()._itse.toString()}`);
            const tiedot = `${valittu.scratch()._itse.toString()} eli moi`;
            this.kirjoitaStatusbar(tiedot);

            if (valittu.scratch()._itse.suhde) {
                this.#uusiAikuinen.up("Luo suhteeseen aikuinen");
                this.#uusiLapsi.up("Luo suhteeseen lapsi");
                this.#poistaSolmu.up("🗑️");
                this.#muokkaaHenkiloa.up();
            } else {
                this.#uusiAikuinen.up("Luo uusi vanhempi");
                this.#uusiLapsi.up("Luo uusi lapsi");
                this.#poistaSolmu.up("🗑️");
                this.#muokkaaHenkiloa.up();
            }
        }
        else if (valitut.length > 1) {
            this.#edellinenValittu = null;
            this.#uusiAikuinen.down();
            this.#uusiLapsi.down();
            this.#poistaSolmu.up("🗑️");
            this.#muokkaaHenkiloa.down();
            this.kirjoitaStatusbar("Valitse vain yksi solmu näyttääksesi tietoja.");
        } else {
            this.#edellinenValittu = null;
            this.#uusiAikuinen.down();
            this.#uusiLapsi.down();
            this.#poistaSolmu.down();
            this.#muokkaaHenkiloa.down();
            this.kirjoitaStatusbar("Valitse solmu näyttääksesi tietoja.");
        }
    }

    edellinenValittuVastaavanlainen(edellinen, nykyinen) {
        if (!edellinen) {
            return false;
        }

        if (edellinen.scratch()._itse.henkilo && nykyinen.scratch()._itse.henkilo) {
            return true;
        }
        if (edellinen.scratch()._itse.suhde && nykyinen.scratch()._itse.suhde) {
            return true;
        }

        return false;
    }

    valitseKaikkiSolmut() {
        cy.elements().select();
    }

    poistaKaaret() {
        let edget = cy.edges(":selected");
        this.previouslyRemoved.push(cy.remove(edget));  // bäckspeissillä saa poistaa vain kaaria
    }

    valitseLehdet() {
        cy.nodes().leaves().select();
    }

    selectRoots() {
        cy.nodes(":selected").unselect();
        cy.nodes().roots().select();
    }

    undoPoisto() {
        if (this.previouslyRemoved.length === 0) {
            return;
        }
        this.previouslyRemoved.pop().restore();
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

    /*
     
     
     
    Komponenttikuuntelijat (joiden pakko käyttää 'that':tiä)
    --------------------------------------------------------
     
    */

    poistaSolmut(event) {
        if (that.#ekaaKertaaPoistan) {
            alert("Tämä poistaa valitut pallurat, mutta ne voidaan palauttaa undolla (ctrl + Z).");
            that.#ekaaKertaaPoistan = false;
        }
        const nodet = cy.nodes(":selected");
        that.previouslyRemoved.push(cy.remove(nodet));  // (käyttää jquery-mäisiä selectoreita, muttei jqueryä - riippuvuukseton)
    }

    uudenAikuisenLogiikka(_event) {
        // this ei ole näkyvissä ollenkaan luokan ulkopuolelle!
        alert(`Kaikki aikanaan, myös aikuinen: ${that.#statusbar.textContent}`);
    }

    uudenLapsenLogiikka(_event) {
        alert(`Kaikki aikanaan, lapsikin: ${that.#statusbar.textContent}`);
    }

    muokkaaHenkilonTietoja(event) {
        const valitut = cy.nodes(":selected"); // katsotaan vain solmuja, ei kaaria!
        if (valitut.length != 1) {
            return;
        }

        const currentTarget = event.currentTarget.value;
        alert(currentTarget);
    }

    muokkaaSuhteenTietoja(event) {
        const valitut = cy.nodes(":selected"); // katsotaan vain solmuja, ei kaaria!
        if (valitut.length != 1) {
            return;
        }

        const currentTarget = event.currentTarget.value;
        alert(currentTarget);
    }

    /*
     
     
     
    Funktiot (business-logiikka, "tärkeät funktiot")
    ------------------------------------------------
     
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
