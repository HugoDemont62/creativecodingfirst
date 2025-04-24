//Réalisé par claude (merci à lui pour le helper qui ne voulait pas marcher)
import { getWebgl } from '../index.js';

export default class ModelExplorer {
  constructor() {
    // Créer une interface GUI complètement séparée
    this.createStandaloneGUI();

    // Essayer de récupérer le contexte webgl après un délai
    setTimeout(() => {
      try {
        this.webgl = getWebgl();
        this.initializeModelExplorer();
      } catch (error) {
        this.updateStatus(`Erreur lors de la récupération de WebGL: ${error.message}`);
      }
    }, 2000);
  }

  createStandaloneGUI() {
    // Créer un conteneur pour notre GUI personnalisé
    const container = document.createElement('div');
    container.id = 'model-explorer-container';
    container.style.position = 'fixed';
    container.style.top = '10px';
    container.style.right = '10px';
    container.style.width = '400px';
    container.style.backgroundColor = 'rgba(34, 34, 34, 0.9)';
    container.style.color = 'white';
    container.style.padding = '10px';
    container.style.borderRadius = '5px';
    container.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
    container.style.zIndex = '10000';
    container.style.overflow = 'auto';
    container.style.maxHeight = '90vh';
    container.style.fontSize = '14px';
    container.style.fontFamily = 'Arial, sans-serif';

    // Ajouter en-tête avec bouton de fermeture
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '10px';
    header.style.borderBottom = '1px solid #555';
    header.style.paddingBottom = '5px';

    const title = document.createElement('h3');
    title.textContent = 'Explorateur de Modèle 3D';
    title.style.margin = '0';

    const closeButton = document.createElement('button');
    closeButton.textContent = 'X';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.color = 'white';
    closeButton.style.fontSize = '16px';
    closeButton.style.cursor = 'pointer';
    closeButton.onclick = () => {
      container.style.display = 'none';
    };

    header.appendChild(title);
    header.appendChild(closeButton);
    container.appendChild(header);

    // Ajouter un statut pour les messages
    const status = document.createElement('div');
    status.id = 'model-explorer-status';
    status.textContent = 'Initialisation...';
    status.style.padding = '10px';
    status.style.marginBottom = '10px';
    status.style.backgroundColor = 'rgba(50, 50, 50, 0.5)';
    status.style.borderRadius = '3px';
    container.appendChild(status);

    // Ajouter des boutons de débug
    const debugActions = document.createElement('div');
    debugActions.style.display = 'flex';
    debugActions.style.gap = '10px';
    debugActions.style.marginBottom = '10px';

    const inspectButton = document.createElement('button');
    inspectButton.textContent = 'Vérifier WebGL';
    inspectButton.style.padding = '5px 10px';
    inspectButton.style.cursor = 'pointer';
    inspectButton.onclick = () => this.inspectWebGL();

    const refreshButton = document.createElement('button');
    refreshButton.textContent = 'Rafraîchir';
    refreshButton.style.padding = '5px 10px';
    refreshButton.style.cursor = 'pointer';
    refreshButton.onclick = () => this.refreshExplorer();

    debugActions.appendChild(inspectButton);
    debugActions.appendChild(refreshButton);
    container.appendChild(debugActions);

    // Ajouter une section pour explorer le modèle
    const explorer = document.createElement('div');
    explorer.id = 'model-explorer-content';
    container.appendChild(explorer);

    // Ajouter à la page
    document.body.appendChild(container);

    this.container = container;
    this.statusElement = status;
    this.explorerElement = explorer;

    this.updateStatus('Interface initialisée. En attente du modèle 3D...');
  }

  updateStatus(message) {
    if (this.statusElement) {
      this.statusElement.textContent = message;
      console.log('[ModelExplorer]', message);
    }
  }

