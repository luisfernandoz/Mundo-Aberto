import * as THREE from "three";

//---------------- Criando a cena ----------------------------------
const scene = new THREE.Scene();

// Criando a câmera de perspectiva
const fov = 45;
const aspect = 2;
const near = 0.1;
const far = 100;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(10, 10, 10);
camera.lookAt(0, 10, 0);

// Criando o renderer
const canvas = document.querySelector("#c");
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas,
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Adicionando uma textura para o chão
const loader = new THREE.TextureLoader();
const groundTexture = loader.load("resources/grass.png");
groundTexture.wrapS = THREE.RepeatWrapping;
groundTexture.wrapT = THREE.RepeatWrapping;

const groundMaterial = new THREE.MeshPhongMaterial({ map: groundTexture });
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
groundMesh.rotation.x = -Math.PI / 2;
scene.add(groundMesh);

// Adicionando uma textura para o céu
const backgroundTexture = loader.load("resources/sky.png");
backgroundTexture.mapping = THREE.EquirectangularReflectionMapping;
scene.background = backgroundTexture;

// Adicionando luz ambiente
const light = new THREE.AmbientLight(0xffffff);
scene.add(light);

// Criando os cubos
const geometry = new THREE.BoxGeometry(1, 1, 1);

function makeInstance(geometry, color, x) {
  const material = new THREE.MeshToonMaterial({ color });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
  cube.position.set(x, 2, 0);
  return cube;
}

const cubes = [
  makeInstance(geometry, 0x44aa88, 0),
  makeInstance(geometry, 0x8844aa, -2),
  makeInstance(geometry, 0xaa8844, 2),
];

// Adicionando névoa
scene.fog = new THREE.Fog(0x000000, 10, 15);

// Variáveis para controle do teclado
const keys = {
  q: false, // Subir
  e: false, // Descer
  a: false, // Rotacionar para a esquerda
  d: false, // Rotacionar para a direita
  w: false, // Mover para frente
  s: false, // Mover para trás
  ArrowUp: false, // Olhar para cima
  ArrowDown: false, // Olhar para baixo
};

// Sensibilidade de movimento
const moveSpeed = 0.2; // Velocidade de movimento vertical e frente/trás
const rotationSpeed = 0.02; // Velocidade de rotação horizontal e vertical

// Eventos de pressionar tecla
window.addEventListener("keydown", (event) => {
  if (keys.hasOwnProperty(event.key)) keys[event.key] = true;
});

window.addEventListener("keyup", (event) => {
  if (keys.hasOwnProperty(event.key)) keys[event.key] = false;
});

// Função para redimensionar o renderer
function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const pixelRatio = window.devicePixelRatio;
  const width = Math.floor(canvas.clientWidth * pixelRatio);
  const height = Math.floor(canvas.clientHeight * pixelRatio);
  const needResize = canvas.width !== width || canvas.height !== height;

  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

// Função de renderização
function render(time) {
  time *= 0.001;

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  // Atualizar posição e rotação da câmera com base nas teclas pressionadas
  if (keys.q) camera.position.y += moveSpeed; // Subir
  if (keys.e) camera.position.y -= moveSpeed; // Descer
  if (keys.a) camera.rotation.y += rotationSpeed; // Girar para a esquerda
  if (keys.d) camera.rotation.y -= rotationSpeed; // Girar para a direita

  // Controle da câmera em relação à direção atual
  const pitchAxis = new THREE.Vector3(1, 0, 0); // Eixo para pitch (subir/descer)
  camera.rotation.order = "YXZ"; // Ordem correta para pitch e yaw

  if (keys.ArrowUp) {
    camera.rotation.x += rotationSpeed; // Girar para cima
  }
  if (keys.ArrowDown) {
    camera.rotation.x -= rotationSpeed; // Girar para baixo
  }

  // Movimento para frente e para trás
  const direction = new THREE.Vector3();
  camera.getWorldDirection(direction);

  if (keys.w) {
    camera.position.add(direction.clone().multiplyScalar(moveSpeed)); // Frente
  }
  if (keys.s) {
    camera.position.add(direction.clone().multiplyScalar(-moveSpeed)); // Trás
  }

  cubes.forEach((cube, ndx) => {
    const speed = 1 + ndx * 0.1;
    const rot = time * speed;
    cube.rotation.x = rot;
    cube.rotation.y = rot;
  });

  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

requestAnimationFrame(render);
