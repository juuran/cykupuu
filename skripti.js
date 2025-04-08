"use strict";

/*



Muuttujat ja data
-----------------

*/

var cy = cytoscape({  // tämän nimeäminen pienellä poikkeus, joka tuo ilmi säännön
    container: document.getElementById('cy'), // container to render in
    elements: [],

    style: [ // the stylesheet for the graph
        {
            selector: 'node',
            style: {
                'background-color': '#666',
                'label': 'data(id)'
            }
        },
        {
            selector: ':selected',
            style: {
                'color': 'maroon',
                'background-color': 'red',
                'width': '36px',
                'height': '36px'
            }
        },
        {
            selector: 'edge',
            style: {
                'width': 3,
                'line-color': '#ccc',
                'target-arrow-color': '#ccc',
                'target-arrow-shape': 'triangle',
                'curve-style': 'bezier'
            }
        },
        {
            selector: 'edge.round-taxi',
            style: {
                'curve-style': 'round-taxi',
                'taxi-direction': 'downward',
                'taxi-turn': 20,
                'taxi-turn-min-distance': 5,
                'taxi-radius': 10
            }
        },
        {
            "selector": "node[label]",
            "style": {
                "label": "data(label)"
            }
        },
        {
            "selector": ".multiline-manual",
            "style": {
                "text-wrap": "wrap"
            }
        }
    ],

    // options
    wheelSensitivity: 0.75,
    minZoom: 0.05,
    maxZoom: 4
});

const NAYTON_LEVEYS = 1200;
const NO_OF_GROUPS = 3;
const SIVU_MARGIN = 100;
const SUHTEEN_MARGIN = 50;
var UNSAFE_GLOBAL_SYVIN_SYVYYS = -1;
var PREVIOUSLY_REMOVED = [];  // säilötään, että voidaan undo'ata!
var STATUSBAR;
var SUHTEITA_PER_SYVYYS = new Map();
var PATHS_FOR_VISUALISING = [];

class Henkilo {
    constructor(nimi, vanhempiSuhteet, lapsiSuhteet, syvyys) {
        this.nimi = nimi;
        this.vanhempiSuhteet = vanhempiSuhteet;
        this.lapsiSuhteet = lapsiSuhteet;
        this.syvyys = syvyys;
    }
    toString() {
        return `[ Nimi: ${this.nimi}. VanhempiSuhteet: (${this.vanhempiSuhteet}). Lapsisuhteet: (${this.lapsiSuhteet}). (s=${this.syvyys}) ]`;
    }
}

const henkilodata = [
    new Henkilo("hlö0", [], [], 1),      // 0    (Tässä esimerkissä nyt nimi on yksilöivä kuin id)
    new Henkilo("hlö1", [], [], 1),      // 1
    new Henkilo("hlö2", [], [], 3),      // 2
    new Henkilo("hlö3", [], [], 3),      // 3
    new Henkilo("hlö4", [], [], 3),      // 4
    new Henkilo("hlö5", [], [], 3),      // 5
    new Henkilo("hlö6", [], [], 3),      // 6
    new Henkilo("hlö7", [], [], 5),      // 7
    new Henkilo("hlö8", [], [], 5),      // 8
    new Henkilo("hlö9", [], [], 1),      // 9
    new Henkilo("hlö10", [], [], 1),     // 10
    new Henkilo("hlö11", [], [], 5),     // 11
    new Henkilo("hlö12", [], [], 7),     // 12
    new Henkilo("hlö13", [], [], 7),     // 13
    new Henkilo("hlö14", [], [], 7),     // 14
    new Henkilo("hlö15", [], [], 7),     // 15
    new Henkilo("hlö16", [], [], 3),     // 16
    new Henkilo("hlö17", [], [], 5),     // 17
    new Henkilo("hlö18", [], [], 5),     // 18
    new Henkilo("hlö19", [], [], 5),     // 19
    new Henkilo("hlö20", [], [], 1),     // 20
    new Henkilo("hlö21", [], [], 1),     // 21
    new Henkilo("hlö22", [], [], 3),     // 22
    new Henkilo("hlö23", [], [], 3),     // 23
];