  inspectWebGL() {
    try {
      this.webgl = getWebgl();

      this.updateStatus('Inspection WebGL:');

      const info = document.createElement('pre');
      info.style.whiteSpace = 'pre-wrap';
      info.style.overflow = 'auto';
      info.style.maxHeight = '300px';
      info.style.backgroundColor = '#111';
      info.style.padding = '10px';
      info.style.borderRadius = '3px';
      info.style.fontSize = '12px';

      const webglInfo = {
        'WebGL disponible': !!this.webgl,
        'Slider disponible': this.webgl ? !!this.webgl.slider : false,
        'CarModel disponible': this.webgl && this.webgl.slider ? !!this.webgl.slider.carModel : false
      };

      if (this.webgl && this.webgl.slider && this.webgl.slider.carModel) {
        const model = this.webgl.slider.carModel;
        webglInfo['Type du modèle'] = model.type;
        webglInfo['Nombre d\'enfants'] = model.children ? model.children.length : 0;
        webglInfo['UUID du modèle'] = model.uuid;
        webglInfo['Position'] = `x:${model.position.x}, y:${model.position.y}, z:${model.position.z}`;

        // Lister les 5 premiers enfants
        if (model.children && model.children.length > 0) {
          webglInfo['Premiers enfants'] = model.children.slice(0, 5).map(child =>
            `${child.name || child.type || 'Sans nom'} (${child.type})`
          );
        }
      }

      info.textContent = JSON.stringify(webglInfo, null, 2);

      // Remplacer le contenu de l'explorateur
      this.explorerElement.innerHTML = '';
      this.explorerElement.appendChild(info);

      // Si le modèle est disponible, proposer d'initialiser l'explorateur
      if (this.webgl && this.webgl.slider && this.webgl.slider.carModel) {
        const initButton = document.createElement('button');
        initButton.textContent = 'Explorer ce modèle';
        initButton.style.display = 'block';
        initButton.style.margin = '10px auto';
        initButton.style.padding = '8px 16px';
        initButton.onclick = () => this.initializeModelExplorer();
        this.explorerElement.appendChild(initButton);
      } else {
        this.updateStatus('Modèle 3D non trouvé. Vérifiez la console pour plus d\'informations.');
      }
    } catch (error) {
      this.updateStatus(`Erreur lors de l'inspection: ${error.message}`);
      console.error('Erreur d\'inspection:', error);
    }
  }

  refreshExplorer() {
    this.updateStatus('Rafraîchissement...');
    this.explorerElement.innerHTML = '';
    setTimeout(() => this.initializeModelExplorer(), 100);
  }

  initializeModelExplorer() {
    try {
      if (!this.webgl) {
        this.webgl = getWebgl();
        if (!this.webgl) {
          this.updateStatus('WebGL non disponible.');
          return;
        }
      }

      if (!this.webgl.slider || !this.webgl.slider.carModel) {
        this.updateStatus('Modèle 3D non trouvé. Vérifiez la console.');
        console.log('État de WebGL:', this.webgl);
        return;
      }

      const model = this.webgl.slider.carModel;
      this.updateStatus(`Modèle trouvé: ${model.type} avec ${model.children ? model.children.length : 0} enfants`);

      // Nettoyer l'explorateur
      this.explorerElement.innerHTML = '';

      // Créer une arborescence pour le modèle
      this.createModelTree(model, this.explorerElement);

      // Ajouter contrôles des roues
      this.createWheelControls();

    } catch (error) {
      this.updateStatus(`Erreur d'initialisation: ${error.message}`);
      console.error('Erreur d\'initialisation:', error);
    }
  }

