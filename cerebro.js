"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const STORAGE_CATALOGO = "calc_frutas_catalogo_v2";
    const STORAGE_NOTA_GRAL = "calc_frutas_nota_gral_v2";

    const catalogoInicial = {
        "manzana-verde": {
            id: "manzana-verde",
            categoria: "manzana",
            nombre: "Manzana verde",
            imagen: "images/manzana verde mv.jpg",
            info: "Caja o cartón · Fresca",
            disponible: true,
            presentaciones: ["caja", "carton"],
            precios: { caja: null, carton: null },
            calibres: ["100", "113", "125", "138"],
            calibrePorDefecto: "113",
            nota: ""
        },
        "manzana-california": {
            id: "manzana-california",
            categoria: "manzana",
            nombre: "Manzana California",
            imagen: "images/manzana california mc.jpg",
            info: "Caja o cartón · Selección",
            disponible: true,
            presentaciones: ["caja", "carton"],
            precios: { caja: null, carton: null },
            calibres: ["100", "113", "125"],
            calibrePorDefecto: "113",
            nota: ""
        },
        "manzana-amarilla": {
            id: "manzana-amarilla",
            categoria: "manzana",
            nombre: "Manzana amarilla",
            imagen: "images/manzana amarilla ma.jpg",
            info: "Caja o cartón · Dulce",
            disponible: true,
            presentaciones: ["caja", "carton"],
            precios: { caja: null, carton: null },
            calibres: ["100", "113", "125"],
            calibrePorDefecto: "113",
            nota: ""
        },
        "manzana-gala": {
            id: "manzana-gala",
            categoria: "manzana",
            nombre: "Manzana Gala",
            imagen: "images/manzana gala mg.jpg",
            info: "Caja o cartón · Calibre 150",
            disponible: true,
            presentaciones: ["caja", "carton"],
            precios: { caja: null, carton: null },
            calibres: ["150", "138", "125", "113"],
            calibrePorDefecto: "150",
            nota: ""
        },
        "manzana-pink-lady": {
            id: "manzana-pink-lady",
            categoria: "manzana",
            nombre: "Manzana Pink Lady",
            imagen: "images/manzana pink lady mpl.jpg",
            info: "Caja o cartón · Premium",
            disponible: true,
            presentaciones: ["caja", "carton"],
            precios: { caja: null, carton: null },
            calibres: ["100", "113", "125"],
            calibrePorDefecto: "113",
            nota: ""
        },
        "uva-verde": {
            id: "uva-verde",
            categoria: "uva",
            nombre: "Uva verde",
            imagen: "images/uva verde uv.jpg",
            info: "Por caja o por libra",
            disponible: true,
            presentaciones: ["caja", "libra"],
            precios: { caja: null, libra: null },
            calibres: ["Jumbo", "Grande", "Mediana"],
            calibrePorDefecto: "Grande",
            nota: ""
        },
        "uva-roja": {
            id: "uva-roja",
            categoria: "uva",
            nombre: "Uva roja",
            imagen: "images/uva roja ur.jpg",
            info: "Por caja o por libra",
            disponible: true,
            presentaciones: ["caja", "libra"],
            precios: { caja: null, libra: null },
            calibres: ["Jumbo", "Grande", "Mediana"],
            calibrePorDefecto: "Grande",
            nota: ""
        },
        "pera-forell": {
            id: "pera-forell",
            categoria: "pera",
            nombre: "Pera Forell",
            imagen: "images/pera forell pf.jpg",
            info: "Caja o cartón · Importada",
            disponible: true,
            presentaciones: ["caja", "carton"],
            precios: { caja: null, carton: null },
            calibres: ["120", "135", "150"],
            calibrePorDefecto: "135",
            nota: ""
        },
        "pera-piedra-cafe": {
            id: "pera-piedra-cafe",
            categoria: "pera",
            nombre: "Pera piedra café",
            imagen: "images/pera piedra cafe ppc.jpg",
            info: "Caja o cartón · Firme",
            disponible: true,
            presentaciones: ["caja", "carton"],
            precios: { caja: null, carton: null },
            calibres: ["100", "110", "120"],
            calibrePorDefecto: "110",
            nota: ""
        },
        "pera-verde": {
            id: "pera-verde",
            categoria: "pera",
            nombre: "Pera verde",
            imagen: "images/pera verde pv.jpg",
            info: "Caja o cartón · Jugosa",
            disponible: true,
            presentaciones: ["caja", "carton"],
            precios: { caja: null, carton: null },
            calibres: ["100", "110", "120", "135"],
            calibrePorDefecto: "110",
            nota: ""
        }
    };

    let catalogo = cargarCatalogo();
    let notaGeneral = localStorage.getItem(STORAGE_NOTA_GRAL) || "";
    let modoEdicionActivo = false;
    const estadoVenta = new Map();

    // Referencias DOM principales
    const gridManzanas = document.querySelector("#grid-manzanas");
    const gridUvas = document.querySelector("#grid-uvas");
    const gridPeras = document.querySelector("#grid-peras");
    const contenedorLista = document.querySelector("#lista-venta");
    const mensajeVacio = document.querySelector("#resumen-vacio");
    const botonLimpiar = document.querySelector("#limpiar-venta");
    const botonFinalizar = document.querySelector("#finalizar-venta");
    const cantidadTotal = document.querySelector("#cantidad-total");
    const totalVenta = document.querySelector("#total-venta");
    const etiquetaCantidad = document.querySelector(".resumen-venta__cantidad");
    const btnModoEdicion = document.querySelector("#btn-modo-edicion");
    const btnNotaGeneral = document.querySelector("#btn-nota-general");
    const cajaNotaGeneral = document.querySelector("#caja-nota-general");
    const textoNotaGeneral = document.querySelector("#texto-nota-general");
    const editarNotaGeneralBtn = document.querySelector("#editar-nota-general");

    // Modal selección (presentación + calibre + nota item)
    const modalSel = document.querySelector("#modal-seleccion");
    const modalSelTitulo = document.querySelector("#modal-sel-titulo");
    const modalSelSub = document.querySelector("#modal-sel-sub");
    const opcionesPresentacionEl = document.querySelector("#opciones-presentacion");
    const listaCalibresRapidos = document.querySelector("#lista-calibres-rapidos");
    const btnToggleNuevoCalibre = document.querySelector("#btn-toggle-nuevo-calibre");
    const boxNuevoCalibre = document.querySelector("#box-nuevo-calibre");
    const inputNuevoCalibre = document.querySelector("#input-nuevo-calibre");
    const btnGuardarCalibre = document.querySelector("#btn-guardar-calibre");
    const inputCalibreActivo = document.querySelector("#input-calibre-activo");
    const inputNotaItem = document.querySelector("#input-nota-item");
    const confirmarAgregarItemBtn = document.querySelector("#confirmar-agregar-item");

    // Modal edición de producto
    const modalEd = document.querySelector("#modal-edicion");
    const modalEdTitulo = document.querySelector("#modal-ed-titulo");
    const edDisponible = document.querySelector("#ed-disponible");
    const edInfo = document.querySelector("#ed-info");
    const edPreciosGrid = document.querySelector("#ed-precios-grid");
    const edCalibres = document.querySelector("#ed-calibres");
    const edNota = document.querySelector("#ed-nota");
    const guardarEdicionProductoBtn = document.querySelector("#guardar-edicion-producto");

    let productoEnSeleccion = null;
    let presentacionSeleccionada = "caja";
    let productoEnEdicion = null;

    function cargarCatalogo() {
        try {
            const raw = localStorage.getItem(STORAGE_CATALOGO);
            if (!raw) return structuredClone(catalogoInicial);
            const parsed = JSON.parse(raw);
            // Fusiona por si se agregan campos nuevos
            const merged = structuredClone(catalogoInicial);
            Object.keys(merged).forEach((id) => {
                if (parsed[id]) {
                    merged[id] = {
                        ...merged[id],
                        ...parsed[id],
                        precios: {
                            ...merged[id].precios,
                            ...(parsed[id].precios || {})
                        }
                    };
                }
            });
            return merged;
        } catch {
            return structuredClone(catalogoInicial);
        }
    }

    function guardarCatalogo() {
        localStorage.setItem(STORAGE_CATALOGO, JSON.stringify(catalogo));
    }

    function formatearEtiquetaPresentacion(presentacion) {
        const mapa = {
            caja: "Caja",
            carton: "Cartón",
            libra: "Libra"
        };
        return mapa[presentacion] || "Caja";
    }

    function formatearPrecio(valor) {
        return new Intl.NumberFormat("es-SV", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2
        }).format(valor);
    }

    function resumenPreciosTexto(producto) {
        const partes = producto.presentaciones.map((pres) => {
            const val = producto.precios[pres];
            const etiqueta = formatearEtiquetaPresentacion(pres);
            return val !== null && val !== undefined && !Number.isNaN(val)
                ? `${etiqueta}: ${formatearPrecio(val)}`
                : `${etiqueta}: pendiente`;
        });
        return partes.join(" · ");
    }

    function crearTarjetaProducto(producto) {
        const article = document.createElement("article");
        article.className = `producto-card ${!producto.disponible ? "producto-card--no-disponible" : ""}`;

        const calibresBadges = producto.calibres.length
            ? `<span class="badge-calibre">Cal. ${producto.calibres.join(" / ")}</span>`
            : "";

        const notaBadge = producto.nota
            ? `<p class="producto-card__nota">Nota: ${escaparHtml(producto.nota)}</p>`
            : "";

        const estadoTag = !producto.disponible
            ? `<span class="tag-estado tag-estado--agotado">No disponible</span>`
            : `<span class="tag-estado tag-estado--ok">Disponible</span>`;

        article.innerHTML = `
            <div class="producto-card__glass">
                <div class="producto-card__superior">
                    ${estadoTag}
                    <button
                        type="button"
                        class="btn-editar-mini"
                        data-editar-id="${producto.id}"
                        title="Editar precio, info, calibre o disponibilidad"
                    >
                        Editar
                    </button>
                </div>

                <button
                    type="button"
                    class="producto-card__principal"
                    data-seleccionar-id="${producto.id}"
                >
                    <div class="producto-card__imagen">
                        <img
                            src="${escaparAtributo(producto.imagen)}"
                            alt="${escaparAtributo(producto.nombre)}"
                            onerror="this.style.opacity='0.35';"
                        >
                    </div>

                    <div class="producto-card__informacion">
                        <div class="producto-card__fila-titulo">
                            <h4 class="producto-card__nombre">${escaparHtml(producto.nombre)}</h4>
                            ${calibresBadges}
                        </div>

                        <p class="producto-card__tipo">${escaparHtml(producto.info)}</p>
                        ${notaBadge}

                        <span class="producto-card__precio">
                            ${escaparHtml(resumenPreciosTexto(producto))}
                        </span>
                    </div>

                    <span class="producto-card__accion">
                        ${producto.disponible ? "Elegir presentación y calibre" : "No disponible · Ver/Editar"}
                    </span>
                </button>
            </div>
        `;

        return article;
    }

    function renderizarCatalogo() {
        gridManzanas.innerHTML = "";
        gridUvas.innerHTML = "";
        gridPeras.innerHTML = "";

        Object.values(catalogo).forEach((producto) => {
            const card = crearTarjetaProducto(producto);
            if (producto.categoria === "manzana") gridManzanas.appendChild(card);
            else if (producto.categoria === "uva") gridUvas.appendChild(card);
            else if (producto.categoria === "pera") gridPeras.appendChild(card);
        });

        document.body.classList.toggle("modo-edicion-activo", modoEdicionActivo);
    }

    function escaparHtml(str) {
        return String(str ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;");
    }

    function escaparAtributo(str) {
        return escaparHtml(str).replaceAll("'", "&#39;");
    }

    // --- MODAL DE SELECCIÓN DE PRESENTACIÓN Y CALIBRE ---
    function abrirModalSeleccion(idProducto) {
        const producto = catalogo[idProducto];
        if (!producto) return;

        if (!producto.disponible) {
            abrirModalEdicion(idProducto);
            return;
        }

        productoEnSeleccion = producto;
        presentacionSeleccionada = producto.presentaciones[0] || "caja";

        modalSelTitulo.textContent = producto.nombre;
        modalSelSub.textContent = producto.info || "Selecciona presentación y calibre";

        renderizarBotonesPresentacion();
        renderizarCalibresRapidos();

        inputCalibreActivo.value = producto.calibrePorDefecto || (producto.calibres[0] || "");
        inputNotaItem.value = producto.nota || "";
        boxNuevoCalibre.hidden = true;
        inputNuevoCalibre.value = "";

        modalSel.hidden = false;
        inputCalibreActivo.focus();
    }

    function cerrarModalSeleccion() {
        modalSel.hidden = true;
        productoEnSeleccion = null;
    }

    function renderizarBotonesPresentacion() {
        if (!productoEnSeleccion) return;
        opcionesPresentacionEl.innerHTML = "";

        productoEnSeleccion.presentaciones.forEach((pres) => {
            const btn = document.createElement("button");
            btn.type = "button";
            const activa = pres === presentacionSeleccionada;
            btn.className = `chip-opcion ${activa ? "is-activa" : ""}`;
            const precio = productoEnSeleccion.precios[pres];
            const precioTexto = precio !== null && !Number.isNaN(precio)
                ? ` (${formatearPrecio(precio)})`
                : "";
            btn.textContent = `${formatearEtiquetaPresentacion(pres)}${precioTexto}`;
            btn.addEventListener("click", () => {
                presentacionSeleccionada = pres;
                renderizarBotonesPresentacion();
            });
            opcionesPresentacionEl.appendChild(btn);
        });
    }

    function renderizarCalibresRapidos() {
        if (!productoEnSeleccion) return;
        listaCalibresRapidos.innerHTML = "";

        productoEnSeleccion.calibres.forEach((cal) => {
            const chip = document.createElement("button");
            chip.type = "button";
            const seleccionado = inputCalibreActivo.value.trim() === String(cal);
            chip.className = `chip-calibre ${seleccionado ? "is-activa" : ""}`;
            chip.textContent = cal;
            chip.addEventListener("click", () => {
                inputCalibreActivo.value = cal;
                renderizarCalibresRapidos();
            });
            listaCalibresRapidos.appendChild(chip);
        });
    }

    btnToggleNuevoCalibre.addEventListener("click", () => {
        boxNuevoCalibre.hidden = !boxNuevoCalibre.hidden;
        if (!boxNuevoCalibre.hidden) {
            inputNuevoCalibre.focus();
        }
    });

    btnGuardarCalibre.addEventListener("click", () => {
        if (!productoEnSeleccion) return;
        const nuevo = inputNuevoCalibre.value.trim();
        if (!nuevo) return;

        if (!productoEnSeleccion.calibres.includes(nuevo)) {
            productoEnSeleccion.calibres.push(nuevo);
        }
        productoEnSeleccion.calibrePorDefecto = nuevo;
        inputCalibreActivo.value = nuevo;
        inputNuevoCalibre.value = "";
        boxNuevoCalibre.hidden = true;

        guardarCatalogo();
        renderizarCalibresRapidos();
        renderizarCatalogo();
    });

    inputCalibreActivo.addEventListener("input", () => {
        renderizarCalibresRapidos();
    });

    confirmarAgregarItemBtn.addEventListener("click", () => {
        if (!productoEnSeleccion) return;

        const calibreFinal = inputCalibreActivo.value.trim() || "Estándar";
        const notaFinal = inputNotaItem.value.trim();

        // Si escribió un calibre nuevo en el campo activo, lo sumamos al historial si no está
        if (calibreFinal !== "Estándar" && !productoEnSeleccion.calibres.includes(calibreFinal)) {
            productoEnSeleccion.calibres.push(calibreFinal);
            productoEnSeleccion.calibrePorDefecto = calibreFinal;
            guardarCatalogo();
            renderizarCatalogo();
        }

        const clave = `${productoEnSeleccion.id}__${presentacionSeleccionada}__${calibreFinal}__${notaFinal}`;
        const actual = estadoVenta.get(clave) || {
            idProducto: productoEnSeleccion.id,
            presentacion: presentacionSeleccionada,
            calibre: calibreFinal,
            nota: notaFinal,
            cantidad: 0
        };

        actual.cantidad += 1;
        estadoVenta.set(clave, actual);

        cerrarModalSeleccion();
        actualizarResumen();
    });

    // --- MODAL DE EDICIÓN RÁPIDA ---
    function abrirModalEdicion(idProducto) {
        const producto = catalogo[idProducto];
        if (!producto) return;

        productoEnEdicion = producto;
        modalEdTitulo.textContent = `Editar · ${producto.nombre}`;
        edDisponible.checked = Boolean(producto.disponible);
        edInfo.value = producto.info || "";
        edCalibres.value = producto.calibres.join(", ");
        edNota.value = producto.nota || "";

        edPreciosGrid.innerHTML = "";
        producto.presentaciones.forEach((pres) => {
            const div = document.createElement("div");
            div.className = "campo-grupo";
            const valActual = producto.precios[pres];
            div.innerHTML = `
                <label class="campo-label" for="precio-input-${pres}">
                    Precio por ${formatearEtiquetaPresentacion(pres).toLowerCase()} (USD)
                </label>
                <input
                    type="number"
                    step="0.01"
                    min="0"
                    class="campo-input"
                    id="precio-input-${pres}"
                    data-pres-precio="${pres}"
                    value="${valActual !== null && valActual !== undefined ? valActual : ""}"
                    placeholder="Ej: 24.50 (vacío = pendiente)"
                >
            `;
            edPreciosGrid.appendChild(div);
        });

        modalEd.hidden = false;
        edInfo.focus();
    }

    function cerrarModalEdicion() {
        modalEd.hidden = true;
        productoEnEdicion = null;
    }

    guardarEdicionProductoBtn.addEventListener("click", () => {
        if (!productoEnEdicion) return;

        productoEnEdicion.disponible = edDisponible.checked;
        productoEnEdicion.info = edInfo.value.trim() || "Disponible";
        productoEnEdicion.nota = edNota.value.trim();

        const listaCal = edCalibres.value
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean);

        if (listaCal.length > 0) {
            productoEnEdicion.calibres = listaCal;
            if (!listaCal.includes(productoEnEdicion.calibrePorDefecto)) {
                productoEnEdicion.calibrePorDefecto = listaCal[0];
            }
        }

        edPreciosGrid.querySelectorAll("[data-pres-precio]").forEach((input) => {
            const pres = input.dataset.presPrecio;
            const raw = input.value.trim();
            if (raw === "") {
                productoEnEdicion.precios[pres] = null;
            } else {
                const num = Number(raw);
                productoEnEdicion.precios[pres] = Number.isNaN(num) || num < 0 ? null : num;
            }
        });

        guardarCatalogo();
        renderizarCatalogo();
        actualizarResumen();
        cerrarModalEdicion();
    });

    // --- NOTA GENERAL DE VENTA ---
    function renderizarNotaGeneral() {
        if (notaGeneral.trim()) {
            cajaNotaGeneral.hidden = false;
            textoNotaGeneral.textContent = notaGeneral.trim();
        } else {
            cajaNotaGeneral.hidden = true;
            textoNotaGeneral.textContent = "";
        }
    }

    function solicitarNotaGeneral() {
        const nueva = window.prompt(
            "Escribe o edita la nota general de la venta (déjala vacía para borrarla):",
            notaGeneral
        );
        if (nueva === null) return;
        notaGeneral = nueva.trim();
        localStorage.setItem(STORAGE_NOTA_GRAL, notaGeneral);
        renderizarNotaGeneral();
    }

    btnNotaGeneral.addEventListener("click", solicitarNotaGeneral);
    editarNotaGeneralBtn.addEventListener("click", solicitarNotaGeneral);

    // --- MODO EDICIÓN ---
    btnModoEdicion.addEventListener("click", () => {
        modoEdicionActivo = !modoEdicionActivo;
        btnModoEdicion.setAttribute("aria-pressed", String(modoEdicionActivo));
        btnModoEdicion.textContent = modoEdicionActivo ? "Listo (Salir de editar)" : "Editar catálogo";
        document.body.classList.toggle("modo-edicion-activo", modoEdicionActivo);
    });

    // --- RESUMEN Y CÁLCULOS ---
    function obtenerCantidadTotal() {
        let total = 0;
        estadoVenta.forEach((item) => {
            total += item.cantidad;
        });
        return total;
    }

    function renderizarListaVenta() {
        contenedorLista.innerHTML = "";

        estadoVenta.forEach((item, clave) => {
            const producto = catalogo[item.idProducto];
            if (!producto) return;

            const precioUnit = producto.precios[item.presentacion];
            const tienePrecio = precioUnit !== null && precioUnit !== undefined && !Number.isNaN(precioUnit);
            const subtotalTexto = tienePrecio
                ? formatearPrecio(precioUnit * item.cantidad)
                : "Precio pendiente";

            const notaHtml = item.nota
                ? `<p class="venta-item__nota">Nota: ${escaparHtml(item.nota)}</p>`
                : "";

            const div = document.createElement("div");
            div.className = "venta-item";
            div.innerHTML = `
                <div class="venta-item__informacion">
                    <h3 class="venta-item__nombre">${escaparHtml(producto.nombre)}</h3>
                    <p class="venta-item__detalle">
                        ${formatearEtiquetaPresentacion(item.presentacion)} · Calibre: <strong>${escaparHtml(item.calibre)}</strong>
                    </p>
                    ${notaHtml}
                    <span class="venta-item__subtotal">${escaparHtml(subtotalTexto)}</span>
                </div>

                <div class="venta-item__controles">
                    <button
                        type="button"
                        class="venta-item__control"
                        data-accion="disminuir"
                        data-clave="${escaparAtributo(clave)}"
                        aria-label="Disminuir cantidad"
                    >-</button>
                    <span class="venta-item__cantidad">${item.cantidad}</span>
                    <button
                        type="button"
                        class="venta-item__control"
                        data-accion="aumentar"
                        data-clave="${escaparAtributo(clave)}"
                        aria-label="Aumentar cantidad"
                    >+</button>
                </div>
            `;
            contenedorLista.appendChild(div);
        });
    }

    function actualizarTotalVisual() {
        if (estadoVenta.size === 0) {
            totalVenta.textContent = "Precio pendiente";
            return;
        }

        let total = 0;
        let hayAlMenosUnoConPrecio = false;
        let faltaAlgunPrecio = false;

        estadoVenta.forEach((item) => {
            const producto = catalogo[item.idProducto];
            const precio = producto ? producto.precios[item.presentacion] : null;
            if (precio === null || precio === undefined || Number.isNaN(precio)) {
                faltaAlgunPrecio = true;
            } else {
                hayAlMenosUnoConPrecio = true;
                total += precio * item.cantidad;
            }
        });

        if (!hayAlMenosUnoConPrecio) {
            totalVenta.textContent = "Precio pendiente";
            return;
        }

        totalVenta.textContent = faltaAlgunPrecio
            ? `${formatearPrecio(total)} (parcial)`
            : formatearPrecio(total);
    }

    function actualizarResumen() {
        renderizarListaVenta();
        const hayItems = estadoVenta.size > 0;
        mensajeVacio.hidden = hayItems;
        contenedorLista.hidden = !hayItems;

        const totalUnidades = obtenerCantidadTotal();
        cantidadTotal.textContent = totalUnidades;
        etiquetaCantidad.textContent = totalUnidades === 1 ? "1 item" : `${totalUnidades} items`;

        actualizarTotalVisual();
    }

    // Delegación de eventos en grids de productos
    document.querySelector(".seccion-productos").addEventListener("click", (e) => {
        const btnEditar = e.target.closest("[data-editar-id]");
        if (btnEditar) {
            e.stopPropagation();
            abrirModalEdicion(btnEditar.dataset.editarId);
            return;
        }

        const btnSel = e.target.closest("[data-seleccionar-id]");
        if (btnSel) {
            const id = btnSel.dataset.seleccionarId;
            if (modoEdicionActivo) {
                abrirModalEdicion(id);
            } else {
                abrirModalSeleccion(id);
            }
        }
    });

    // Controles en resumen
    contenedorLista.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-accion][data-clave]");
        if (!btn) return;

        const clave = btn.dataset.clave;
        const item = estadoVenta.get(clave);
        if (!item) return;

        if (btn.dataset.accion === "aumentar") {
            item.cantidad += 1;
        } else if (btn.dataset.accion === "disminuir") {
            if (item.cantidad <= 1) {
                estadoVenta.delete(clave);
            } else {
                item.cantidad -= 1;
            }
        }
        actualizarResumen();
    });

    botonLimpiar.addEventListener("click", () => {
        estadoVenta.clear();
        actualizarResumen();
    });

    botonFinalizar.addEventListener("click", () => {
        if (obtenerCantidadTotal() === 0) {
            window.alert("Todavía no hay productos en la venta.");
            return;
        }
        window.alert(`Resumen listo con ${obtenerCantidadTotal()} unidades/libras. Total: ${totalVenta.textContent}`);
    });

    // Cerrar modales
    document.querySelector("#cerrar-modal-sel").addEventListener("click", cerrarModalSeleccion);
    document.querySelector("#cancelar-modal-sel").addEventListener("click", cerrarModalSeleccion);
    document.querySelector("#cerrar-modal-ed").addEventListener("click", cerrarModalEdicion);
    document.querySelector("#cancelar-modal-ed").addEventListener("click", cerrarModalEdicion);

    modalSel.addEventListener("click", (e) => {
        if (e.target === modalSel) cerrarModalSeleccion();
    });
    modalEd.addEventListener("click", (e) => {
        if (e.target === modalEd) cerrarModalEdicion();
    });

    // Inicialización
    renderizarCatalogo();
    renderizarNotaGeneral();
    actualizarResumen();
});