class Suhde {
    constructor(suhdeId, suhdetyyppi, yhdessä, vanhemmat, lapset, ryhmä) {
        this.suhdeId = suhdeId;
        this.suhdetyyppi = suhdetyyppi;
        this.yhdessä = yhdessä;
        this.vanhemmat = vanhemmat;
        this.lapset = lapset;
        this.ryhmä = ryhmä;
    }
    toString() {
        let vanhTeksti = "{";
        for (const vanhempi of this.vanhemmat) {
            vanhTeksti = vanhTeksti + " " + vanhempi.nimi + "; ";
        }
        vanhTeksti = vanhTeksti + "}";
        let lapsTeksti = "{ ";
        for (const lapsi of this.lapset) {
            lapsTeksti = lapsTeksti + " " + lapsi.nimi + "; ";
        }
        lapsTeksti = lapsTeksti + "}";

        return `${vanhTeksti} --> ${lapsTeksti}`;
    }
}

const suhdeData = [
    // yksi olio on yksittäinen suhde - suhdetyypit: "avoliitto", "avioliitto", "eronnut", "monisuhde"
    new Suhde(
        100, "avioliitto", true,
        [henkilodata[0], henkilodata[1]],
        [henkilodata[2], henkilodata[3], henkilodata[4], henkilodata[5]], 1),
    new Suhde(
        101, "avioliitto (eronnut)", false,
        [henkilodata[5], henkilodata[6]],
        [henkilodata[7], henkilodata[8]], 1),
    new Suhde(
        102, "avioliitto", true,
        [henkilodata[9], henkilodata[10]],
        [henkilodata[6]], 2),
    new Suhde(
        103, "avoliitto", true,
        [henkilodata[7], henkilodata[11]],
        [henkilodata[12], henkilodata[13], henkilodata[14], henkilodata[15]], 1),
    new Suhde(
        104, "avioliitto", true,
        [henkilodata[6], henkilodata[16]],
        [henkilodata[17], henkilodata[18], henkilodata[19]], 2),
    new Suhde(
        105, "avioliitto", true,
        [henkilodata[20], henkilodata[21]],
        [henkilodata[16], henkilodata[22], henkilodata[23]], 3)
];
henkilodata[0].vanhempiSuhteet.push(null); /*               */ henkilodata[0].lapsiSuhteet.push(suhdeData[0]);
henkilodata[1].vanhempiSuhteet.push(null); /*               */ henkilodata[1].lapsiSuhteet.push(suhdeData[0]);
henkilodata[2].vanhempiSuhteet.push(suhdeData[0]);
henkilodata[3].vanhempiSuhteet.push(suhdeData[0]);
henkilodata[4].vanhempiSuhteet.push(suhdeData[0]);
henkilodata[5].vanhempiSuhteet.push(suhdeData[0]); /*       */ henkilodata[5].lapsiSuhteet.push(suhdeData[1]);
henkilodata[6].vanhempiSuhteet.push(suhdeData[2]); /*       */ henkilodata[6].lapsiSuhteet.push(suhdeData[1], suhdeData[4]);
henkilodata[7].vanhempiSuhteet.push(suhdeData[1]); /*       */ henkilodata[7].lapsiSuhteet.push(suhdeData[3]);
henkilodata[8].vanhempiSuhteet.push(suhdeData[1]);
henkilodata[9].vanhempiSuhteet.push(null); /*               */ henkilodata[9].lapsiSuhteet.push(suhdeData[2]);
henkilodata[10].vanhempiSuhteet.push(null); /*              */ henkilodata[10].lapsiSuhteet.push(suhdeData[2]);
henkilodata[11].vanhempiSuhteet.push(null); /*              */ henkilodata[11].lapsiSuhteet.push(suhdeData[3]);
henkilodata[12].vanhempiSuhteet.push(suhdeData[3]);
henkilodata[13].vanhempiSuhteet.push(suhdeData[3]);
henkilodata[14].vanhempiSuhteet.push(suhdeData[3]);
henkilodata[15].vanhempiSuhteet.push(suhdeData[3]);
henkilodata[16].vanhempiSuhteet.push(suhdeData[5]); /*      */ henkilodata[16].lapsiSuhteet.push(suhdeData[4]);
henkilodata[17].vanhempiSuhteet.push(suhdeData[4]);
henkilodata[18].vanhempiSuhteet.push(suhdeData[4]);
henkilodata[19].vanhempiSuhteet.push(suhdeData[4]);
henkilodata[20].vanhempiSuhteet.push(null); /*              */ henkilodata[20].lapsiSuhteet.push(suhdeData[5]);
henkilodata[21].vanhempiSuhteet.push(null); /*              */ henkilodata[21].lapsiSuhteet.push(suhdeData[5]);
henkilodata[22].vanhempiSuhteet.push(suhdeData[5]);
henkilodata[23].vanhempiSuhteet.push(suhdeData[5]);

