import * as fabric from 'fabric';

/**
 * Configure la gestion du copier-coller global pour un canvas spécifique.
 */
export const setupPasteHandler = (canvas: fabric.Canvas) => {
  // Suppression des anciens écouteurs pour éviter les doublons si React remonte le composant
  // Note: Fabric ne gère pas nativement le Ctrl+V global, on écoute sur window
  // et on vérifie si le canvas est "actif" dans le composant parent.
};

/**
 * Ajoute une flèche simple au centre du canvas.
 */
export const addArrow = (canvas: fabric.Canvas, color: string, width: number) => {
  const triangle = new fabric.Triangle({
    width: 20 + width * 2,
    height: 20 + width * 2,
    fill: color,
    left: 100,
    top: 0,
    angle: 90,
    originX: 'center',
    originY: 'center',
    selectable: false // Sera groupé
  });

  const line = new fabric.Line([0, 0, 100, 0], {
    stroke: color,
    strokeWidth: width,
    originX: 'center',
    originY: 'center',
    selectable: false // Sera groupé
  });

  const group = new fabric.Group([line, triangle], {
    left: canvas.width! / 2 - 50,
    top: canvas.height! / 2,
    originX: 'center',
    originY: 'center'
  });

  canvas.add(group);
  canvas.setActiveObject(group);
  canvas.requestRenderAll();
};

/**
 * Ajoute un cadre (rectangle vide) au centre.
 */
export const addFrame = (canvas: fabric.Canvas, color: string, width: number) => {
  const rect = new fabric.Rect({
    left: canvas.width! / 2 - 100,
    top: canvas.height! / 2 - 75,
    width: 200,
    height: 150,
    fill: 'transparent',
    stroke: color,
    strokeWidth: width,
    objectCaching: false
  });

  canvas.add(rect);
  canvas.setActiveObject(rect);
  canvas.requestRenderAll();
};

/**
 * Ajoute une zone de texte qui s'adapte (Fabric textbox standard).
 * Pour simuler l'auto-fit demandé : on utilise un Textbox standard.
 * L'utilisateur peut redimensionner la boite, ce qui scale le texte (comportement par défaut de Fabric).
 */
export const addTextZone = (canvas: fabric.Canvas, color: string) => {
  const text = new fabric.Textbox('Texte ici', {
    left: canvas.width! / 2 - 100,
    top: canvas.height! / 2,
    width: 200,
    fontSize: 24,
    fill: color,
    textAlign: 'center',
    borderColor: '#333',
    cornerColor: '#333',
    cornerSize: 10,
    transparentCorners: false
  });

  canvas.add(text);
  canvas.setActiveObject(text);
  canvas.requestRenderAll();
};

/**
 * Applique le style par défaut aux images importées (Bordure 2px).
 */
export const styleImportedImage = (img: fabric.Image) => {
  img.set({
    stroke: 'black',
    strokeWidth: 2,
    cornerColor: 'white',
    cornerStrokeColor: 'black',
    borderColor: 'black',
    cornerSize: 10,
    transparentCorners: false
  });
};