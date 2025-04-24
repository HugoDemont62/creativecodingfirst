
import { getWebgl } from '../index.js';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { Scene, Vector3, MathUtils, AmbientLight, DirectionalLight, Group } from 'three';
import gsap from 'gsap';

export default class Slider {
  constructor() {
    this.webgl = getWebgl();
    this.currentSlide = 0;
    this.totalSlides = 6;
    this.isAnimating = false;
    this.carGroup = new Group();

    // Variables pour le scroll
    this.scrollThreshold = 50;
    this.lastScrollTime = Date.now();
    this.scrollCooldown = 1000;
    this.wheelDirection = 0;

    // Cette référence sera mise à jour une fois le modèle chargé
    this.carModel = null;

    // Configuration pour chaque slide (scale multiplié par 400 pour une taille impressionnante)
    this.slideConfigs = [
      { rot: [0, Math.PI * 0.25, 0], scale: 7.2 },         // Slide 1: Vue 3/4 avant (0.018 * 400)
      { rot: [0, Math.PI * 0.5, 0], scale: 6.0 },          // Slide 2: Vue de profil (0.015 * 400)
      { rot: [0, Math.PI * 0.75, 0], scale: 6.0 },         // Slide 3: Vue 3/4 arrière (0.015 * 400)
      { rot: [0, 0, 0], scale: 8.0 },                      // Slide 4: Vue de face (0.02 * 400)
      { rot: [0, Math.PI * 0.8, 0], scale: 7.2 },          // Slide 5: Vue arrière dynamique (0.018 * 400)
      { rot: [0, 0, 0], scale: 8.8 }                       // Slide 6: Vue de face imposante (0.022 * 400)
    ];

    // Animations pour chaque slide
    this.animations = {
      driftEffect: null,
      engineIdle: null,
      vibration: null,
      zoom: null,
      dynamicRotation: null,
      pulse: null
    };

    this.init();
    this.initEvents();
  }

  init() {
    // Ajout du groupe de la voiture à la scène
    this.webgl.scene.add(this.carGroup);

    // Positionnement du groupe à gauche
    this.carGroup.position.set(-2, 0, 0);

    // Ajout des lumières spécifiques pour la voiture
    this.setupLights();

    // Chargement du modèle
    this.loadModel();

    // Affichage du premier slide immédiatement
    this.showSlide(0);
  }

  setupLights() {
    // Lumière ambiante
    const ambientLight = new AmbientLight(0xffffff, 0.5);
    this.carGroup.add(ambientLight);

    // Lumière principale
    const mainLight = new DirectionalLight(0xffffff, 1);
    mainLight.position.set(1, 3, 2);
    mainLight.castShadow = true;
    this.carGroup.add(mainLight);

    // Lumière d'accentuation bleue
    const blueLight = new DirectionalLight(0x0044ff, 0.5);
    blueLight.position.set(-2, 1, 1);
    this.carGroup.add(blueLight);

    // Lumière d'accentuation rouge
    const redLight = new DirectionalLight(0xff4400, 0.5);
    redLight.position.set(2, 1, -1);
    this.carGroup.add(redLight);
  }

