export const STORAGE_KEY = 'canvas_editor_v1_content';

export const INITIAL_CODE = `
export const config = {
  canvasWidth: 800,
  canvasHeight: 600,
  position: 'center',
  backgroundColor: '#f8fafc',
  fonts: [
    {
      fontName: 'Inter',
      weights: [400, 500, 600],
      subset: 'latin',
      display: 'swap',
      format: 'woff2'
    }
  ]
};

// Fondo
ctx.fillStyle = config.backgroundColor;
ctx.fillRect(0, 0, config.canvasWidth, config.canvasHeight);

// Gradiente sutil para el área principal
const gradient = ctx.createLinearGradient(0, 0, config.canvasWidth, config.canvasHeight);
gradient.addColorStop(0, '#ffffff');
gradient.addColorStop(1, '#f1f5f9');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, config.canvasWidth, config.canvasHeight);

// Título principal
ctx.font = '600 56px Inter, sans-serif';
ctx.fillStyle = '#0f172a';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';

const titleText = 'Canvas IDE';
const titleMetrics = ctx.measureText(titleText);
const titleX = config.canvasWidth / 2;
const titleY = config.canvasHeight / 2 - 40;

ctx.fillText(titleText, titleX, titleY);

// Subtítulo
ctx.font = '400 18px Inter, sans-serif';
ctx.fillStyle = '#64748b';

const subtitleText = 'Previsualiza tu canvas en tiempo real';
const subtitleMetrics = ctx.measureText(subtitleText);
const subtitleX = config.canvasWidth / 2;
const subtitleY = titleY + 60;

ctx.fillText(subtitleText, subtitleX, subtitleY);

// Línea decorativa sutil
const lineY = subtitleY + 35;
ctx.strokeStyle = '#e2e8f0';
ctx.lineWidth = 1;
ctx.beginPath();
ctx.moveTo(config.canvasWidth / 2 - 80, lineY);
ctx.lineTo(config.canvasWidth / 2 + 80, lineY);
ctx.stroke();

// Texto informativo
ctx.font = '500 14px Inter, sans-serif';
ctx.fillStyle = '#94a3b8';

const infoText = 'Los cambios se guardan automáticamente';
const infoMetrics = ctx.measureText(infoText);
const infoX = config.canvasWidth / 2;
const infoY = lineY + 30;

ctx.fillText(infoText, infoX, infoY);
`.trim();


