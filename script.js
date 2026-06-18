// SISTEMA NOCTRA CON LOCALSTORAGE

document.addEventListener("DOMContentLoaded", function () {
  cargarReservaParaEditar();
  guardarReserva();
  guardarPostulacion();
  crearGlobitoNoctra();
  saludoSegunHorario();
  mostrarResumenGracias();
  cargarReservas();
  cargarPostulaciones();
  cargarPedidoComida();
  cargarPagoComida();
});

/* FUNCIONES BASE */

function obtenerDatos(clave) {
  return JSON.parse(localStorage.getItem(clave)) || [];
}

function guardarDatos(clave, datos) {
  localStorage.setItem(clave, JSON.stringify(datos));
}

function mostrarNotificacion(mensaje, tipo = "ok") {
  const anterior = document.querySelector(".notificacion-noctra");
  if (anterior) anterior.remove();

  const notificacion = document.createElement("div");
  notificacion.className = "notificacion-noctra " + tipo;
  notificacion.textContent = mensaje;

  document.body.appendChild(notificacion);

  setTimeout(function () {
    notificacion.classList.add("activa");
  }, 50);

  setTimeout(function () {
    notificacion.classList.remove("activa");

    setTimeout(function () {
      notificacion.remove();
    }, 400);
  }, 2800);
}

function obtenerValor(id) {
  const elemento = document.getElementById(id);
  return elemento ? elemento.value.trim() : "";
}

function ponerValor(id, valor) {
  const elemento = document.getElementById(id);
  if (elemento) elemento.value = valor || "";
}

function fechaHoraReserva(fecha, horario) {
  return new Date(fecha + "T" + horario);
}

function reservaEstaVencida(reserva) {
  if (!reserva.fecha || !reserva.horario) return false;
  return fechaHoraReserva(reserva.fecha, reserva.horario) < new Date();
}

/* VALIDACIÓN RESERVA */

function validarReserva(reserva) {
  if (!reserva.nombre || !reserva.email || !reserva.fecha || !reserva.horario) {
    mostrarNotificacion("Completá como mínimo nombre, email, día y horario.", "error");
    return false;
  }

  if (Number(reserva.personas) > 20) {
    mostrarNotificacion("Para reservas de más de 20 personas, contactanos directamente por WhatsApp.", "error");
    return false;
  }

  if (Number(reserva.personas) < 1) {
    mostrarNotificacion("La cantidad mínima es 1 persona.", "error");
    return false;
  }

  const fechaReserva = fechaHoraReserva(reserva.fecha, reserva.horario);

  if (fechaReserva < new Date()) {
    mostrarNotificacion("No se puede reservar en una fecha u horario que ya pasó.", "error");
    return false;
  }

  return true;
}

/* CARGAR RESERVA PARA EDITAR */

function cargarReservaParaEditar() {
  const form = document.getElementById("form-reserva") || document.getElementById("form-reserva-noctra");
  if (!form) return;

  const idEditando = localStorage.getItem("reservaEditandoNoctra");
  if (!idEditando) return;

  const reservas = obtenerDatos("reservasNoctra");
  const reserva = reservas.find(function (r) {
    return Number(r.id) === Number(idEditando);
  });

  if (!reserva) {
    localStorage.removeItem("reservaEditandoNoctra");
    return;
  }

  ponerValor("nombre", reserva.nombre);
  ponerValor("email", reserva.email);
  ponerValor("telefono", reserva.telefono);
  ponerValor("motivo", reserva.motivo);
  ponerValor("fecha", reserva.fecha);
  ponerValor("horario", reserva.horario);
  ponerValor("personas", reserva.personas);
  ponerValor("mensaje", reserva.mensaje);

  const boton = form.querySelector("button[type='submit']");
  if (boton) boton.textContent = "GUARDAR CAMBIOS";
}

/* GUARDAR / EDITAR RESERVA */