/*



Apufunktiot (alustukset, kuuntelijat jne)
-----------------------------------------

*/

function init() {
    UNSAFE_GLOBAL_SYVIN_SYVYYS = -1;  // että varmasti lasketaan uudestaan joka kerta kun kutsutaan init()
    STATUSBAR = document.getElementById("statusbar");
    let breadthfirstLeiska = luoLeiska("preset");
    breadthfirstLeiska.run();

    document.addEventListener("keydown", nappaimienKuuntelija);
    document.getElementById("randoButton").addEventListener("click", nappiKuuntelija);
    document.getElementById("järjestäButton").addEventListener("click", nappiKuuntelija);
    document.getElementById("omaJärjestysButton").addEventListener("click", nappiKuuntelija);
    document.addEventListener('mouseup', async () => {
        await sleep(0.01);
        valitsimenKuuntelija();
    });
    document.addEventListener('touchend', async () => {
        await sleep(0.15);
        valitsimenKuuntelija();
    });
}

function nappaimienKuuntelija(event) {
    if (event.code === "Delete") {
        const nodet = cy.nodes(":selected");
        PREVIOUSLY_REMOVED.push(cy.remove(nodet));  // käyttää jquery-mäisiä selectoreita (mutta ei itse jqueryä - riippuvuukseton)
        return;
    }
    if (event.code === "Backspace") {
        let edget = cy.edges(":selected");
        PREVIOUSLY_REMOVED.push(cy.remove(edget));  // bäckspeissillä saa poistaa vain kaaria
        return;
    }

    if (event.code === "KeyZ" && event.ctrlKey) {
        if (PREVIOUSLY_REMOVED.length === 0) {
            return;
        }
        PREVIOUSLY_REMOVED.pop().restore();
    }

    if (event.code === "KeyA") {
        STATUSBAR.textContent = 'Painettu näppäintä "A" (all): valitse kaikki solmut.';
        cy.elements().select();
    }

    if (event.code === "KeyR") {
        selectRoots();
    }

    if (event.code === "KeyL") {
        STATUSBAR.textContent = 'Painettu näppäintä "L" (leaves): valitse lehdet.';
        cy.nodes().leaves().select();
    }

    if (event.code === "KeyK") {
        valitseLapset();
    }

    if (event.code === "KeyP") {
        valitseVanhemmat();
    }

    if (event.code === "KeyJ") {
        juusoSearch();
    }

    if (event.code === "KeyH") {
        asetaGraafinPositiot(cy.elements());
    }
}

function nappiKuuntelija(event) {
    if (event.currentTarget.id === "randoButton") {
        luoLeiska("random").run();
    }

    if (event.currentTarget.id === "järjestäButton") {
        luoLeiska("breadthfirst").run();
    }

    if (event.currentTarget.id === "omaJärjestysButton") {
        cy.remove(cy.elements(""));
        main();
    }
}

function valitsimenKuuntelija(event) {
    let valitut = cy.nodes(":selected");
    if (valitut.length === 1) {
        // DEBUG LOG valituille, voipi olla että turha
        console.log(`solmu "${valitut.id()}" valittu: ${valitut.scratch()._itse.toString()}`);
        const tiedot = valitut[0].scratch()._itse.toString();
        STATUSBAR.textContent = tiedot;
    }
    else if (valitut.length > 1) {
        STATUSBAR.textContent = "Valitse vain yksi solmu näyttääksesi tietoja.";
    } else {
        STATUSBAR.textContent = "Valitse solmu näyttääksesi tietoja.";
    }
}

