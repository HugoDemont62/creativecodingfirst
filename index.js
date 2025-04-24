import { WebGLRenderer, Scene, Vector2} from 'three';
import { Pane } from 'tweakpane';
import gsap from 'gsap';
import Camera from './components/Camera.js';
import Cube from './components/Cube.js';
import Lighting from './components/Lighting.js';
let canvas, webgl, renderer;

webgl = {};

canvas = document.createElement('canvas');
const app = document.querySelector('#app');
app.appendChild(canvas);

function init() {
    webgl.canvas = canvas;
    const pr = window.devicePixelRatio;
    renderer = new WebGLRenderer({
        canvas,
    });
    renderer.setPixelRatio(pr);

    webgl.gui = new Pane();
    webgl.scene = new Scene();
    webgl.camera = new Camera();
    webgl.cube = new Cube();
    webgl.slider = new Slider();
    webgl.viewport = new Vector2();
    webgl.light = new Lighting(webgl.scene, renderer);

    
    initMenuEvents();
    
    resize();
}

function initMenuEvents() {
    const buttons = document.querySelectorAll('#menu button');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const slideIndex = parseInt(button.dataset.slide, 10);
            webgl.slider.goToSlide(slideIndex);
        });
    });
}

function preload() {

}

function update(time, deltaTime, frame) {
    webgl.camera.update();
    webgl.cube.update();
    render();
}

function render() {
    renderer.render(webgl.scene, webgl.camera.activeCamera);

}

function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    webgl.viewport.set(width, height);
    webgl.viewportRatio = width / height;
    webgl.camera.resize();
    renderer.setSize(width, height);

}

window.addEventListener('resize', resize);
window.addEventListener('DOMContentLoaded', init);
gsap.ticker.add(update);

export function getWebgl() {
    return webgl;
}