function guardarReserva() {
  const form = document.getElementById("form-reserva") || document.getElementById("form-reserva-noctra");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const idEditando = localStorage.getItem("reservaEditandoNoctra");

    const nuevaReserva = {
      id: idEditando ? Number(idEditando) : Date.now(),
      tipo: "reserva",
      nombre: obtenerValor("nombre"),
      email: obtenerValor("email"),
      telefono: obtenerValor("telefono"),
      motivo: obtenerValor("motivo"),
      fecha: obtenerValor("fecha"),
      horario: obtenerValor("horario"),
      personas: obtenerValor("personas") || "1",
      mensaje: obtenerValor("mensaje"),
      estado: "activa",
      comida: null
    };

    if (!validarReserva(nuevaReserva)) return;

    let reservas = obtenerDatos("reservasNoctra");

    if (idEditando) {
      reservas = reservas.map(function (reserva) {
        if (Number(reserva.id) === Number(idEditando)) {
          return {
            ...reserva,
            nombre: nuevaReserva.nombre,
            email: nuevaReserva.email,
            telefono: nuevaReserva.telefono,
            motivo: nuevaReserva.motivo,
            fecha: nuevaReserva.fecha,
            horario: nuevaReserva.horario,
            personas: nuevaReserva.personas,
            mensaje: nuevaReserva.mensaje,
            estado: "activa"
          };
        }
        return reserva;
      });

      localStorage.removeItem("reservaEditandoNoctra");
    } else {
      reservas.push(nuevaReserva);
    }

    guardarDatos("reservasNoctra", reservas);
    localStorage.setItem("ultimoEnvioNoctra", "reserva");

    window.location.href = "gracias.html";
  });
}

/* POSTULACIONES */

function guardarPostulacion() {
  const form = document.getElementById("form-postulacion") || document.getElementById("form-postulacion-noctra");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const postulacion = {
      id: Date.now(),
      tipo: "postulacion",
      nombre: obtenerValor("nombre-trabajo") || obtenerValor("nombrePostulacion"),
      email: obtenerValor("email-trabajo") || obtenerValor("emailPostulacion"),
      area: obtenerValor("area"),
      disponibilidad: obtenerValor("disponibilidad"),
      mensaje: obtenerValor("mensaje-trabajo") || obtenerValor("mensajePostulacion"),
      estado: "En revisión"
    };

    if (!postulacion.nombre || !postulacion.email) {
      mostrarNotificacion("Completá como mínimo nombre y email.", "error");
      return;
    }

    const postulaciones = obtenerDatos("postulacionesNoctra");
    postulaciones.push(postulacion);

    guardarDatos("postulacionesNoctra", postulaciones);
    localStorage.setItem("ultimoEnvioNoctra", "postulacion");

    window.location.href = "gracias.html";
  });
}

/* GLOBITO */

function crearGlobitoNoctra() {
  const reservas = obtenerDatos("reservasNoctra");
  const postulaciones = obtenerDatos("postulacionesNoctra");

  const reservasActivas = reservas.filter(function (reserva) {
    return reserva.estado !== "cancelada" && !reservaEstaVencida(reserva);
  });

  if (reservasActivas.length === 0 && postulaciones.length === 0) return;

  const globito = document.createElement("div");
  globito.className = "globito-noctra";

  globito.innerHTML = `
    <button class="globito-boton" onclick="togglePanelNoctra()">
      <img src="img/disco1.png" alt="NOCTRA">
      <span>${reservasActivas.length + postulaciones.length}</span>
    </button>

    <div class="panel-noctra" id="panel-noctra">
      <h3>NOCTRA</h3>
      <p>${reservasActivas.length} reserva(s) activa(s)</p>
      <p>${postulaciones.length} postulación(es)</p>

      ${reservas.length > 0 ? `<a href="mis-reservas.html">Ver reservas</a>` : ""}
      ${postulaciones.length > 0 ? `<a href="mis-postulaciones.html">Ver postulaciones</a>` : ""}
    </div>
  `;

  document.body.appendChild(globito);
}

function togglePanelNoctra() {
  const panel = document.getElementById("panel-noctra");
  if (panel) panel.classList.toggle("activo");
}

/* SALUDO */

