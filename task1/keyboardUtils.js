let distCamera = -10.0;

document.addEventListener('keydown', event => {
  console.log(event);
  switch (event.key) {
    case 'ArrowUp': 
      ++distCamera;
      break;
    case 'ArrowDown':
      --distCamera;
      break;
  }
})