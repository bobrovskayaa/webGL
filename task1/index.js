var gl; // глобальная переменная для контекста WebGL
// вершинный шейдер (положение и форма вершин)

const vsSource = `
attribute vec4 aVertexPosition;
attribute vec4 aVertexColor;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying lowp vec4 vColor;

void main(void) {
  gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
  vColor = aVertexColor;
}
`;

// фрагментный шейдер (цвет) пока квадрата
const fsSource = `
  varying lowp vec4 vColor;

  void main() {
    gl_FragColor = vColor;
  }
`;

main();

function main() {
  const canvas = document.querySelector("#glCanvas");
  // инициализация контекста GL
  const gl = canvas.getContext("webgl");

  // продолжать только если WebGL доступен и работает
  if (!gl) {
    console.log("Unable to initialize WebGL. Your browser or machine may not support it.");
    return;
  }

  // установить в качестве цвета очистки буфера цвета черный, полная непрозрачность
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // очистить буфер цвета
  gl.clear(gl.COLOR_BUFFER_BIT);


  const shaderProgram = initShaders(gl, vsSource, fsSource);
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
    },
  };

  const buffers = initBuffers(gl);
  drawScene(gl, programInfo, buffers);
}

// загружает шейдеры и встраивает в html
function initShaders(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // создать шейдерную программу
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // Если создать шейдерную программу не удалось, вывести предупреждение
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.log('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

// создаем шейдер нужного типа и подгружаем
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // проверяем тип шейдера
  gl.shaderSource(shader, source);

  // скомпилировать шейдерную программу
  gl.compileShader(shader);

  // Проверить успешное завершение компиляции
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.log('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}
