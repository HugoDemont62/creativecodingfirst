import { getWebgl } from '../index.js';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { AmbientLight, DirectionalLight, Group } from 'three';
import gsap from 'gsap';

export default class Slider {
  constructor() {
    this.webgl = getWebgl();
    this.currentSlide = 0;
    this.totalSlides = 6;
    this.isAnimating = false;
    this.carGroup = new Group();

    this.carModel = null;
    this.frontWheels = []; // Pour stocker les roues avant
    this.backWheels = []; // Pour stocker les roues arrière
    this.wheelAnimationId = null; // Pour l'animation des roues

    this.slideConfigs = [
      // positionné sur la gauche
      {
        rot: [0, Math.PI * 0.25, 0],
        scale: 7.2,
        position: [-5, 0, 0]
      },
      {
        rot: [0, Math.PI * 0.5, 0],
        scale: 6.0,
        position: [-5, 0, 0]
      },
      {
        rot: [0, Math.PI * 0.75, 0],
        scale: 6.0,
        position: [-5, 0, 0]
      },
      {
        // Vue du dessus
        rot: [0, Math.PI * 0.5, 0],
        scale: 10.0,
        position: [-5, 1, 0]
      },
      {
        rot: [0, Math.PI * 0.1, 0],
        scale: 7.2,
        position: [-5, 0.5, 0]
      },
      {
        rot: [0, 0, 0],
        scale: 8.8,
        position: [-10, 0, 0]
      }
    ];

    this.animations = {
      driftEffect: null,
      engineIdle: null,
      vibration: null,
      topView: null,
      circleAround: null,
      dynamicRotation: null,
      pulse: null
    };

    this.init();
    this.initEvents();
  }

  init() {
    this.webgl.scene.add(this.carGroup);

    this.carGroup.position.set(-8, 0, 0);
    this.setupLights();
    this.loadModel();
    this.showSlide(0);
  }

  setupLights() {
    const ambientLight = new AmbientLight(0xffffff, 0.6);
    this.carGroup.add(ambientLight);

    const mainLight = new DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(1, 3, 2);
    mainLight.castShadow = true;
    this.carGroup.add(mainLight);

    const topLight = new DirectionalLight(0xffffff, 0.8);
    topLight.position.set(0, 10, 0);
    this.carGroup.add(topLight);
  }

  loadModel() {
    const loader = new GLTFLoader();

    loader.load(
      'assets/car.glb',
      (gltf) => {
        this.carModel = gltf.scene;

        // Application de l'échelle initiale
        this.carModel.scale.setScalar(this.slideConfigs[0].scale);

        // Rotation initiale
        this.carModel.rotation.set(
          this.slideConfigs[0].rot[0],
          this.slideConfigs[0].rot[1],
          this.slideConfigs[0].rot[2]
        );

        this.identifyWheels();

        this.carGroup.add(this.carModel);

        this.startSlideSpecificAnimation(0);
        console.log('Modèle S15 chargé avec succès');
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% chargé');
      },
      (error) => {
        console.error('Erreur lors du chargement du modèle:', error);
      }
    );
  }

  identifyWheels() {
    if (!this.carModel) return;

    this.carModel.traverse((child) => {
      // Nous identifions les roues par leur nom
      if (child.name) {
        if (child.name === 'Back_1' || child.name === 'Back_2') {
          this.backWheels.push(child);
          console.log('Roue arrière identifiée:', child.name);
        } else if (child.name === 'Front_1' || child.name === 'Front_2') {
          this.frontWheels.push(child);
          console.log('Roue avant identifiée:', child.name);
        }
      }
    });

    this.startCustomWheelRotation();
  }