/**
 * Jos tarvitsee nukkua tässä suorituksen aikana. Muista käyttää "await" avainsanan kanssa, esim. "await sleep(2);"
 * @param {*} secs Uniaika annettuna sekunteina
 */
function sleep(secs) {
    return new Promise(r => setTimeout(r, secs * 1000));
}

function luoLeiska(nimi) {
    return cy.layout({
        name: nimi,

        fit: true, // whether to fit the viewport to the graph
        directed: true, // whether the tree is directed downwards (or edges can point in any direction if false)
        padding: 10, // padding on fit
        circle: false, // put depths in concentric circles if true, put depths top down if false
        grid: false, // whether to create an even grid into which the DAG is placed (circle:false only)
        spacingFactor: 1.5, // positive spacing factor, larger => more space between nodes (N.B. n/a if causes overlap)
        boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
        avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
        nodeDimensionsIncludeLabels: false, // Excludes the label when calculating node bounding boxes for the layout algorithm
        roots: undefined, // the roots of the trees
        depthSort: function (a, b) { return a.data('weight') - b.data('weight') }, // a sorting function to order nodes at equal depth. e.g. function(a, b){ return a.data('weight') - b.data('weight') }
        animate: true, // whether to transition the node positions
        animationDuration: 500, // duration of animation in ms if enabled
        animationEasing: undefined, // easing of animation if enabled,
        animateFilter: function (node, i) { return true; }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
        ready: undefined, // callback on layoutready
        stop: undefined, // callback on layoutstop
        transform: function (node, position) { return position; }, // transform a given node position. Useful for changing flow direction in discrete layouts
        zoom: 1,
    });
}

async function animoiPolut() {
    for (const polku of PATHS_FOR_VISUALISING) {
        let speed = 0.01;
        cy.nodes().unselect();
        for (const askel of polku) {
            askel.select();
            speed = speed * 0.25;
            await sleep(speed);
        }
        await sleep(0.1);
    }
}

function isNumber(value) {
    return typeof value === 'number';
}

/*



Funktiot (business-logiikka, "tärkeät funktiot" tms)
----------------------------------------------------

*/

function luoSukupuunHenkiloData(henkilot) {
    let henks = [];

    // luo solmut henkilöille
    for (const henkilo of henkilot) {
        let ryhmäni = haeHenkilonRyhmä(henkilo);

        henks.push({
            group: 'nodes',
            data: {
                id: henkilo.nimi,
                weight: ryhmäni,
                label: `${henkilo.nimi}`  // tämä sallii monirivisen tekstin
            },
            classes: 'multiline-manual',
            scratch: {
                _itse: {
                    henkilo: henkilo,
                    toString: () => henkilo.toString()
                }
            }
        });
    }

    return henks;
}

function luoSukupuunSuhdeData(suhteet) {
    let suhts = [];

    for (const suhde of suhteet) {
        // luo solmut suhteille
        let tempSuhdeId = suhde.suhdetyyppi + " (" + suhde.suhdeId + ")";

        suhts.push({
            group: 'nodes',
            data: {
                id: tempSuhdeId,
                weight: suhde.ryhmä
            },
            scratch: {
                _itse: {
                    suhde: suhde,
                    toString: () => suhde.toString() + `(r=${suhde.ryhmä})`,
                }
            }
        });

        // luo kaaret suhteen aikuisista suhdetyyppiin
        for (const osallinen of suhde.vanhemmat) {
            suhts.push({
                group: 'edges',
                data: {
                    id: osallinen.nimi + tempSuhdeId,  // ei näy missään
                    source: osallinen.nimi,
                    target: tempSuhdeId
                },
                classes: 'round-taxi'
            });
        }

        if (suhde.lapset == null) {
            continue;
        }

        // luo kaaret suhdetyyppistä lapsiin
        for (const lapsi of suhde.lapset) {
            suhts.push({
                group: 'edges',
                data: {
                    id: tempSuhdeId + lapsi.nimi,  // ei näy missään
                    source: tempSuhdeId,
                    target: lapsi.nimi
                },
                classes: 'round-taxi'
            });
        }
    }

    return suhts;
}