function saludoSegunHorario() {
  if (sessionStorage.getItem("saludoNoctraCerrado")) return;

  const hora = new Date().getHours();
  let mensaje = "";

  if (hora >= 6 && hora < 12) {
    mensaje = "Buenos días. NOCTRA abre más tarde, pero ya podés reservar tu lugar.";
  } else if (hora >= 12 && hora < 20) {
    mensaje = "Buenas tardes. La noche todavía no empezó, pero tu mesa puede esperarte.";
  } else if (hora >= 20 || hora < 3) {
    mensaje = "Buenas noches. ¿Reservamos tu lugar?";
  } else {
    mensaje = "Seguís despierto/a. NOCTRA también piensa en quienes habitan la noche.";
  }

  const caja = document.createElement("div");
  caja.className = "saludo-noctra";

  caja.innerHTML = `
    <button onclick="cerrarSaludoNoctra()">×</button>
    <p>${mensaje}</p>
    <a href="contacto.html#reservas" class="btn-saludo-reserva">Reservar</a>
  `;

  document.body.appendChild(caja);
}

function cerrarSaludoNoctra() {
  sessionStorage.setItem("saludoNoctraCerrado", "true");
  const saludo = document.querySelector(".saludo-noctra");
  if (saludo) saludo.remove();
}

/* GRACIAS */

function mostrarResumenGracias() {
  const contenido = document.getElementById("contenido-gracias");
  const resumen = document.getElementById("resumen-gracias");
  const botones = document.getElementById("botones-gracias");

  if (!contenido || !resumen || !botones) return;

  const ultimo = localStorage.getItem("ultimoEnvioNoctra");

  if (ultimo === "reserva") {
    const reservas = obtenerDatos("reservasNoctra").sort(function (a, b) {
      return b.id - a.id;
    });

    const reserva = reservas[0];
    if (!reserva) return;

    contenido.innerHTML = `
      <h1>¡Muchas gracias!</h1>
      <p>Recibimos tu reserva correctamente. Te esperamos en NOCTRA.</p>
      <p class="gracias-frase">También podés encargar comida desde la gestión de tus reservas.</p>
    `;

    resumen.innerHTML = `
      <div class="resumen-reserva">
        <p><strong>Nombre:</strong> ${reserva.nombre}</p>
        <p><strong>Fecha:</strong> ${reserva.fecha}</p>
        <p><strong>Horario:</strong> ${reserva.horario}</p>
        <p><strong>Personas:</strong> ${reserva.personas || "-"}</p>
      </div>
    `;

    botones.innerHTML = `
      <a href="mis-reservas.html" class="btn btn-noctra-accion">Ver mi reserva</a>
      <a href="index.html" class="btn btn-gracias-secundario">Volver al inicio</a>
    `;
  }

  if (ultimo === "postulacion") {
    const postulaciones = obtenerDatos("postulacionesNoctra").sort(function (a, b) {
      return b.id - a.id;
    });

    const postulacion = postulaciones[0];
    if (!postulacion) return;

    contenido.innerHTML = `
      <h1>Muchas gracias</h1>
      <p>NOCTRA recibió tu información correctamente. El equipo revisará tu perfil y se pondrá en contacto para continuar el proceso.</p>
      <p class="gracias-frase">Gracias por querer formar parte de nuestra atmósfera.</p>
    `;

    resumen.innerHTML = `
      <div class="resumen-reserva">
        <p><strong>Nombre:</strong> ${postulacion.nombre}</p>
        <p><strong>Área:</strong> ${postulacion.area || "-"}</p>
        <p><strong>Estado:</strong> ${postulacion.estado}</p>
      </div>
    `;

    botones.innerHTML = `
  <a href="mis-postulaciones.html" class="btn btn-noctra-accion">Ver mi postulación</a>
  <a href="index.html" class="btn btn-gracias-secundario">Volver al inicio</a>
`;
  }
}

/* MIS RESERVAS */