  startCustomWheelRotation() {
    if (this.wheelAnimationId) {
      cancelAnimationFrame(this.wheelAnimationId);
      this.wheelAnimationId = null;
    }

    let driftAngle = 0;
    const driftSpeed = 0.01;
    const backWheelSpeed = 0.1; // Vitesse rapide pour les roues arrière
    const frontWheelSpeed = 0.03; // Vitesse lente pour les roues avant

    const animate = () => {
      this.backWheels.forEach(wheel => {
        if (wheel && wheel.rotation) {
          wheel.rotation.y += backWheelSpeed;
        }
      });

      this.frontWheels.forEach(wheel => {
        if (wheel && wheel.rotation) {
          // Rotation de base
          wheel.rotation.z += frontWheelSpeed;

          // Effet de dérapage (oscillation sur l'axe Z)
          driftAngle += driftSpeed;
          wheel.rotation.z = Math.sin(driftAngle) * 0.5;
        }
      });

      this.wheelAnimationId = requestAnimationFrame(animate);
    };

    animate();
  }

  startCustomWheelRotationBack () {
    if (this.wheelAnimationId) {
      cancelAnimationFrame(this.wheelAnimationId);
      this.wheelAnimationId = null;
    }

    let driftAngle = 0;
    const driftSpeed = 0.01;
    const backWheelSpeed = 0.1; // Vitesse rapide pour les roues arrière

    const animate = () => {
      this.backWheels.forEach(wheel => {
        if (wheel && wheel.rotation) {
          wheel.rotation.y += backWheelSpeed;
        }
      });

      this.wheelAnimationId = requestAnimationFrame(animate);
    };

    animate();
  }

  stopCustomWheelRotationFront() {
    if (this.wheelAnimationId) {
      cancelAnimationFrame(this.wheelAnimationId);
      this.wheelAnimationId = null;
    }
  }

