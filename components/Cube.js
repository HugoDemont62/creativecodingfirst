import { GridHelper, Mesh, BoxGeometry, MeshBasicMaterial } from "three";
import { getWebgl } from '../index.js';
import gsap from 'gsap';

export default class Cube {
    constructor(){
        this.webgl = getWebgl();
        this.scene = this.webgl.scene;
        
        this.init();
    }

    init() {
        this.grid = this.createDebug();
        this.cube = this.createGeometry();
    }

    createGeometry() {
        const PARAMS = { scale: 0};

        const geometry = new BoxGeometry(1,1,1);
        const material = new MeshBasicMaterial({color: 'blue'});
        const mesh = new Mesh(geometry, material);

        /*gsap.to(PARAMS, {
            scale: 1,
            duration: 1,
            yoyo: true,
            repeat: -1,
            onUpdate: () => {
                mesh.scale.setScalar(PARAMS.scale);
            }
        })*/

        // this.scene.add(mesh);
        return mesh;
    }

    createDebug() {
        const mesh = new GridHelper(10,10);
        this.scene.add(mesh);
        return mesh;

    }

    update() {
        // this.cube.rotation.x += 0.01;
    }

}
