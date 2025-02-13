/*
Pakolliset initiaatiot yms
--------------------------
*/

"use strict";

var cy = cytoscape({
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
                'background-color': 'red'
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
        }
    ],

    layout: {
        name: 'grid',
        rows: 1
    },

    // options
    zoom: 1,
    wheelSensitivity: 0.5,
    minZoom: 0.05,
    maxZoom: 4
});

/*


Muuttujat ja data
-----------------
*/

var previouslyRemoved = [];  // säilötään, että voidaan undo'ata!

const henkilodata = [
    { nimi: "hlö0" },  // Tässä esimerkissä nyt nimi on yksilöivä kuin id
    { nimi: "hlö1" },
    { nimi: "hlö2" },
    { nimi: "hlö3" },
    { nimi: "hlö4" },
    { nimi: "hlö5" },
    { nimi: "hlö6" },
    { nimi: "hlö7" },
    { nimi: "hlö8" },
    { nimi: "hlö9" },
    { nimi: "hlö10" },
    { nimi: "hlö11" },
    { nimi: "hlö12" },
    { nimi: "hlö13" },
    { nimi: "hlö14" },
    { nimi: "hlö15" },
    { nimi: "hlö16" },
    { nimi: "hlö17" },
    { nimi: "hlö18" }
];
const suhdeData = [
    {   // yksi olio on yksittäinen suhde
        suhdeId: 100, suhdetyyppi: "parisuhde",
        osalliset: [henkilodata[0], henkilodata[1]],
        lapset: [henkilodata[2], henkilodata[3]]
    },
    {
        suhdeId: 101, suhdetyyppi: "parisuhde",
        osalliset: [henkilodata[4], henkilodata[5]],
        lapset: [henkilodata[6], henkilodata[7], henkilodata[8],]
    },
    {
        suhdeId: 102, suhdetyyppi: "eronnut",
        osalliset: [henkilodata[9], henkilodata[10]],
        lapset: [henkilodata[11]]
    },
    {
        suhdeId: 103, suhdetyyppi: "härdelli",
        osalliset: [henkilodata[12], henkilodata[13], henkilodata[14], henkilodata[15]],
        lapset: [henkilodata[16]]
    },
    {
        suhdeId: 104, suhdetyyppi: "avopari",
        osalliset: [henkilodata[17], henkilodata[18]],
        lapset: null
    },
];

/*


Funktiot
--------
*/

function init() {
    let breadthfirstLeiska = luoLeiska("breadthfirst");
    breadthfirstLeiska.run();

    document.addEventListener("keydown", nappaimienKuuntelija);
    document.getElementById("randoButton").addEventListener("click", nappiKuuntelija);
    document.getElementById("järjestäButton").addEventListener("click", nappiKuuntelija);
}

function nappaimienKuuntelija(event) {
    if (event.code === "Delete") {
        const nodet = cy.nodes(":selected");
        previouslyRemoved.push(cy.remove(nodet));  // käyttää jquery-mäisiä selectoreita (mutta ei itse jqueryä - riippuvuukseton)
        return;
    }
    if (event.code === "Backspace") {
        let edget = cy.edges(":selected");
        previouslyRemoved.push(cy.remove(edget));  // bäckspeissillä saa poistaa vain kaaria
        return;
    }

    if (event.code === "KeyZ" && event.ctrlKey) {
        if (previouslyRemoved.length === 0) {
            return;
        }
        previouslyRemoved.pop().restore();
    }
}

function nappiKuuntelija(event) {
    if (event.currentTarget.id === "randoButton") {
        luoLeiska("random").run();
    }

    if (event.currentTarget.id === "järjestäButton") {
        luoLeiska("breadthfirst").run();
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
        animate: false, // whether to transition the node positions
        animationDuration: 500, // duration of animation in ms if enabled
        animationEasing: undefined, // easing of animation if enabled,
        animateFilter: function (node, i) { return true; }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
        ready: undefined, // callback on layoutready
        stop: undefined, // callback on layoutstop
        transform: function (node, position) { return position; }, // transform a given node position. Useful for changing flow direction in discrete layouts
    });
}

function luoSukupuunHenkiloData(henkilot) {
    let henks = [];

    // luo solmut henkilöille
    for (const henkilo of henkilot) {
        henks.push({
            data: {
                id: henkilo.nimi
            }
        });
    }

    return henks;
}

function luoSukupuunSuhdeData(suhteet) {
    let suhts = [];

    for (const suhde of suhteet) {
        // luo solmut suhteille
        let tempSuhdeId = suhde.suhdetyyppi + " (" + suhde.suhdeId + ")"
        suhts.push({
            data: {
                id: tempSuhdeId
            }
        });

        // luo kaaret suhteen aikuisista suhdetyyppiin
        for (const osallinen of suhde.osalliset) {
            suhts.push({
                data: {
                    id: osallinen.nimi + tempSuhdeId,  // ei näy missään
                    source: osallinen.nimi,
                    target: tempSuhdeId
                }, classes: 'round-taxi'
            });
        }

        if (suhde.lapset == null) {
            continue;
        }

        // luo kaaret suhdetyyppistä lapsiin
        for (const lapsi of suhde.lapset) {
            suhts.push({
                data: {
                    id: tempSuhdeId + lapsi.nimi,  // ei näy missään
                    source: tempSuhdeId,
                    target: lapsi.nimi
                }, classes: 'round-taxi'
            });
        }
    }

    return suhts;
}


/*
 
 
Ohjelman suoritus, aka "main"
-----------------------------
*/

window.onload = async () => {
    init();
    cy.add(luoSukupuunHenkiloData(henkilodata));
    cy.add(luoSukupuunSuhdeData(suhdeData));

    let breadthfirstLeiska = luoLeiska("breadthfirst");
    breadthfirstLeiska.run();
}
