import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

let suzanne
const loader = new GLTFLoader()
loader.load('suzanne.glb', function (gltf) {
    suzanne = gltf.scene
    scene.add(gltf.scene)
}, undefined, function (error) {
    console.error(error)
})

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, 4 / 3, 0.1, 1000)

const renderer = new THREE.WebGLRenderer()
renderer.setSize(640, 480)
document.body.appendChild(renderer.domElement)

// from https://tools.wwwtyro.net/space-3d/index.html
const envMap = new THREE.CubeTextureLoader().load([
    'skybox/right.png', 'skybox/left.png',
    'skybox/top.png', 'skybox/bottom.png',
    'skybox/front.png', 'skybox/back.png'
])
scene.background = envMap

const cubeGeo1 = new THREE.BoxGeometry(1, 1, 1)
const cubeMat1 = new THREE.MeshStandardMaterial({ color: 0x00ff00, envMap: envMap, roughness: 0, metalness: 1, envMapIntensity: 1.0 })
const cube1 = new THREE.Mesh(cubeGeo1, cubeMat1)
cube1.position.x = 2
scene.add(cube1)

const cubeGeo2 = new THREE.BoxGeometry(1, 1, 1)
const cubeMat2 = new THREE.MeshStandardMaterial({ color: 0x0000ff, envMap: envMap })
const cube2 = new THREE.Mesh(cubeGeo2, cubeMat2)
cube2.position.x = -2
scene.add(cube2)

// mirror sphere
const mirrorSphereGeometry = new THREE.SphereGeometry(1, 32, 32)
const mirrorSphereMaterial = new THREE.MeshStandardMaterial({
    color: 0x8888ff,
    roughness: 0,
    metalness: 1,
    envMap: envMap,
    envMapIntensity: 1.0
})
const mirrorSphere = new THREE.Mesh(mirrorSphereGeometry, mirrorSphereMaterial)
scene.add(mirrorSphere)
mirrorSphere.position.y = 2

// ambient light
const ambientLight = new THREE.AmbientLight(0x404040)
scene.add(ambientLight)

// directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
directionalLight.position.set(5, -5, 5)
scene.add(directionalLight)

camera.position.z = 5

function animate() {
    const now = Date.now()

    requestAnimationFrame(animate)

    if (suzanne) {
        suzanne.rotation.x += 0.005
        suzanne.rotation.y += 0.005
        suzanne.position.y = Math.sin(now / 1000)
    }
    cube1.rotation.x += 0.01
    cube1.rotation.y += 0.01

    cube2.rotation.x -= 0.01
    cube2.rotation.y -= 0.01

    mirrorSphere.position.x = 6 * Math.sin(now / 1000)
    mirrorSphere.position.y = 3 * Math.cos(now / 1000)

    scene.rotation.y += 0.005

    camera.position.x = 5 * Math.sin(now / 2000)
    camera.position.z = 5 * Math.cos(now / 2000)
    camera.lookAt(scene.position)

    renderer.render(scene, camera)
}
animate()