import { PerspectiveCamera, CameraHelper } from 'three';
import { getWebgl } from '../index.js';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

export default class Camera {
    constructor() {
        this.webgl = getWebgl();
        this.scene = this.webgl.scene;

        this.main = this.createCamera();
        this.debug = this.createDebug();

        this.activeCamera = this.debug;
        this.createPaneFolder();

    }


    createCamera() {
        const camera = new PerspectiveCamera(55, this.webgl.viewportRatio, 0.1, 100);
        const helper = new CameraHelper(camera);

        camera.position.set(0, 1, 2.5); // Ajustez les coordonnées selon vos besoins
        camera.lookAt(0, 0, 0); // Oriente la caméra vers le centre de la scène

        this.scene.add(camera);
        this.scene.add(helper);
        return camera;
    }

    createDebug() {
        const camera = new PerspectiveCamera(55, this.webgl.viewportRatio, 0.1, 100);
        camera.position.set(10, 10, 10);
        camera.lookAt(0, 0, 0);

        this.orbitControls = new OrbitControls(camera, this.webgl.canvas);

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

    }

    update() {
        this.orbitControls?.update();
    }

    resize() {
        this.main.aspect = window.innerWidth / window.innerHeight; // Met à jour le ratio d'aspect
        this.main.updateProjectionMatrix(); // Met à jour la matrice de projection

        this.activeCamera.aspect = window.innerWidth / window.innerHeight; // Met à jour la caméra active
        this.activeCamera.updateProjectionMatrix();
    }
}
