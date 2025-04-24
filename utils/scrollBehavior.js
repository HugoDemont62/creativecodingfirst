import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

// Enregistrer les plugins
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export function initScrollBehavior() {
  // Récupération des éléments slides
  const slides = document.querySelectorAll('.slide-content');
  const totalSlides = slides.length;

  // Variables pour gérer le scroll manuel
  let isScrolling = false;
  let currentSlide = 0;

  // Fonction pour changer de slide
  function goToSlide(index) {
    // Ne rien faire si on est déjà sur ce slide ou en cours d'animation
    if (index === currentSlide || isScrolling) return;

    // Limiter l'index aux limites des slides disponibles
    index = Math.max(0, Math.min(index, totalSlides - 1));

    // Marquer comme en cours de scroll
    isScrolling = true;

    // Utiliser le système de slider si disponible
    if (window.webgl && window.webgl.slider) {
      window.webgl.slider.goToSlide(index);
    }

    // Mettre à jour les boutons de navigation
    document.querySelectorAll('#menu button[data-slide]').forEach((btn, i) => {
      if (i === index) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Mettre à jour le slide actuel
    currentSlide = index;

    // Marquer comme fin de scroll après animation
    setTimeout(() => {
      isScrolling = false;
    }, 1000);
  }

  // Gérer l'événement de scroll
  function handleWheel(e) {
    e.preventDefault();

    // Ne pas traiter si déjà en cours de scroll
    if (isScrolling) return;

    if (e.deltaY > 0) {
      // Scroll vers le bas -> slide suivant
      goToSlide(currentSlide + 1);
    } else {
      // Scroll vers le haut -> slide précédent
      goToSlide(currentSlide - 1);
    }
  }

  // Ajouter l'écouteur d'événement sur window
  window.addEventListener('wheel', handleWheel, { passive: false });

  // Gérer les événements tactiles (pour mobile)
  let touchStartY = 0;
  let touchEndY = 0;

  function handleTouchStart(e) {
    touchStartY = e.touches[0].clientY;
  }

  function handleTouchEnd(e) {
    touchEndY = e.changedTouches[0].clientY;

    // Calculer la direction du swipe
    const diff = touchStartY - touchEndY;

    // Seuil pour considérer comme un swipe
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swipe vers le haut -> slide suivant
        goToSlide(currentSlide + 1);
      } else {
        // Swipe vers le bas -> slide précédent
        goToSlide(currentSlide - 1);
      }
    }
  }

  // Ajouter les écouteurs d'événements tactiles
  document.addEventListener('touchstart', handleTouchStart, { passive: false });
  document.addEventListener('touchend', handleTouchEnd, { passive: false });

  // Gérer les clics sur les boutons de navigation
  document.querySelectorAll('#menu button[data-slide]').forEach(button => {
    button.addEventListener('click', () => {
      const targetSlide = parseInt(button.dataset.slide, 10);
      goToSlide(targetSlide);
    });
  });

  // Boutons précédent/suivant
  document.getElementById('prev-slide').addEventListener('click', () => {
    goToSlide(currentSlide - 1);
  });

  document.getElementById('next-slide').addEventListener('click', () => {
    goToSlide(currentSlide + 1);
  });

  // Événements clavier (flèches)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      goToSlide(currentSlide + 1);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      goToSlide(currentSlide - 1);
    } else if (e.key >= '1' && e.key <= String(totalSlides)) {
      // Si l'utilisateur appuie sur un chiffre, aller directement à ce slide
      goToSlide(parseInt(e.key) - 1);
    }
  });

  // Fonction pour initialiser l'affichage du premier slide
  function initFirstSlide() {
    // Cacher tous les slides sauf le premier
    slides.forEach((slide, index) => {
      if (index === 0) {
        slide.style.display = 'block';
        slide.style.opacity = '1';
      } else {
        slide.style.display = 'none';
        slide.style.opacity = '0';
      }
    });

    // Activer le premier bouton
    document.querySelectorAll('#menu button[data-slide]').forEach((btn, i) => {
      if (i === 0) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // Initialiser le premier slide
  initFirstSlide();

  // Retourner une fonction pour nettoyer les écouteurs d'événements si nécessaire
  return {
    destroy: () => {
      window.removeEventListener('wheel', handleWheel);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    },
    goToSlide
  };
}