function asetaGraafinPositiot(solmut) {
    let suhteenLapsistaPiirretty = new Map();   // montako suhteen lapsista piirretty, esim. ({key: suhde1, value: 3}, {key: suhde2, value: 1})
    let suhteenAikuisistaPiirretty = new Map();  // sama periaate, mutta juurisolmuille (koska heillä ei ole vanhempia, mutta on lapset, muutoin ei olisi heitä ollut tarpeen sukupuuhun lisäilläkään... saati edes mahdollista)

    for (const solmu of solmut) {

        if (solmu.scratch()._itse.henkilo != null) {  // piirretään henkilo-solmut

            const henkilo = solmu.scratch()._itse.henkilo;

            const pystyPiste = henkilo.syvyys * 100;
            let vaakaPiste;
            const vanhempiSuhde = henkilo.vanhempiSuhteet[0];
            let monesko;
            if (vanhempiSuhde != null) {
                // jos henkilöllä on vanhemmat, kuvio selkeä: hän on niin mones piirrettävä kuin mitä sisaruksista on piirretty
                const vanhempiSuhdeId = vanhempiSuhde.suhdeId;

                if (suhteenLapsistaPiirretty.has(vanhempiSuhdeId)) {
                    monesko = suhteenLapsistaPiirretty.get(vanhempiSuhdeId);  // monesko indeksoidaan 0:sta lähtien (piirtoteknisistä syistä)
                    suhteenLapsistaPiirretty.set(vanhempiSuhdeId, monesko + 1);
                }
                else {
                    monesko = 0;
                    suhteenLapsistaPiirretty.set(vanhempiSuhdeId, 1);
                }
            }
            else {
                // jos ei vanhempia (juurisolmu), piirretään ensisijaisesti yhdessä olevan suhteen mukaan tai sitten ensimmäisen suhteen
                let lapsiSuhdeId = null;
                for (const lapsiSuhde of henkilo.lapsiSuhteet) {
                    if (lapsiSuhde.yhdessä) {
                        lapsiSuhdeId = lapsiSuhde.suhdeId;
                        break;
                    }
                }
                if (lapsiSuhdeId === null) {
                    lapsiSuhdeId = henkilo.lapsiSuhteet[0].suhdeId;  // (jos ei löydy, valitaan 1. lapsisuhde piirtämisjärjestyksen perusteeksi)
                }

                if (suhteenAikuisistaPiirretty.has(lapsiSuhdeId)) {
                    monesko = suhteenAikuisistaPiirretty.get(lapsiSuhdeId);
                    suhteenAikuisistaPiirretty.set(lapsiSuhdeId, monesko + 1);
                }
                else {
                    monesko = 0;
                    suhteenAikuisistaPiirretty.set(lapsiSuhdeId, 1);
                }
            }

            let monesta;
            if (vanhempiSuhde != null) {
                monesta = vanhempiSuhde.lapset.length;
            }
            else {
                for (const lapsiSuhde of henkilo.lapsiSuhteet) {
                    if (lapsiSuhde.yhdessä) {
                        monesta = lapsiSuhde.vanhemmat.length;
                    }
                }
            }

            let henkilönVaakaPiste;
            const randomLeveys = Math.floor(Math.random() * 17);
            try {
                const kerroin = monesko / (monesta + 1);  // monesko == min. 0, monesta == max. x-1 ettei piirretä yli oman alueen
                henkilönVaakaPiste = (kerroin * (NAYTON_LEVEYS / NO_OF_GROUPS));
                var ryhmänVaakaPiste = laskeRyhmänVaakaPiste(haeHenkilonRyhmä(henkilo));
                vaakaPiste = ryhmänVaakaPiste + henkilönVaakaPiste + randomLeveys;
            } catch (e) {
                vaakaPiste = ryhmänVaakaPiste + (monesko * 10);
            }

            // console.dir("solmun jeison ennen: " + JSON.stringify(solmu.json()));
            solmu.json({
                position: {
                    x: vaakaPiste + SIVU_MARGIN,
                    y: pystyPiste
                }
            });
            // console.dir("solmun jeison jälkeen: " + JSON.stringify(solmu.json()));

        } else if (solmu.scratch()._itse.suhde != null) {  // piirretään suhde-solmut

            const suhde = solmu.scratch()._itse.suhde;

            const pystyPiste = (suhde.vanhemmat[0].syvyys * 100) + SUHTEEN_MARGIN;
            const vaakaKeskiPiste = laskeRyhmänVaakaKeskiPiste(suhde.ryhmä);

            solmu.json({
                position: {
                    x: vaakaKeskiPiste + SIVU_MARGIN,
                    y: pystyPiste
                }
            });

        }
    }
}

