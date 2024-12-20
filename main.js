import * as THREE from "three";

// ------------------- Configuração Inicial -------------------
const canvas = document.querySelector("#c");
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas,
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0xaaaaaa, 0.1); // Cor cinza claro e densidade inicial

// ------------------- Configuração da Câmera -------------------
const fov = 45;
const aspect = 2;
const near = 0.1;
const far = 100;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(10, 10, 10);
camera.lookAt(0, 10, 0);

// ------------------- Iluminação -------------------
const ambientLight = new THREE.HemisphereLight(0x444444, 0x000000, 0.5);
scene.add(ambientLight);

const cameraLight = new THREE.PointLight(0xffffff, 0.8, 50);
scene.add(cameraLight);

// ------------------- Texturas e Materiais -------------------
const loader = new THREE.TextureLoader();

// Textura do chão
const groundTexture = loader.load("resources/grass.png");
groundTexture.wrapS = THREE.RepeatWrapping;
groundTexture.wrapT = THREE.RepeatWrapping;

const groundMaterial = new THREE.MeshPhongMaterial({ map: groundTexture });

// Textura do céu
const backgroundTexture = loader.load("resources/sky.png");
backgroundTexture.mapping = THREE.EquirectangularReflectionMapping;
scene.background = backgroundTexture;

// Textura da parede
const stoneTexture = loader.load("resources/stone_wall_04_diff_4k.jpg");
stoneTexture.wrapS = THREE.RepeatWrapping;
stoneTexture.wrapT = THREE.RepeatWrapping;
stoneTexture.repeat.set(10, 1);

const stoneBumpMap = loader.load("resources/stone_wall_04_disp_4k.png");
stoneBumpMap.wrapS = THREE.RepeatWrapping;
stoneBumpMap.wrapT = THREE.RepeatWrapping;
stoneBumpMap.repeat.set(10, 1);

const wallMaterial = new THREE.MeshPhongMaterial({
  map: stoneTexture,
  bumpMap: stoneBumpMap,
  bumpScale: 10,
});

// Textura dos espetos
const spikeTexture = loader.load("resources/metal.jpg");
const spikeMaterial = new THREE.MeshStandardMaterial({
  map: spikeTexture,
  metalness: 0.8,
  roughness: 0.2,
});

// ------------------- Criação dos Elementos da Cena -------------------
// Chão
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
groundMesh.rotation.x = -Math.PI / 2;
scene.add(groundMesh);

// Paredes
const wallHeight = 3;
const wallThickness = 0.8;
const wallLength = 30;

const createWall = (geometry, position) => {
  const wall = new THREE.Mesh(geometry, wallMaterial);
  wall.position.set(...position);
  scene.add(wall);
  return wall;
};

// Criar paredes
const leftWall = createWall(
  new THREE.BoxGeometry(wallThickness, wallHeight, wallLength),
  [-wallLength / 2, wallHeight / 2, 0]
);

const rightWall = createWall(
  new THREE.BoxGeometry(wallThickness, wallHeight, wallLength),
  [wallLength / 2, wallHeight / 2, 0]
);

const backWall = createWall(
  new THREE.BoxGeometry(wallLength, wallHeight, wallThickness),
  [0, wallHeight / 2, -wallLength / 2]
);

const frontWall = createWall(
  new THREE.BoxGeometry(wallLength / 3, wallHeight, wallThickness),
  [-wallLength / 3, wallHeight / 2, wallLength / 2]
);

const frontWall2 = createWall(
  new THREE.BoxGeometry(wallLength / 3, wallHeight, wallThickness),
  [wallLength / 3, wallHeight / 2, wallLength / 2]
);

// Espetos
const addSpikes = (wall, numSpikes, spikeHeight, spikeRadius, direction) => {
  for (let i = 0; i < numSpikes; i++) {
    const spikeGeometry = new THREE.ConeGeometry(spikeRadius, spikeHeight, 4);
    const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);

    if (direction === "horizontal") {
      spike.position.x =
        wall.position.x +
        (i - numSpikes / 2) * (wall.geometry.parameters.width / numSpikes);
      spike.position.z = wall.position.z;
    } else {
      spike.position.z =
        wall.position.z +
        (i - numSpikes / 2) * (wall.geometry.parameters.depth / numSpikes);
      spike.position.x = wall.position.x;
    }

    spike.position.y =
      wall.position.y + wall.geometry.parameters.height / 2 + spikeHeight / 2;

    scene.add(spike);
  }
};

// Adicionar espetos nas paredes
const spikeHeight = 1;
const spikeRadius = 0.2;
addSpikes(backWall, 15, spikeHeight, spikeRadius, "horizontal");
addSpikes(frontWall, 5, spikeHeight, spikeRadius, "horizontal");
addSpikes(frontWall2, 5, spikeHeight, spikeRadius, "horizontal");
addSpikes(leftWall, 15, spikeHeight, spikeRadius, "vertical");
addSpikes(rightWall, 15, spikeHeight, spikeRadius, "vertical");

// ------------------- Controle de Teclado -------------------
const keys = {};
const moveSpeed = 0.2;
const rotationSpeed = 0.02;

window.addEventListener("keydown", (event) => {
  keys[event.key] = true;
});

window.addEventListener("keyup", (event) => {
  keys[event.key] = false;
});

// ------------------- Funções Auxiliares -------------------
const resizeRendererToDisplaySize = (renderer) => {
  const canvas = renderer.domElement;
  const pixelRatio = window.devicePixelRatio;
  const width = Math.floor(canvas.clientWidth * pixelRatio);
  const height = Math.floor(canvas.clientHeight * pixelRatio);
  const needResize = canvas.width !== width || canvas.height !== height;

  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
};

// ------------------- Loop de Renderização -------------------
const render = (time) => {
  time *= 0.001;

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  if (keys.q) camera.position.y += moveSpeed;
  if (keys.e) camera.position.y -= moveSpeed;
  if (keys.a) camera.rotation.y += rotationSpeed;
  if (keys.d) camera.rotation.y -= rotationSpeed;

  const direction = new THREE.Vector3();
  camera.getWorldDirection(direction);

  if (keys.w) camera.position.add(direction.clone().multiplyScalar(moveSpeed));
  if (keys.s) camera.position.add(direction.clone().multiplyScalar(-moveSpeed));

  camera.rotation.order = "YXZ";

  if (keys.ArrowUp) {
    camera.rotation.x += rotationSpeed;
  }
  if (keys.ArrowDown) {
    camera.rotation.x -= rotationSpeed;
  }

  cameraLight.position.copy(camera.position);

  renderer.render(scene, camera);
  requestAnimationFrame(render);
};

// ------------------- Eventos de Redimensionamento -------------------
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

requestAnimationFrame(render);
