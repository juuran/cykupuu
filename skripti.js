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

function luoLayout() {
    return cy.layout({
        name: 'breadthfirst',

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

function luoPerhe() {
    return [
        // nodet eli solmut (päätellään sisällöstä)
        // { data: { id: 'jussi' } },
        // { data: { id: 'raili' } },
        // { data: { id: 'alkuperhe' } },
        { data: { id: 'juuso', weight: 1 } },
        { data: { id: 'vilma', weight: 1 } },
        { data: { id: 'perhe', weight: 1 } },
        { data: { id: 'sulo', weight: 1 } },
        { data: { id: 'oole', weight: 1 } },
        { data: { id: 'julius', weight: 1 } },
        { data: { id: 'miiki', weight: 1 } },
        // edget eli kaaret
        // { data: { id: 'railiAlkuperhe', source: 'raili', target: 'alkuperhe' } },
        // { data: { id: 'jussiAlkuperhe', source: 'jussi', target: 'alkuperhe' } },
        // { data: { id: 'alkuperheJuuso', source: 'alkuperhe', target: 'juuso' } },
        { data: { id: 'juusoPerhe', source: 'juuso', target: 'perhe' }, classes: 'round-taxi' },
        { data: { id: 'vilmaPerhe', source: 'vilma', target: 'perhe' }, classes: 'round-taxi' },
        { data: { id: 'perheSulo', source: 'perhe', target: 'sulo' }, classes: 'round-taxi' },
        { data: { id: 'perheOole', source: 'perhe', target: 'oole' }, classes: 'round-taxi' },
        { data: { id: 'perheJulius', source: 'perhe', target: 'julius' }, classes: 'round-taxi' },
        { data: { id: 'perheMiiki', source: 'perhe', target: 'miiki' }, classes: 'round-taxi' }
    ];
}

function luoKokeiluData() {
    return [
        // nodet eli solmut (päätellään sisällöstä)
        { data: { id: 'jarmo', weight: 2 } },
        { data: { id: 'osmo', weight: 2 } },
        { data: { id: 'parisuhde', weight: 2 } },

        { data: { id: 'harmo', weight: 3 } },
        { data: { id: 'tarmo', weight: 3 } },
        { data: { id: 'armo', weight: 3 } },
        { data: { id: 'arwo', weight: 3 } },
        { data: { id: 'monikkosuhde', weight: 3 } },

        // edget eli kaaret
        { data: { id: 'jarmoParisuhde', source: 'jarmo', target: 'parisuhde' }, classes: 'round-taxi' },
        { data: { id: 'osmoParisuhde', source: 'osmo', target: 'parisuhde' }, classes: 'round-taxi' },

        { data: { id: 'hMonikkosuhde', source: 'harmo', target: 'monikkosuhde' }, classes: 'round-taxi' },
        { data: { id: 'tMonikkosuhde', source: 'tarmo', target: 'monikkosuhde' }, classes: 'round-taxi' },
        { data: { id: 'aMonikkosuhde', source: 'armo', target: 'monikkosuhde' }, classes: 'round-taxi' },
        { data: { id: 'wMonikkosuhde', source: 'arwo', target: 'monikkosuhde' }, classes: 'round-taxi' }
    ];
}

window.onload = () => {
    cy.add(luoPerhe());
    cy.add(luoKokeiluData());
    let breadthfirstLayout = luoLayout();
    breadthfirstLayout.run();
}
