import { PerspectiveCamera, CameraHelper } from 'three';
import { getWebgl } from '../index.js';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

export default class Camera {
    constructor() {
        this.webgl = getWebgl();
        this.scene = this.webgl.scene;

        this.main = this.createCamera();
        this.debug = this.createDebug();

        this.activeCamera = this.main; // Définir la caméra principale comme active par défaut
        this.createPaneFolder();
    }

    createCamera() {
        const camera = new PerspectiveCamera(45, this.webgl.viewportRatio, 0.1, 1000);
        const helper = new CameraHelper(camera);
        helper.visible = false; // Cacher l'helper par défaut

        // Position optimisée pour voir la voiture à gauche
        camera.position.set(-6, 3, 15);
        camera.lookAt(-8, 0, -2); // Regarder vers la position du groupe de la voiture

        this.scene.add(camera);
        this.scene.add(helper);
        return camera;
    }

    createDebug() {
        const camera = new PerspectiveCamera(45, this.webgl.viewportRatio, 0.1, 1000);

        // Position également ajustée pour la caméra de debug
        camera.position.set(0, 15, 25);
        camera.lookAt(-8, 0, -2); // Regarder vers la position du groupe de la voiture

        this.orbitControls = new OrbitControls(camera, this.webgl.canvas);

        // Ajustement des contrôles pour une meilleure navigation
        this.orbitControls.enableDamping = true;
        this.orbitControls.dampingFactor = 0.05;
        this.orbitControls.minDistance = 5;
        this.orbitControls.maxDistance = 50;
        // Définir une cible pour les contrôles orbitaux
        this.orbitControls.target.set(-8, 0, -2);

        this.scene.add(camera);

        return camera;
    }

    createPaneFolder() {
        const folder = this.webgl.gui.addFolder({title: 'Scene', expanded: true});
        const opts = [
            {text: 'Main', value: this.main},
            {text: 'Debug', value: this.debug},
        ];
        folder.addBlade({
            view: 'list',
            label: 'Cameras',
            options: opts,
            value: this.activeCamera,
        })
        .on('change', ev => {
            this.activeCamera = ev.value;
        });
    }

    setCamera(camera) {
        this.activeCamera = camera;
    }

    init() {
        // Initialisation supplémentaire si nécessaire
    }

    update() {
        this.orbitControls?.update();
    }

    resize() {
        this.main.aspect = window.innerWidth / window.innerHeight;
        this.main.updateProjectionMatrix();

        this.debug.aspect = window.innerWidth / window.innerHeight;
        this.debug.updateProjectionMatrix();

        if (this.activeCamera !== this.main && this.activeCamera !== this.debug) {
            this.activeCamera.aspect = window.innerWidth / window.innerHeight;
            this.activeCamera.updateProjectionMatrix();
        }
    }
}