  loadModel() {
    const loader = new GLTFLoader();

    // Chargement du modèle Nissan S15
    loader.load(
      'models/nissan_silvia_drift_tuned_s15.glb',
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

        // Ajout du modèle au groupe
        this.carGroup.add(this.carModel);

        // Démarrer l'animation du slide 1
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

  initEvents() {
    // Événements pour les boutons de navigation
    document.querySelectorAll('#menu button[data-slide]').forEach(button => {
      button.addEventListener('click', () => {
        const slideIndex = parseInt(button.dataset.slide, 10);
        this.goToSlide(slideIndex);
      });
    });

    // Boutons précédent/suivant
    document.getElementById('prev-slide').addEventListener('click', () => {
      this.prevSlide();
    });

    document.getElementById('next-slide').addEventListener('click', () => {
      this.nextSlide();
    });

    // Événement de scroll
    window.addEventListener('wheel', (e) => {
      this.handleScroll(e);
    });

    // Événements tactiles pour mobile
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

    // Événements clavier (flèches)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        this.nextSlide();
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        this.prevSlide();
      }
    });
  }

  handleScroll(e) {
    // Ignorer les événements pendant les animations
    if (this.isAnimating) return;

    // Vérifier le temps écoulé depuis le dernier scroll
    const now = Date.now();
    if (now - this.lastScrollTime < this.scrollCooldown) return;

    // Accumuler la valeur de deltaY pour détecter la direction
    this.wheelDirection += e.deltaY;

    // Si le seuil est dépassé, changer de slide
    if (Math.abs(this.wheelDirection) > this.scrollThreshold) {
      if (this.wheelDirection > 0) {
        this.nextSlide();
      } else {
        this.prevSlide();
      }

      // Réinitialiser la direction et mettre à jour le temps
      this.wheelDirection = 0;
      this.lastScrollTime = now;
    }
  }

  goToSlide(index) {
    if (this.currentSlide === index || this.isAnimating || index >= this.totalSlides) return;

    this.isAnimating = true;

    // Animation du contenu textuel
    this.animateContentOut(this.currentSlide);

    // Animation du modèle 3D
    this.animateToSlide(index);

    // Mise à jour des styles des boutons
    this.updateButtonStyles(index);

    // Afficher le contenu après un court délai
    setTimeout(() => {
      this.animateContentIn(index);
      this.currentSlide = index;

      // Réactiver les événements après la fin de l'animation
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
    // Cacher tous les slides
    for (let i = 0; i < this.totalSlides; i++) {
      const slideContent = document.getElementById(`slide-content-${i}`);
      if (slideContent) {
        slideContent.style.display = 'none';
        slideContent.style.opacity = '0';
      }
    }

    // Afficher le slide demandé
    const currentSlideContent = document.getElementById(`slide-content-${index}`);
    if (currentSlideContent) {
      currentSlideContent.style.display = 'block';
      gsap.to(currentSlideContent, {
        opacity: 1,
        duration: 0.5,
        ease: 'power2.inOut'
      });
    }

    // Mise à jour des styles des boutons
    this.updateButtonStyles(index);
  }

  updateButtonStyles(activeIndex) {
    // Mise à jour des styles des boutons
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

    // Arrêter les animations précédentes
    this.stopAllAnimations();

    // Animation de la rotation
    gsap.to(this.carModel.rotation, {
      x: config.rot[0],
      y: config.rot[1],
      z: config.rot[2],
      duration: 0.8,
      ease: 'power2.inOut'
    });

    // Animation de l'échelle
    gsap.to(this.carModel.scale, {
      x: config.scale,
      y: config.scale,
      z: config.scale,
      duration: 0.8,
      ease: 'power2.inOut',
      onComplete: () => {
        // Démarrer l'animation spécifique au slide
        this.startSlideSpecificAnimation(slideIndex);
      }
    });
  }

  startSlideSpecificAnimation(slideIndex) {
    switch(slideIndex) {
      case 0:  // Slide 1: Drift statique
        this.startDriftEffect();
        break;
      case 1:  // Slide 2: Battement moteur
        this.startEngineIdleEffect();
        break;
      case 2:  // Slide 3: Vibration démarrage
        this.startVibrationEffect();
        break;
      case 3:  // Slide 4: Zoom subtil
        this.startZoomEffect();
        break;
      case 4:  // Slide 5: Rotation drift
        this.startDynamicRotationEffect();
        break;
      case 5:  // Slide 6: Pulsation
        this.startPulseEffect();
        break;
    }
  }

  // Animation 1: Drift statique (balancement subtil)
  startDriftEffect() {
    if (!this.carModel) return;

    this.stopAllAnimations();

    // Animation de balancement subtil sur l'axe Y (valeurs ajustées)
    this.animations.driftEffect = gsap.to(this.carModel.rotation, {
      y: `+=${Math.PI * 0.05}`,
      duration: 2,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1
    });
  }

  // Animation 2: Battement moteur (vibration légère)
  startEngineIdleEffect() {
    if (!this.carModel) return;

    this.stopAllAnimations();

    // Vibration très subtile (valeurs ajustées pour grande échelle)
    this.animations.engineIdle = gsap.to(this.carModel.position, {
      y: '+=0.1',
      duration: 0.1,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1
    });
  }

  // Animation 3: Vibration démarrage
  startVibrationEffect() {
    if (!this.carModel) return;

    this.stopAllAnimations();

    // Vibration plus intense que l'idle (valeurs ajustées)
    this.animations.vibration = gsap.timeline({repeat: -1});

    // Séquence de vibrations
    this.animations.vibration.to(this.carModel.position, {
      y: '+=0.2',
      x: '-=0.1',
      duration: 0.05,
      ease: 'power1.inOut'
    });

    this.animations.vibration.to(this.carModel.position, {
      y: '-=0.2',
      x: '+=0.1',
      duration: 0.05,
      ease: 'power1.inOut'
    });
  }

  // Animation 4: Zoom subtil
  startZoomEffect() {
    if (!this.carModel) return;

    this.stopAllAnimations();

    // Animation de légère avancée/recul (valeurs ajustées)
    this.animations.zoom = gsap.to(this.carModel.position, {
      z: '+=1',
      duration: 2,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1
    });
  }

  // Animation 5: Rotation drift dynamique
  startDynamicRotationEffect() {
    if (!this.carModel) return;

    this.stopAllAnimations();

    // Rotation oscillante plus rapide qu'en slide 1
    this.animations.dynamicRotation = gsap.timeline({repeat: -1});

    // Rotation plus dynamique
    this.animations.dynamicRotation.to(this.carModel.rotation, {
      y: `+=${Math.PI * 0.1}`,
      duration: 1,
      ease: 'power2.inOut'
    });

    this.animations.dynamicRotation.to(this.carModel.rotation, {
      y: `-=${Math.PI * 0.1}`,
      duration: 1,
      ease: 'power2.inOut'
    });
  }

  // Animation 6: Pulsation (comme un battement de cœur)
  startPulseEffect() {
    if (!this.carModel) return;

    this.stopAllAnimations();

    // Effet de pulsation
    this.animations.pulse = gsap.timeline({repeat: -1});

    // Légère augmentation de taille (valeurs ajustées pour la grande échelle)
    this.animations.pulse.to(this.carModel.scale, {
      x: '+=0.8',
      y: '+=0.8',
      z: '+=0.8',
      duration: 0.8,
      ease: 'sine.inOut'
    });

    // Retour à la taille normale
    this.animations.pulse.to(this.carModel.scale, {
      x: '-=0.8',
      y: '-=0.8',
      z: '-=0.8',
      duration: 0.8,
      ease: 'sine.inOut'
    });
  }

  // Arrêter toutes les animations en cours
  stopAllAnimations() {
    for (const key in this.animations) {
      if (this.animations[key]) {
        this.animations[key].kill();
        this.animations[key] = null;
      }
    }

    // Réinitialiser les petits décalages de position
    if (this.carModel) {
      gsap.to(this.carModel.position, {
        y: 0,
        x: 0,
        duration: 0.2
      });
    }
  }

  update() {
    // Mises à jour à chaque frame si nécessaire
  }
}