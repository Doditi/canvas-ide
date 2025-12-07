export const STORAGE_KEY = 'canvas_editor_v1_content';

export const INITIAL_CODE = `
export const config = {
  canvasWidth: 600,
  canvasHeight: 600,
  position: 'center',
  backgroundColor: '#0b0f19',
  fonts: [
    {
      fontName: 'Inter',
      weights: [400, 600],
      subset: 'latin',
      display: 'swap',
      format: 'woff2'
    }
  ]
};

// Fondo oscuro base
ctx.fillStyle = '#111827';
ctx.fillRect(0, 0, config.canvasWidth, config.canvasHeight);

// Configuración de gradiente
const gradient = ctx.createLinearGradient(0, 0, config.canvasWidth, config.canvasHeight);
gradient.addColorStop(0, '#f43f5e'); // Rose
gradient.addColorStop(1, '#6366f1'); // Indigo

// Círculo central
ctx.fillStyle = gradient;
ctx.beginPath();
ctx.arc(300, 300, 150, 0, Math.PI * 2);
ctx.fill();

// Efecto de brillo
ctx.shadowColor = '#f43f5e';
ctx.shadowBlur = 50;

// Texto
ctx.fillStyle = 'white';
ctx.shadowBlur = 0; // Reset shadow para texto nítido
ctx.font = 'bold 40px Inter, sans-serif';
ctx.textAlign = 'center';
ctx.fillText('Canvas Editor', 300, 280);

ctx.font = 'normal 20px Inter, sans-serif';
ctx.fillStyle = '#cbd5e1';
ctx.fillText('Changes are saved automatically', 300, 320);
`.trim();


