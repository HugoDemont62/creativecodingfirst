import { WebGLRenderer, Scene, Vector2, Color } from 'three';
import { Pane } from 'tweakpane';
import gsap from 'gsap';
import Camera from './components/Camera.js';
import Slider from './components/Slider.js';
import Lighting from './components/Lighting.js';
import { initScrollBehavior } from './utils/scrollBehavior.js';

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
        antialias: true,
        alpha: true
    });
    renderer.setPixelRatio(pr);
    renderer.setClearColor(0x000000, 0); // Fond transparent

    webgl.gui = new Pane({
        container: document.querySelector('#app')
    });
    webgl.gui.hidden = true; // Cacher l'interface de debug par défaut

    webgl.scene = new Scene();
    webgl.camera = new Camera();
    webgl.slider = new Slider();
    webgl.viewport = new Vector2();
    webgl.light = new Lighting(webgl.scene, renderer);

    // Rendre l'objet webgl disponible globalement pour le système de scroll
    window.webgl = webgl;

    // Initialiser le comportement de scroll
    const scrollSystem = initScrollBehavior();
    webgl.scrollSystem = scrollSystem;

    resize();
}

function update(time, deltaTime, frame) {
    // Mise à jour des composants
    webgl.camera.update();
    if(webgl.slider) webgl.slider.update();

    // Rendu
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