  createModelTree(object, container, level = 0) {
    if (!object) return; // Supprime la limite de profondeur

    const itemDiv = document.createElement('div');
    itemDiv.style.marginLeft = `${level * 20}px`;
    itemDiv.style.padding = '5px';
    itemDiv.style.borderBottom = '1px solid #444';
    itemDiv.style.display = 'flex';
    itemDiv.style.flexDirection = 'column';

    // En-tête avec le nom et type
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.cursor = 'pointer';

    const objectName = object.name || object.type || `Objet_${object.uuid.substring(0, 5)}`;
    header.innerHTML = `<span><strong>${objectName}</strong> (${object.type})</span>`;

    // Bouton d'expansion
    const expandButton = document.createElement('button');
    expandButton.textContent = '+';
    expandButton.style.background = 'none';
    expandButton.style.border = '1px solid #555';
    expandButton.style.color = 'white';
    expandButton.style.width = '24px';
    expandButton.style.height = '24px';
    expandButton.style.borderRadius = '3px';
    expandButton.style.cursor = 'pointer';
    header.appendChild(expandButton);

    itemDiv.appendChild(header);

    // Zone de détails (cachée par défaut)
    const detailsDiv = document.createElement('div');
    detailsDiv.style.display = 'none';
    detailsDiv.style.padding = '10px';
    detailsDiv.style.backgroundColor = 'rgba(60, 60, 60, 0.3)';
    detailsDiv.style.borderRadius = '3px';
    detailsDiv.style.margin = '5px 0';

    // Ajouter les propriétés de l'objet
    this.addObjectProperties(object, detailsDiv);

    // Ajouter actions
    const actionsDiv = document.createElement('div');
    actionsDiv.style.display = 'flex';
    actionsDiv.style.gap = '10px';
    actionsDiv.style.marginTop = '10px';

    const toggleVisibleBtn = document.createElement('button');
    toggleVisibleBtn.textContent = object.visible ? 'Cacher' : 'Afficher';
    toggleVisibleBtn.onclick = () => {
      object.visible = !object.visible;
      toggleVisibleBtn.textContent = object.visible ? 'Cacher' : 'Afficher';
    };

    const toggleWheelBtn = document.createElement('button');
    toggleWheelBtn.textContent = this.wheels?.includes(object) ? 'Pas une roue' : 'Marquer comme roue';
    toggleWheelBtn.onclick = () => {
      if (!this.wheels) this.wheels = [];

      if (this.wheels.includes(object)) {
        this.wheels = this.wheels.filter(w => w !== object);
        toggleWheelBtn.textContent = 'Marquer comme roue';
      } else {
        this.wheels.push(object);
        toggleWheelBtn.textContent = 'Pas une roue';
      }

      console.log('Roues:', this.wheels.length);
    };

    actionsDiv.appendChild(toggleVisibleBtn);
    actionsDiv.appendChild(toggleWheelBtn);
    detailsDiv.appendChild(actionsDiv);

    // Ajouter enfants si présents
    if (object.children && object.children.length > 0) {
      const childrenDiv = document.createElement('div');
      childrenDiv.style.marginTop = '10px';
      childrenDiv.style.paddingLeft = '10px';
      childrenDiv.style.borderLeft = '1px solid #555';

      // Afficher le nombre d'enfants
      const childCountDiv = document.createElement('div');
      childCountDiv.textContent = `${object.children.length} enfants`;
      childCountDiv.style.marginBottom = '5px';
      childCountDiv.style.color = '#aaa';
      childrenDiv.appendChild(childCountDiv);

      // Créer l'arborescence pour chaque enfant
      object.children.forEach(child => {
        this.createModelTree(child, childrenDiv, level + 1);
      });

      detailsDiv.appendChild(childrenDiv);
    }

    itemDiv.appendChild(detailsDiv);

    // Gérer l'expansion/réduction
    expandButton.onclick = () => {
      if (detailsDiv.style.display === 'none') {
        detailsDiv.style.display = 'block';
        expandButton.textContent = '-';
      } else {
        detailsDiv.style.display = 'none';
        expandButton.textContent = '+';
      }
    };

    container.appendChild(itemDiv);
  }

  addObjectProperties(object, container) {
    const propertiesDiv = document.createElement('div');
    propertiesDiv.style.fontSize = '12px';

    // Afficher les propriétés principales
    const properties = {
      UUID: object.uuid,
      Position: object.position ? `x:${object.position.x.toFixed(2)}, y:${object.position.y.toFixed(2)}, z:${object.position.z.toFixed(2)}` : 'N/A',
      Rotation: object.rotation ? `x:${object.rotation.x.toFixed(2)}, y:${object.rotation.y.toFixed(2)}, z:${object.rotation.z.toFixed(2)}` : 'N/A',
      Scale: object.scale ? `x:${object.scale.x.toFixed(2)}, y:${object.scale.y.toFixed(2)}, z:${object.scale.z.toFixed(2)}` : 'N/A',
      'Type matériau': object.material ? (Array.isArray(object.material) ? `Multiples (${object.material.length})` : object.material.type) : 'N/A',
      'Type géométrie': object.geometry ? object.geometry.type : 'N/A'
    };

    for (const [key, value] of Object.entries(properties)) {
      const propDiv = document.createElement('div');
      propDiv.style.margin = '3px 0';
      propDiv.innerHTML = `<span style="color:#aaa">${key}:</span> ${value}`;
      propertiesDiv.appendChild(propDiv);
    }

    container.appendChild(propertiesDiv);
  }

