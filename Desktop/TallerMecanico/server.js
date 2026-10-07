
const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const archivoDB = path.join(__dirname, "data", "db.json");

const estados = ["Pendiente", "En proceso", "Finalizado"];

// Leer datos
function leerDB() {
  const contenido = fs.readFileSync(archivoDB, "utf8");
  const datos = JSON.parse(contenido);

  return {
    vehiculos: datos.vehiculos || [],
    reparaciones: datos.reparaciones || []
  };
}

// Guardar datos
function guardarDB(datos) {
  fs.writeFileSync(
    archivoDB,
    JSON.stringify(datos, null, 2),
    "utf8"
  );
}

// Generar un identificador único dentro de cada colección
function nuevoId(registros) {
  return Math.max(0, ...registros.map(r => Number(r.id) || 0)) + 1;
}

// Validar datos de vehículos
function validarVehiculo(datos) {
  const { placa, marca, modelo, propietario } = datos;

  return [placa, marca, modelo, propietario].every(
    valor => typeof valor === "string" && valor.trim()
  );
}

// Validar información de reparaciones
function validarReparacion(datos) {
  return (
    typeof datos.servicio === "string" &&
    datos.servicio.trim() &&
    datos.precio !== "" &&
    datos.precio !== null &&
    datos.precio !== undefined &&
    Number.isFinite(Number(datos.precio)) &&
    Number(datos.precio) >= 0
  );
}

// ===============================
// VEHÍCULOS
// ===============================

// CONSULTAR
app.get("/api/vehiculos", (req, res) => {
  res.json(leerDB().vehiculos);
});

// REGISTRAR
app.post("/api/vehiculos", (req, res) => {
  if (!validarVehiculo(req.body)) {
    return res.status(400).json({
      mensaje: "Todos los campos son obligatorios"
    });
  }

  const db = leerDB();
  const { placa, marca, modelo, propietario } = req.body;
  const placaNormalizada = placa.trim().toUpperCase();

  if (db.vehiculos.some(v => v.placa === placaNormalizada)) {
    return res.status(409).json({
      mensaje: "Esta placa ya está registrada"
    });
  }

  const nuevo = {
    id: nuevoId(db.vehiculos),
    placa: placaNormalizada,
    marca: marca.trim(),
    modelo: modelo.trim(),
    propietario: propietario.trim()
  };

  db.vehiculos.push(nuevo);
  guardarDB(db);

  res.status(201).json({
    mensaje: "Vehículo registrado correctamente",
    vehiculo: nuevo
  });
});

// EDITAR
app.put("/api/vehiculos/:id", (req, res) => {
  const db = leerDB();

  const vehiculo = db.vehiculos.find(
    v => v.id === Number(req.params.id)
  );

  if (!vehiculo) {
    return res.status(404).json({
      mensaje: "Vehículo no encontrado"
    });
  }

  if (!validarVehiculo(req.body)) {
    return res.status(400).json({
      mensaje: "Complete todos los campos"
    });
  }

  const { placa, marca, modelo, propietario } = req.body;
  const nuevaPlaca = placa.trim().toUpperCase();

  const existe = db.vehiculos.some(
    v => v.placa === nuevaPlaca && v.id !== vehiculo.id
  );

  if (existe) {
    return res.status(409).json({
      mensaje: "La placa pertenece a otro vehículo"
    });
  }

  vehiculo.placa = nuevaPlaca;
  vehiculo.marca = marca.trim();
  vehiculo.modelo = modelo.trim();
  vehiculo.propietario = propietario.trim();

  guardarDB(db);

  res.json({
    mensaje: "Vehículo actualizado correctamente",
    vehiculo
  });
});

