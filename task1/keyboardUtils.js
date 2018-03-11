let distCamera = -10.0;

document.addEventListener('keydown', event => {
  switch (event.key) {
    case 'ArrowUp': 
      ++distCamera;
      break;
    case 'ArrowDown':
      --distCamera;
      break;
    case '=':
      number += 10;
      buffers = initBuffers(gl);
      break;
    case '-':
      buffers = initBuffers(gl);
      number -= 10;
      break;
  }
})