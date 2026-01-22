# 🐵 Monkey Ranch

Una página web responsive y moderna para Monkey Ranch, un destino de aventura con pista de motocross, trackday y terraza.

## 🌐 Demo

Visita el sitio: [Monkey Ranch](https://mich281292.github.io/monkey-ranch/)

## ✨ Características

- **Diseño Responsive**: Compatible con dispositivos móviles, tablets y desktop
- **Modo Oscuro/Día**: Tema adaptable con preferencias del navegador
- **Efectos 3D**: Logo con efecto 3D al pasar el mouse
- **Parallax**: Fondo hero con efecto parallax al hacer scroll
- **Imágenes Personalizadas**: Fondos personalizados en cada sección de servicios
- **Navegación Suave**: Desplazamiento suave entre secciones
- **Formulario de Contacto**: Formulario con validación
- **Redes Sociales**: Enlaces a redes sociales en el footer

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Estilos modernos y animaciones
- **JavaScript Vanilla**: Interactividad sin dependencias

## 📁 Estructura del Proyecto

```
monkey-ranch/
├── index.html              # Archivo HTML principal
├── styles.css              # Estilos CSS
├── script.js               # Lógica JavaScript
├── logo-monkey.png         # Logo del sitio
├── monkeyspace.jpg         # Imagen hero
├── carrera1.jpg            # Imagen sección Motocross
├── trackday1.jpg           # Imagen sección Trackday
├── terraza2.jpg            # Imagen sección Terraza
├── README.md               # Este archivo
└── .github/
    ├── copilot-instructions.md
    └── workflows/
```

## 🚀 Cómo Usar

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/Mich281292/monkey-ranch.git
   cd monkey-ranch
   ```

2. **Abre el archivo HTML:**
   - Simplemente abre `index.html` en tu navegador
   - No requiere servidor ni build tools

## 🎨 Personalización

### Cambiar Colores
Los colores están definidos como variables CSS en `styles.css`:
- `--header-bg`: Color del header (actualmente rojo: #b8242f)
- `--accent-color`: Color de acento (actualmente naranja: #ff9800)

### Cambiar Imágenes
Reemplaza los archivos de imagen:
- `logo-monkey.png`: Logo
- `monkeyspace.jpg`: Fondo hero
- `carrera1.jpg`: Motocross
- `trackday1.jpg`: Trackday
- `terraza2.jpg`: Terraza

### Cambiar Textos
Edita el contenido en `index.html`:
- Títulos en etiquetas `<h1>`, `<h2>`, `<h3>`
- Párrafos en etiquetas `<p>`
- Botones en etiquetas `<button>`

## 🌓 Modo Oscuro

El sitio detecta automáticamente la preferencia del navegador (prefers-color-scheme). También puedes:
- Usar el botón de tema en la navegación (🌙/☀️)
- La preferencia se guarda en localStorage

## 📱 Responsividad

El sitio es completamente responsive:
- **Móvil**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 📝 Formulario de Contacto

El formulario valida:
- Nombre requerido
- Email válido
- Mensaje requerido

Los datos se validan en cliente. Para producción, conecta con un backend.

## 🔗 Redes Sociales

Enlaces en el footer hacia:
- Facebook
- Twitter (X)
- Instagram
- YouTube

## 📄 Licencia

Proyecto libre para uso personal y educativo.

## 👤 Autor

Desarrollado para Monkey Ranch MX

## 📞 Contacto

Para consultas o sugerencias, completa el formulario en la página o contacta a través de nuestras redes sociales.

---

**Última actualización:** Enero 2026
