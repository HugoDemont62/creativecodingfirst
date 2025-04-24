import { DirectionalLight, AmbientLight, PCFSoftShadowMap } from 'three';

export default class Lighting {
  constructor(scene, renderer) {
    this.scene = scene;
    this.renderer = renderer;

    this.init();
  }

  init() {
    // Activer les ombres sur le renderer
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;

    // Lumière ambiante
    const ambientLight = new AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    // Lumière directionnelle
    const directionalLight = new DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;

    // Configurer les ombres
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;

    this.scene.add(directionalLight);
  }

  update() {
  }
}