function cargarReservas() {
  const contenedor = document.getElementById("lista-reservas") || document.getElementById("listaReservas");
  if (!contenedor) return;

  const reservas = obtenerDatos("reservasNoctra").sort(function (a, b) {
    return b.id - a.id;
  });

  if (reservas.length === 0) {
    contenedor.innerHTML = "<p>No tenés reservas guardadas.</p>";
    return;
  }

  contenedor.innerHTML = "";

  reservas.forEach(function (reserva) {
    const vencida = reservaEstaVencida(reserva);

    const card = document.createElement("div");
    card.className = "reserva-card";

    if (vencida) card.classList.add("reserva-vencida");
    if (reserva.estado === "cancelada") card.classList.add("reserva-cancelada");

    card.innerHTML = `
      ${reserva.estado === "cancelada" || vencida ? `
        <button class="btn-borrar-registro" onclick="borrarReserva(${reserva.id})">×</button>
      ` : ""}

      <h3>${reserva.motivo || "Reserva NOCTRA"}</h3>
      <p><strong>Nombre:</strong> ${reserva.nombre}</p>
      <p><strong>Email:</strong> ${reserva.email}</p>
      <p><strong>WhatsApp:</strong> ${reserva.telefono || "-"}</p>
      <p><strong>Fecha:</strong> ${reserva.fecha}</p>
      <p><strong>Horario:</strong> ${reserva.horario}</p>
      <p><strong>Personas:</strong> ${reserva.personas || "-"}</p>
      <p><strong>Mensaje:</strong> ${reserva.mensaje || "-"}</p>
      <p><strong>Estado:</strong> ${reserva.estado === "cancelada" ? "Cancelada" : vencida ? "Vencida" : "Activa"}</p>

      ${reserva.comida && reserva.comida.items ? `
        <div class="comida-reservada">
          <h4>Comida reservada</h4>

          ${reserva.comida.items.map(function(item) {
            return `
              <p>
                <strong>${item.nombre}</strong> x${item.cantidad} —
                $${(item.precio * item.cantidad).toLocaleString("es-AR")}
              </p>
            `;
          }).join("")}

          <p><strong>Horario de entrega:</strong> ${reserva.comida.horario}</p>
          <p><strong>Total:</strong> $${reserva.comida.total.toLocaleString("es-AR")}</p>
          <p><strong>Pago:</strong> ${reserva.comida.estadoPago === "pagado" ? "Pagado" : "Pendiente"}</p>
          <p><strong>Observaciones:</strong> ${reserva.comida.observaciones || "-"}</p>
        </div>
      ` : ""}

      ${!vencida && reserva.estado !== "cancelada" ? `
        <button onclick="editarReserva(${reserva.id})">Editar</button>
        <button onclick="cancelarReserva(${reserva.id})">Cancelar</button>
        <button onclick="irAPedidoComida(${reserva.id})">${reserva.comida ? "Editar comida" : "Reservar comida"}</button>
      ` : `
        <button disabled>Reserva cerrada</button>
      `}
    `;

    contenedor.appendChild(card);
  });
}

function editarReserva(id) {
  const reservas = obtenerDatos("reservasNoctra");
  const reserva = reservas.find(function (r) {
    return Number(r.id) === Number(id);
  });

  if (!reserva) return;

  if (reserva.estado === "cancelada" || reservaEstaVencida(reserva)) {
    mostrarNotificacion("No se puede editar una reserva cancelada o vencida.", "error");
    return;
  }

  localStorage.setItem("reservaEditandoNoctra", String(reserva.id));
  window.location.href = "contacto.html#reservas";
}

function cancelarReserva(id) {
  const reservas = obtenerDatos("reservasNoctra");

  reservas.forEach(function (reserva) {
    if (Number(reserva.id) === Number(id)) {
      reserva.estado = "cancelada";
    }
  });

  guardarDatos("reservasNoctra", reservas);

  mostrarNotificacion("Reserva cancelada.", "ok");

  setTimeout(function () {
    location.reload();
  }, 1000);
}

function borrarReserva(id) {
  const confirmar = confirm("¿Querés borrar definitivamente esta reserva del historial?");
  if (!confirmar) return;

  let reservas = obtenerDatos("reservasNoctra");

  reservas = reservas.filter(function (reserva) {
    return Number(reserva.id) !== Number(id);
  });

  guardarDatos("reservasNoctra", reservas);

  mostrarNotificacion("Reserva eliminada del historial.", "ok");

  setTimeout(function () {
    location.reload();
  }, 1000);
}

