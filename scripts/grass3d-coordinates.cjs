// Coordenadas para os testes web, espelhando a câmera fixa base de LawnScene.
// A câmera acompanha o cortador apenas discretamente; a margem do pincel
// preserva os gestos nas bordas durante essa pequena defasagem.
const { PerspectiveCamera, Vector3 } = require('three');

function grass3DPoint(box, [x, y]) {
  const aspect = box.width / box.height;
  const fit = Math.max(1, 0.88 / aspect);
  const camera = new PerspectiveCamera(35, aspect, 0.1, 60);
  camera.position.set(3.32 * fit, 11.5 * fit, 7.98 * fit);
  camera.lookAt(0, 0.15, 0);
  camera.updateMatrixWorld();
  const projected = new Vector3(
    (x / 320 - 0.5) * 4,
    0.16,
    (y / 448 - 0.5) * 5.6,
  ).project(camera);
  return [
    box.x + (projected.x + 1) * box.width / 2,
    box.y + (1 - projected.y) * box.height / 2,
  ];
}

module.exports = { grass3DPoint };
