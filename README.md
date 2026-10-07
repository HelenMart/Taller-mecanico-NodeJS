# TALLER PRO — Sistema de Gestión de Taller Mecánico

**Desarrollado por:** Helen Elizabeth Martinez Soloj  
**Tecnología principal:** Node.js  
**Repositorio:** https://github.com/HelenMart/Taller-mecanico-NodeJS

## Descripción del proyecto

TALLER PRO es un sistema web desarrollado con Node.js y Express que permite administrar los vehículos y las reparaciones de un taller mecánico.

El objetivo del proyecto es facilitar el registro, consulta, actualización y eliminación de información mediante una interfaz sencilla y organizada.

## Funcionalidades

- Registrar vehículos con placa, marca, modelo y propietario.
- Consultar los vehículos registrados.
- Editar y eliminar vehículos.
- Registrar reparaciones y sus respectivos costos.
- Modificar los datos de las reparaciones.
- Controlar el estado de las reparaciones: Pendiente, En proceso y Finalizado.
- Consultar estadísticas de vehículos, reparaciones e ingresos estimados.
- Almacenar información permanentemente mediante un archivo JSON.

## Tecnologías utilizadas

| Tecnología | Función |
|---|---|
| Node.js | Ejecución de JavaScript del lado del servidor |
| Express.js | Creación de la API REST |
| HTML5 | Estructura de la interfaz |
| CSS3 | Diseño y presentación visual |
| JavaScript | Interactividad y consumo de la API |
| JSON | Almacenamiento de información |
| Git y GitHub | Control de versiones |

## Estructura del proyecto

```text
TallerMecanico/
├── data/
│   └── db.json
├── public/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── server.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

## Instalación y ejecución

**1. Clonar el repositorio**

```bash
git clone https://github.com/HelenMart/Taller-mecanico-NodeJS.git
```

**2. Ingresar a la carpeta del proyecto**

```bash
cd Taller-mecanico-NodeJS
```

**3. Instalar dependencias**

```bash
npm install
```

**4. Iniciar el servidor**

```bash
npm start
```

**5. Abrir la aplicación**

Ingresar desde el navegador a:

http://localhost:3000

Se requiere tener Node.js instalado.

## Funcionamiento de la API

El sistema utiliza los métodos HTTP para realizar las operaciones CRUD.

| Método | Ruta | Descripción |
|---|---|---|
| GET | /api/vehiculos | Consultar vehículos |
| POST | /api/vehiculos | Registrar vehículo |
| PUT | /api/vehiculos/:id | Actualizar vehículo |
| DELETE | /api/vehiculos/:id | Eliminar vehículo |
| GET | /api/reparaciones | Consultar reparaciones |
| POST | /api/reparaciones | Registrar reparación |
| PUT | /api/reparaciones/:id | Editar reparación |
| PATCH | /api/reparaciones/:id | Actualizar estado |
| DELETE | /api/reparaciones/:id | Eliminar reparación |

## Aprendizajes obtenidos

Durante el desarrollo de este proyecto reforcé mis conocimientos sobre JavaScript y aprendí a utilizar Node.js y Express para construir una aplicación web con operaciones CRUD.

Lo más interesante fue comprender cómo se comunica la interfaz con el servidor utilizando solicitudes HTTP y cómo se actualiza la información de los vehículos y reparaciones.

Uno de los aspectos que anteriormente no comprendía completamente era el almacenamiento de información mediante archivos JSON. Ahora entiendo cómo Node.js puede leer, modificar y guardar registros utilizando el módulo `fs`.

También reforcé mis conocimientos sobre Git y GitHub para administrar y publicar un proyecto.

## Conclusión

Este proyecto me permitió comprender mejor la estructura y el funcionamiento de una aplicación web desarrollada con Node.js.

Además, pude aplicar conocimientos de programación, desarrollo de API REST, almacenamiento de datos y control de versiones mediante un sistema práctico.

---

**Proyecto académico desarrollado por Helen Elizabeth Martinez Soloj.**