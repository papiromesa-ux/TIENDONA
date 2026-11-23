"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const estadoVenta = new Map();

    const botonesProducto = document.querySelectorAll(
        "[data-producto]"
    );

    const contenedorLista = document.querySelector(
        "#lista-venta"
    );

    const mensajeVacio = document.querySelector(
        "#resumen-vacio"
    );

    const botonLimpiar = document.querySelector(
        "#limpiar-venta"
    );

    const botonFinalizar = document.querySelector(
        "#finalizar-venta"
    );

    const cantidadTotal = document.querySelector(
        "#cantidad-total"
    );

    const totalVenta = document.querySelector(
        "#total-venta"
    );

    const etiquetaCantidad = document.querySelector(
        ".resumen-venta__cantidad"
    );

    const catalogoProductos = {
        "manzana-verde": {
            nombre: "Manzana verde",
            categoria: "manzana",
            permiteCarton: true,
            precioCaja: null,
            precioCarton: null
        },

        "manzana-california": {
            nombre: "Manzana California",
            categoria: "manzana",
            permiteCarton: true,
            precioCaja: null,
            precioCarton: null
        },

        "manzana-amarilla": {
            nombre: "Manzana amarilla",
            categoria: "manzana",
            permiteCarton: true,
            precioCaja: null,
            precioCarton: null
        },

        "manzana-gala": {
            nombre: "Manzana Gala",
            categoria: "manzana",
            permiteCarton: true,
            precioCaja: null,
            precioCarton: null
        },

        "manzana-pink-lady": {
            nombre: "Manzana Pink Lady",
            categoria: "manzana",
            permiteCarton: true,
            precioCaja: null,
            precioCarton: null
        },

        "uva-verde": {
            nombre: "Uva verde",
            categoria: "uva",
            permiteCarton: false,
            precioCaja: null,
            precioCarton: null
        },

        "uva-roja": {
            nombre: "Uva roja",
            categoria: "uva",
            permiteCarton: false,
            precioCaja: null,
            precioCarton: null
        },

        "pera-forell": {
            nombre: "Pera Forell",
            categoria: "pera",
            permiteCarton: true,
            precioCaja: null,
            precioCarton: null
        },

        "pera-piedra-cafe": {
            nombre: "Pera piedra café",
            categoria: "pera",
            permiteCarton: true,
            precioCaja: null,
            precioCarton: null
        },

        "pera-verde": {
            nombre: "Pera verde",
            categoria: "pera",
            permiteCarton: true,
            precioCaja: null,
            precioCarton: null
        }
    };

    function obtenerProducto(idProducto) {
        return catalogoProductos[idProducto] || null;
    }

    function obtenerClaveVenta(idProducto, presentacion) {
        return `${idProducto}__${presentacion}`;
    }

    function interpretarClaveVenta(clave) {
        const [idProducto, presentacion] = clave.split("__");
        return { idProducto, presentacion };
    }

    function obtenerEtiquetaPresentacion(producto, presentacion) {
        if (presentacion === "carton") {
            return `Cartón de ${producto.categoria}`;
        }
        return `Caja de ${producto.categoria}`;
    }

    function obtenerPrecioItem(producto, presentacion) {
        return presentacion === "carton"
            ? producto.precioCarton
            : producto.precioCaja;
    }

    function obtenerCantidadTotal() {
        let total = 0;

        estadoVenta.forEach((cantidad) => {
            total += cantidad;
        });

        return total;
    }

    function agregarProducto(idProducto, presentacion = "caja") {
        const producto = obtenerProducto(idProducto);

        if (!producto) {
            return;
        }

        if (presentacion === "carton" && !producto.permiteCarton) {
            return;
        }

        const clave = obtenerClaveVenta(idProducto, presentacion);
        const cantidadActual = estadoVenta.get(clave) || 0;

        estadoVenta.set(
            clave,
            cantidadActual + 1
        );

        actualizarResumen();
    }

    function aumentarItem(clave) {
        const cantidadActual = estadoVenta.get(clave) || 0;
        estadoVenta.set(clave, cantidadActual + 1);
        actualizarResumen();
    }

    function disminuirItem(clave) {
        const cantidadActual = estadoVenta.get(clave) || 0;

        if (cantidadActual <= 1) {
            estadoVenta.delete(clave);
        } else {
            estadoVenta.set(
                clave,
                cantidadActual - 1
            );
        }

        actualizarResumen();
    }

    function crearElementoVenta(clave, cantidad) {
        const { idProducto, presentacion } = interpretarClaveVenta(clave);
        const producto = obtenerProducto(idProducto);

        if (!producto) {
            return null;
        }

        const detallePresentacion = obtenerEtiquetaPresentacion(producto, presentacion);
        const elemento = document.createElement("div");

        elemento.className = "venta-item";

        elemento.innerHTML = `
            <div class="venta-item__informacion">
                <h3 class="venta-item__nombre">
                    ${producto.nombre}
                </h3>

                <p class="venta-item__detalle">
                    ${detallePresentacion}
                </p>
            </div>

            <div class="venta-item__controles">
                <button
                    type="button"
                    class="venta-item__control"
                    data-accion="disminuir"
                    data-clave="${clave}"
                    aria-label="Disminuir cantidad de ${producto.nombre} (${detallePresentacion})"
                >
                    -
                </button>

                <span class="venta-item__cantidad">
                    ${cantidad}
                </span>

                <button
                    type="button"
                    class="venta-item__control"
                    data-accion="aumentar"
                    data-clave="${clave}"
                    aria-label="Aumentar cantidad de ${producto.nombre} (${detallePresentacion})"
                >
                    +
                </button>
            </div>
        `;

        return elemento;
    }

    function renderizarListaVenta() {
        contenedorLista.innerHTML = "";

        estadoVenta.forEach((cantidad, clave) => {
            const elementoVenta = crearElementoVenta(
                clave,
                cantidad
            );

            if (elementoVenta) {
                contenedorLista.appendChild(elementoVenta);
            }
        });
    }

    function actualizarEstadoVacio() {
        const hayProductos = estadoVenta.size > 0;

        mensajeVacio.hidden = hayProductos;
        contenedorLista.hidden = !hayProductos;
    }

    function actualizarCantidadTotal() {
        const totalProductos = obtenerCantidadTotal();

        cantidadTotal.textContent = totalProductos;

        etiquetaCantidad.textContent = totalProductos === 1
            ? "1 producto"
            : `${totalProductos} productos`;
    }

    function actualizarTotalVisual() {
        const hayPrecios = Array.from(
            estadoVenta.keys()
        ).some((clave) => {
            const { idProducto, presentacion } = interpretarClaveVenta(clave);
            const producto = obtenerProducto(idProducto);

            return producto && obtenerPrecioItem(producto, presentacion) !== null;
        });

        if (!hayPrecios) {
            totalVenta.textContent = "Precio pendiente";
            return;
        }

        let total = 0;
        let todosTienenPrecio = true;

        estadoVenta.forEach((cantidad, clave) => {
            const { idProducto, presentacion } = interpretarClaveVenta(clave);
            const producto = obtenerProducto(idProducto);
            const precio = producto ? obtenerPrecioItem(producto, presentacion) : null;

            if (!producto || precio === null) {
                todosTienenPrecio = false;
                return;
            }

            total += precio * cantidad;
        });

        if (!todosTienenPrecio) {
            totalVenta.textContent = "Precio pendiente";
            return;
        }

        totalVenta.textContent = formatearPrecio(total);
    }

    function formatearPrecio(valor) {
        return new Intl.NumberFormat(
            "es-SV",
            {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 2
            }
        ).format(valor);
    }

    function actualizarResumen() {
        renderizarListaVenta();
        actualizarEstadoVacio();
        actualizarCantidadTotal();
        actualizarTotalVisual();
    }

    function limpiarVenta() {
        estadoVenta.clear();
        actualizarResumen();
    }

    function finalizarVenta() {
        const totalProductos = obtenerCantidadTotal();

        if (totalProductos === 0) {
            window.alert(
                "Todavía no hay productos seleccionados."
            );

            return;
        }

        window.alert(
            "Este prototipo todavía no tiene precios reales ni cierre de venta."
        );
    }

    botonesProducto.forEach((boton) => {
        boton.addEventListener("click", () => {
            const idProducto = boton.dataset.producto;
            const presentacion = boton.dataset.presentacion || "caja";

            agregarProducto(idProducto, presentacion);
        });
    });

    contenedorLista.addEventListener("click", (evento) => {
        const boton = evento.target.closest(
            "[data-accion][data-clave]"
        );

        if (!boton) {
            return;
        }

        const clave = boton.dataset.clave;
        const accion = boton.dataset.accion;

        if (accion === "aumentar") {
            aumentarItem(clave);
        }

        if (accion === "disminuir") {
            disminuirItem(clave);
        }
    });

    botonLimpiar.addEventListener(
        "click",
        limpiarVenta
    );

    botonFinalizar.addEventListener(
        "click",
        finalizarVenta
    );

    actualizarResumen();
});