function haeHenkilonRyhmä(henkilo) {
    if (henkilo.vanhempiSuhteet[0] != null) {
        return henkilo.vanhempiSuhteet[0].ryhmä;  // paras oletus hakea vanhemman ryhmä
    }

    const henkilonSyvyys = henkilo.syvyys;

    if (SUHTEITA_PER_SYVYYS.size < 1) {  // jos ei map tietoa, haetaan lapsien ryhmä  
        return henkilo.lapsiSuhteet[0].ryhmä;
    }

    // jos olemassa map, käytetään sitä
    if (henkilonSyvyys === 1) {  // juurisolmuille oma käsittely, jossa katsotaan lapsia sisältävä (s + 1) suhde
        let suhdeIdTaulukko = SUHTEITA_PER_SYVYYS.get(henkilonSyvyys + 1);
        for (const suhdeId of suhdeIdTaulukko) {
            if (suhdeId === henkilo.lapsiSuhteet[0].suhdeId) {
                const suhteenIndex = suhdeIdTaulukko.findIndex(e => e === suhdeId);
                return suhteenIndex + 1;
            }
        }
    }

    return SUHTEITA_PER_SYVYYS.get(henkilonSyvyys - 1).length + 1;  // jos ei vanhempaa, haetaan yllä olevien (s - 1) suhteiden määrä + 1    
}

function laskeRyhmänVaakaPiste(ryhmä) {
    return (NAYTON_LEVEYS / NO_OF_GROUPS) * (ryhmä - 1);
}

function laskeRyhmänVaakaKeskiPiste(ryhmä) {
    // TODO: Tee joskus tästä fiksumpi!
    return laskeRyhmänVaakaPiste(ryhmä) + ((NAYTON_LEVEYS / NO_OF_GROUPS) * 0.18);
}

function selectRoots() {
    let valitut = cy.nodes(":selected");
    if (valitut.length <= 1) {
        STATUSBAR.textContent = 'Painettu näppäintä "R" (roots): valitse juuret.';
        cy.nodes().roots().select();
        return;
    }

    STATUSBAR.textContent = 'Painettu näppäintä "R" (roots) kokoelmalle solmuja: valitaan juuret tälle joukolle.';
    valitut.unselect();
    valitut.roots().select();
}

function valitseLapset() {
    let valitut = cy.nodes(":selected");
    if (valitut.length === 0) {
        STATUSBAR.textContent = 'Painettu näppäintä "K" (kids): Lasten (ja lapsisuhteiden) valitseminen on mahdollista vain kun jokin solmu on valittuna!';
        return;
    }

    valitut.outgoers().select();
    STATUSBAR.textContent = 'Painettu näppäintä "K" (kids): valitaan lapset ja lapsisuhteet valitulle solmulle.';
}

function valitseVanhemmat() {
    let valitut = cy.nodes(":selected");
    if (valitut.length === 0) {
        STATUSBAR.textContent = 'Painettu näppäintä "P" (parents): Vanhempien (ja vanhempisuhteiden) valitseminen on mahdollista vain kun jokin solmu on valittuna!';
        return;
    }

    valitut.incomers().select();
    STATUSBAR.textContent = 'Painettu näppäintä "P" (parents): valitaan vanhemmat ja vanhempisuhteet valitulle solmulle.';
}

