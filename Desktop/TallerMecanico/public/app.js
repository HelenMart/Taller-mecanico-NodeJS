
const formVehiculo = document.getElementById("formVehiculo");
const formReparacion = document.getElementById("formReparacion");
const mensaje = document.getElementById("mensaje");

const tablaVehiculos = document.getElementById("tablaVehiculos");
const tablaReparaciones = document.getElementById("tablaReparaciones");
const selectorVehiculo = document.getElementById("vehiculoId");

let vehiculos = [];
let reparaciones = [];
let editandoVehiculo = null;
let editandoReparacion = null;

function mostrarMensaje(texto) {
  mensaje.textContent = texto;
}

async function solicitar(url, opciones) {
  const respuesta = await fetch(url, opciones);
  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.mensaje || "Error en la solicitud");
  }

  return datos;
}

function opcionesJSON(method, datos) {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos)
  };
}

function crearCelda(fila, texto) {
  const celda = fila.insertCell();
  celda.textContent = texto;
  return celda;
}

function crearBoton(texto, clase, accion) {
  const boton = document.createElement("button");
  boton.textContent = texto;
  boton.className = clase;
  boton.type = "button";
  boton.addEventListener("click", accion);
  return boton;
}

// ===============================
// VEHÍCULOS
// ===============================

async function cargarVehiculos() {
  vehiculos = await solicitar("/api/vehiculos");

  tablaVehiculos.innerHTML = "";
  selectorVehiculo.innerHTML =
    '<option value="">Seleccione vehículo</option>';

  document.getElementById("total").textContent =
    vehiculos.length;

  vehiculos.forEach(v => {
    const fila = tablaVehiculos.insertRow();

    crearCelda(fila, v.placa);
    crearCelda(fila, v.marca);
    crearCelda(fila, v.modelo);
    crearCelda(fila, v.propietario);

    const acciones = fila.insertCell();
    acciones.className = "acciones";

    acciones.appendChild(
      crearBoton("Editar", "btn-editar", () => editarVehiculo(v.id))
    );

    acciones.appendChild(
      crearBoton("Eliminar", "btn-eliminar", () => eliminarVehiculo(v.id))
    );

    const opcion = document.createElement("option");
    opcion.value = v.id;
    opcion.textContent = `${v.placa} - ${v.marca}`;
    selectorVehiculo.appendChild(opcion);
  });
}

function editarVehiculo(id) {
  const v = vehiculos.find(item => item.id === id);
  if (!v) return;

  editandoVehiculo = id;

  document.getElementById("placa").value = v.placa;
  document.getElementById("marca").value = v.marca;
  document.getElementById("modelo").value = v.modelo;
  document.getElementById("propietario").value = v.propietario;

  document.getElementById("tituloVehiculo").textContent =
    "Editar vehículo";

  document.getElementById("btnVehiculo").textContent =
    "Guardar cambios";

  document.getElementById("cancelarVehiculo")
    .classList.remove("oculto");

  formVehiculo.scrollIntoView({ behavior: "smooth" });
}

function cancelarEdicionVehiculo() {
  editandoVehiculo = null;
  formVehiculo.reset();

  document.getElementById("tituloVehiculo").textContent =
    "Registrar vehículo";

  document.getElementById("btnVehiculo").textContent =
    "Registrar vehículo";

  document.getElementById("cancelarVehiculo")
    .classList.add("oculto");
}

document.getElementById("cancelarVehiculo")
  .addEventListener("click", cancelarEdicionVehiculo);

async function eliminarVehiculo(id) {
  if (!confirm("¿Desea eliminar este vehículo?")) return;

  try {
    const resultado = await solicitar(`/api/vehiculos/${id}`, {
      method: "DELETE"
    });

    if (editandoVehiculo === id) cancelarEdicionVehiculo();

    mostrarMensaje(resultado.mensaje);
    await cargarVehiculos();
  } catch (error) {
    mostrarMensaje(error.message);
  }
}

formVehiculo.addEventListener("submit", async evento => {
  evento.preventDefault();

  const datos = {
    placa: document.getElementById("placa").value.trim(),
    marca: document.getElementById("marca").value.trim(),
    modelo: document.getElementById("modelo").value.trim(),
    propietario: document.getElementById("propietario").value.trim()
  };

  const editando = editandoVehiculo !== null;

  const url = editando
    ? `/api/vehiculos/${editandoVehiculo}`
    : "/api/vehiculos";

  try {
    const resultado = await solicitar(
      url,
      opcionesJSON(editando ? "PUT" : "POST", datos)
    );

    cancelarEdicionVehiculo();
    mostrarMensaje(resultado.mensaje);

    await cargarVehiculos();
    await cargarReparaciones();
  } catch (error) {
    mostrarMensaje(error.message);
  }
});

