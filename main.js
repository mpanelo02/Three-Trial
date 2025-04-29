// alert("Hello World!");
import * as THREE from 'three';
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Octree } from 'three/addons/math/Octree.js';
import { Capsule } from 'three/addons/math/Capsule.js';


const scene = new THREE.Scene();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const canvas = document.getElementById("experience-canvas");
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

// Physics Stuff
const Gravity = 30;
const Capsule_Radius =  1;
const Capsule_Height = 1;
const Jump_Height = 10;
const Move_Speed = 5;

let car = {
  instance: null,
  isMoving: false,
  spawnPosition: new THREE.Vector3(),
}
let targetRotation = Math.PI / 2;


const colliderOctree = new Octree();
const playerCollider = new Capsule(
  new THREE.Vector3(0, Capsule_Radius, 0),
  new THREE.Vector3(0, Capsule_Height, 0),
  Capsule_Radius
);

let playerVelocity = new THREE.Vector3();
let playerOnFloor = false;

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize( sizes.width, sizes.height );
renderer.setPixelRatio( Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
// renderer.toneMappingExposure = 1.5;

const modalContent = {
  "ProjectMario":{
    title: "Project Mario",
    content: "This is project one. Hello World!",
    link: "https://www.linkedin.com/in/mark-johnson-panelo-82030a325/",
  },
}

const modal = document.querySelector(".modal");
const modalTitle = document.querySelector(".modal-title");
const modalProjectDesription = document.querySelector(".modal-project-description");
const modalExitButton = document.querySelector(".modal-exit-button");
const modalVisitProjectButton = document.querySelector(".modal-project-visit-button");


// Show the modal with my Linked in when "ProjectMario" is clicked
function showModal(id) {
  const content = modalContent[id];
  if (content) {
    modalTitle.textContent = content.title;
    modalProjectDesription.textContent = content.content;

    if(content.link) {
      modalVisitProjectButton.href = content.link;
      modalVisitProjectButton.classList.remove("hidden");
    } else {
      modalVisitProjectButton.classList.add("hidden");
    }
    modal.classList.toggle("hidden");
  }
}


function hideModal() {
  modal.classList.toggle("hidden");
}

let intersectObject = ""
const intersectObjects = [];
const intersectObjectsNames = [
  "ChickenWhite",
  "ChickenBrown",
  "Kid",
  "Pig",
  "House",
  "ProjectMario",
];


const loader = new GLTFLoader();

loader.load( "./PracticeModel05Collider.glb", function ( glb ) {
  glb.scene.traverse( function ( child ) {
    if (intersectObjectsNames.includes(child.name)) {
      intersectObjects.push(child);
    }

    if ( child.isMesh ) {
      child.castShadow = true;
      child.receiveShadow = true;
      // console.log(child.material);
      // child.material.metalness = 0.5;

      // if(child.material.name === "T-Paita.001"){
      //   child.material.color.setRGB(0,0,0);
      // }
    }
    if(child.name === "Car"){
      car.spawnPosition.copy(child.position);
      car.instance = child;
      playerCollider.start.copy(child.position).add(new THREE.Vector3(0, Capsule_Radius, 0));
      playerCollider.end.copy(child.position).add(new THREE.Vector3(0, Capsule_Height, 0));
    
    }
    if(child.name === "GroundCollider"){
      colliderOctree.fromGraphNode(child);
      child.visible = false;
    }
  } );

  
  scene.add( glb.scene );

}, undefined, function ( error ) {

  console.error( error );

} );

const sun = new THREE.DirectionalLight( 0xFFFFFF );
sun.castShadow = true;
sun.position.set( 75, 80, 0 );
sun.target.position.set( 75, 0, 0 );
sun.shadow.mapSize.width = 4096; // default
sun.shadow.mapSize.height = 4096; // default
sun.shadow.camera.left = -80;
sun.shadow.camera.right = 80;
sun.shadow.camera.top = 80;
sun.shadow.camera.bottom = -80;
sun.shadow.normalBias = 0.2;
scene.add( sun );

// const shadowHelper = new THREE.CameraHelper( sun.shadow.camera );
// scene.add( shadowHelper );
// console.log(sun.shadow);
// const helper = new THREE.DirectionalLightHelper( light, 5 );
// scene.add( helper );

const light = new THREE.AmbientLight( 0x404040, 5 ); // soft white light
scene.add( light );


const aspect = sizes.width / sizes.height;
const camera = new THREE.OrthographicCamera( -aspect * 50, aspect * 50, 50, -30, 1, 1000 );
// const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

camera.position.x = 35;
camera.position.y = 20;
camera.position.z = 25;

const cameraOffset = new THREE.Vector3(35, 20, 25);
camera.zoom = 2;
camera.updateProjectionMatrix();


// const controls = new OrbitControls( camera, canvas );
// controls.update();


function onResize() {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    const aspect = sizes.width / sizes.height;
    camera.left = -aspect * 50;
    camera.right = aspect * 50; 
    camera.top = 50;
    camera.bottom = -50;
    camera.updateProjectionMatrix();

    renderer.setSize( sizes.width, sizes.height );
    renderer.setPixelRatio( Math.min(window.devicePixelRatio, 2));
}

function jumpCar(meshID) {
  const mesh = scene.getObjectByName(meshID);
  if (!mesh) return;

  const jumpHeight = 10;
  const jumpDuration = 1;

  const startY = mesh.position.y; // <- SAVE the original Y

  const t1 = gsap.timeline();

  t1.to(mesh.scale, {
    x: 3,
    y: 0.8,
    z: 1.2,
    duration: jumpDuration * 0.3,
    ease: "power2.out",
  });

  t1.to(mesh.position, {
    y: startY + jumpHeight,
    duration: jumpDuration * 0.3,
    ease: "power2.out",
  }, "<");

  t1.to(mesh.position, {
    y: startY, // <- use the saved Y
    duration: jumpDuration * 0.5,
    ease: "bounce.out",
  });

  t1.to(mesh.scale, {
    x: 1,
    y: 1,
    z: 1,
    duration: jumpDuration * 0.5,
    ease: "elastic.out(1, 0.3)",
  });
}


function onClick() {
  if(intersectObject !== ""){
    if(["ChickenBrown","ChickenWhite","Pig", "Kid", "House"].includes(intersectObject)){
      jumpCar(intersectObject);
    } else {
      showModal(intersectObject);
    }
  }
}

function onPointerMove( event ) {
	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

function respawnCar() {
  if(!car.instance) return;

  car.instance.position.copy(car.spawnPosition);

  playerCollider.start.copy(car.spawnPosition).add(new THREE.Vector3(0, Capsule_Radius, 0));
  playerCollider.end.copy(car.spawnPosition).add(new THREE.Vector3(0, Capsule_Height, 0));

  playerVelocity.set(0, 0, 0);
  car.isMoving = false;
}

function playerCollisions() {
  const result = colliderOctree.capsuleIntersect(playerCollider);
  playerOnFloor = false;

  if(result) {
    playerOnFloor = result.normal.y > 0;
    playerCollider.translate(result.normal.multiplyScalar(result.depth));

    if(playerOnFloor) {
      car.isMoving = false;
      playerVelocity.x = 0;
      playerVelocity.z = 0;
      // playerVelocity.y = 0;
    }
  }
}

function updatePlayer() {
  if(!car.instance) return;

  if(car.instance.position.y < -20){
    respawnCar();
    return;
  }

  if(!playerOnFloor){
    playerVelocity.y -= Gravity * 0.035;
  }
  playerCollider.translate(playerVelocity.clone().multiplyScalar(0.035));

  playerCollisions();


  car.instance.position.copy(playerCollider.start);
  car.instance.position.y -= Capsule_Radius;

  let rotationDiff = 
  ((((targetRotation - car.instance.rotation.y) % (2 * Math.PI)) + (3 * Math.PI)) % (2 * Math.PI)) - Math.PI;
  let finalRotation = car.instance.rotation.y + rotationDiff;

  car.instance.rotation.y = THREE.MathUtils.lerp(car.instance.rotation.y, finalRotation, 0.4);
}

function onKeyDown(event) {
  if(event.key.toLowerCase() === "r"){
    respawnCar();
    return;
  }

  if(car.isMoving) return;

  switch(event.key.toLowerCase()){
    case "s":
    case "arrowdown":
      playerVelocity.z += Move_Speed;
      targetRotation = -Math.PI / 2;
      break;
    case "w":
    case "arrowup":
      playerVelocity.z -= Move_Speed;
      targetRotation = Math.PI / 2;
      break;
    case "d":
    case "arrowright":
      playerVelocity.x += Move_Speed;
      targetRotation = 0;
      break;
    case "a":
    case "arrowleft":
      playerVelocity.x -= Move_Speed;
      targetRotation = Math.PI;
      break;
    default:
      break;
  }
  playerVelocity.y = Jump_Height;
  car.isMoving = true;
}

modalExitButton.addEventListener("click", hideModal);
window.addEventListener("resize", onResize);
window.addEventListener("click", onClick);
window.addEventListener("pointermove", onPointerMove);
window.addEventListener("keydown", onKeyDown);


function animate() {
  updatePlayer();

  if(car.instance) {
    const targetCameraPosition = new THREE.Vector3(car.instance.position.x + cameraOffset.x, cameraOffset.y, car.instance.position.z + cameraOffset.z);
  
    camera.position.copy(targetCameraPosition);
    camera.lookAt(car.instance.position.x, camera.position.y - 20, car.instance.position.z);
  }
  

  raycaster.setFromCamera( pointer, camera );

	
	const intersects = raycaster.intersectObjects( intersectObjects );

  if (intersects.length > 0) {
    document.body.style.cursor = "pointer";
  }else{
    document.body.style.cursor = "default";
    intersectObject = "";
  }

	for ( let i = 0; i < intersects.length; i ++ ) {
    // console.log(intersects[0].object.parent.name);
    intersectObject = intersects[0].object.parent.name
	}


    // console.log(camera.position);

    renderer.render( scene, camera );
}
renderer.setAnimationLoop( animate );


function updateVantaaDateTime() {
  const dateElement = document.getElementById('vantaa-date');
  const timeElement = document.getElementById('vantaa-clock');

  // const optionsDate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Europe/Helsinki' };
  const optionsDate = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Europe/Helsinki' };
  const optionsTime = { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Europe/Helsinki' };

  const now = new Date();
  
  dateElement.textContent = now.toLocaleDateString('en-FI', optionsDate);
  timeElement.textContent = now.toLocaleTimeString('en-FI', optionsTime);
}
setInterval(updateVantaaDateTime, 1000);
updateVantaaDateTime(); // run immediately
