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

const islandTexture = textureLoader.load(
    "/models/island1.png",
    () => console.log("Island texture loaded")
);

const shoreTexture = textureLoader.load(
    "/models/shorewaves1.png",
    () => console.log("Shore texture loaded")
);

const waterTexture = textureLoader.load(
    "/models/water.png",
    () => console.log("Water texture loaded")
);

const islandTexture = textureLoader.load("/models/island1.png");
const shoreTexture = textureLoader.load("/models/shorewaves1.png");
const waterTexture = textureLoader.load("/models/water.png");

let island;

loader.load("/models/island.glb", (gltf) => {
    island = gltf.scene;

    const textureLoader = new THREE.TextureLoader();

    const islandTexture = textureLoader.load(
        "/models/island1.png"
    );

    const shoreTexture = textureLoader.load(
        "/models/shorewaves1.png"
    );

    const waterTexture = textureLoader.load(
        "/models/water.png"
    );

    islandTexture.flipY = false;
    shoreTexture.flipY = false;
    waterTexture.flipY = false;

    islandTexture.colorSpace = THREE.SRGBColorSpace;
    shoreTexture.colorSpace = THREE.SRGBColorSpace;
    waterTexture.colorSpace = THREE.SRGBColorSpace;

    island.traverse((child) => {
        if (!child.isMesh) return;

        console.log(
            child.name,
            child.material.name
        );

        if (child.material.name === "island1 midpoly") {
            child.material.map = islandTexture;
        }

        if (child.material.name === "shorewaves") {
            child.material.map = shoreTexture;
        }

        if (child.material.name === "water") {
            child.material.map = waterTexture;
        }

        child.material.needsUpdate = true;
    });

    scene.add(island);

    console.log(island);
});

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

loader.load("/models/island.glb", (gltf) => {

    const island = gltf.scene;

    island.position.set(0, 0, 0);
    island.scale.set(1, 1, 1);

    scene.add(island);

islandBox = new THREE.Box3().setFromObject(island);

const helper = new THREE.Box3Helper(
    islandBox,
    0xff0000
);

scene.add(helper);

console.log(island);
});

const collisionGeometry = new THREE.BoxGeometry(
    200, // width
    10,  // height
    200  // depth
);

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
    0.1,
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