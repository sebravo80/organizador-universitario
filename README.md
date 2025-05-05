# Organizador Universitario de la Diatomea

Aplicación web completa para organizar actividades universitarias, entre otras cosas.
Esta idea nació porque mi señora me pidió un excel para hacer lo mismo, 
pero se veia muy rudimentario asi que empecé a desarrollar esto :D

# Características actuales

- **Gestión de tareas**: Permite organuzar tareas por cursos, prioridades y fechas de entrega
- **Calendario semanal**: Una vista de los eventos y fechas importantes
- **Lista de pendientes**: Una lista donde puedes añadir cosas que en algún momento vas a hacer
- **Gestión de ramos**: Permite agregar tus ramos de la universidad con colores distintivos 
- **Calculadora de notas**: Calcula tus promedios ponderados
- **Perfil de usuario**: Cambia tu información y preferencias

## Tecnologías utilizadas

- **Frontend**: React, Material UI, FullCalendar, Axios
- **Backend**: Node.js, Express, MongoDB 
- **Autenticación**: JWT tokens
- **Optimización**: React.memo, useMemo, Lazy Loading

## Requisitos

- Node.js 14.x o superior
- MongoDB 4.x o superior
- NPM 6.x o superior

## Instalación

1. Clona este repositorio
2. Instala las dependencias del backend: 'cd backend && npm install'
3. Instala las dependencias del frontend: 'cd frontend && npm install'
4. Configura las variables de entorno
5. Inicia MongoDB
6. Inicia el backend: 'cd backend && npm start'
7. Inicia el frontend: 'cd frontend && npm start'

## Licencia

[MIT](LICENSE)
