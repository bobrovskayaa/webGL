let distCamera = -15.0;
let number = 250; // степень детализации
let mouseX = 0;
let mouseY = 0;

document.addEventListener('keydown', event => {
  switch (event.key) {
    case 'ArrowUp': 
      ++distCamera;
      break;
    case 'ArrowDown':
      --distCamera;
      break;
    case '=':
      if (number < 500) {
        console.log(number);
          number += 10;
          buffers = initBuffers(gl);
      }
      break;
    case '-':
      if (number > 20) {
        buffers = initBuffers(gl);
        number -= 10;
        break;
      }
  }
});

window.addEventListener("mousemove", e => {
  mouseX += e.movementX / 40;
  mouseY += e.movementY / 40;
});