function irAPedidoComida(id) {
  const reservas = obtenerDatos("reservasNoctra");

  const reserva = reservas.find(function (r) {
    return Number(r.id) === Number(id);
  });

  if (!reserva) return;

  if (reserva.estado === "cancelada" || reservaEstaVencida(reserva)) {
    mostrarNotificacion("No se puede reservar comida para una reserva cancelada o vencida.", "error");
    return;
  }

  localStorage.setItem("reservaPedidoComida", String(id));
  window.location.href = "pedido-comida.html";
}

/* PEDIDO COMIDA / CARRITO */

const menuNoctra = [
  { nombre: "Espresso", precio: 3000 },
  { nombre: "Latte", precio: 5500 },
  { nombre: "Cappuccino", precio: 4000 },
  { nombre: "Americano", precio: 2000 },
  { nombre: "Flat White", precio: 3000 },
  { nombre: "Limonada", precio: 5000 },
  { nombre: "Agua", precio: 1500 },
  { nombre: "Gaseosa", precio: 3000 },
  { nombre: "Tragos", precio: 5000 },
  { nombre: "Red Bull", precio: 3000 },
  { nombre: "Sándwich", precio: 9800 },
  { nombre: "César", precio: 8500 },
  { nombre: "Pizza", precio: 15000 },
  { nombre: "Empanadas", precio: 2500 },
  { nombre: "Pasta", precio: 12000 },
  { nombre: "Tacos veggie", precio: 10000 },
  { nombre: "Wrap veggie", precio: 8500 },
  { nombre: "Ensalada Agni", precio: 7000 },
  { nombre: "Bowl veggie", precio: 7500 },
  { nombre: "Sushi veggie", precio: 15000 },
  { nombre: "Combo estudio", precio: 15000 },
  { nombre: "Café + algo dulce", precio: 10000 },
  { nombre: "Para compartir", precio: 40000 }
];

let carritoNoctra = [];

function cargarPedidoComida() {
  const menuPedido = document.getElementById("menu-pedido");
  const carritoPedido = document.getElementById("carrito-pedido");

  if (!menuPedido || !carritoPedido) return;

  const id = Number(localStorage.getItem("reservaPedidoComida"));
  const reservas = obtenerDatos("reservasNoctra");

  const reserva = reservas.find(function (r) {
    return Number(r.id) === Number(id);
  });

  if (!reserva) {
    document.getElementById("pedido-info").innerHTML = "No se encontró la reserva.";
    return;
  }

  if (reserva.estado === "cancelada" || reservaEstaVencida(reserva)) {
    mostrarNotificacion("No se puede reservar comida para una reserva cancelada o vencida.", "error");

    setTimeout(function () {
      window.location.href = "mis-reservas.html";
    }, 1200);

    return;
  }

  document.getElementById("pedido-info").innerHTML = `
    Reserva de <strong>${reserva.nombre}</strong> para el <strong>${reserva.fecha}</strong> a las <strong>${reserva.horario}</strong>.
  `;

  carritoNoctra = reserva.comida && reserva.comida.items ? reserva.comida.items : [];

  menuPedido.innerHTML = "";

  menuNoctra.forEach(function (producto, index) {
    const item = document.createElement("div");
    item.className = "item-menu-pedido";

    item.innerHTML = `
      <div>
        <h3>${producto.nombre}</h3>
        <p>$${producto.precio.toLocaleString("es-AR")}</p>
      </div>
      <button onclick="agregarAlCarrito(${index})">Agregar</button>
    `;

    menuPedido.appendChild(item);
  });

  if (reserva.comida && reserva.comida.horario) {
    ponerValor("horario-comida", reserva.comida.horario);
  }

  if (reserva.comida && reserva.comida.observaciones) {
    ponerValor("observaciones-comida", reserva.comida.observaciones);
  }

  renderizarCarrito();
}

