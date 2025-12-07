# Canvas IDE

**Canvas IDE** es una aplicación web que permite previsualizar en tiempo real cómo queda el resultado final de un canvas HTML5, con la posibilidad de agregar fuentes fácilmente, sin tener que crear todo un espacio de desarrollo.

## 🎯 Objetivo

El objetivo de Canvas IDE es proporcionar un entorno de desarrollo rápido y ligero para experimentar y prototipar visualizaciones en canvas HTML5. Permite:

- **Previsualización en tiempo real**: Ver los cambios en el canvas mientras escribes el código
- **Carga fácil de fuentes**: Agregar fuentes desde Font Source CDN sin configuración compleja
- **Sin setup complejo**: Todo funciona directamente en el navegador, sin necesidad de configurar un entorno de desarrollo completo

## 🚀 Cómo funciona

Canvas IDE está dividido en dos paneles principales:

### Panel de Editor (Izquierda)
- Editor de código basado en **Monaco Editor** (el mismo que usa VS Code)
- Resaltado de sintaxis para JavaScript
- Formateo automático de código
- Guardado automático en `localStorage` (cambios se guardan después de 800ms de inactividad)
- Indicador de estado: `Ready`, `Saving`, `Saved`, o `Error`

### Panel de Canvas (Derecha)
- Vista previa en tiempo real del canvas
- Auto-escalado para que el canvas siempre se vea completo
- Fondo con patrón de transparencia para visualizar mejor el canvas
- Información de dimensiones y posición del cursor
- Botón para descargar el canvas como imagen PNG

## 📝 Estructura del Código

El código que escribes debe seguir esta estructura:

```javascript
export const config = {
  canvasWidth: 600,        // Ancho del canvas en píxeles
  canvasHeight: 600,       // Alto del canvas en píxeles
  position: 'center',      // Posición del canvas: 'center', 'top-left', 'top', etc.
  backgroundColor: '#fff', // Color de fondo del viewport
  fonts: [                 // Array de fuentes a cargar
    {
      fontName: 'Inter',
      weights: [400, 600],
      subset: 'latin',
      display: 'swap',
      format: 'woff2'
    }
  ]
};

// Tu código de dibujo aquí
// Tienes acceso a las variables: canvas, ctx, y config
ctx.fillStyle = '#ff0000';
ctx.fillRect(0, 0, config.canvasWidth, config.canvasHeight);
```

### Variables Disponibles

Dentro de tu código tienes acceso a:
- `canvas`: El elemento HTMLCanvasElement
- `ctx`: El contexto 2D del canvas (`canvas.getContext('2d')`)
- `config`: El objeto de configuración que definiste

## 🔤 Carga de Fuentes

Canvas IDE permite cargar fuentes fácilmente desde **Font Source CDN** (jsDelivr). Solo necesitas especificarlas en el array `fonts` de la configuración:

```javascript
export const config = {
  // ... otras configuraciones
  fonts: [
    {
      fontName: 'Inter',           // Nombre de la fuente (debe existir en Font Source)
      weights: [400, 600, 700],    // Pesos de la fuente a cargar
      subset: 'latin',             // Subset de caracteres (por defecto: 'latin')
      display: 'swap',             // Estrategia de carga (por defecto: 'swap')
      format: 'woff2'              // Formato de la fuente (por defecto: 'woff2')
    },
    {
      fontName: 'Roboto',
      weights: [400, 500]
    }
  ]
};
```

Las fuentes se cargan automáticamente cuando cambias la configuración. Puedes usar las fuentes cargadas en tu código:

```javascript
ctx.font = 'bold 40px Inter, sans-serif';
ctx.fillText('Hola Mundo', 100, 100);
```

### Fuentes Disponibles

Puedes usar cualquier fuente disponible en [Font Source](https://fontsource.org/). El nombre de la fuente debe coincidir exactamente con el nombre en Font Source (se normaliza automáticamente a minúsculas con guiones).

## ⚙️ Configuración del Canvas

### Dimensiones
- `canvasWidth`: Ancho del canvas en píxeles (por defecto: 600)
- `canvasHeight`: Alto del canvas en píxeles (por defecto: 600)

### Posicionamiento
El canvas se puede posicionar dentro del viewport usando la propiedad `position`:
- `'center'` (por defecto)
- `'top-left'`, `'top'`, `'top-right'`
- `'left'`, `'right'`
- `'bottom-left'`, `'bottom'`, `'bottom-right'`

### Color de Fondo
- `backgroundColor`: Color de fondo del viewport (por defecto: `'#fff'`)

## 🎨 Características

- ✅ **Actualización en tiempo real**: Los cambios se reflejan automáticamente después de 800ms de inactividad
- ✅ **Guardado automático**: Tu código se guarda en `localStorage` automáticamente
- ✅ **Auto-escalado**: El canvas se ajusta automáticamente para verse completo en el viewport
- ✅ **Información del cursor**: Muestra las coordenadas del cursor sobre el canvas
- ✅ **Descarga de imágenes**: Exporta tu canvas como PNG con un solo clic
- ✅ **Formateo de código**: Formatea tu código con el botón de formateo
- ✅ **Reset**: Restaura el código inicial cuando lo necesites

## 🏗️ Estructura del Proyecto

```
/
├── public/              # Archivos estáticos
├── src/
│   ├── components/      # Componentes React
│   │   ├── CanvasPane.tsx      # Panel de visualización del canvas
│   │   ├── CanvasStudio.tsx    # Componente principal
│   │   └── EditorPane.tsx      # Panel del editor de código
│   ├── pages/
│   │   └── index.astro         # Página principal
│   ├── store/
│   │   └── canvasStore.ts      # Store de Zustand para el estado
│   ├── utils/
│   │   ├── fontLoader.ts       # Utilidades para cargar fuentes
│   │   └── initialCode.ts      # Código inicial por defecto
│   └── styles/
│       └── global.css           # Estilos globales
└── package.json
```

## 🧞 Comandos

Todos los comandos se ejecutan desde la raíz del proyecto:

| Comando                   | Acción                                           |
| :------------------------ | :----------------------------------------------- |
| `pnpm install`            | Instala las dependencias                         |
| `pnpm dev`                | Inicia el servidor de desarrollo en `localhost:4321` |
| `pnpm build`              | Construye el sitio para producción en `./dist/` |
| `pnpm preview`            | Previsualiza la build localmente antes de desplegar |
| `pnpm astro ...`          | Ejecuta comandos CLI de Astro                    |

## 🛠️ Tecnologías Utilizadas

- **Astro**: Framework web para construir la aplicación
- **React**: Para los componentes interactivos
- **Monaco Editor**: Editor de código (mismo que VS Code)
- **Zustand**: Gestión de estado ligera
- **Tailwind CSS**: Estilos utilitarios
- **Font Source CDN**: Carga de fuentes desde jsDelivr

## 📦 Dependencias Principales

- `@monaco-editor/react`: Editor de código
- `zustand`: Store de estado
- `react` y `react-dom`: Framework de UI
- `astro`: Framework web
- `tailwindcss`: Framework CSS

## 💡 Ejemplo de Uso

1. Abre la aplicación en el navegador
2. Escribe tu código en el panel izquierdo
3. Observa la previsualización en tiempo real en el panel derecho
4. Agrega fuentes en la configuración si las necesitas
5. Descarga tu creación como PNG cuando esté lista

---

**Canvas IDE** - Previsualiza y prototipa tus visualizaciones de canvas sin complicaciones.
