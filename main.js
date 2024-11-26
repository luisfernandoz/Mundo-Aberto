import * as THREE from "three";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

//---------------- Criando a cena ----------------------------------
const scene = new THREE.Scene();
//------------------------------------------------------------------

// Criando a câmera de perspectiva
//------------------------------------------------------------------
const fov = 45;
const aspect = 2;
const near = 0.1;
const far = 100;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(10, 10, 10);
camera.lookAt(0, 10, 0);
//------------------------------------------------------------------

// Criando o renderer
//------------------------------------------------------------------
const canvas = document.querySelector("#c");
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas,
  alpha: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
//------------------------------------------------------------------

// Adicionando uma textura para o chão
//------------------------------------------------------------------
const loader = new THREE.TextureLoader();
const planeSize = 400;
const texture = loader.load("resources/ceram.png");
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.magFilter = THREE.NearestFilter;
texture.colorSpace = THREE.SRGBColorSpace;
const repeats = planeSize / 2;
texture.repeat.set(repeats, repeats);

const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
const planeMat = new THREE.MeshPhongMaterial({
  map: texture,
  side: THREE.DoubleSide,
});
planeMat.color.setRGB(1.5, 1.5, 1.5);

const mesh = new THREE.Mesh(planeGeo, planeMat);
mesh.rotation.x = Math.PI * -0.5;
scene.add(mesh);
//------------------------------------------------------------------

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
  const moveSpeed = 0.1; // Velocidade de movimento
  const rotateSpeed = 0.02; // Velocidade de rotação

  if (keys["w"]) camera.position.z -= moveSpeed; // Move para frente
  if (keys["s"]) camera.position.z += moveSpeed; // Move para trás
  if (keys["a"]) camera.position.x -= moveSpeed; // Move para a esquerda
  if (keys["d"]) camera.position.x += moveSpeed; // Move para a direita

  if (keys["ArrowUp"]) camera.rotation.x -= rotateSpeed; // Rotaciona para cima
  if (keys["ArrowDown"]) camera.rotation.x += rotateSpeed; // Rotaciona para baixo
  if (keys["ArrowLeft"]) camera.rotation.y -= rotateSpeed; // Rotaciona para a esquerda
  if (keys["ArrowRight"]) camera.rotation.y += rotateSpeed; // Rotaciona para a direita

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