function agregarAlCarrito(index) {
  const producto = menuNoctra[index];

  const existente = carritoNoctra.find(function (item) {
    return item.nombre === producto.nombre;
  });

  if (existente) {
    existente.cantidad++;
  } else {
    carritoNoctra.push({
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: 1
    });
  }

  mostrarNotificacion("Producto agregado al pedido.", "ok");
  renderizarCarrito();
}

function sumarCantidad(nombre) {
  const item = carritoNoctra.find(function (producto) {
    return producto.nombre === nombre;
  });

  if (item) item.cantidad++;
  renderizarCarrito();
}

function restarCantidad(nombre) {
  const item = carritoNoctra.find(function (producto) {
    return producto.nombre === nombre;
  });

  if (!item) return;

  item.cantidad--;

  if (item.cantidad <= 0) {
    carritoNoctra = carritoNoctra.filter(function (producto) {
      return producto.nombre !== nombre;
    });
  }

  renderizarCarrito();
}

function borrarDelCarrito(nombre) {
  carritoNoctra = carritoNoctra.filter(function (producto) {
    return producto.nombre !== nombre;
  });

  mostrarNotificacion("Producto eliminado del pedido.", "ok");
  renderizarCarrito();
}

function calcularTotalCarrito() {
  return carritoNoctra.reduce(function (total, item) {
    return total + item.precio * item.cantidad;
  }, 0);
}

function renderizarCarrito() {
  const carritoPedido = document.getElementById("carrito-pedido");
  const totalPedido = document.getElementById("total-pedido");

  if (!carritoPedido || !totalPedido) return;

  if (carritoNoctra.length === 0) {
    carritoPedido.innerHTML = "<p>Todavía no agregaste comida.</p>";
    totalPedido.innerHTML = "Total: $0";
    return;
  }

  carritoPedido.innerHTML = "";

  carritoNoctra.forEach(function (item) {
    const fila = document.createElement("div");
    fila.className = "fila-carrito";

    fila.innerHTML = `
      <div>
        <strong>${item.nombre}</strong>
        <p>$${item.precio.toLocaleString("es-AR")} x ${item.cantidad}</p>
      </div>

      <div class="acciones-carrito">
        <button onclick="restarCantidad('${item.nombre}')">−</button>
        <span>${item.cantidad}</span>
        <button onclick="sumarCantidad('${item.nombre}')">+</button>
        <button onclick="borrarDelCarrito('${item.nombre}')">×</button>
      </div>
    `;

    carritoPedido.appendChild(fila);
  });

  totalPedido.innerHTML = `Total: $${calcularTotalCarrito().toLocaleString("es-AR")}`;
}

function horarioEnMinutos(horario) {
  const partes = horario.split(":");
  let horas = Number(partes[0]);
  const minutos = Number(partes[1]);

  if (horas >= 0 && horas <= 4) {
    horas = horas + 24;
  }

  return horas * 60 + minutos;
}

function validarHorarioComida(reserva, horarioComida) {
  const reservaMinutos = horarioEnMinutos(reserva.horario);
  const comidaMinutos = horarioEnMinutos(horarioComida);

  if (comidaMinutos < reservaMinutos) {
    mostrarNotificacion("El horario de entrega no puede ser anterior al horario de tu reserva.", "error");
    return false;
  }

  return true;
}

function irAPagarComida() {
  const id = Number(localStorage.getItem("reservaPedidoComida"));
  const reservas = obtenerDatos("reservasNoctra");

  const reserva = reservas.find(function (r) {
    return Number(r.id) === Number(id);
  });

  if (!reserva) return;

  const horarioComida = obtenerValor("horario-comida");
  const observaciones = obtenerValor("observaciones-comida");

  if (carritoNoctra.length === 0) {
    mostrarNotificacion("Agregá al menos un producto al pedido.", "error");
    return;
  }

  if (!horarioComida) {
    mostrarNotificacion("Elegí un horario de entrega.", "error");
    return;
  }

  if (!validarHorarioComida(reserva, horarioComida)) return;

  const pedidoPendiente = {
    items: carritoNoctra,
    horario: horarioComida,
    observaciones: observaciones,
    total: calcularTotalCarrito(),
    estadoPago: "pendiente"
  };

  localStorage.setItem("pedidoPendienteNoctra", JSON.stringify(pedidoPendiente));
  window.location.href = "pago-comida.html";
}

