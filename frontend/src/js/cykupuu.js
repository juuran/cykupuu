import * as Util from './util.js';
import { InputHakuKentta, ButtPainike } from './view/komponentit.js';
import { FormHenkiloa, FormSuhdetta } from './view/popupit.js';
import { luoSuhdeSolmutJaKaaret } from './model/suhde.js';
import { luoHenkiloSolmut } from './model/henkilo.js';
import { createCytoscape, createLayout } from './cytoscape/boilerplate.js';
import { juusoSearch } from './cytoscape/algoritmit.js';
import { synkronoiMuutokset } from './main.js';

/**
 * Tämä luokka sisältää business-logiikan kovan ytimen ja muuttuvan tilan poislukien ulkoiset
 * kutsut (jotka hoitaa main).
 */

/**
 * Cytoscape instanssi nopeaa saantia varten. Tämä on tyyli, mitä kirjasto itse suosii, siksi näin.
 */
let cy;
/**
 * Hieman hack (that's JS for ya), mutta pakko käyttää että eri moduulissa asetetut kuuntelijat
 * pääsevät käsiksi ohjelman kontekstiin. Käytetään siis vain komponenttien kuuntelijoissa.
 */
var that;

class Cykupuu {

    static NAYTON_LEVEYS;  // TODO: Poista tämä, lasketaan automaagisesti!
    static NO_OF_GROUPS;  // TODO: Poista tämä, koska pitäisi laskea automaattisesti!
    static SIVU_MARGIN;
    static SUHTEEN_MARGIN;
    static PIIRTO_STEP;
    static ANIMAATIO_PITUUS_SYNTYMA;
    static ANIMAATIO_PITUUS_KUOLEMA;

    previouslyRemoved;
    #suhteitaPerSyvyys;
    #statusbar;
    #henkiloData;
    #suhdeData;
    hakuKentta;
    #uusiAikuinen;
    #uusiLapsi;
    #poistaSolmu;
    #muokkaaNappi;
    muokkaaHenkiloa;
    muokkaaSuhdetta;
    #ekaaKertaaPoistan;  // (jos harmaa niin ei tajua, että kutsutaan that (eikä this) kautta)
    #dirty;
    #cy;