// ===============================
// REPARACIONES
// ===============================

async function cargarReparaciones() {
  reparaciones = await solicitar("/api/reparaciones");
  tablaReparaciones.innerHTML = "";

  document.getElementById("totalReparaciones").textContent =
    reparaciones.length;

  const total = reparaciones.reduce(
    (suma, r) => suma + r.precio, 0
  );

  document.getElementById("ingresos").textContent =
    total.toFixed(2);

  reparaciones.forEach(r => {
    const fila = tablaReparaciones.insertRow();

    crearCelda(fila, r.placa);
    crearCelda(fila, r.servicio);
    crearCelda(fila, `Q ${r.precio.toFixed(2)}`);

    const celdaEstado = fila.insertCell();
    const select = document.createElement("select");

    ["Pendiente", "En proceso", "Finalizado"].forEach(estado => {
      const opcion = document.createElement("option");
      opcion.value = estado;
      opcion.textContent = estado;
      opcion.selected = estado === r.estado;
      select.appendChild(opcion);
    });

    select.addEventListener("change", async () => {
      try {
        const resultado = await solicitar(
          `/api/reparaciones/${r.id}`,
          opcionesJSON("PATCH", { estado: select.value })
        );

        mostrarMensaje(resultado.mensaje);
        await cargarReparaciones();
      } catch (error) {
        mostrarMensaje(error.message);
        await cargarReparaciones();
      }
    });

    celdaEstado.appendChild(select);

    const acciones = fila.insertCell();
    acciones.className = "acciones";

    acciones.appendChild(
      crearBoton("Editar", "btn-editar", () => editarReparacion(r.id))
    );

    acciones.appendChild(
      crearBoton("Eliminar", "btn-eliminar", () => eliminarReparacion(r.id))
    );
  });
}

function editarReparacion(id) {
  const r = reparaciones.find(item => item.id === id);
  if (!r) return;

  editandoReparacion = id;

  selectorVehiculo.value = r.vehiculoId;
  document.getElementById("servicio").value = r.servicio;
  document.getElementById("precio").value = r.precio;

  document.getElementById("tituloReparacion").textContent =
    "Editar reparación";

  document.getElementById("btnReparacion").textContent =
    "Guardar cambios";

  document.getElementById("cancelarReparacion")
    .classList.remove("oculto");

  formReparacion.scrollIntoView({ behavior: "smooth" });
}

function cancelarEdicionReparacion() {
  editandoReparacion = null;
  formReparacion.reset();

  document.getElementById("tituloReparacion").textContent =
    "Registrar reparación";

  document.getElementById("btnReparacion").textContent =
    "Registrar reparación";

  document.getElementById("cancelarReparacion")
    .classList.add("oculto");
}

document.getElementById("cancelarReparacion")
  .addEventListener("click", cancelarEdicionReparacion);

async function eliminarReparacion(id) {
  if (!confirm("¿Desea eliminar esta reparación?")) return;

  try {
    const resultado = await solicitar(`/api/reparaciones/${id}`, {
      method: "DELETE"
    });

    if (editandoReparacion === id) cancelarEdicionReparacion();

    mostrarMensaje(resultado.mensaje);
    await cargarReparaciones();
  } catch (error) {
    mostrarMensaje(error.message);
  }
}

formReparacion.addEventListener("submit", async evento => {
  evento.preventDefault();

  const datos = {
    vehiculoId: Number(selectorVehiculo.value),
    servicio: document.getElementById("servicio").value,
    precio: document.getElementById("precio").value
  };

  const editando = editandoReparacion !== null;

  const url = editando
    ? `/api/reparaciones/${editandoReparacion}`
    : "/api/reparaciones";

  try {
    const resultado = await solicitar(
      url,
      opcionesJSON(editando ? "PUT" : "POST", datos)
    );

    cancelarEdicionReparacion();
    mostrarMensaje(resultado.mensaje);
    await cargarReparaciones();
  } catch (error) {
    mostrarMensaje(error.message);
  }
});

// Iniciar sistema
async function iniciar() {
  try {
    await cargarVehiculos();
    await cargarReparaciones();
  } catch (error) {
    mostrarMensaje(error.message);
  }
}

iniciar();
