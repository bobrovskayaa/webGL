let gl; // глобальная переменная для контекста WebGL
let buffers;

// вершинный шейдер (положение и форма вершин)
const vsSource = `
attribute vec4 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec4 aVertexColor;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uNormalMatrix;

varying lowp vec4 vColor;
varying highp vec3 vLighting;

void main(void) {
  gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
  vColor = aVertexColor;
  
  highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
  highp vec3 directionalLightColor = vec3(0, 1, 1);
  highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));
  highp vec3 directionalLightColor2 = vec3(1, 0, 1);
  highp vec3 directionalVector2 = normalize(vec3(-0.3, 0.3, 0.6));

  highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

  highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
  highp float directional2 = max(dot(transformedNormal.xyz, directionalVector2), 0.0);
  vLighting = ambientLight + (directionalLightColor * directional) + (directionalLightColor2 * directional2);
}
`;

// фрагментный шейдер (цвет) пока квадрата
const fsSource = `
  varying lowp vec4 vColor;
  varying highp vec3 vLighting;

  void main() {
    gl_FragColor = vColor;

    gl_FragColor = vec4(vColor.rgb * vLighting, vColor.a);
  }
`;

window.onload = main;

function main() {
  const canvas = document.querySelector("#glCanvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // инициализация контекста GL
  gl = canvas.getContext("webgl");

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
      vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
    },
  };

  buffers = initBuffers(gl);
  
  let then = 0;
  
    // Draw the scene repeatedly
    function render(now) {
      now *= 0.001;  // convert to seconds
      const deltaTime = now - then;
      then = now;
  
      drawScene(gl, programInfo, buffers, deltaTime);
  
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
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