// ELIMINAR
app.delete("/api/vehiculos/:id", (req, res) => {
  const db = leerDB();
  const id = Number(req.params.id);

  const vehiculo = db.vehiculos.find(v => v.id === id);

  if (!vehiculo) {
    return res.status(404).json({
      mensaje: "Vehículo no encontrado"
    });
  }

  // Proteger el historial de reparaciones
  if (db.reparaciones.some(r => r.vehiculoId === id)) {
    return res.status(409).json({
      mensaje: "Elimine primero las reparaciones de este vehículo"
    });
  }

  db.vehiculos = db.vehiculos.filter(v => v.id !== id);
  guardarDB(db);

  res.json({
    mensaje: "Vehículo eliminado correctamente"
  });
});

// ===============================
// REPARACIONES
// ===============================

// CONSULTAR
app.get("/api/reparaciones", (req, res) => {
  const db = leerDB();

  const resultado = db.reparaciones.map(r => {
    const vehiculo = db.vehiculos.find(
      v => v.id === r.vehiculoId
    );

    return {
      ...r,
      placa: vehiculo?.placa || "Desconocido"
    };
  });

  res.json(resultado);
});

// REGISTRAR
app.post("/api/reparaciones", (req, res) => {
  const db = leerDB();
  const { vehiculoId, servicio, precio } = req.body;

  const vehiculo = db.vehiculos.find(
    v => v.id === Number(vehiculoId)
  );

  if (!vehiculo) {
    return res.status(404).json({
      mensaje: "Vehículo no encontrado"
    });
  }

  if (!validarReparacion(req.body)) {
    return res.status(400).json({
      mensaje: "Servicio o precio no válido"
    });
  }

  const nueva = {
    id: nuevoId(db.reparaciones),
    vehiculoId: vehiculo.id,
    servicio: servicio.trim(),
    precio: Number(precio),
    estado: "Pendiente",
    fecha: new Date().toISOString()
  };

  db.reparaciones.push(nueva);
  guardarDB(db);

  res.status(201).json({
    mensaje: "Reparación registrada correctamente",
    reparacion: nueva
  });
});

// EDITAR REPARACIÓN
app.put("/api/reparaciones/:id", (req, res) => {
  const db = leerDB();

  const reparacion = db.reparaciones.find(
    r => r.id === Number(req.params.id)
  );

  if (!reparacion) {
    return res.status(404).json({
      mensaje: "Reparación no encontrada"
    });
  }

  if (!validarReparacion(req.body)) {
    return res.status(400).json({
      mensaje: "Servicio o precio no válido"
    });
  }

  const { servicio, precio, vehiculoId } = req.body;

  const vehiculo = db.vehiculos.find(
    v => v.id === Number(vehiculoId)
  );

  if (!vehiculo) {
    return res.status(404).json({
      mensaje: "Vehículo no encontrado"
    });
  }

  reparacion.vehiculoId = vehiculo.id;
  reparacion.servicio = servicio.trim();
  reparacion.precio = Number(precio);

  guardarDB(db);

  res.json({
    mensaje: "Reparación actualizada correctamente",
    reparacion
  });
});

// ACTUALIZAR ESTADO
app.patch("/api/reparaciones/:id", (req, res) => {
  const db = leerDB();

  const reparacion = db.reparaciones.find(
    r => r.id === Number(req.params.id)
  );

  if (!reparacion) {
    return res.status(404).json({
      mensaje: "Reparación no encontrada"
    });
  }

  if (!estados.includes(req.body.estado)) {
    return res.status(400).json({
      mensaje: "Estado no válido"
    });
  }

  reparacion.estado = req.body.estado;
  guardarDB(db);

  res.json({
    mensaje: "Estado actualizado correctamente"
  });
});

// ELIMINAR REPARACIÓN
app.delete("/api/reparaciones/:id", (req, res) => {
  const db = leerDB();
  const id = Number(req.params.id);

  if (!db.reparaciones.some(r => r.id === id)) {
    return res.status(404).json({
      mensaje: "Reparación no encontrada"
    });
  }

  db.reparaciones = db.reparaciones.filter(
    r => r.id !== id
  );

  guardarDB(db);

  res.json({
    mensaje: "Reparación eliminada correctamente"
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor funcionando en http://localhost:${PORT}`);
});