    constructor(naytonLeveys, noOfGroups, sivuMargin, suhteenMargin, piirtoStep, synnyinAnimaatioPituus, kuolinAnimaatioPituus) {
        that = this;

        Cykupuu.NAYTON_LEVEYS = naytonLeveys;
        Cykupuu.NO_OF_GROUPS = noOfGroups;
        Cykupuu.SIVU_MARGIN = sivuMargin;
        Cykupuu.SUHTEEN_MARGIN = suhteenMargin;
        Cykupuu.PIIRTO_STEP = piirtoStep;
        Cykupuu.ANIMAATIO_PITUUS_SYNTYMA = synnyinAnimaatioPituus * 0.9; // varulta nipistetään
        Cykupuu.ANIMAATIO_PITUUS_KUOLEMA = kuolinAnimaatioPituus * 0.9;  // hiukan ajasta
        this.previouslyRemoved = [];  // säilötään, että voidaan undo'ata!
        this.#suhteitaPerSyvyys = new Map();
        this.#statusbar = document.getElementById("statusbar");
        this.#henkiloData = {};
        this.#suhdeData = {};

        const span = document.getElementById("graafinMuokkausSpan");
        this.hakuKentta = new InputHakuKentta(this.hakuKentanHakulogiikka, "input", document.getElementById("hakukentanSpan"));
        this.#poistaSolmu = new ButtPainike(this.poistaSolmut, "click", span);
        this.#uusiAikuinen = new ButtPainike(this.uudenAikuisenLogiikka, "click", span);
        this.#uusiLapsi = new ButtPainike(this.uudenLapsenLogiikka, "click", span);
        this.#muokkaaNappi = new ButtPainike(this.avaaMuokkaus, "click", span);
        this.muokkaaHenkiloa = new FormHenkiloa(this.muokkaaHenkilonTietoja, this.tallennaTaiKumoaMuokkaus, document.getElementById("tietojenMuokkaus"));
        this.muokkaaSuhdetta = new FormSuhdetta(this.muokkaaSuhteenTietoja, this.tallennaTaiKumoaMuokkaus, document.getElementById("tietojenMuokkaus"));
        this.#ekaaKertaaPoistan = true;
        this.#dirty = false;
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

            const itse = valittu.scratch()._itse;
            const tiedot = `${itse.toString()} eli moi`;
            this.kirjoitaStatusbar(tiedot);

            if (itse.henkilo) {
                this.#poistaSolmu.up("🗑️");
                this.#muokkaaNappi.up("✏️");
                this.#uusiAikuinen.up("Luo uusi vanhempi");
                this.#uusiLapsi.up("Luo uusi lapsi");
            }
            else {
                this.#poistaSolmu.up("🗑️");
                this.#muokkaaNappi.up("✏️");
                this.#uusiAikuinen.up("Luo uusi vanhempi");
                this.#uusiLapsi.up("Luo uusi lapsi");
            }
        }
        else if (valitut.length > 1) {
            this.#poistaSolmu.up("🗑️");
            this.#muokkaaNappi.down();
            this.#uusiAikuinen.down();
            this.#uusiLapsi.down();
            this.kirjoitaStatusbar("Valitse vain yksi solmu näyttääksesi tietoja.");
        } else {
            this.#poistaSolmu.down();
            this.#muokkaaNappi.down();
            this.#uusiAikuinen.down();
            this.#uusiLapsi.down();
            this.kirjoitaStatusbar("Valitse solmu näyttääksesi tietoja.");
        }
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
        this.hakuKentta.up();
    }

    laskeHakuKentta() {
        this.hakuKentta.down();
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

    getDirty() {
        return this.#dirty;
    }

    setDirty(likapostia) {
        this.#dirty = likapostia;
    }

    setHenkiloData(henkilot) {
        this.#henkiloData = henkilot;
    }

    setSuhdeData(suhteet) {
        this.#suhdeData = suhteet;
    }

    /*
     
     
     
    Komponenttikuuntelijat (joiden pakko käyttää 'that':tiä)
    --------------------------------------------------------
     
    */

    poistaSolmut(_event) {
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

    avaaMuokkaus(_event) {
        const valitut = cy.nodes(":selected"); // katsotaan vain solmuja, ei kaaria!
        if (valitut.length !== 1) {
            return;
        }

        if (that.muokkaaHenkiloa.isUp() || that.muokkaaSuhdetta.isUp()) {
            that.muokkaaHenkiloa.down();
            that.muokkaaSuhdetta.down();
            return;
        }

        const valittu = valitut[0];
        const itse = valittu.scratch()._itse;
        if (itse.henkilo) {
            that.muokkaaHenkiloa.up(itse.henkilo);
            that.muokkaaSuhdetta.down();
        } else {
            that.muokkaaSuhdetta.up(itse.suhde);
            that.muokkaaHenkiloa.down();
        }
    }

    muokkaaHenkilonTietoja(event) {
        const valitut = cy.nodes(":selected"); // katsotaan vain solmuja, ei kaaria!
        if (valitut.length != 1) {
            return;
        }

        const arvo = event.currentTarget.value;
        const kentta = event.currentTarget.name;
        if (kentta === "etun") {
            // mitä tässä nyt voisi edes tehdä...?
        }
        else if (kentta === "sukun") {
            // mitä tässä nyt voisi edes tehdä...?
        }
    }

    muokkaaSuhteenTietoja(event) {
        const valitut = cy.nodes(":selected"); // katsotaan vain solmuja, ei kaaria!
        if (valitut.length != 1) {
            return;
        }

        const currentTarget = event.currentTarget.value;
        alert(currentTarget);
    }

    tallennaTaiKumoaMuokkaus(event) {
        event.preventDefault();
        let hyvaksymisTeksti = "";
        const kentta = event.currentTarget.name;

        if (kentta === "tallennaHenkilo") {
            console.log("Tallennetaan muutokset henkilön tietoihin...");
            that.tallennaMuutokset();
            synkronoiMuutokset();
            hyvaksymisTeksti = "hyvaksyttiin";
            console.log("Tallennettu onnistuneesti.");
        }
        else if (kentta === "kumoaHenkilo") {
            hyvaksymisTeksti = "kumottiin";
            console.log("Muutoksia henkilön tietoihin ei tallennettu (painettu 'kumoaHenkilo').");
        }

        // lopuksi suljetaan muokkaus painettiin kumpaa tahansa
        if (that.muokkaaHenkiloa.isUp() || that.muokkaaSuhdetta.isUp()) {
            that.muokkaaHenkiloa.down(hyvaksymisTeksti);
            that.muokkaaSuhdetta.down(hyvaksymisTeksti);
        }
    }

    tallennaMuutokset() {
        const valittu = cy.nodes(":selected");
        const henkiloForm = that.muokkaaHenkiloa;
        const suhdeForm = that.muokkaaSuhdetta;
        if (henkiloForm.isUp()) {
            const henkilo = valittu.scratch()._itse.henkilo;
            const etunimi = henkiloForm.etunimetKentta.underlyingElement.value;
            const sukunimi = henkiloForm.sukuNimetKentta.underlyingElement.value;

            henkilo.etunimet = etunimi;
            henkilo.sukunimet = sukunimi;

            valittu.json({
                data: {
                    label: `${henkilo.etunimet}\n${henkilo.sukunimet}`  // tämä sallii monirivisen tekstin
                },
            });

        }
        else if (suhdeForm.isUp()) {
            const suhde = valittu.scratch()._itse.suhde;
        }
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

}

export { Cykupuu, cy };
