import cytoscape from './cytoscape.umd.js';
import { cy } from '../cykupuu.js';

function createCytoscape() {
    return cytoscape({  // tämän nimeäminen pienellä poikkeus, joka tuo ilmi säännön
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
        wheelSensitivity: 0.5,  // aiemmin 0.75
        minZoom: 0.05,
        maxZoom: 4
    });
}

function createLayout(nimi) {
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
        depthSort: function (a, b) { return a.data('weight') - b.data('weight'); }, // a sorting function to order nodes at equal depth. e.g. function(a, b){ return a.data('weight') - b.data('weight') }
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

export { createCytoscape, createLayout };