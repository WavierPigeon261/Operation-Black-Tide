import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import './style.css';
let islandBox;
let yaw = 0;
let pitch = 0;

const loader = new GLTFLoader();
const raycaster = new THREE.Raycaster();
const down = new THREE.Vector3(0, -1, 0);

const textureLoader = new THREE.TextureLoader();

const islandTexture = textureLoader.load("/models/island1.png");
const normalTexture = textureLoader.load("/models/island1_n1.png");

islandTexture.flipY = false;
normalTexture.flipY = false;


islandTexture.wrapS = THREE.ClampToEdgeWrapping;
islandTexture.wrapT = THREE.ClampToEdgeWrapping;
islandTexture.repeat.set(1, 1);

islandTexture.colorSpace = THREE.SRGBColorSpace;
normalTexture.colorSpace = THREE.NoColorSpace;


let island;

loader.load("/models/island_fixed1.glb", (gltf) => {
    island = gltf.scene;

    scene.add(island);

    islandBox = new THREE.Box3().setFromObject(island);
});

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const collisionGeometry = new THREE.BoxGeometry(
    200, // width
    10,  // height
    200  // depth
);

const waterGeometry = new THREE.PlaneGeometry(2000, 2000);

const waterMaterial = new THREE.MeshStandardMaterial({
    color: 0x1e5aa8,
    transparent: true,
    opacity: 0.9,
    roughness: 0.2,
    metalness: 0.1
});

const water = new THREE.Mesh(
    waterGeometry,
    waterMaterial
);

water.rotation.x = -Math.PI / 2;
water.position.y = 0;

scene.add(water);

const collisionMaterial = new THREE.MeshBasicMaterial({
    visible: false
});

const collisionMesh = new THREE.Mesh(
    collisionGeometry,
    collisionMaterial
);

collisionMesh.position.set(0, -5, 0);

scene.add(collisionMesh);

const collisionBox = new THREE.Box3().setFromObject(
    collisionMesh
);


const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.5,
    1000
);

camera.position.set(50, 21.8, 50);

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

// Sunlight
const light = new THREE.DirectionalLight(0xffffff, 2);

light.position.set(10, 20, 10);

scene.add(light);

// Ambient light
scene.add(new THREE.AmbientLight(0xffffff, 0.5));

// Ground
const groundGeometry = new THREE.PlaneGeometry(100, 100);

const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x228b22
});

const ground = new THREE.Mesh(
    groundGeometry,
    groundMaterial
);
scene.remove(ground);
ground.rotation.x = -Math.PI / 2;

scene.add(ground);

// Cube
const cube = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.MeshStandardMaterial({
        color: 0x4444ff
    })
);


cube.position.set(50, 20, 50);


cube.visible = true;
scene.add(cube);


const keys = {};

window.addEventListener("keydown", (event) => {
    keys[event.key.toLowerCase()] = true;
    keys[event.code.toLowerCase()] = true;
});

window.addEventListener("keyup", (event) => {
    keys[event.key.toLowerCase()] = false;
});

let velocityY = 0;
let onGround = true;
const gravity = 0.01;
const jumpStrength = 0.25;

function updateMovement() {

    let speed = 0.1;

if (keys["shift"]) {
    speed = 0.2;
}

    const forwardX = Math.sin(yaw);
const forwardZ = Math.cos(yaw);

const rightX = Math.cos(yaw);
const rightZ = -Math.sin(yaw);

const previousX = cube.position.x;
const previousZ = cube.position.z;

if (keys["w"]) {
    cube.position.x -= forwardX * speed;
    cube.position.z -= forwardZ * speed;
}

if (keys["s"]) {
    cube.position.x += forwardX * speed;
    cube.position.z += forwardZ * speed;
}

if (keys["a"]) {
    cube.position.x -= rightX * speed;
    cube.position.z -= rightZ * speed;
}

if (keys["d"]) {
    cube.position.x += rightX * speed;
    cube.position.z += rightZ * speed;
}

if (keys[" "] && onGround) {
    velocityY = jumpStrength;
    onGround = false;
}



velocityY -= gravity;
cube.position.y += velocityY;

if (island) {
    raycaster.set(
        new THREE.Vector3(
            cube.position.x,
            1000,
            cube.position.z
        ),
        down
    );

    const hits = raycaster.intersectObject(
        island,
        true
    );

    if (hits.length > 0) {
    const groundHeight = hits[0].point.y + 1;

    if (cube.position.y <= groundHeight) {
        cube.position.y = groundHeight;
        velocityY = 0;
        onGround = true;
    }
}
}


    camera.position.x = cube.position.x;
camera.position.y = cube.position.y + 1.8;
camera.position.z = cube.position.z;
}


// Animation loop
function animate() {
    requestAnimationFrame(animate);

    updateMovement();

    renderer.render(scene, camera);

    camera.rotation.order = "YXZ";
    camera.rotation.y = yaw;
    camera.rotation.x = pitch;
}

animate();

// Resize handler
window.addEventListener('resize', () => {

    camera.aspect = window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

});
document.addEventListener("click", () => {
    document.body.requestPointerLock();
});

document.addEventListener("mousemove", (event) => {

    if (document.pointerLockElement !== document.body) {
        return;
    }

    yaw -= event.movementX * 0.002;
    pitch -= event.movementY * 0.002;

    const limit = Math.PI / 2;

    pitch = Math.max(
        -limit,
        Math.min(limit, pitch)
    );
});