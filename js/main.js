import { SineGenerator, Sampler, Quantizer, ReconstructionFilter , Evaluate } from './Block.js'
import { Wire, connectionNodes, WireManager, Encoder, Decoder } from './Block.js';
import { drawSourceWave } from './sourceWaveGraph.js';
import { drawSampledWave } from './sampledWaveGraph.js';
import { drawEncodedWave, getQuantizationLevels } from './encodedWaveGraph.js';
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


const questions = {
    1: {
        "question": "Arrange the sequence of operations performed in transmitter part of a PCM system",
        "options": [
            "Decoder, Sampler, Quantizer",
            "Quantizer, Filter, Sampler",
            "Encoder, quantizer, Sampler",
            "Sampler, Quantizer, Encoder"
        ],
        "answer": "Sampler, Quantizer, Encoder"
    },
    2: {
        "question": "What is the transmission bandwidth of n- bit PCM for the message bandwidth of “w” Hz?",
        "options": [
            "BT=4nw",
            "BT=nw/2",
            "BT=2nw",
            "BT=nw"
        ],
        "answer": "BT=nw"
    },
    3: {
        "question": "Define PCM",
        "options": [
            "Each message sample is converted into n-bit binary.",
            "Each message sample is converted into analog.",
            "Each message sample is converted into discrete.",
            "Each message sample is converted into sinewave."
        ],
        "answer": "Each message sample is converted into n-bit binary."
    },
    4: {
        "question": "Calculate the signal to quantization noise ratio in dB for a 10-bit PCM system.",
        "options": [
            "23.8 dB",
            "61.8 dB",
            "72.6 dB",
            "56.3 dB"
        ],
        "answer": "61.8 dB"
    },
    5: {
        "question": "Obtain the codeword length ofa sample which is quantized into one of 16 levels in PCM.",
        "options": [
            "5",
            "4",
            "3",
            "7"
        ],
        "answer": "4"
    }
};

function generateQuizQuestions() {
    let quizBody = document.getElementById("quizBody");
    for (const [qnno, qobj] of Object.entries(questions)) {
        let question_div = document.createElement("div");

        let question = document.createElement("h5");
        question.innerHTML = qnno + ') ' + qobj.question;

        question_div.appendChild(question);

        qobj.options.forEach((option) => {
            let b = document.createElement("input");

            b.type = "radio"
            b.name = 'qn'+qnno;
            b.value = option;
            b.style = "margin-left: 25px";
            let  c = document.createElement("label");
            c.for = qnno;
            c.innerText = option;
            c.style = "margin-left: 10px";
            question_div.appendChild(b);
            question_div.appendChild(c);

            question_div.appendChild(document.createElement("br"));
        });
        question_div.appendChild(document.createElement("br"));
        quizBody.append(question_div);
    }
}

function validateQuiz() {
    console.log('Validate Quiz');
    const num_questions = Object.entries(questions).length;
    const questionMap = new Map(Object.entries(questions));
    console.log(questionMap);
    for (let i = 1; i <= num_questions; i++) {
        const name = 'qn' + i;
        const elements = document.getElementsByName(name);
        let checked = false;
        elements.forEach((element) => {
            if (element.checked)
                checked = true;
        });
        if (!checked) {
            alert('Answer all questions');
            return ;
        }
    }
    const labels = document.getElementsByTagName('label');
    console.log('Labels: ', labels);

    for (let i = 1; i <= num_questions; i++) {
        const name = 'qn' + i;
        const elements = document.getElementsByName(name);

        let ans = '';
        elements.forEach((element) => {
            if (element.checked) {
                ans = element.value;
            }
        });
        const correct_ans = questionMap.get(`${i}`).answer;
        labels.forEach((label) => {
            if (label.for !== `${i}`)
                return ;
            if (label.innerText === correct_ans) {
                label.style = 'color: green; margin-left: 10px';
            } else if (label.innerText === ans && ans !== correct_ans) {
                label.style = 'color: red; margin-left: 10px';
            }
        });
    }
}

function showQuizes() {
    $('#quizModal').modal('show');
    generateQuizQuestions();
}

document.getElementById('submitbtn').onclick = validateQuiz;

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
            console.log('1');
        } else if (modalName === '#sampledWaveGraph') {
            drawSampledWave();
            console.log('6');
        } else if (modalName === '#decoderWaveGraph') {
            drawDecoderWave();
            console.log('5');
        }else if (modalName === '#reconWaveGraph') {
            drawReconWave();
            console.log('4');
        } else if (modalName === '#quantizerOutput') {
            drawQuantizedWave();
            console.log('3');
        } else if (modalName === '#encodedWaveGraph') {
            drawEncodedWave();
            console.log('2');
        } else if (modalName === '#exampleModal') {
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
            totalConnection --;
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

                    if (isCircuitComplete()) {
                        showQuizes();
                    }
                    console.log('Total Connection: ', totalConnection);
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