function getSyvinSyvyys() {
    if (UNSAFE_GLOBAL_SYVIN_SYVYYS === -1) {
        UNSAFE_GLOBAL_SYVIN_SYVYYS = etsiSyvinSyvyys();
    }
    return UNSAFE_GLOBAL_SYVIN_SYVYYS;
}

function etsiSyvinSyvyys() {
    let syvinSyvyys = -1;

    const results = cy.elements().depthFirstSearch({
        roots: cy.nodes().roots(),
        visit: function (v, e, u, i, depth) {
            let syvyys = depth + 1;

            if (syvyys > syvinSyvyys) {
                syvinSyvyys = syvyys;
            }
        },
        directed: true
    });

    if (syvinSyvyys === -1) {
        throw Error("Syvyyden hakeminen epäonnistui!");
    }

    return syvinSyvyys;
}

function asetaAutoritatiivisetJuuret() {
    for (const juuri of cy.nodes().roots()) {
        const results = cy.elements().depthFirstSearch({
            roots: juuri,
            visit: function (v, e, u, i, depth) {
                let syvyys = depth + 1;

                if (syvyys === getSyvinSyvyys()) {
                    juuri.scratch()._itse.henkilo.syvinSolmu = true;
                }
            },
            directed: true
        });
    }
}

async function juusoSearch() {
    STATUSBAR.textContent = 'Painettu näppäintä "J" (Juuso): juuso juuso';
    asetaAutoritatiivisetJuuret();
    const valitutJuuret = cy.nodes(":selected");
    if (valitutJuuret.length === 0) {
        STATUSBAR.textContent = 'Painettu näppäintä "J" (Juuso): Tyhjä valinta! Joku solmu tai joukko solmuja vaaditaan.';
        return;
    }

    PATHS_FOR_VISUALISING = [];
    for (const juuri of valitutJuuret) {
        määritäSyvyydetSolmustaAlavirtaan(juuri);
    }

    SUHTEITA_PER_SYVYYS = new Map();  // määritäLeveydetSolmustaAlavirtaan() käyttää tätä, joten tyhjätään ettei vanhaa dataa!
    for (const juuri of valitutJuuret) {
        määritäLeveydetSolmustaAlavirtaan(juuri);
    }

    animoiPolut();
}

function määritäSyvyydetSolmustaAlavirtaan(juuri, isDeepestVaikkeiOlisikaan, lisäSyvyys = 0) {
    cy.elements().breadthFirstSearch({
        roots: juuri,
        visit: function (v, e, u, i, depth) {  // v=nykyinen solmu,  u=edellinen solmu,  i=perus i
            PATHS_FOR_VISUALISING.push(v);
            let syvyys = depth + 1 + lisäSyvyys;

            if (syvyys % 2 === 0) {  // käsitellään suhde-solmut

                if (juuri.scratch()._itse.henkilo.syvinSolmu || isDeepestVaikkeiOlisikaan) {
                    // kun juuri on syvin, täytetään tieto suhteen todellisesta syvyydestä
                    v.scratch()._itse.suhde.todellinenSyvyys = syvyys;
                    return;
                }

                // kun juuri ei ole syvin, ei voida täyttää tietoa vaan levitettävä tieto suhteen vanhemmalle
                const todellinenSyvyys = v.scratch()._itse.suhde.todellinenSyvyys;
                if (isNumber(todellinenSyvyys)) {
                    korjaaSyvyydetYlävirtaan(u, todellinenSyvyys - 1);
                    // FIXME:  Bugi! Haku pitää pystyä lopettamaan tähän jollain tavalla!
                    //         Muussa tapauksessa palatessaan kutsusta levittää väärää tietoa.
                    // return true tai false saattaa toimia... dokumentaatio on tässä sekava!!!
                }

            }
            else {  // käsitellään henkilo solmut
                v.scratch()._itse.henkilo.syvyys = syvyys;
            }
        },
        directed: true
    });
}

