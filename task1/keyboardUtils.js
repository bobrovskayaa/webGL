let distCamera = -10.0;

document.addEventListener('keydown', event => {
  switch (event.key) {
    case 'ArrowUp': 
      ++distCamera;
      break;
    case 'ArrowDown':
      --distCamera;
      break;
  }
})