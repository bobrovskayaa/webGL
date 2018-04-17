let distCamera = -15.0;
let number = 100; // степень детализации
let mouseX = 0;
let mouseY = 0;

const actions = {
    'ArrowUp': () => {
        ++distCamera
    },
    'ArrowDown': () => {
        --distCamera
    },
    '=': () => {
        if (number < 260) {
            console.log(number);
            number += 10;
            buffers = initBuffers(gl, programInfo);
        }
    },
    '-': () => {
        if (number > 20) {
            console.log(number);
            number -= 10;
            buffers = initBuffers(gl, programInfo);
        }
    }
};

document.addEventListener('keydown', event => {
    actions[event.key]();
});

window.addEventListener("mousemove", e => {
    mouseX += e.movementX / 40;
    mouseY += e.movementY / 40;
});