// alert("Hello World!");
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


const scene = new THREE.Scene();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const canvas = document.getElementById("experience-canvas");
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

let car = {
  instance: null,
  moveDistance: 3,
  jumpHeight: 1,
  isMoving: false,
  moveDuration: 0.2,
}

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

loader.load( "./PracticeModel03Collider.glb", function ( glb ) {
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
      car.instance = child;
    }
    // console.log(child);
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
sun.shadow.camera.left = -50;
sun.shadow.camera.right = 50;
sun.shadow.camera.top = 50;
sun.shadow.camera.bottom = -50;
sun.shadow.normalBias = 0.2;
scene.add( sun );

const shadowHelper = new THREE.CameraHelper( sun.shadow.camera );
scene.add( shadowHelper );
console.log(sun.shadow);
// const helper = new THREE.DirectionalLightHelper( light, 5 );
// scene.add( helper );

const light = new THREE.AmbientLight( 0x404040, 5 ); // soft white light
scene.add( light );


const aspect = sizes.width / sizes.height;
const camera = new THREE.OrthographicCamera( -aspect * 50, aspect * 50, 50, -50, 1, 1000 );
// const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

camera.position.x = 35;
camera.position.y = 40;
camera.position.z = 25;

const controls = new OrbitControls( camera, canvas );
controls.update();


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
  const jumpHeight = 2;
  const jumpDuration = 0.5;

  const t1 = gsap.timeline();

  t1.to(mesh.scale, {
    x: 1.2,
    y: 0.8,
    z: 1.2,
    duration: jumpDuration * 2,
    ease: "power2.out",
  });

  t1.to(mesh.scale, {
    x: 0.8,
    y: 1.3,
    z: 0.8,
    duration: jumpDuration * 2,
    ease: "power2.out",
  });

  t1.to(mesh.position, {
    y: mesh.position.y + jumpHeight,
    duration: jumpDuration * 0.5,
    ease: "power2.out",
  },"<"
  );

  t1.to(mesh.scale, {
    x: 1,
    y: 1,
    z: 1,
    duration: jumpDuration * 0.3,
    ease: "power1.out",
  });

  t1.to(mesh.position, {
    y: mesh.position.y,
    duration: jumpDuration * 0.5,
    ease: "bounce.out",
  },"<"
  );

  t1.to(mesh.scale, {
    x: 1,
    y: 1,
    z: 1,
    duration: jumpDuration * 0.2,
    ease: "elastic.out(1, 1)",
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

function moveCar(targetPosition, targetRotation) {
  car.isMoving = true;

  let rotationDiff = 
    ((((targetRotation - car.instance.rotation.y) % (2 * Math.PI)) + (3 * Math.PI)) % (2 * Math.PI)) - Math.PI;
  let finalRotation = car.instance.rotation.y + rotationDiff;

  const t1 = gsap.timeline({
    onComplete: () => {
      car.isMoving = false;
    }
  });

  t1.to(car.instance.rotation, {
    y: finalRotation, 
    duration: car.moveDuration,
  }
  );

  t1.to(car.instance.position, {
    x: targetPosition.x,
    z: targetPosition.z,
    duration: car.moveDuration,
  },
 0
  );
  t1.to(car.instance.position, {
    y: car.instance.position.y + car.jumpHeight,
    duration: car.moveDuration / 2,
    yoyo: true,
    repeat: 1,
  },
 0
  );
}

function onKeyDown(event) {
  if(car.isMoving) return;

  const targetPosition = new THREE.Vector3().copy(car.instance.position);
  let targetRotation = 0;

  switch(event.key.toLowerCase()){
    case "s":
    case "arrowdown":
      targetPosition.z += car.moveDistance;
      targetRotation = -Math.PI / 2;
      break;
    case "w":
    case "arrowup":
      targetPosition.z -= car.moveDistance;
      targetRotation = Math.PI / 2;
      break;
    case "d":
    case "arrowright":
      targetPosition.x += car.moveDistance;
      targetRotation = 0;
      break;
    case "a":
    case "arrowleft":
      targetPosition.x -= car.moveDistance;
      targetRotation = Math.PI;
      break;
    default:
      break;
  }
  moveCar(targetPosition, targetRotation);
}


modalExitButton.addEventListener("click", hideModal);
window.addEventListener("resize", onResize);
window.addEventListener("click", onClick);
window.addEventListener("pointermove", onPointerMove);
window.addEventListener("keydown", onKeyDown);

function animate() {
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

