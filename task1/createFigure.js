/*const faceColors = [
  [1.0,  1.0,  1.0,  1.0],    // Front face: white
  [1.0,  0.0,  0.0,  1.0]    // Back face: red
  [0.0,  1.0,  0.0,  1.0],    // Top face: green
  [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
  [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
  [1.0,  0.0,  1.0,  1.0],    // Left face: purple
];*/

var cubeRotation = 0.0;
const number = 100;
let verticesNumber = 0;

function initBuffers(gl) {
  const positionBuffer = gl.createBuffer();
  const colorBuffer = gl.createBuffer();
  const normalBuffer = gl.createBuffer();
  const indexBuffer = gl.createBuffer();

  const [positions, colors, normals] = calculatePositions();
  const indices = calculateIndices(positions);

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  return {
    position: positionBuffer,
    color: colorBuffer,
    normal: normalBuffer,
    indices: indexBuffer,
  };
}

function drawScene(gl, programInfo, buffers, deltaTime) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // угол обзора в 45°, с соотношением ширины к высоте равным 640/480 
  // объекты на расстоянии от 0.1 до 100 единиц от камеры

  const fieldOfView = 60 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;

  const projectionMatrix = mat4.create();

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.perspective(projectionMatrix,
                    fieldOfView,
                    aspect,
                    zNear,
                    zFar);

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  const modelViewMatrix = mat4.create();

  // устанавливаем позицию предмета от камеры на 6 единиц

  mat4.translate(modelViewMatrix,     // destination matrix
                  modelViewMatrix,     // matrix to translate
                  [-0.0, 0.0, distCamera]);  // amount to translate
  mat4.rotate(modelViewMatrix,  // destination matrix
              modelViewMatrix,  // matrix to rotate
              cubeRotation,     // amount to rotate in radians
              [0, 0, 1]);       // axis to rotate around (Z)
  mat4.rotate(modelViewMatrix,  // destination matrix
              modelViewMatrix,  // matrix to rotate
              cubeRotation * .7,// amount to rotate in radians
              [0, 1, 0]);       // axis to rotate around (X)

  const normalMatrix = mat4.create();
  mat4.invert(normalMatrix, modelViewMatrix);
  mat4.transpose(normalMatrix, normalMatrix);
  
  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute.
  {
    const numComponents = 3;  
    const type = gl.FLOAT;    // the data in the buffer is 32bit floats
    const normalize = false;  // don't normalize
    const stride = 0;         // how many bytes to get from one set of values to the next
                              // 0 = use type and numComponents above
    const offset = 0;         // how many bytes inside the buffer to start from
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition);
  }

  {
    const numComponents = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexColor,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexColor);
  }

  {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexNormal,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexNormal);
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

  // Tell WebGL to use our program when drawing

  gl.useProgram(programInfo.program);

  // Set the shader uniforms

  gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix);
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix);
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.normalMatrix,
    false,
    normalMatrix);

  // Since each face of our cube is comprised of two triangles, 
  // there are 6 vertices per side, or 36 total vertices in the cube
  {
    const vertexCount = verticesNumber;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }

  cubeRotation += deltaTime;
}

// calculate sphere

function calculatePositions() {
  const radius = 0.1;
  let points = [];
  let vertexColors = [];
  let vertexNormals = [];

  for  (let i = 0; i < number; ++i) {
    const u = i / (number - 1) * Math.PI;
    for (let j = 0; j < number; ++j) {
      const t = j / (number - 1) * 2 * Math.PI;
      const x = 16 * Math.pow(Math.sin(t), 3) * Math.sin(u);
      const y = (13 * Math.cos(t) - 5 * Math.cos(2*t)  - 2 * Math.cos(3*t) - Math.cos(4*t)) * Math.sin(u) ;
      const z = 6 * Math.cos(u);
      const normalz = 48 * Math.pow(Math.sin(t),2) * Math.cos(t) * 
        (13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t)) * Math.sin(u) * Math.cos(u) -
        16*Math.pow(Math.sin(t),3) * 
        (-13*Math.sin(t)+10*Math.sin(2*t)+6*Math.sin(3*t)+4*Math.sin(4*t)) * Math.sin(u) * Math.cos(u);
      const normalx = -6 * (-13*Math.sin(t)+10*Math.sin(2*t)+6*Math.sin(3*t)+4*Math.sin(4*t)) * Math.pow(Math.sin(u),2);
      const normaly = 288 * Math.pow(Math.sin(t),2) * Math.cos(t) * Math.pow(Math.sin(u),2);
      const denominator = Math.sqrt(Math.pow(normalx,2)+Math.pow(normaly,2)+Math.pow(normalz,2));


      points.push(radius * x, radius * y, radius * z);
      vertexNormals.push(normalx/denominator, normaly/denominator, normalz/denominator);
      vertexColors.push(normalx/denominator * 0.5 + 0.5, 
        normaly/denominator * 0.5 + 0.5,
        normalz/denominator * 0.5 + 0.5, 1.0);
      vertexColors.push(1.0, 1.0, 1.0, 1.0);
    }
  }

  return [ points, vertexColors, vertexNormals ];
}

function calculateIndices(positions) {
  let indices = [];
  for (let i = 0; i < positions.length/3 - number - 1; i++) {
    indices.push(i, i+1, i+number);
    indices.push(i+number+1, i+1, i+number);
  }
  verticesNumber = indices.length;
  return indices;
}