  initEvents() {
    document.querySelectorAll('#menu button[data-slide]').forEach(button => {
      button.addEventListener('click', () => {
        const slideIndex = parseInt(button.dataset.slide, 10);
        this.goToSlide(slideIndex);
      });
    });

    document.getElementById('prev-slide').addEventListener('click', () => {
      this.prevSlide();
    });

    document.getElementById('next-slide').addEventListener('click', () => {
      this.nextSlide();
    });

    let touchStartY = 0;
    document.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    });

    document.addEventListener('touchend', (e) => {
      const touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY - touchEndY;

      if (Math.abs(diff) > 50) { // Seuil pour considérer comme un swipe
        if (diff > 0) {
          this.nextSlide();
        } else {
          this.prevSlide();
        }
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        this.nextSlide();
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        this.prevSlide();
      }
    });
  }

  goToSlide(index) {
    if (this.currentSlide === index || this.isAnimating || index >= this.totalSlides) return;

    this.isAnimating = true;

    this.animateContentOut(this.currentSlide);
    this.animateToSlide(index);
    this.updateButtonStyles(index);

    setTimeout(() => {
      this.animateContentIn(index);
      this.currentSlide = index;

      setTimeout(() => {
        this.isAnimating = false;
      }, 500);
    }, 500);
  }

  nextSlide() {
    if (this.currentSlide < this.totalSlides - 1) {
      this.goToSlide(this.currentSlide + 1);
    }
  }

  prevSlide() {
    if (this.currentSlide > 0) {
      this.goToSlide(this.currentSlide - 1);
    }
  }

  showSlide(index) {
    for (let i = 0; i < this.totalSlides; i++) {
      const slideContent = document.getElementById(`slide-content-${i}`);
      if (slideContent) {
        slideContent.style.display = 'none';
        slideContent.style.opacity = '0';
      }
    }

    const currentSlideContent = document.getElementById(`slide-content-${index}`);
    if (currentSlideContent) {
      currentSlideContent.style.display = 'block';
      gsap.to(currentSlideContent, {
        opacity: 1,
        duration: 0.5,
        ease: 'power2.inOut'
      });
    }

    this.updateButtonStyles(index);

    this.updateAnimationIndicator(index);
  }

  updateButtonStyles(activeIndex) {
    document.querySelectorAll('#menu button[data-slide]').forEach((button, index) => {
      if (index === activeIndex) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
  }

  animateContentOut(index) {
    const slideContent = document.getElementById(`slide-content-${index}`);
    if (!slideContent) return;

    gsap.to(slideContent, {
      opacity: 0,
      y: -20,
      duration: 0.5,
      ease: 'power2.inOut',
      onComplete: () => {
        slideContent.style.display = 'none';
        slideContent.style.y = 0;
      }
    });
  }

  animateContentIn(index) {
    const slideContent = document.getElementById(`slide-content-${index}`);
    if (!slideContent) return;

    slideContent.style.display = 'block';
    slideContent.style.opacity = '0';
    slideContent.style.transform = 'translateY(20px)';

    gsap.to(slideContent, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'power2.inOut'
    });
  }

  animateToSlide(slideIndex) {
    if (!this.carModel) return;

    const config = this.slideConfigs[slideIndex];

    this.stopAllAnimations();

    gsap.to(this.carModel.rotation, {
      x: config.rot[0],
      y: config.rot[1],
      z: config.rot[2],
      duration: 1.2,
      ease: 'power2.inOut'
    });

    // Animation de l'échelle
    gsap.to(this.carModel.scale, {
      x: config.scale,
      y: config.scale,
      z: config.scale,
      duration: 1.2,
      ease: 'power2.inOut'
    });

    gsap.to(this.carModel.position, {
      x: config.position[0],
      y: config.position[1],
      z: config.position[2],
      duration: 1.2,
      ease: 'power2.inOut',
      onComplete: () => {
        this.startSlideSpecificAnimation(slideIndex);
      }
    });
  }

  startSlideSpecificAnimation(slideIndex) {
    this.startCustomWheelRotation();

    switch(slideIndex) {
      case 0:
        this.startDriftEffect();
        break;
      case 1:
        this.stopCustomWheelRotationFront();
        this.startCustomWheelRotationBack();
        this.startEngineIdleEffect();
        break;
      case 2:
        this.stopCustomWheelRotationFront();
        this.startCustomWheelRotationBack();
        this.startVibrationEffect();
        break;
      case 3:
        this.startTopViewEffect();
        break;
      case 4:
        this.startCircleAroundEffect();
        break;
      case 5:
        this.startPulseEffect();
        break;
    }

    this.updateAnimationIndicator(slideIndex);
  }

  updateAnimationIndicator(slideIndex) {
    const animationNames = [
      'Drift statique amélioré',
      'Battement moteur',
      'Vibration démarrage',
      'Vue du dessus en rotation',
      'Mouvement circulaire',
      'Pulsation dynamique'
    ];

    const indicator = document.getElementById('animation-name');
    if (indicator) {
      indicator.textContent = `Animation: ${animationNames[slideIndex]}`;
    }

    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
      const progressWidth = ((slideIndex + 1) / this.totalSlides) * 100;
      progressBar.style.width = `${progressWidth}%`;
    }
  }

  startDriftEffect() {
    if (!this.carModel) return;

    this.stopAllAnimations();

    this.animations.driftEffect = gsap.timeline({repeat: -1, yoyo: true});

    this.animations.driftEffect.to(this.carModel.rotation, {
      y: `+=${Math.PI * 0.08}`,
      z: `-=${Math.PI * 0.01}`,
      duration: 1.5,
      ease: 'sine.inOut'
    });

    this.animations.driftEffect.to(this.carModel.rotation, {
      y: `-=${Math.PI * 0.05}`,
      z: `+=${Math.PI * 0.015}`,
      duration: 1.2,
      ease: 'sine.inOut'
    });

    this.animations.driftEffect.to(this.carModel.position, {
      x: '+=0.3',
      duration: 1.5,
      ease: 'sine.inOut'
    }, 0);

    this.animations.driftEffect.to(this.carModel.position, {
      x: '-=0.3',
      duration: 1.2,
      ease: 'sine.inOut'
    }, 1.5);
  }

  startEngineIdleEffect() {
    if (!this.carModel) return;

    this.stopAllAnimations();

    this.animations.engineIdle = gsap.timeline({repeat: -1});

    for (let i = 0; i < 8; i++) {
      const intensity = 0.05 + Math.random() * 0.05;
      const duration = 0.1 + Math.random() * 0.1;

      this.animations.engineIdle.to(this.carModel.position, {
        y: `+=${intensity}`,
        duration: duration,
        ease: 'power1.inOut'
      });

      this.animations.engineIdle.to(this.carModel.position, {
        y: `-=${intensity}`,
        duration: duration,
        ease: 'power1.inOut'
      });
    }

    gsap.to(this.carModel.rotation, {
      z: Math.PI * 0.005,
      duration: 2,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1
    });
  }

  startVibrationEffect() {
    if (!this.carModel) return;

    this.stopAllAnimations();

    this.animations.vibration = gsap.timeline({repeat: -1});

    for (let i = 0; i < 5; i++) {
      const intensity = 0.2 - (i * 0.03);

      this.animations.vibration.to(this.carModel.position, {
        y: `+=${intensity}`,
        x: `+=${intensity * 0.1}`,
        duration: 0.05,
        ease: 'power1.in'
      });

      this.animations.vibration.to(this.carModel.position, {
        y: `-=${intensity}`,
        x: `-=${intensity * 0.15}`,
        duration: 0.05,
        ease: 'power1.out'
      });
    }

    for (let i = 0; i < 10; i++) {
      const intensity = 0.08 - (i * 0.006);

      this.animations.vibration.to(this.carModel.position, {
        y: `+=${intensity}`,
        x: `+=${intensity * 0.15}`,
        duration: 0.07,
        ease: 'sine.inOut'
      });

      this.animations.vibration.to(this.carModel.position, {
        y: `-=${intensity}`,
        x: `-=${intensity * 0.5}`,
        duration: 0.07,
        ease: 'sine.inOut'
      });
    }

    for (let i = 0; i < 15; i++) {
      const intensity = 0.02 + (Math.random() * 0.01);

      this.animations.vibration.to(this.carModel.position, {
        y: `+=${intensity}`,
        duration: 0.01,
        ease: 'sine.inOut'
      });

      this.animations.vibration.to(this.carModel.position, {
        y: `-=${intensity}`,
        duration: 0.01,
        ease: 'sine.inOut'
      });
    }
  }

  startTopViewEffect() {
    if (!this.carModel) return;

    this.stopAllAnimations();

    this.animations.topView = gsap.timeline({repeat: -1});

    this.animations.topView.to(this.carModel.rotation, {
      y: this.carModel.rotation.z + Math.PI * 2,
      duration: 15,
      ease: 'none'
    });

    gsap.to(this.carModel.position, {
      z: '+=0.5',
      duration: 3,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1
    });
  }

  startCircleAroundEffect() {
    if (!this.carModel) return;

    this.stopAllAnimations();

    const centerX = this.carModel.position.x;
    const centerZ = this.carModel.position.z;
    const radius = 1.5;

    this.animations.circleAround = gsap.timeline({repeat: -1});

    for (let angle = 0; angle <= 360; angle += 5) {
      const radians = angle * (Math.PI / 180);
      const x = centerX + radius * Math.cos(radians);
      const z = centerZ + radius * Math.sin(radians);

      this.animations.circleAround.to(this.carModel.position, {
        x: x,
        z: z,
        duration: 0.2,
        ease: 'none'
      });

      this.animations.circleAround.to(this.carModel.rotation, {
        y: radians + Math.PI/2,
        duration: 0.2,
        ease: 'none'
      }, "<");
    }
  }

  startPulseEffect() {
    if (!this.carModel) return;

    this.stopAllAnimations();

    this.animations.pulse = gsap.timeline({repeat: -1});

    this.animations.pulse.to(this.carModel.scale, {
      x: '+=1.2',
      y: '+=1.2',
      z: '+=1.2',
      duration: 1,
      ease: 'power2.out'
    });

    this.animations.pulse.to(this.carModel.scale, {
      x: '-=1.2',
      y: '-=1.2',
      z: '-=1.2',
      duration: 1.5,
      ease: 'elastic.out(1, 0.3)'
    });

    gsap.to(this.carModel.rotation, {
      y: '+=0.2',
      duration: 1,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1
    });
  }

  stopAllAnimations() {
    for (const key in this.animations) {
      if (this.animations[key]) {
        this.animations[key].kill();
        this.animations[key] = null;
      }
    }

    if (this.carModel) {
      gsap.to(this.carModel.position, {
        x: this.slideConfigs[this.currentSlide].position[0],
        y: this.slideConfigs[this.currentSlide].position[1],
        z: this.slideConfigs[this.currentSlide].position[2],
        duration: 0.2
      });
    }
  }

  update() {
  }
}