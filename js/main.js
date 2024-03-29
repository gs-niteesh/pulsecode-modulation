import { SineGenerator, Sampler, OneBitQuantizer, PredictionFilter } from './Block.js'
import { Encoder, Decoder, ReconstructionFilter } from './Block.js';
import { Adder } from './Adder.js';
import { Line } from './Line.js';

let myblocks = new Map();

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    myblocks.forEach((block) => {
        block.update_pos();
    });
}

function setup_modulation() {
    myblocks.set('generator', new SineGenerator(150, 200, 200, 100));
    myblocks.set('sampler', new Sampler(550, 200, 200, 100));
    myblocks.set('quantizer', new OneBitQuantizer(950, 200, 220, 100));
    myblocks.set('encoder', new Encoder(1460, 200, 220, 100));

    /* FIXME: Find a new way to make the elements responsive to resize */
    // myblocks.set('adder1', new Adder(15, (val) => {
    //     const sampler = myblocks.get('sampler');
    //     const quantizer = myblocks.get('quantizer');
    //     val.cx = sampler.cx + 0.65 * (quantizer.cx - sampler.cx);
    //     val.cy = sampler.cy + sampler.ch / 2;
    // }));

    myblocks.set('line0', new Line((val) => {
        const generator = myblocks.get('generator');
        const sampler = myblocks.get('sampler');

        val.x1 = generator.cx + generator.cw;
        val.y1 = generator.cy + generator.ch / 2;
        val.x2 = sampler.cx;
        val.y2 = sampler.cy + sampler.ch / 2;
    }, 0, 'x(t)'));

    myblocks.set('line1', new Line((val) => {
        const sampler = myblocks.get('sampler');
        const quantizer = myblocks.get('quantizer');

        val.x1 = sampler.cx + sampler.cw;
        val.y1 = sampler.cy + sampler.ch / 2;
        val.x2 = quantizer.cx;
        val.y2 = quantizer.cy + quantizer.ch / 2;
    }, 0, 'x(nTs)'));

    // myblocks.set('line2', new Line((val) => {
    //     const sampler = myblocks.get('sampler');
    //     const quantizer = myblocks.get('quantizer');
    //     const adder = myblocks.get('adder1');

    //     val.x1 = adder.cx + adder.cr;
    //     val.y1 = sampler.cy + sampler.ch / 2;
    //     val.x2 = quantizer.cx;
    //     val.y2 = quantizer.cy + quantizer.ch / 2;
    // }, 0, 'e(nTs)'));

    // myblocks.set('line3', new Line((val) => {
    //     const sampler = myblocks.get('sampler');
    //     const quantizer = myblocks.get('quantizer');
    //     const filter = myblocks.get('prediction filter');

    //     val.x1 = sampler.cx + 0.65 * (quantizer.cx - sampler.cx);
    //     val.y1 = filter.cy + filter.ch / 2;
    //     val.x2 = val.x1;
    //     val.y2 = quantizer.cy + quantizer.ch / 2 + myblocks.get('adder1').cr;
    // }, 90));

    // myblocks.set('line4', new Line((val) => {
    //     const filter = myblocks.get('prediction filter');
    //     const adder = myblocks.get('adder1');

    //     val.x1 = filter.cx;
    //     val.x2 = adder.cx;
    //     val.y1 = filter.cy + filter.ch / 2;
    //     val.y2 = val.y1;
    // }, null, 'xq((n - 1)Ts)'));

    myblocks.set('line5', new Line((val) => {
        const sampler = myblocks.get('sampler');
        const quantizer = myblocks.get('quantizer');
        const encoder = myblocks.get('encoder');

        val.x1 = quantizer.cx + quantizer.cw;
        val.y1 = sampler.cy + sampler.ch / 2;
        val.x2 = encoder.cx;
        val.y2 = quantizer.cy + quantizer.ch / 2;
    }, 0, 'xq(nts)'));

    myblocks.set('outputline', new Line((val) => {
        const encoder = myblocks.get('encoder');

        val.x1 = encoder.cx + encoder.cw;
        val.y1 = encoder.cy + encoder.ch / 2;
        val.x2 = val.x1 + 0.7 * (windowWidth - val.x1);
        val.y2 = val.y1;
    }, 0, 'binary'));
    // myblocks.set('line6', new Line((val) => {
    //     const quantizer = myblocks.get('quantizer');
    //     // const adder = myblocks.get('adder2');

    //     val.x1 = adder.cx;
    //     val.y1 = quantizer.cy + quantizer.ch / 2;
    //     val.x2 = adder.cx;
    //     val.y2 = adder.cy - adder.cr;
    // }, 270));

    // myblocks.set('line7', new Line((val) => {
    //     const filter = myblocks.get('prediction filter');
    //     const adder = myblocks.get('adder2');

    //     val.x1 = adder.cx;
    //     val.y1 = adder.cy + adder.cr;
    //     val.x2 = adder.cx;
    //     val.y2 = filter.cy + filter.ch / 2;
    // }));

    // myblocks.set('line8', new Line((val) => {
    //     const filter = myblocks.get('prediction filter');
    //     const adder = myblocks.get('adder2');

    //     val.x1 = adder.cx;
    //     val.y1 = filter.cy + filter.ch / 2;
    //     val.x2 = filter.cx + filter.cw;
    //     val.y2 = filter.cy + filter.ch / 2;
    // }, 180, 'xq(nTs)'));

    // myblocks.set('line9', new Line((val) => {
    //     const adder1 = myblocks.get('adder1');
    //     const adder2 = myblocks.get('adder2');

    //     val.x1 = adder1.cx;
    //     val.y1 = adder2.cy;
    //     val.x2 = adder2.cx - adder2.cr;
    //     val.y2 = adder2.cy;
    // }, 0));
}

