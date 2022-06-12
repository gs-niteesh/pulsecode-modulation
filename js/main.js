import { SineGenerator, Sampler, Quantizer, ReconstructionFilter , Evaluate } from './Block.js'
import { Wire, connectionNodes, WireManager, Encoder, Decoder } from './Block.js';
import { drawSourceWave } from './sourceWaveGraph.js';
import { drawSampledWave } from './sampledWaveGraph.js';
import { drawEncodedWave, getQuantizationLevels } from './encodedWaveGraph.js';
import { Line } from './Line.js';
import { drawDecoderWave } from './decoderWaveGraph.js';
import { drawReconWave } from "./reconWaveGraph.js";
import { drawQuantizedWave } from "./quantizerWaveGraph.js";
import { setupModal } from './graph.js';

let myblocks = new Map();
let currentModal = null;

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    myblocks.forEach((block) => {
        block.update_pos();
    });
}


const validConnections = [
    'sgo+sai',
    'sao+qai',
    'qao+eni',
    'eno+dci',
    'dco+rfi',
    'rfo+evi'
];

function validConnection(c1, c2) {
    const connection1 = c1 + '+' + c2;
    const connection2 = c2 + '+' + c1;
    if (validConnections.includes(connection1) || validConnections.includes(connection2)) {
        return true;
    }
    return false;
}


let totalConnection = 0;

function isCircuitComplete() {
    return totalConnection >= 6;
}

function setup_modulation() {
    myblocks.set('generator', new SineGenerator(240-79, 112.5, 200, 100));
    myblocks.set('sampler', new Sampler(646.6-79, 112.5, 200, 100));
    myblocks.set('quantizer', new Quantizer(1053.32-79, 112.5, 220, 100));
    myblocks.set('encoder', new Encoder(1460-79, 112.5, 220, 100));
}

function setup_demodulation() {
    myblocks.set('decoder', new Decoder(450-200, 587.6-170, 200, 100));
    myblocks.set('reconstructionfilter', new ReconstructionFilter(950-200, 587.6-170, 200, 100));
    myblocks.set('evaluate', new Evaluate(1250, 587.6-170, 200, 100));
}

function openModal(obj, dblClick = false) {
    // On double click first a single click event is triggered and then the double click event
    // Return if already showing a modal and a single click was performed
    if (currentModal && !dblClick) {
        return ;
    }

    if (currentModal && dblClick) {
        $(`${currentModal}`).modal('hide');
        currentModal = null;
    }

    let _modalName = dblClick ? obj.doubleClickModal() : obj.singleClickModal();
    if (!_modalName) {
        return ;
    }
    const modalName = `#${_modalName}`;
    console.log('This is modal to be showd: ', modalName);
    if (!isCircuitComplete()) {
        alert('Complete all the connections');
        return ;
    }

    $(modalName).modal('show');
    $(modalName).on('shown.bs.modal', function () {
        if (modalName === '#sourceWaveGraph') {
            drawSourceWave();
        } else if (modalName === '#sampledWaveGraph') {
            drawSampledWave();
        } else if (modalName === '#decoderWaveGraph') {
            drawDecoderWave();
        }else if (modalName === '#reconWaveGraph') {
            drawReconWave();
        } else if (modalName === '#quantizerOutput') {
            const binLength = getQuantizationLevels();
            drawQuantizedWave();
        } else if (modalName === '#encodedWaveGraph') {
            drawEncodedWave();
        } else if (modalName === '#evaluateOutput') {
            console.log('Drawing eval otput');
            setupModal();
        }
    });
    currentModal = modalName;

    $(`${modalName}`).on('hidden.bs.modal', function () {
        currentModal = null;
    })
}

function doubleClicked() {
    myblocks.forEach((val, key) => {
        if (val.mouseOver()) {
            openModal(val, true);
        }
    });
}

let wireManager = new WireManager();
let currentStartNode = null;
let currentSelected = null;


function keyPressed() {
    if (keyCode === DELETE) {
        if (currentSelected) {
            console.log('removing ', currentSelected);
            wireManager.remove(currentSelected);
            currentSelected = null;
        }
        components = [];
        if (currentStartNode) currentStartNode = null;
    }
    if (keyCode === ENTER) {
        console.log(components);
        console.log(wireManager);
    }
}

let components = [];

function mouseClicked() {
    let anySelected = false;
    if (currentSelected instanceof Wire) currentSelected.selected = false;
    connectionNodes.forEach((node) => {
        if (node.didClick()) {
            if (!currentStartNode) {
                currentStartNode = node;
                console.log('current start node: ', currentStartNode);
                components.push(currentStartNode);
            }
            else {
                components.push(node);
                console.log(components);
                console.log('adding wire from: ', currentStartNode, ' to ', node);
                const n = components.length;
                if (validConnection(components[0].name, components[n - 1].name)) {
                    totalConnection ++;
                    wireManager.addWire(components);
                } else {
                    alert("Invalid Connection. Please check your connections");
                }
                currentStartNode = null;
                components = [];
            }
            anySelected = true;
        }
    });
    wireManager.wires.forEach((wire) => {
        if (wire.didClick()) {
            console.log('clicked on wire ', wire);
            currentSelected = wire;
            wire.selected = true;
            anySelected = true;
        }
    })
    if (!anySelected && currentStartNode) {
        const v = createVector(mouseX, mouseY)
        // line(currentStartNode.x, currentStartNode.y, v.x, v.y);
        components.push(v);
        currentStartNode = v;
    }

    if (!anySelected) { currentSelected = null; console.log('setting curretnSelcted to ', currentSelected); }
}

export function draw() {
    clear();

    myblocks.forEach((val, key) => {
        const highlight = val.mouseOver() && !currentModal;
        val.draw(highlight);
    });

    wireManager.draw();

    if (components)
        new Wire(components).draw();

    if (currentStartNode)
        line(currentStartNode.x, currentStartNode.y, mouseX, mouseY);
}

export function setup() {
    createCanvas(windowWidth, windowHeight);

    setup_modulation();
    setup_demodulation();
}

/** @type {Window} */
window.setup = setup;
window.draw = draw;
window.windowResized = windowResized;
window.onclick = mouseClicked;
window.doubleClicked = doubleClicked;
window.onkeydown = keyPressed;