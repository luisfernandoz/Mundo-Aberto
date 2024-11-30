import * as THREE from "three";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

//---------------- Criando a cena ----------------------------------

const scene = new THREE.Scene();

//------------------------------------------------------------------

// Criando a câmera de perspectiva

const fov = 45;
const aspect = 2;
const near = 0.1;
const far = 100;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(10, 10, 10);
camera.lookAt(0, 10, 0);

//------------------------------------------------------------------

// Criando o renderer

const canvas = document.querySelector("#c");
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas,
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//------------------------------------------------------------------

// Adicionando uma textura para o chão

const loader = new THREE.TextureLoader();
const groundTexture = loader.load("resources/grass.png");

groundTexture.wrapS = THREE.RepeatWrapping;
groundTexture.wrapT = THREE.RepeatWrapping;
// groundTexture.repeat.set(10, 10); // Define repetições
groundTexture.magFilter = THREE.LinearFilter;

const groundMaterial = new THREE.MeshPhongMaterial({
  map: groundTexture,
});

const groundGeometry = new THREE.PlaneGeometry(100, 100); // Define o tamanho
const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
groundMesh.rotation.x = -Math.PI / 2; // Rotaciona para alinhar ao plano XY
scene.add(groundMesh);

// Adicionando uma textura para o céu

// Carregando uma única imagem como fundo
const backgroundTexture = loader.load("resources/sky.png");

// mapeamento da textura
backgroundTexture.mapping = THREE.EquirectangularReflectionMapping;

backgroundTexture.magFilter = THREE.LinearFilter; // Suaviza a ampliação
backgroundTexture.minFilter = THREE.LinearMipmapLinearFilter; // Melhora a redução
backgroundTexture.colorSpace = THREE.SRGBColorSpace;

// Adicionar o fundo ao cenário
scene.background = backgroundTexture;

// Adicionando luz ambiente
//------------------------------------------------------------------
const light = new THREE.AmbientLight(0xffffff); // Luz branca suave
scene.add(light);
//------------------------------------------------------------------

// Criando os cubos
//------------------------------------------------------------------
const geometry = new THREE.BoxGeometry(1, 1, 1);

function makeInstance(geometry, color, x) {
  const material = new THREE.MeshPhongMaterial({ color });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  cube.position.x = x;
  cube.position.y = 2;
  return cube;
}

const cubes = [
  makeInstance(geometry, 0x44aa88, 0),
  makeInstance(geometry, 0x8844aa, -2),
  makeInstance(geometry, 0xaa8844, 2),
];
//------------------------------------------------------------------

// Controle de teclado
//------------------------------------------------------------------
const keys = {};

document.addEventListener("keydown", (event) => {
  keys[event.key] = true;
});

document.addEventListener("keyup", (event) => {
  keys[event.key] = false;
});
//------------------------------------------------------------------

scene.fog = new THREE.Fog(0x000000, 10, 15);

//------------------------------------------------------------------

// Função para redimensionar o renderer
//------------------------------------------------------------------
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
//------------------------------------------------------------------

// Função de renderização
//------------------------------------------------------------------
function render(time) {
  time *= 0.001; // Converte tempo para segundos

  // Atualiza a posição da câmera com base nas teclas pressionadas
  // Atualiza a posição da câmera com base na direção para onde ela está olhando
  const moveSpeed = 0.1; // Velocidade de movimento
  const rotateSpeed = 0.02; // Velocidade de rotação

  // Vetores de direção
  const forward = new THREE.Vector3();
  const right = new THREE.Vector3();
  const up = new THREE.Vector3();

  // Calcula o vetor "para frente" com base na orientação da câmera
  camera.getWorldDirection(forward);

  // Calcula o vetor "para a direita" usando o cross product
  right.crossVectors(camera.up, forward).normalize();

  // Calcula o vetor "para cima" baseado no sistema de coordenadas local da câmera
  up.copy(camera.up).normalize();

  // Movimentos relativos
  if (keys["w"]) camera.position.add(forward.multiplyScalar(moveSpeed)); // Para frente
  if (keys["s"]) camera.position.add(forward.multiplyScalar(-moveSpeed)); // Para trás
  if (keys["a"]) camera.position.add(right.multiplyScalar(-moveSpeed)); // Para a esquerda
  if (keys["d"]) camera.position.add(right.multiplyScalar(moveSpeed)); // Para a direita
  if (keys["r"]) camera.position.add(up.multiplyScalar(moveSpeed)); // Para cima
  if (keys["f"]) camera.position.add(up.multiplyScalar(-moveSpeed)); // Para baixo

  // Rotaciona a câmera
  if (keys["ArrowUp"]) camera.rotation.x += rotateSpeed; // Rotaciona para cima
  if (keys["ArrowDown"]) camera.rotation.x -= rotateSpeed; // Rotaciona para baixo
  if (keys["ArrowLeft"]) camera.rotation.y += rotateSpeed; // Rotaciona para a esquerda
  if (keys["ArrowRight"]) camera.rotation.y -= rotateSpeed; // Rotaciona para a direita

  // Rola a câmera
  if (keys["q"]) camera.rotation.z += rotateSpeed;
  if (keys["e"]) camera.rotation.z -= rotateSpeed;

  // Ajusta o tamanho do renderer se necessário
  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  // Atualiza a rotação dos cubos
  cubes.forEach((cube, ndx) => {
    const speed = 1 + ndx * 0.1;
    const rot = time * speed;
    cube.rotation.x = rot;
    cube.rotation.y = rot;
  });

  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

requestAnimationFrame(render);
//------------------------------------------------------------------
