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
            tipo: "Caja de manzana",
            precio: null
        },

        "manzana-california": {
            nombre: "Manzana California",
            tipo: "Caja de manzana",
            precio: null
        },

        "manzana-amarilla": {
            nombre: "Manzana amarilla",
            tipo: "Caja de manzana",
            precio: null
        },

        "manzana-gala": {
            nombre: "Manzana Gala",
            tipo: "Caja de manzana",
            precio: null
        },

        "manzana-pink-lady": {
            nombre: "Manzana Pink Lady",
            tipo: "Caja de manzana",
            precio: null
        },

        "uva-verde": {
            nombre: "Uva verde",
            tipo: "Caja de uva",
            precio: null
        },

        "uva-roja": {
            nombre: "Uva roja",
            tipo: "Caja de uva",
            precio: null
        },

        "pera-forell": {
            nombre: "Pera Forell",
            tipo: "Caja de pera",
            precio: null
        },

        "pera-piedra-cafe": {
            nombre: "Pera piedra café",
            tipo: "Caja de pera",
            precio: null
        },

        "pera-verde": {
            nombre: "Pera verde",
            tipo: "Caja de pera",
            precio: null
        }
    };

    function obtenerProducto(idProducto) {
        return catalogoProductos[idProducto] || null;
    }

    function obtenerCantidadTotal() {
        let total = 0;

        estadoVenta.forEach((cantidad) => {
            total += cantidad;
        });

        return total;
    }

    function agregarProducto(idProducto) {
        const producto = obtenerProducto(idProducto);

        if (!producto) {
            return;
        }

        const cantidadActual = estadoVenta.get(idProducto) || 0;

        estadoVenta.set(
            idProducto,
            cantidadActual + 1
        );

        actualizarResumen();
    }

    function aumentarProducto(idProducto) {
        agregarProducto(idProducto);
    }

    function disminuirProducto(idProducto) {
        const cantidadActual = estadoVenta.get(idProducto) || 0;

        if (cantidadActual <= 1) {
            estadoVenta.delete(idProducto);
        } else {
            estadoVenta.set(
                idProducto,
                cantidadActual - 1
            );
        }

        actualizarResumen();
    }

    function crearElementoVenta(idProducto, cantidad) {
        const producto = obtenerProducto(idProducto);

        if (!producto) {
            return null;
        }

        const elemento = document.createElement("div");

        elemento.className = "venta-item";

        elemento.innerHTML = `
            <div class="venta-item__informacion">
                <h3 class="venta-item__nombre">
                    ${producto.nombre}
                </h3>

                <p class="venta-item__detalle">
                    ${producto.tipo}
                </p>
            </div>

            <div class="venta-item__controles">
                <button
                    type="button"
                    class="venta-item__control"
                    data-accion="disminuir"
                    data-producto="${idProducto}"
                    aria-label="Disminuir cantidad de ${producto.nombre}"
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
                    data-producto="${idProducto}"
                    aria-label="Aumentar cantidad de ${producto.nombre}"
                >
                    +
                </button>
            </div>
        `;

        return elemento;
    }

    function renderizarListaVenta() {
        contenedorLista.innerHTML = "";

        estadoVenta.forEach((cantidad, idProducto) => {
            const elementoVenta = crearElementoVenta(
                idProducto,
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
        ).some((idProducto) => {
            const producto = obtenerProducto(idProducto);

            return producto && producto.precio !== null;
        });

        if (!hayPrecios) {
            totalVenta.textContent = "Precio pendiente";
            return;
        }

        let total = 0;
        let todosTienenPrecio = true;

        estadoVenta.forEach((cantidad, idProducto) => {
            const producto = obtenerProducto(idProducto);

            if (!producto || producto.precio === null) {
                todosTienenPrecio = false;
                return;
            }

            total += producto.precio * cantidad;
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

            agregarProducto(idProducto);
        });
    });

    contenedorLista.addEventListener("click", (evento) => {
        const boton = evento.target.closest(
            "[data-accion][data-producto]"
        );

        if (!boton) {
            return;
        }

        const idProducto = boton.dataset.producto;
        const accion = boton.dataset.accion;

        if (accion === "aumentar") {
            aumentarProducto(idProducto);
        }

        if (accion === "disminuir") {
            disminuirProducto(idProducto);
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