function setup_demodulation() {
    myblocks.set('decoder', new Decoder(650, 287.6, 200, 100));
    myblocks.set('reconstructionfilter', new ReconstructionFilter(1050, 287.6, 250, 100));

    myblocks.set('line1', new Line((val) => {
        const decoder = myblocks.get('decoder');
        val.x1 = decoder.cx * 0.6;
        val.y1 = decoder.cy + (decoder.ch / 2);
        val.x2 = decoder.cx;
        val.y2 = decoder.cy + (decoder.ch / 2);
    }, 0, 'Encoder Output'));

    myblocks.set('line2', new Line((val) => {
        const decoder = myblocks.get('decoder');
        const filter = myblocks.get('reconstructionfilter');
        val.x1 = decoder.cx + (filter.cx - decoder.cx) * 0.5;
        val.y1 = decoder.cy + (decoder.ch / 2);
        val.x2 = filter.cx;
        val.y2 = decoder.cy + (decoder.ch / 2);
        console.log(val);
    }, 0, 'Decoded output'));

    myblocks.set('line3', new Line((val) => {
        const filter = myblocks.get('reconstructionfilter');
        val.x1 = filter.cx + filter.cw;
        val.y1 = filter.cy + (filter.ch / 2);
        val.x2 = windowWidth * 0.8;
        val.y2 = val.y1;
        console.log(val);
    }, 0, 'Reconstructed Message Signal'));
}


// Get DOM Elements
const modal = document.getElementById('my-modal');
const closeBtn = document.querySelector('.close');

let currentModal = null;

// Events
closeBtn.addEventListener('onclick', () => {
    console.log('close modal');
    modal.style.display = 'none';
});

export function draw() {
    clear();

    myblocks.forEach((val, key) => {
        val.draw();
    });
}

function singleClicked(event) {
    console.log(mouseX, mouseY);
}

function doubleClicked() {
    console.log('double');
    if (currentModal) {
        currentModal.style.display = 'none';
        currentModal = null;
    }
}

let numClicks = 0;
let singleClickTimer;
const handleClick = (event) => {
    console.log(event);
    numClicks++;
    if (numClicks === 1) {
        singleClickTimer = setTimeout(() => {
            numClicks = 0;
            singleClicked();
        }, 250);
    } else if (numClicks === 2) {
        clearTimeout(singleClickTimer);
        numClicks = 0;
        doubleClicked();
    }
};


function mousePressed(e) {
    let clicked = false;
    myblocks.forEach((val) => {
        if (val.clicked(mouseX, mouseY)) {
            clicked = true;
            modal.style.display = 'block';
            currentModal = modal;
        }
    });
}

export function setup() {
    createCanvas(windowWidth, windowHeight);

    setup_demodulation();
    // setup_modulation();
}

window.setup = setup;
window.draw = draw;
window.windowResized = windowResized;
window.onclick = singleClicked;
window.ondblclick = doubleClicked;

// document.addEventListener("click", handleClick);