/* PAGO COMIDA */

function cargarPagoComida() {
  const form = document.getElementById("form-pago-comida");
  if (!form) return;

  const pedido = JSON.parse(localStorage.getItem("pedidoPendienteNoctra"));

  if (!pedido) {
    document.getElementById("pago-info").innerHTML = "No hay ningún pedido pendiente de pago.";
    return;
  }

  document.getElementById("pago-info").innerHTML = `
    Total a pagar: <strong>$${pedido.total.toLocaleString("es-AR")}</strong>
  `;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const titular = obtenerValor("titular-pago");
    const numero = obtenerValor("numero-pago");
    const vencimiento = obtenerValor("vencimiento-pago");
    const cvv = obtenerValor("cvv-pago");

    if (!titular || !numero || !vencimiento || !cvv) {
      mostrarNotificacion("Completá todos los datos de pago.", "error");
      return;
    }

    const id = Number(localStorage.getItem("reservaPedidoComida"));
    const reservas = obtenerDatos("reservasNoctra");

    const reserva = reservas.find(function (r) {
      return Number(r.id) === Number(id);
    });

    if (!reserva) return;

    pedido.estadoPago = "pagado";
    pedido.fechaPago = new Date().toLocaleString("es-AR");

    reserva.comida = pedido;

    guardarDatos("reservasNoctra", reservas);
    localStorage.removeItem("pedidoPendienteNoctra");

    mostrarNotificacion("Pago aprobado. Tu comida quedó confirmada.", "ok");

    setTimeout(function () {
      window.location.href = "mis-reservas.html";
    }, 1200);
  });
}

/* MIS POSTULACIONES */

function cargarPostulaciones() {
  const contenedor = document.getElementById("lista-postulaciones") || document.getElementById("listaPostulaciones");
  if (!contenedor) return;

  const postulaciones = obtenerDatos("postulacionesNoctra").sort(function (a, b) {
    return b.id - a.id;
  });

  if (postulaciones.length === 0) {
    contenedor.innerHTML = "<p>No tenés postulaciones guardadas.</p>";
    return;
  }

  contenedor.innerHTML = "";

  postulaciones.forEach(function (postulacion) {
    const card = document.createElement("div");
    card.className = "reserva-card";

    card.innerHTML = `
      <h3>${postulacion.area || "Postulación NOCTRA"}</h3>
      <p><strong>Nombre:</strong> ${postulacion.nombre}</p>
      <p><strong>Email:</strong> ${postulacion.email}</p>
      <p><strong>Disponibilidad:</strong> ${postulacion.disponibilidad || "-"}</p>
      <p><strong>Mensaje:</strong> ${postulacion.mensaje || "-"}</p>
      <p><strong>Estado:</strong> ${postulacion.estado}</p>

      <div class="respuesta-noctra">
        <h4>Respuesta del equipo NOCTRA</h4>
        <p>Tu postulación fue recibida. Valoraremos disponibilidad nocturna, atención al detalle y afinidad con el espacio.</p>
      </div>

      <button onclick="editarPostulacion(${postulacion.id})">Editar</button>
      <button onclick="cancelarPostulacion(${postulacion.id})">Cancelar</button>
    `;

    contenedor.appendChild(card);
  });
}

function editarPostulacion(id) {
  mostrarNotificacion("Para editar una postulación, enviá una nueva versión desde el formulario de contacto.", "error");
}

function cancelarPostulacion(id) {
  let postulaciones = obtenerDatos("postulacionesNoctra");

  postulaciones = postulaciones.filter(function (postulacion) {
    return Number(postulacion.id) !== Number(id);
  });

  guardarDatos("postulacionesNoctra", postulaciones);

  mostrarNotificacion("Postulación cancelada.", "ok");

  setTimeout(function () {
    location.reload();
  }, 1000);
}