  createWheelControls() {
    if (!this.wheels) this.wheels = [];

    const wheelControlsDiv = document.createElement('div');
    wheelControlsDiv.style.marginTop = '20px';
    wheelControlsDiv.style.padding = '10px';
    wheelControlsDiv.style.backgroundColor = 'rgba(40, 40, 40, 0.7)';
    wheelControlsDiv.style.borderRadius = '5px';

    const title = document.createElement('h4');
    title.textContent = 'Contrôles des roues';
    title.style.margin = '0 0 10px 0';
    wheelControlsDiv.appendChild(title);

    // Afficher le nombre de roues
    const wheelCountDiv = document.createElement('div');
    wheelCountDiv.textContent = `${this.wheels.length} roues définies`;
    wheelCountDiv.style.marginBottom = '10px';
    wheelControlsDiv.appendChild(wheelCountDiv);

    // Contrôles de rotation
    const controlsDiv = document.createElement('div');
    controlsDiv.style.display = 'grid';
    controlsDiv.style.gridTemplateColumns = '1fr 1fr';
    controlsDiv.style.gap = '10px';

    // Vitesse de rotation
    const speedDiv = document.createElement('div');
    speedDiv.innerHTML = '<label>Vitesse de rotation:</label>';
    const speedInput = document.createElement('input');
    speedInput.type = 'range';
    speedInput.min = '-0.5';
    speedInput.max = '0.5';
    speedInput.step = '0.01';
    speedInput.value = '0';
    speedInput.style.width = '100%';
    speedDiv.appendChild(speedInput);

    // Afficher la valeur
    const speedValue = document.createElement('span');
    speedValue.textContent = '0';
    speedValue.style.marginLeft = '5px';
    speedDiv.appendChild(speedValue);

    speedInput.oninput = () => {
      speedValue.textContent = speedInput.value;
    };

    controlsDiv.appendChild(speedDiv);

    // Axe de rotation
    const axisDiv = document.createElement('div');
    axisDiv.innerHTML = '<label>Axe de rotation:</label>';
    const axisSelect = document.createElement('select');
    axisSelect.style.width = '100%';
    axisSelect.style.padding = '5px';
    ['x', 'y', 'z'].forEach(axis => {
      const option = document.createElement('option');
      option.value = axis;
      option.textContent = axis.toUpperCase();
      axisSelect.appendChild(option);
    });
    axisDiv.appendChild(axisSelect);
    controlsDiv.appendChild(axisDiv);

    wheelControlsDiv.appendChild(controlsDiv);

    // Boutons de contrôle
    const buttonsDiv = document.createElement('div');
    buttonsDiv.style.display = 'flex';
    buttonsDiv.style.justifyContent = 'space-between';
    buttonsDiv.style.marginTop = '10px';

    const startButton = document.createElement('button');
    startButton.textContent = 'Démarrer rotation';
    startButton.style.flex = '1';
    startButton.style.marginRight = '5px';
    startButton.style.padding = '8px';
    startButton.onclick = () => {
      this.startWheelRotation(parseFloat(speedInput.value), axisSelect.value);
      wheelCountDiv.textContent = `${this.wheels.length} roues en rotation`;
    };

    const stopButton = document.createElement('button');
    stopButton.textContent = 'Arrêter rotation';
    stopButton.style.flex = '1';
    stopButton.style.marginLeft = '5px';
    stopButton.style.padding = '8px';
    stopButton.onclick = () => {
      this.stopWheelRotation();
      wheelCountDiv.textContent = `${this.wheels.length} roues définies`;
    };

    buttonsDiv.appendChild(startButton);
    buttonsDiv.appendChild(stopButton);

    wheelControlsDiv.appendChild(buttonsDiv);

    this.explorerElement.appendChild(wheelControlsDiv);
  }

  wheels = [];
  wheelAnimationId = null;

  startWheelRotation(speed, axis = 'x') {
    this.stopWheelRotation();

    if (this.wheels.length === 0) {
      this.updateStatus('Aucune roue définie. Marquez des objets comme roues d\'abord.');
      return;
    }

    const animate = () => {
      this.wheels.forEach(wheel => {
        if (wheel && wheel.rotation) {
          wheel.rotation[axis] += speed;
        }
      });

      this.wheelAnimationId = requestAnimationFrame(animate);
    };

    animate();
    this.updateStatus(`Rotation des roues sur l'axe ${axis.toUpperCase()} à la vitesse ${speed}`);
  }

  stopWheelRotation() {
    if (this.wheelAnimationId !== null) {
      cancelAnimationFrame(this.wheelAnimationId);
      this.wheelAnimationId = null;
      this.updateStatus('Rotation des roues arrêtée');
    }
  }
}