function korjaaSyvyydetYlävirtaan(v, todellinenSyvyys) {  // v=nykyinen solmu, vaikka tultiinkin tänne u:na (edellinen solmu)
    PATHS_FOR_VISUALISING.push(v);
    v.scratch()._itse.henkilo.syvyys = todellinenSyvyys;

    const incomers = v.incomers().nodes();
    if (incomers == null || incomers.length === 0) {  // poistutaan, jos tällä ei ole suhdesolmua
        return;
    }

    const suhdeSolmu = incomers[0];  // vain ensimmäinen alkio järkevä, koska kaari tulee suhdesolmusta
    const suhdeSolmunSyvyys = todellinenSyvyys - 1;  // suhde-solmun korkeus nykyistä (v) korkeampi yhdellä
    suhdeSolmu.scratch()._itse.suhde.todellinenSyvyys = suhdeSolmunSyvyys;
    PATHS_FOR_VISUALISING.push(suhdeSolmu);

    for (const lapsi of suhdeSolmu.outgoers().nodes()) {
        if (lapsi === v) {
            continue;  // ei korjata itsestä alas: mentäisiin sinne, mistä on tultu!
        }

        määritäSyvyydetSolmustaAlavirtaan(lapsi, true, suhdeSolmunSyvyys);  // syvyys suhteen perusteella, koska syvyyteen lisätään aina 1 aloittaessa
    }

    const veenVanhemmat = suhdeSolmu.incomers().nodes();
    for (const veenVanhempi of veenVanhemmat) {
        korjaaSyvyydetYlävirtaan(veenVanhempi, suhdeSolmunSyvyys - 1);  // vanhempien korkeus on vielä yksi suhteesta ylöspäin
    }
}

/**
 * Tämän algoritmin pitää määrittää suhteen "leveys" eli ryhmä. Käytännössä se tehdään katsomalla onko samalla korkeudella jo muita suhdesolmuja ja määrittämällä oikea määrä sen perusteella.
 */
function määritäLeveydetSolmustaAlavirtaan(juuri) {
    // SUHTEITA_PER_SYVYYS (Map) tallentaa avaimena syvyyden ja arvona tulukon suhteita, esim.
    //      (   { key: 2, value: ["205", "605"]},   { key: 4, value: ["953", "200"]}   )
    cy.elements().breadthFirstSearch({
        roots: juuri,
        visit: function (v, e, u, i, depth) {
            // pathsForVisualising.push(v);
            let syvyys = depth + 1;

            // vain parilliset eli suhde-solmut kiinnostavia "leveyden" eli ryhmien näkökulmasta
            if (syvyys % 2 !== 0) {
                return;
            }

            const todellinenSyvyys = v.scratch()._itse.suhde.todellinenSyvyys;
            if (isNumber(todellinenSyvyys)) {
                syvyys = todellinenSyvyys;
            } else {
                console.log("Todellista syvyyttä ei voitu löytää!")
            }

            let suhdeId = v.scratch()._itse.suhde.suhdeId;

            if (SUHTEITA_PER_SYVYYS.get(syvyys) != null) {  // tässä syvyydessä jo käyty jos mapin taulukko sillä kohdalla jo olemassa
                var suhteetTaulukko = SUHTEITA_PER_SYVYYS.get(syvyys);
                let suhteenI = suhteetTaulukko.findIndex(e => e === suhdeId);
                if (suhteenI === -1) {
                    suhteetTaulukko.push(suhdeId);
                    var suhteenRyhmä = suhteetTaulukko.length;
                } else {
                    suhteenRyhmä = suhteenI + 1;  // aloitetaan ryhmittely ykkösestä
                }
            }
            else {
                SUHTEITA_PER_SYVYYS.set(syvyys, [suhdeId]);
                suhteenRyhmä = 1;
            }
            v.scratch()._itse.suhde.ryhmä = suhteenRyhmä;
            v.scratch()._itse.suhde.todellinenSyvyys = syvyys;
        },
        directed: true
    });
}

/*



Ohjelman suoritus, aka "main"
-----------------------------

*/

function main() {
    init();
    cy.add(luoSukupuunHenkiloData(henkilodata));
    cy.add(luoSukupuunSuhdeData(suhdeData));
    asetaGraafinPositiot(cy.nodes());
    cy.animate({ pan: { x: -50, y: -50 }, zoom: 1, duration: 300, easing: "ease-in-out" });
}

window.onload = async () => {
    main();
}
