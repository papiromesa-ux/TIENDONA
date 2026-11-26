"use strict";

/* ============================================================
   TIENDONA · lógica de pedido, catálogo y administración segura
   ============================================================ */

(() => {
    /* ---------------- constantes ---------------- */
    const ALMACEN = {
        catalogo: "tiendona_catalogo_v3",
        catalogoLegado: "calc_frutas_catalogo_v2",
        nota: "tiendona_nota_v1",
        pedido: "tiendona_pedido_v1",
        credencial: "tiendona_admin_credencial_v1",
        bloqueo: "tiendona_admin_bloqueo_v1",
        sesion: "tiendona_admin_sesion_v1",
        auditoria: "tiendona_admin_auditoria_v1"
    };

    const SEGURIDAD = {
        iteraciones: 250000,
        maxIntentos: 5,
        bloqueoBase: 30000,
        bloqueoMax: 15 * 60 * 1000,
        sesionInactividad: 10 * 60 * 1000,
        sesionAbsoluta: 60 * 60 * 1000,
        longitudMinima: 10,
        longitudMaxima: 128
    };

    const CATEGORIAS = {
        manzana: { nombre: "Manzana", plural: "Manzanas", emoji: "🍎" },
        uva: { nombre: "Uva", plural: "Uvas", emoji: "🍇" },
        pera: { nombre: "Pera", plural: "Peras", emoji: "🍐" }
    };

    const PRESENTACIONES = {
        caja: "Caja",
        carton: "Cartón",
        libra: "Libra"
    };

    const ACCIONES_AUDITORIA = {
        sesion_iniciada: "Sesión iniciada",
        sesion_fallida: "Intento de acceso fallido",
        sesion_bloqueada: "Acceso bloqueado temporalmente",
        sesion_cerrada: "Sesión cerrada",
        credencial_creada: "Clave maestra creada",
        credencial_actualizada: "Hash de seguridad reforzado",
        clave_cambiada: "Clave maestra actualizada",
        producto_actualizado: "Producto actualizado",
        producto_creado: "Producto creado",
        producto_eliminado: "Producto eliminado",
        catalogo_exportado: "Catálogo exportado",
        catalogo_importado: "Catálogo importado",
        catalogo_restablecido: "Catálogo restablecido"
    };

    const CATALOGO_INICIAL = {
        "manzana-verde": {
            id: "manzana-verde",
            categoria: "manzana",
            nombre: "Manzana verde",
            imagen: "imagenes/mv.jpg",
            emoji: "🍏",
            info: "Caja o cartón · Fresca y ácida",
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
            imagen: "imagenes/mc.jpg",
            emoji: "🍎",
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
            imagen: "imagenes/ma.jpg",
            emoji: "🍏",
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
            imagen: "imagenes/mg.jpg",
            emoji: "🍎",
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
            imagen: "imagenes/mp.jpg",
            emoji: "🍎",
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
            imagen: "imagenes/uva-verde.svg",
            emoji: "🍇",
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
            imagen: "imagenes/uva-roja.svg",
            emoji: "🍇",
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
            imagen: "imagenes/pf.jpg",
            emoji: "🍐",
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
            imagen: "imagenes/pera-piedra-cafe.svg",
            emoji: "🍐",
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
            imagen: "imagenes/pera-verde.svg",
            emoji: "🍐",
            info: "Caja o cartón · Jugosa",
            disponible: true,
            presentaciones: ["caja", "carton"],
            precios: { caja: null, carton: null },
            calibres: ["100", "110", "120", "135"],
            calibrePorDefecto: "110",
            nota: ""
        }
    };

    /* ---------------- utilidades ---------------- */
    const $ = (selector, contexto = document) => contexto.querySelector(selector);
    const $$ = (selector, contexto = document) => Array.from(contexto.querySelectorAll(selector));

    const formatoMoneda = new Intl.NumberFormat("es-SV", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2
    });
    const formatoNumero = new Intl.NumberFormat("es-SV");

    function escapar(valor) {
        return String(valor ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");
    }

    function normalizar(texto) {
        return String(texto ?? "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();
    }

    function clonar(valor) {
        return JSON.parse(JSON.stringify(valor));
    }

    function formatearPrecio(valor) {
        return formatoMoneda.format(valor);
    }

    function etiquetaPresentacion(presentacion) {
        return PRESENTACIONES[presentacion] || "Caja";
    }

    function leerJSON(clave, almacen) {
        try {
            const destino = almacen || window.localStorage;
            const crudo = destino.getItem(clave);
            return crudo ? JSON.parse(crudo) : null;
        } catch {
            return null;
        }
    }

    function escribirJSON(clave, valor, almacen) {
        try {
            const destino = almacen || window.localStorage;
            destino.setItem(clave, JSON.stringify(valor));
            return true;
        } catch {
            return false;
        }
    }

    function leerTexto(clave, almacen) {
        try {
            return (almacen || window.localStorage).getItem(clave) || "";
        } catch {
            return "";
        }
    }

    function guardarTexto(clave, valor, almacen) {
        try {
            (almacen || window.localStorage).setItem(clave, valor);
            return true;
        } catch {
            return false;
        }
    }

    function slugUnico(nombre) {
        const base = normalizar(nombre)
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 48) || "producto";
        let id = base;
        let n = 2;
        while (catalogo[id]) {
            id = `${base}-${n}`;
            n += 1;
        }
        return id;
    }

    function aleatorioHex(bytes = 12) {
        try {
            const datos = crypto.getRandomValues(new Uint8Array(bytes));
            return Array.from(datos, (b) => b.toString(16).padStart(2, "0")).join("");
        } catch {
            return Math.random().toString(16).slice(2, 2 + bytes * 2);
        }
    }

    function bytesABase64(bytes) {
        let binario = "";
        bytes.forEach((b) => {
            binario += String.fromCharCode(b);
        });
        return btoa(binario);
    }

    function base64ABytes(texto) {
        const binario = atob(texto);
        return Uint8Array.from(binario, (c) => c.charCodeAt(0));
    }

    function compararSeguro(a, b) {
        if (a.length !== b.length) return false;
        let diferencia = 0;
        for (let i = 0; i < a.length; i += 1) {
            diferencia |= a[i] ^ b[i];
        }
        return diferencia === 0;
    }

    function cryptoDisponible() {
        return Boolean(
            typeof crypto !== "undefined" &&
            crypto.subtle &&
            typeof crypto.subtle.deriveBits === "function" &&
            typeof crypto.getRandomValues === "function"
        );
    }

    function formatearFechaHora(iso) {
        const fecha = new Date(iso);
        if (Number.isNaN(fecha.getTime())) return "—";
        return new Intl.DateTimeFormat("es-SV", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
        }).format(fecha);
    }

    function formatearFecha(iso) {
        const fecha = new Date(iso);
        if (Number.isNaN(fecha.getTime())) return "hoy";
        return new Intl.DateTimeFormat("es-SV", {
            day: "numeric",
            month: "long",
            year: "numeric"
        }).format(fecha);
    }

    function formatearTiempo(ms) {
        const total = Math.max(0, Math.ceil(ms / 1000));
        const minutos = Math.floor(total / 60);
        const segundos = total % 60;
        return `${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;
    }

    function normalizarCatalogo(productos) {
        const salida = {};
        Object.entries(productos || {}).forEach(([id, producto]) => {
            if (!producto || typeof producto !== "object") return;
            const categoria = CATEGORIAS[producto.categoria] ? producto.categoria : "manzana";
            let presentaciones = Array.isArray(producto.presentaciones)
                ? producto.presentaciones.filter((p) => PRESENTACIONES[p])
                : [];
            if (!presentaciones.length) presentaciones = ["caja"];
            presentaciones = [...new Set(presentaciones)];

            const precios = {};
            presentaciones.forEach((pres) => {
                const valor = producto.precios ? producto.precios[pres] : null;
                if (valor === null || valor === undefined || valor === "") {
                    precios[pres] = null;
                } else {
                    const numero = Number(valor);
                    precios[pres] = Number.isFinite(numero) && numero >= 0 ? Math.round(numero * 100) / 100 : null;
                }
            });

            const calibres = Array.isArray(producto.calibres)
                ? producto.calibres.map((c) => String(c).trim()).filter(Boolean)
                : [];

            salida[id] = {
                id,
                categoria,
                nombre: String(producto.nombre || "Producto").slice(0, 80),
                imagen: String(producto.imagen || ""),
                emoji: String(producto.emoji || CATEGORIAS[categoria].emoji),
                info: String(producto.info || "").slice(0, 120),
                disponible: producto.disponible !== false,
                presentaciones,
                precios,
                calibres,
                calibrePorDefecto: calibres.includes(String(producto.calibrePorDefecto))
                    ? String(producto.calibrePorDefecto)
                    : (calibres[0] || ""),
                nota: String(producto.nota || "").slice(0, 200)
            };
        });
        return salida;
    }

    /* ---------------- estado ---------------- */
    const guardado = leerJSON(ALMACEN.catalogo);
    let catalogo;
    let actualizado = null;

    if (guardado && guardado.productos && typeof guardado.productos === "object") {
        catalogo = normalizarCatalogo(guardado.productos);
        actualizado = guardado.actualizado || null;
    } else {
        const legado = leerJSON(ALMACEN.catalogoLegado);
        if (legado && typeof legado === "object") {
            catalogo = normalizarCatalogo({ ...clonar(CATALOGO_INICIAL), ...legado });
        } else {
            catalogo = normalizarCatalogo(clonar(CATALOGO_INICIAL));
        }
    }

    const pedido = new Map();
    const pedidoGuardado = leerJSON(ALMACEN.pedido, window.sessionStorage);
    if (pedidoGuardado && Array.isArray(pedidoGuardado.items)) {
        pedidoGuardado.items.forEach((item) => {
            if (!item || !catalogo[item.idProducto]) return;
            const cantidad = Math.max(1, Math.min(99, Number(item.cantidad) || 1));
            pedido.set(claveItem(item), { ...item, cantidad });
        });
    }

    let notaGeneral = leerTexto(ALMACEN.nota);
    let filtroActivo = "todo";
    let busqueda = "";
    let seleccion = null;
    let adminActivo = false;
    let sesion = null;
    let temporizadorSesion = null;
    let temporizadorGate = null;
    let temporizadorBusqueda = null;
    let resolverConfirmacion = null;
    let paletaIndice = 0;
    let comandosVisibles = [];
    let bufferSecreto = "";
    let temporizadorSecreto = null;

    /* ---------------- referencias DOM ---------------- */
    const el = {
        cabecera: $("#cabecera"),
        progreso: $("#progreso-barra"),
        cursor: $("#cursor-luz"),
        marca: $("#marca"),
        navAdmin: $("#nav-admin"),
        btnPaleta: $("#btn-paleta"),
        btnPaletaPie: $("#btn-paleta-pie"),
        btnPrivado: $("#btn-acceso-privado"),
        btnCarritoCabecera: $("#btn-carrito-cabecera"),
        badgeCarrito: $("#badge-carrito"),
        heroConteo: $("#hero-conteo"),
        datoProductos: $("#dato-productos"),
        datoCategorias: $("#dato-categorias"),
        btnHeroCuenta: $("#hero-ver-cuenta"),
        buscador: $("#buscador"),
        grid: $("#grid-productos"),
        vacio: $("#catalogo-vacio"),
        btnVacioLimpiar: $("#vacio-limpiar"),
        filtros: $$(".filtro"),
        cierreCuenta: $("#cierre-cuenta"),
        carritoFlotante: $("#carrito-flotante"),
        fabBadge: $("#fab-badge"),
        fabTotal: $("#fab-total"),
        velo: $("#velo-carrito"),
        cajon: $("#cajon-carrito"),
        cajonVacio: $("#cajon-vacio"),
        cajonLista: $("#cajon-lista"),
        cajonIrCatalogo: $("#cajon-ir-catalogo"),
        notaGeneral: $("#nota-general"),
        totalUnidades: $("#total-unidades"),
        totalDinero: $("#total-dinero"),
        avisoPendiente: $("#aviso-pendiente"),
        btnLimpiar: $("#btn-limpiar"),
        btnGenerar: $("#btn-generar"),
        modalProducto: $("#modal-producto"),
        mpImagen: $("#mp-imagen"),
        mpEstado: $("#mp-estado"),
        mpCategoria: $("#mp-categoria"),
        mpTitulo: $("#mp-titulo"),
        mpInfo: $("#mp-info"),
        mpPresentaciones: $("#mp-presentaciones"),
        mpCalibres: $("#mp-calibres"),
        mpCalibreOtro: $("#mp-calibre-otro"),
        mpNota: $("#mp-nota"),
        mpMenos: $("#mp-menos"),
        mpCantidad: $("#mp-cantidad"),
        mpMas: $("#mp-mas"),
        mpAgregar: $("#mp-agregar"),
        mpEtiqueta: $("#mp-etiqueta"),
        mpSubtotal: $("#mp-subtotal"),
        modalCuenta: $("#modal-cuenta"),
        recibo: $("#recibo"),
        btnCopiarRecibo: $("#btn-copiar-recibo"),
        btnImprimir: $("#btn-imprimir"),
        modalAdmin: $("#modal-admin"),
        gateTitulo: $("#gate-titulo"),
        gateCuerpo: $("#gate-cuerpo"),
        gateSello: $("#gate-sello"),
        modalConfirmar: $("#modal-confirmar"),
        confTitulo: $("#conf-titulo"),
        confTexto: $("#conf-texto"),
        confAceptar: $("#conf-aceptar"),
        confCancelar: $("#conf-cancelar"),
        modalNuevo: $("#modal-nuevo"),
        formNuevo: $("#form-nuevo"),
        nuevoNombre: $("#nuevo-nombre"),
        nuevoCategoria: $("#nuevo-categoria"),
        nuevoInfo: $("#nuevo-info"),
        nuevoImagen: $("#nuevo-imagen"),
        nuevoError: $("#nuevo-error"),
        paleta: $("#paleta"),
        paletaInput: $("#paleta-input"),
        paletaLista: $("#paleta-lista"),
        toasts: $("#toasts"),
        vistaPublica: $("#vista-publica"),
        vistaAdmin: $("#vista-admin"),
        adminStats: $("#admin-stats"),
        adminLista: $("#admin-lista"),
        btnExportar: $("#btn-exportar"),
        inputImportar: $("#input-importar"),
        btnNuevo: $("#btn-nuevo"),
        btnReset: $("#btn-reset"),
        btnVolver: $("#btn-volver"),
        btnBloquear: $("#btn-bloquear"),
        sesionTiempo: $("#sesion-tiempo"),
        auditoria: $("#auditoria"),
        seguridadMeta: $("#seguridad-meta"),
        formClave: $("#form-clave"),
        claveActual: $("#clave-actual"),
        claveNueva: $("#clave-nueva"),
        claveNueva2: $("#clave-nueva-2"),
        claveError: $("#clave-error"),
        btnCambiarClave: $("#btn-cambiar-clave"),
        pieActualizado: $("#pie-actualizado"),
        heroVisual: $("#hero-visual")
    };

    const ICONOS = {
        lock: '<svg viewBox="0 0 24 24" fill="none"><rect x="5" y="10" width="14" height="10" rx="3" stroke="currentColor" stroke-width="1.6"/><path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10" stroke="currentColor" stroke-width="1.6"/></svg>',
        bolsa: '<svg viewBox="0 0 24 24" fill="none"><path d="M6 8h12l-1 12H7L6 8Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M9.5 8V6.5a2.5 2.5 0 0 1 5 0V8" stroke="currentColor" stroke-width="1.6"/></svg>',
        grid: '<svg viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="6.5" height="6.5" rx="1.6" stroke="currentColor" stroke-width="1.6"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6" stroke="currentColor" stroke-width="1.6"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6" stroke="currentColor" stroke-width="1.6"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.6" stroke="currentColor" stroke-width="1.6"/></svg>',
        basura: '<svg viewBox="0 0 24 24" fill="none"><path d="M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        ojo: '<svg viewBox="0 0 24 24" fill="none"><path d="M3 12s3.4-6 9-6 9 6 9 6-3.4 6-9 6-9-6-9-6Z" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="2.4" stroke="currentColor" stroke-width="1.6"/></svg>',
        caja: '<svg viewBox="0 0 24 24" fill="none"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
        check: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.6"/><path d="m8.5 12 2.4 2.4 4.6-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        moneda: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.6"/><path d="M14.5 9.2c-.5-.6-1.4-1-2.4-1-1.3 0-2.2.6-2.2 1.5 0 2.4 4.8 1 4.8 3.6 0 1-.9 1.7-2.4 1.7-1.2 0-2.2-.4-2.8-1.1M12 6.8v10.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
        capas: '<svg viewBox="0 0 24 24" fill="none"><path d="m12 3 9 5-9 5-9-5 9-5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>'
    };

    /* ---------------- catálogo ---------------- */
    function precioDe(producto, presentacion) {
        const valor = producto && producto.precios ? producto.precios[presentacion] : null;
        return typeof valor === "number" && Number.isFinite(valor) ? valor : null;
    }

    function precioMinimo(producto) {
        const valores = producto.presentaciones
            .map((pres) => precioDe(producto, pres))
            .filter((v) => v !== null);
        if (!valores.length) return null;
        return Math.min(...valores);
    }

    function presentacionDelMinimo(producto) {
        const minimo = precioMinimo(producto);
        if (minimo === null) return producto.presentaciones[0] || "caja";
        return producto.presentaciones.find((pres) => precioDe(producto, pres) === minimo) || producto.presentaciones[0];
    }

    function productosFiltrados() {
        const consulta = normalizar(busqueda);
        return Object.values(catalogo).filter((producto) => {
            if (filtroActivo !== "todo" && producto.categoria !== filtroActivo) return false;
            if (!consulta) return true;
            const texto = [
                producto.nombre,
                producto.info,
                producto.nota,
                CATEGORIAS[producto.categoria] ? CATEGORIAS[producto.categoria].nombre : "",
                ...producto.calibres
            ].map(normalizar).join(" ");
            return texto.includes(consulta);
        });
    }

    function tarjetaHTML(producto, indice) {
        const minimo = precioMinimo(producto);
        const presentacion = presentacionDelMinimo(producto);
        const precioHTML = minimo !== null
            ? `<span class="producto__desde">Desde</span>
               <span class="producto__precio">${formatearPrecio(minimo)}</span>
               <span class="producto__unidad">/ ${etiquetaPresentacion(presentacion).toLowerCase()}</span>`
            : `<span class="producto__desde">Precio</span>
               <span class="producto__precio producto__precio--pendiente">A confirmar</span>`;

        const chips = producto.calibres.slice(0, 3)
            .map((calibre) => `<span class="chip-mini">${escapar(calibre)}</span>`)
            .join("");
        const restantes = producto.calibres.length > 3
            ? `<span class="chip-mini chip-mini--mas">+${producto.calibres.length - 3}</span>`
            : "";

        const estado = producto.disponible
            ? '<span class="producto__estado"><i></i>Disponible</span>'
            : '<span class="producto__estado producto__estado--agotado"><i></i>Agotado</span>';

        const imagen = producto.imagen
            ? `<img src="${escapar(producto.imagen)}" alt="${escapar(producto.nombre)}" loading="lazy" decoding="async">`
            : "";

        const categoria = CATEGORIAS[producto.categoria] ? CATEGORIAS[producto.categoria].nombre : "Fruta";

        return `
            <article class="producto ${producto.imagen ? "" : "sin-imagen"}" style="--i:${indice}" data-id="${escapar(producto.id)}">
                <div class="producto__marco">
                    <div class="producto__media">
                        ${imagen}
                        <span class="producto__fallback" aria-hidden="true">${escapar(producto.emoji || "🍎")}</span>
                        ${estado}
                        <span class="producto__cat">${escapar(categoria)}</span>
                        <span class="producto__brillo"></span>
                    </div>
                    <div class="producto__cuerpo">
                        <div class="producto__linea">
                            <h3 class="producto__nombre">${escapar(producto.nombre)}</h3>
                        </div>
                        <p class="producto__info">${escapar(producto.info || "Fruta fresca de temporada")}</p>
                        <div class="producto__chips">${chips}${restantes}</div>
                        <div class="producto__pie">
                            <div>${precioHTML}</div>
                            <span class="producto__flecha" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none"><path d="M7 17 17 7M9 7h8v8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
                            </span>
                        </div>
                    </div>
                </div>
                <button type="button" class="producto__hit" data-abrir="${escapar(producto.id)}" aria-label="${producto.disponible ? "Elegir" : "Ver"} ${escapar(producto.nombre)}"></button>
            </article>`;
    }

    function renderizarCatalogo() {
        const lista = productosFiltrados();
        el.grid.innerHTML = lista.map((producto, indice) => tarjetaHTML(producto, indice)).join("");
        el.grid.hidden = lista.length === 0;
        el.vacio.hidden = lista.length > 0;
        actualizarContadores();
        actualizarDatosHero();
    }

    function actualizarContadores() {
        const todos = Object.values(catalogo);
        const cuenta = {
            todo: todos.length,
            manzana: todos.filter((p) => p.categoria === "manzana").length,
            uva: todos.filter((p) => p.categoria === "uva").length,
            pera: todos.filter((p) => p.categoria === "pera").length
        };
        const nodos = {
            todo: $("#filtro-n-todo"),
            manzana: $("#filtro-n-manzana"),
            uva: $("#filtro-n-uva"),
            pera: $("#filtro-n-pera")
        };
        Object.entries(nodos).forEach(([clave, nodo]) => {
            if (nodo) nodo.textContent = cuenta[clave];
        });
    }

    function actualizarDatosHero() {
        const productos = Object.values(catalogo);
        const categorias = new Set(productos.map((p) => p.categoria));
        el.datoProductos.textContent = productos.length;
        el.datoCategorias.textContent = categorias.size;
        el.heroConteo.textContent = obtenerUnidades();
    }

    function actualizarFechaPie() {
        el.pieActualizado.textContent = actualizado
            ? `Catálogo actualizado el ${formatearFecha(actualizado)}.`
            : "Catálogo actualizado hoy.";
    }

    function guardarCatalogo() {
        const ahora = new Date().toISOString();
        const ok = escribirJSON(ALMACEN.catalogo, {
            v: 3,
            actualizado: ahora,
            productos: catalogo
        });
        if (ok) {
            actualizado = ahora;
            actualizarFechaPie();
        }
        return ok;
    }

    /* ---------------- pedido ---------------- */
    function claveItem(item) {
        return `${item.idProducto}|${item.presentacion}|${item.calibre}|${item.nota}`;
    }

    function obtenerUnidades() {
        let total = 0;
        pedido.forEach((item) => {
            total += item.cantidad;
        });
        return total;
    }

    function guardarPedido() {
        escribirJSON(ALMACEN.pedido, { items: Array.from(pedido.values()) }, window.sessionStorage);
    }

    function limpiarPedidoHuerfano() {
        let cambio = false;
        Array.from(pedido.keys()).forEach((clave) => {
            const item = pedido.get(clave);
            if (!item || !catalogo[item.idProducto]) {
                pedido.delete(clave);
                cambio = true;
            }
        });
        if (cambio) {
            guardarPedido();
            renderPedido();
        }
    }

    function itemPedidoHTML(item) {
        const producto = catalogo[item.idProducto];
        if (!producto) return "";
        const precio = precioDe(producto, item.presentacion);
        const subtotal = precio !== null ? formatearPrecio(precio * item.cantidad) : "A confirmar";
        const clave = escapar(claveItem(item));
        const nota = item.nota
            ? `<em>Nota: ${escapar(item.nota)}</em>`
            : "";

        return `
            <div class="pedido-item">
                <div class="pedido-item__foto">
                    ${producto.imagen
                        ? `<img src="${escapar(producto.imagen)}" alt="" loading="lazy" decoding="async">`
                        : `<span aria-hidden="true">${escapar(producto.emoji || "🍎")}</span>`}
                </div>
                <div class="pedido-item__info">
                    <strong>${escapar(producto.nombre)}</strong>
                    <span>${etiquetaPresentacion(item.presentacion)} · Cal. ${escapar(item.calibre || "Estándar")}</span>
                    ${nota}
                    <div class="pedido-item__controles">
                        <button type="button" data-accion="menos" data-clave="${clave}" aria-label="Disminuir ${escapar(producto.nombre)}">−</button>
                        <b>${item.cantidad}</b>
                        <button type="button" data-accion="mas" data-clave="${clave}" aria-label="Aumentar ${escapar(producto.nombre)}">+</button>
                    </div>
                </div>
                <div class="pedido-item__lado">
                    <span class="pedido-item__precio">${subtotal}</span>
                    <button type="button" class="pedido-item__quitar" data-accion="quitar" data-clave="${clave}" aria-label="Quitar ${escapar(producto.nombre)}">
                        ${ICONOS.basura}
                    </button>
                </div>
            </div>`;
    }

    function renderPedido() {
        const items = Array.from(pedido.values());
        const vacio = items.length === 0;
        el.cajonVacio.hidden = !vacio;
        el.cajonLista.hidden = vacio;
        el.cajonLista.innerHTML = items.map(itemPedidoHTML).join("");
        actualizarResumen();
    }

    function actualizarResumen() {
        const items = Array.from(pedido.values());
        let unidades = 0;
        let total = 0;
        let conPrecio = false;
        let pendiente = false;

        items.forEach((item) => {
            unidades += item.cantidad;
            const producto = catalogo[item.idProducto];
            const precio = producto ? precioDe(producto, item.presentacion) : null;
            if (precio === null) {
                pendiente = true;
            } else {
                conPrecio = true;
                total += precio * item.cantidad;
            }
        });

        let totalTexto;
        if (!items.length) {
            totalTexto = "$0.00";
        } else if (!conPrecio) {
            totalTexto = "A confirmar";
        } else if (pendiente) {
            totalTexto = `${formatearPrecio(total)} +`;
        } else {
            totalTexto = formatearPrecio(total);
        }

        el.badgeCarrito.textContent = unidades;
        el.fabBadge.textContent = unidades;
        el.heroConteo.textContent = unidades;
        el.totalUnidades.textContent = unidades;
        el.totalDinero.textContent = totalTexto;
        el.fabTotal.textContent = totalTexto;
        el.avisoPendiente.hidden = !pendiente;
        el.btnLimpiar.disabled = !items.length;
        el.btnGenerar.disabled = !items.length;
        el.carritoFlotante.hidden = !items.length;
        el.badgeCarrito.classList.remove("is-pop");
        void el.badgeCarrito.offsetWidth;
        el.badgeCarrito.classList.add("is-pop");
        el.carritoFlotante.classList.remove("is-pop");
        void el.carritoFlotante.offsetWidth;
        el.carritoFlotante.classList.add("is-pop");
    }

    /* ---------------- cajón ---------------- */
    function hayCapasAbiertas() {
        return Boolean(
            document.querySelector(".modal-fondo:not([hidden])") ||
            el.cajon.classList.contains("abierto") ||
            !el.paleta.hidden
        );
    }

    function actualizarBloqueoScroll() {
        document.body.classList.toggle("sin-scroll", hayCapasAbiertas());
    }

    function abrirCajon() {
        if (el.cajon.classList.contains("abierto")) return;
        renderPedido();
        el.velo.hidden = false;
        el.cajon.setAttribute("aria-hidden", "false");
        requestAnimationFrame(() => {
            el.velo.classList.add("visible");
            el.cajon.classList.add("abierto");
        });
        actualizarBloqueoScroll();
        setTimeout(() => {
            const cerrar = el.cajon.querySelector("[data-cerrar-carrito]");
            if (cerrar) cerrar.focus({ preventScroll: true });
        }, 380);
    }

    function cerrarCajon() {
        if (!el.cajon.classList.contains("abierto")) return;
        el.velo.classList.remove("visible");
        el.cajon.classList.remove("abierto");
        el.cajon.setAttribute("aria-hidden", "true");
        setTimeout(() => {
            el.velo.hidden = true;
            actualizarBloqueoScroll();
        }, 680);
    }

    /* ---------------- modales ---------------- */
    function abrirModal(id) {
        const modal = document.getElementById(id);
        if (!modal) return;
        modal.hidden = false;
        requestAnimationFrame(() => modal.classList.add("is-abierto"));
        actualizarBloqueoScroll();
        setTimeout(() => {
            let enfocable = null;
            if (id === "modal-admin") {
                enfocable = modal.querySelector("#gate-clave, #gate-nueva");
            } else if (id === "modal-nuevo") {
                enfocable = modal.querySelector("#nuevo-nombre");
            }
            if (!enfocable) {
                enfocable = modal.querySelector(
                    "input:not([type='hidden']):not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled])"
                );
            }
            if (enfocable) enfocable.focus({ preventScroll: true });
        }, 260);
    }

    function cerrarModal(id) {
        const modal = document.getElementById(id);
        if (!modal) return;
        if (id === "modal-admin") {
            clearInterval(temporizadorGate);
            temporizadorGate = null;
        }
        modal.classList.remove("is-abierto");
        if (id === "modal-confirmar" && resolverConfirmacion) {
            const resolver = resolverConfirmacion;
            resolverConfirmacion = null;
            resolver(false);
        }
        setTimeout(() => {
            modal.hidden = true;
            actualizarBloqueoScroll();
        }, 380);
    }

    function confirmar({ titulo, texto, boton = "Confirmar", peligro = true }) {
        return new Promise((resolve) => {
            resolverConfirmacion = resolve;
            el.confTitulo.textContent = titulo;
            el.confTexto.textContent = texto;
            el.confAceptar.textContent = boton;
            el.confAceptar.className = `btn btn--sm ${peligro ? "btn--peligro" : "btn--primario"}`;
            abrirModal("modal-confirmar");
        });
    }

    /* ---------------- modal de producto ---------------- */
    function imagenDe(producto) {
        if (producto.imagen) return producto.imagen;
        const emoji = escapar(producto.emoji || "🍎");
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800"><rect width="800" height="800" fill="#f2e8d2"/><circle cx="400" cy="400" r="270" fill="#fbf7ec"/><text x="400" y="500" font-size="280" text-anchor="middle">${emoji}</text></svg>`;
        return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    }

    function abrirProducto(id) {
        const producto = catalogo[id];
        if (!producto) return;

        seleccion = {
            producto,
            presentacion: producto.presentaciones[0] || "caja",
            calibre: producto.calibrePorDefecto || producto.calibres[0] || "",
            cantidad: 1
        };

        el.mpTitulo.textContent = producto.nombre;
        el.mpCategoria.textContent = CATEGORIAS[producto.categoria]
            ? CATEGORIAS[producto.categoria].nombre
            : "Fruta";
        el.mpInfo.textContent = producto.info || "Fruta fresca de temporada.";
        el.mpNota.value = "";
        el.mpNota.placeholder = producto.nota
            ? `Sugerencia: ${producto.nota}`
            : "Ej. Bien maduras";
        el.mpCalibreOtro.value = "";
        el.mpCantidad.textContent = "1";

        if (producto.imagen || producto.emoji) {
            el.mpImagen.style.display = "";
            el.mpImagen.src = imagenDe(producto);
            el.mpImagen.alt = producto.nombre;
        } else {
            el.mpImagen.style.display = "none";
            el.mpImagen.removeAttribute("src");
        }

        el.mpEstado.textContent = producto.disponible ? "Disponible" : "Agotado";
        el.mpEstado.classList.toggle("pastilla--agotado", !producto.disponible);

        renderizarPresentaciones();
        renderizarCalibres();
        actualizarBotonAgregar();
        abrirModal("modal-producto");
    }

    function renderizarPresentaciones() {
        if (!seleccion) return;
        const producto = seleccion.producto;
        el.mpPresentaciones.innerHTML = producto.presentaciones.map((pres) => {
            const precio = precioDe(producto, pres);
            const activo = pres === seleccion.presentacion;
            return `
                <button type="button" class="segmento ${activo ? "is-activo" : ""}" data-presentacion="${pres}">
                    <strong>${etiquetaPresentacion(pres)}</strong>
                    <small>${precio !== null ? formatearPrecio(precio) : "A confirmar"}</small>
                </button>`;
        }).join("");
    }

    function renderizarCalibres() {
        if (!seleccion) return;
        const producto = seleccion.producto;
        el.mpCalibres.innerHTML = producto.calibres.map((calibre) => {
            const activo = calibre === seleccion.calibre && !el.mpCalibreOtro.value.trim();
            return `<button type="button" class="chip-calibre ${activo ? "is-activo" : ""}" data-calibre="${escapar(calibre)}">${escapar(calibre)}</button>`;
        }).join("");
    }

    function marcarCalibreActivo() {
        if (!seleccion) return;
        const personalizado = el.mpCalibreOtro.value.trim();
        $$(".chip-calibre", el.mpCalibres).forEach((chip) => {
            chip.classList.toggle("is-activo", !personalizado && chip.dataset.calibre === seleccion.calibre);
        });
    }

    function actualizarBotonAgregar() {
        if (!seleccion) return;
        const producto = seleccion.producto;
        const precio = precioDe(producto, seleccion.presentacion);
        el.mpEtiqueta.textContent = producto.disponible ? "Agregar" : "Agotado";
        el.mpSubtotal.textContent = producto.disponible
            ? (precio !== null ? formatearPrecio(precio * seleccion.cantidad) : "A confirmar")
            : "—";
        el.mpAgregar.disabled = !producto.disponible;
    }

    function agregarSeleccion() {
        if (!seleccion) return;
        const producto = seleccion.producto;
        if (!producto.disponible) return;

        const calibre = (el.mpCalibreOtro.value.trim() || seleccion.calibre || "Estándar").trim();
        const nota = el.mpNota.value.trim().slice(0, 160);
        const item = {
            idProducto: producto.id,
            presentacion: seleccion.presentacion,
            calibre,
            nota,
            cantidad: seleccion.cantidad
        };
        const clave = claveItem(item);
        const existente = pedido.get(clave);
        if (existente) {
            existente.cantidad = Math.min(99, existente.cantidad + seleccion.cantidad);
        } else {
            pedido.set(clave, item);
        }

        guardarPedido();
        renderPedido();
        volarAlCarrito(el.mpImagen);
        cerrarModal("modal-producto");
        toast(`${producto.nombre} · ${seleccion.cantidad} ${seleccion.cantidad === 1 ? "artículo" : "artículos"} en la cuenta.`);
    }

    function volarAlCarrito(origen) {
        if (!origen || !origen.getBoundingClientRect || !origen.src) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const destino = el.carritoFlotante.hidden
            ? el.btnCarritoCabecera
            : el.carritoFlotante;
        const desde = origen.getBoundingClientRect();
        const hasta = destino.getBoundingClientRect();
        if (!desde.width || !hasta.width) return;

        const clon = document.createElement("img");
        clon.src = origen.currentSrc || origen.src;
        clon.alt = "";
        clon.style.cssText = `position:fixed;left:${desde.left}px;top:${desde.top}px;width:${desde.width}px;height:${desde.height}px;object-fit:cover;border-radius:50%;z-index:700;pointer-events:none;box-shadow:0 18px 40px rgba(9,26,18,.35);`;
        document.body.appendChild(clon);

        const dx = hasta.left + hasta.width / 2 - (desde.left + desde.width / 2);
        const dy = hasta.top + hasta.height / 2 - (desde.top + desde.height / 2);

        const animacion = clon.animate(
            [
                { transform: "translate(0,0) scale(1)", opacity: 1, offset: 0 },
                { transform: `translate(${dx * 0.55}px, ${dy * 0.55 - 130}px) scale(.62)`, opacity: 0.95, offset: 0.58 },
                { transform: `translate(${dx}px, ${dy}px) scale(.08)`, opacity: 0, offset: 1 }
            ],
            { duration: 760, easing: "cubic-bezier(.2,.8,.2,1)" }
        );
        animacion.finished.catch(() => {}).finally(() => clon.remove());
    }

    /* ---------------- recibo ---------------- */
    function generarCuenta() {
        const items = Array.from(pedido.values());
        if (!items.length) {
            toast("Agrega al menos una fruta para generar la cuenta.", "error");
            return;
        }

        const ahora = new Date();
        const numero = `TN-${String(ahora.getFullYear()).slice(2)}${String(ahora.getMonth() + 1).padStart(2, "0")}${String(ahora.getDate()).padStart(2, "0")}-${aleatorioHex(2).toUpperCase()}`;
        const fecha = new Intl.DateTimeFormat("es-SV", {
            dateStyle: "long",
            timeStyle: "short"
        }).format(ahora);

        let unidades = 0;
        let total = 0;
        let conPrecio = false;
        let pendientes = 0;

        const lineas = items.map((item) => {
            const producto = catalogo[item.idProducto];
            if (!producto) return "";
            unidades += item.cantidad;
            const precio = precioDe(producto, item.presentacion);
            let precioTexto = "A confirmar";
            if (precio !== null) {
                conPrecio = true;
                total += precio * item.cantidad;
                precioTexto = formatearPrecio(precio * item.cantidad);
            } else {
                pendientes += 1;
            }
            const nota = item.nota
                ? `<span class="recibo__item-nota">Nota: ${escapar(item.nota)}</span>`
                : "";
            return `
                <div class="recibo__item">
                    <span class="recibo__item-nombre">${escapar(producto.nombre)}</span>
                    <span class="recibo__item-precio">${precioTexto}</span>
                    <span class="recibo__item-detalle">
                        ${etiquetaPresentacion(item.presentacion)} · Cal. ${escapar(item.calibre || "Estándar")} · ×${item.cantidad}
                    </span>
                    ${nota}
                </div>`;
        }).join("");

        const totalTexto = conPrecio
            ? formatearPrecio(total)
            : "A confirmar";

        el.recibo.innerHTML = `
            <div class="recibo__cabecera">
                <div class="recibo__marca">TIENDONA<span>frutería de mercado</span></div>
                <div class="recibo__meta">
                    <span>Cuenta <strong>${numero}</strong></span>
                    <span>${escapar(fecha)}</span>
                </div>
            </div>
            <div class="recibo__lineas">${lineas}</div>
            <div class="recibo__totales">
                <div><span>Artículos</span><strong>${unidades}</strong></div>
                <div><span>Precios por confirmar</span><strong>${pendientes}</strong></div>
                <div class="recibo__total"><span>Total del pedido</span><strong>${totalTexto}</strong></div>
            </div>
            ${notaGeneral.trim() ? `<div class="recibo__nota"><strong>Nota para la tienda:</strong> ${escapar(notaGeneral.trim())}</div>` : ""}
            <p class="recibo__pie">Gracias por tu pedido · Precios sujetos a confirmación</p>`;

        abrirModal("modal-cuenta");
    }

    async function copiarRecibo() {
        const texto = el.recibo.innerText.trim();
        let ok = false;
        try {
            await navigator.clipboard.writeText(texto);
            ok = true;
        } catch {
            try {
                const area = document.createElement("textarea");
                area.value = texto;
                area.style.cssText = "position:fixed;opacity:0;pointer-events:none;";
                document.body.appendChild(area);
                area.select();
                ok = document.execCommand("copy");
                area.remove();
            } catch {
                ok = false;
            }
        }
        toast(ok ? "Cuenta copiada al portapapeles." : "No se pudo copiar. Selecciona el texto manualmente.", ok ? "ok" : "error");
    }

    /* ---------------- toasts ---------------- */
    function toast(mensaje, tipo = "ok") {
        const div = document.createElement("div");
        div.className = `toast ${tipo === "error" ? "toast--error" : ""}`;
        div.innerHTML = `<span class="toast__icono">${tipo === "error" ? "!" : "✓"}</span><span>${escapar(mensaje)}</span>`;
        el.toasts.appendChild(div);
        while (el.toasts.children.length > 3) {
            el.toasts.firstElementChild.remove();
        }
        setTimeout(() => {
            div.classList.add("saliendo");
            setTimeout(() => div.remove(), 320);
        }, 4200);
    }

    /* ============================================================
       SEGURIDAD · credencial, bloqueo y sesión
       ============================================================ */
    let procesandoGate = false;
    let procesandoClave = false;

    function leerCredencial() {
        const cred = leerJSON(ALMACEN.credencial);
        if (!cred || typeof cred.hash !== "string" || typeof cred.sal !== "string") return null;
        return cred;
    }

    async function derivarClave(clave, sal, iteraciones) {
        const material = await crypto.subtle.importKey(
            "raw",
            new TextEncoder().encode(clave.normalize("NFKC")),
            "PBKDF2",
            false,
            ["deriveBits"]
        );
        const bits = await crypto.subtle.deriveBits(
            {
                name: "PBKDF2",
                salt: sal,
                iterations: iteraciones,
                hash: "SHA-256"
            },
            material,
            256
        );
        return new Uint8Array(bits);
    }

    async function crearCredencial(clave) {
        const sal = crypto.getRandomValues(new Uint8Array(16));
        const hash = await derivarClave(clave, sal, SEGURIDAD.iteraciones);
        const cred = {
            v: 1,
            sal: bytesABase64(sal),
            hash: bytesABase64(hash),
            iter: SEGURIDAD.iteraciones,
            creado: new Date().toISOString()
        };
        escribirJSON(ALMACEN.credencial, cred);
        return cred;
    }

    async function verificarClave(clave, cred) {
        const sal = base64ABytes(cred.sal);
        const iteraciones = Number(cred.iter) || SEGURIDAD.iteraciones;
        const hash = await derivarClave(clave, sal, iteraciones);
        return compararSeguro(hash, base64ABytes(cred.hash));
    }

    function leerBloqueo() {
        const bloqueo = leerJSON(ALMACEN.bloqueo);
        if (!bloqueo || typeof bloqueo !== "object") return { fallos: 0, hasta: 0 };
        return {
            fallos: Math.max(0, Number(bloqueo.fallos) || 0),
            hasta: Math.max(0, Number(bloqueo.hasta) || 0)
        };
    }

    function guardarBloqueo(bloqueo) {
        escribirJSON(ALMACEN.bloqueo, bloqueo);
    }

    function bloqueoRestante(bloqueo = leerBloqueo()) {
        return Math.max(0, (bloqueo.hasta || 0) - Date.now());
    }

    function registrarFallo() {
        const bloqueo = leerBloqueo();
        bloqueo.fallos += 1;
        if (bloqueo.fallos >= SEGURIDAD.maxIntentos) {
            const exceso = bloqueo.fallos - SEGURIDAD.maxIntentos;
            const espera = Math.min(
                SEGURIDAD.bloqueoMax,
                SEGURIDAD.bloqueoBase * Math.pow(2, exceso)
            );
            bloqueo.hasta = Date.now() + espera;
            registrarAuditoria(
                "sesion_bloqueada",
                `Bloqueo temporal de ${Math.ceil(espera / 1000)} s tras ${bloqueo.fallos} intentos`
            );
        }
        guardarBloqueo(bloqueo);
        return bloqueo;
    }

    function limpiarFallos() {
        guardarBloqueo({ fallos: 0, hasta: 0 });
    }

    function validarClave(clave) {
        if (clave.length < SEGURIDAD.longitudMinima) {
            return `Usa al menos ${SEGURIDAD.longitudMinima} caracteres.`;
        }
        if (clave.length > SEGURIDAD.longitudMaxima) {
            return `La clave no puede superar ${SEGURIDAD.longitudMaxima} caracteres.`;
        }
        if (!/[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]/.test(clave)) {
            return "Incluye al menos una letra.";
        }
        if (!/\d/.test(clave)) {
            return "Incluye al menos un número.";
        }
        if (/^\s|\s$/.test(clave)) {
            return "No empieces ni termines con espacios.";
        }
        return "";
    }

    function medirFuerza(clave) {
        let puntos = 0;
        if (clave.length >= SEGURIDAD.longitudMinima) puntos += 1;
        if (clave.length >= 14) puntos += 1;
        if (/[a-z]/.test(clave) && /[A-Z]/.test(clave)) puntos += 1;
        if (/\d/.test(clave)) puntos += 1;
        if (/[^\w\sáéíóúüñÁÉÍÓÚÜÑ]/.test(clave)) puntos += 1;

        if (puntos <= 2) return { porcentaje: 34, etiqueta: "Débil", color: "#d4776a" };
        if (puntos === 3) return { porcentaje: 64, etiqueta: "Media", color: "#e6b054" };
        return { porcentaje: 100, etiqueta: "Fuerte", color: "#79b894" };
    }

    function registrarAuditoria(accion, detalle = "") {
        const lista = leerJSON(ALMACEN.auditoria);
        const registros = Array.isArray(lista) ? lista : [];
        registros.push({
            t: new Date().toISOString(),
            accion,
            detalle: String(detalle).slice(0, 140)
        });
        while (registros.length > 120) registros.shift();
        escribirJSON(ALMACEN.auditoria, registros);
    }

    function renderAuditoria() {
        const registros = leerJSON(ALMACEN.auditoria);
        if (!Array.isArray(registros) || !registros.length) {
            el.auditoria.innerHTML = '<li class="auditoria__vacia">Sin actividad registrada todavía.</li>';
            return;
        }
        el.auditoria.innerHTML = registros
            .slice()
            .reverse()
            .slice(0, 30)
            .map((registro) => {
                const alerta = /fallida|bloqueada/.test(registro.accion);
                const etiqueta = ACCIONES_AUDITORIA[registro.accion] || registro.accion;
                const detalle = registro.detalle
                    ? `<small>${escapar(registro.detalle)}</small>`
                    : "";
                return `
                    <li>
                        <span class="auditoria__punto ${alerta ? "auditoria__punto--alerta" : ""}"></span>
                        <span class="auditoria__texto">${escapar(etiqueta)}${detalle}</span>
                        <span class="auditoria__hora">${escapar(formatearFechaHora(registro.t))}</span>
                    </li>`;
            })
            .join("");
    }

    function renderSeguridadMeta() {
        const cred = leerCredencial();
        if (!cred) {
            el.seguridadMeta.textContent = "Sin clave maestra configurada.";
            return;
        }
        el.seguridadMeta.textContent = `Clave creada el ${formatearFecha(cred.creado)} · PBKDF2-SHA256 · ${formatoNumero.format(Number(cred.iter) || SEGURIDAD.iteraciones)} iteraciones · sesión de 10 min.`;
    }

    /* ============================================================
       SESIÓN ADMIN
       ============================================================ */
    function leerSesion() {
        const guardada = leerJSON(ALMACEN.sesion, window.sessionStorage);
        if (!guardada || typeof guardada.token !== "string") return null;
        if (!Number.isFinite(guardada.inicio) || !Number.isFinite(guardada.ultimo)) return null;
        return guardada;
    }

    function sesionValida(actual) {
        if (!actual) return false;
        const ahora = Date.now();
        return (
            ahora < actual.ultimo + SEGURIDAD.sesionInactividad &&
            ahora < actual.inicio + SEGURIDAD.sesionAbsoluta
        );
    }

    function crearSesion() {
        const nueva = {
            token: aleatorioHex(24),
            inicio: Date.now(),
            ultimo: Date.now()
        };
        escribirJSON(ALMACEN.sesion, nueva, window.sessionStorage);
        return nueva;
    }

    function limpiarSesion() {
        sesion = null;
        try {
            window.sessionStorage.removeItem(ALMACEN.sesion);
        } catch {
            /* sin sessionStorage */
        }
        clearInterval(temporizadorSesion);
        temporizadorSesion = null;
        el.navAdmin.hidden = true;
    }

    function cerrarCapasPublicas() {
        ["modal-producto", "modal-cuenta", "modal-nuevo", "modal-confirmar"].forEach((id) => {
            const modal = document.getElementById(id);
            if (modal && !modal.hidden) cerrarModal(id);
        });
        cerrarCajon();
    }

    function salirVistaAdmin() {
        adminActivo = false;
        cerrarCapasPublicas();
        el.vistaAdmin.hidden = true;
        el.vistaPublica.hidden = false;
        document.body.classList.remove("admin-activo");
        window.scrollTo(0, 0);
        renderizarCatalogo();
        renderPedido();
    }

    function verTienda() {
        salirVistaAdmin();
    }

    function entrarAdmin() {
        if (!sesionValida(sesion)) {
            abrirGate();
            return;
        }
        adminActivo = true;
        cerrarCapasPublicas();
        el.vistaPublica.hidden = true;
        el.vistaAdmin.hidden = false;
        el.navAdmin.hidden = false;
        document.body.classList.add("admin-activo");
        cerrarModal("modal-admin");
        renderAdmin();
        iniciarTickerSesion();
        window.scrollTo(0, 0);
    }

    function bloquearAdmin(mensaje = "Sesión bloqueada. La clave maestra vuelve a ser necesaria.") {
        const estabaEnAdmin = adminActivo;
        limpiarSesion();
        if (estabaEnAdmin) salirVistaAdmin();
        registrarAuditoria("sesion_cerrada", "Bloqueo manual");
        toast(mensaje);
    }

    function comprobarSesion() {
        if (!sesion) return;
        if (!sesionValida(sesion)) {
            const estabaEnAdmin = adminActivo;
            limpiarSesion();
            if (estabaEnAdmin) {
                salirVistaAdmin();
                registrarAuditoria("sesion_cerrada", "Expiración automática por inactividad");
                toast("La sesión expiró. Vuelve a introducir la clave maestra.", "error");
            }
            return;
        }
        const restante = Math.min(
            sesion.ultimo + SEGURIDAD.sesionInactividad,
            sesion.inicio + SEGURIDAD.sesionAbsoluta
        ) - Date.now();
        el.sesionTiempo.textContent = formatearTiempo(restante);
    }

    function iniciarTickerSesion() {
        clearInterval(temporizadorSesion);
        comprobarSesion();
        temporizadorSesion = setInterval(comprobarSesion, 1000);
    }

    function marcarActividad() {
        if (!adminActivo || !sesion) return;
        const ahora = Date.now();
        if (ahora - sesion.ultimo < 3000) return;
        sesion.ultimo = ahora;
        escribirJSON(ALMACEN.sesion, sesion, window.sessionStorage);
    }

    /* ============================================================
       GATE · interfaz de acceso
       ============================================================ */
    function htmlLogin() {
        const bloqueo = leerBloqueo();
        const restante = bloqueoRestante(bloqueo);
        const bloqueado = restante > 0;
        const intentos = bloqueado ? 0 : Math.max(1, SEGURIDAD.maxIntentos - bloqueo.fallos);
        const sinCrypto = !cryptoDisponible();

        return `
            <form class="gate__form" id="gate-login" novalidate>
                <label class="gate__campo">
                    <span>Clave maestra</span>
                    <span class="gate__input">
                        <input id="gate-clave" type="password" autocomplete="current-password"
                            maxlength="${SEGURIDAD.longitudMaxima}" placeholder="••••••••••"
                            aria-describedby="gate-error" ${bloqueado || sinCrypto ? "disabled" : ""}>
                        <button type="button" class="gate__ver" data-ver-clave aria-label="Mostrar u ocultar clave">
                            ${ICONOS.ojo}
                        </button>
                    </span>
                </label>
                <p class="gate__error" id="gate-error" role="alert"></p>
                <button type="submit" class="btn btn--oro" id="gate-entrar" ${bloqueado || sinCrypto ? "disabled" : ""}>
                    ${bloqueado ? "Acceso bloqueado" : "Desbloquear panel"}
                </button>
                <p class="gate__pie">
                    PBKDF2-SHA256 · ${bloqueado ? `reintenta en <b data-countdown>${Math.ceil(restante / 1000)}</b> s` : `<b>${intentos}</b> intento${intentos === 1 ? "" : "s"} restante${intentos === 1 ? "" : "s"}`}
                </p>
                ${sinCrypto ? '<p class="gate__error">Este navegador no permite cifrado seguro. Abre el sitio con HTTPS.</p>' : ""}
                <p class="gate__nota">
                    La clave se guarda cifrada en este dispositivo. Si la olvidas, el catálogo solo se puede
                    recuperar desde un respaldo exportado.
                </p>
            </form>`;
    }

    function htmlSetup() {
        return `
            <form class="gate__form" id="gate-setup" novalidate>
                <p class="gate__aviso">
                    <strong>Primera vez.</strong> Crea una clave maestra para este dispositivo.
                    No se puede recuperar: guárdala en un lugar seguro.
                </p>
                <label class="gate__campo">
                    <span>Nueva clave</span>
                    <span class="gate__input">
                        <input id="gate-nueva" type="password" autocomplete="new-password"
                            maxlength="${SEGURIDAD.longitudMaxima}" placeholder="10 caracteres o más"
                            aria-describedby="gate-error">
                        <button type="button" class="gate__ver" data-ver-clave aria-label="Mostrar u ocultar clave">
                            ${ICONOS.ojo}
                        </button>
                    </span>
                </label>
                <label class="gate__campo">
                    <span>Repite la clave</span>
                    <span class="gate__input">
                        <input id="gate-nueva-2" type="password" autocomplete="new-password"
                            maxlength="${SEGURIDAD.longitudMaxima}" placeholder="Confirma la clave">
                        <button type="button" class="gate__ver" data-ver-clave aria-label="Mostrar u ocultar clave">
                            ${ICONOS.ojo}
                        </button>
                    </span>
                </label>
                <div class="fuerza">
                    <div class="fuerza__barra"><span id="fuerza-barra"></span></div>
                    <div class="fuerza__texto"><span>Seguridad de la clave</span><b id="fuerza-texto">—</b></div>
                </div>
                <ul class="reglas">
                    <li>Mínimo 10 caracteres</li>
                    <li>Al menos una letra y un número</li>
                </ul>
                <p class="gate__error" id="gate-error" role="alert"></p>
                <button type="submit" class="btn btn--oro" id="gate-crear">Crear clave y entrar</button>
                <p class="gate__pie">PBKDF2-SHA256 · 250 000 iteraciones · sal aleatoria</p>
            </form>`;
    }

    function renderGate(mensaje = "") {
        clearInterval(temporizadorGate);
        temporizadorGate = null;

        const cred = leerCredencial();
        el.gateTitulo.textContent = cred ? "Modo administrador" : "Crea tu clave";
        el.gateCuerpo.innerHTML = cred ? htmlLogin() : htmlSetup();

        if (mensaje) {
            const error = $("#gate-error", el.gateCuerpo);
            if (error) error.textContent = mensaje;
        }

        const bloqueo = leerBloqueo();
        if (cred && bloqueoRestante(bloqueo) > 0) iniciarCuentaAtrasGate();
    }

    function iniciarCuentaAtrasGate() {
        clearInterval(temporizadorGate);
        temporizadorGate = setInterval(() => {
            const restante = bloqueoRestante();
            if (restante <= 0) {
                clearInterval(temporizadorGate);
                temporizadorGate = null;
                if (!el.modalAdmin.hidden) renderGate();
                return;
            }
            const nodo = $("[data-countdown]", el.gateCuerpo);
            if (nodo) nodo.textContent = Math.ceil(restante / 1000);
        }, 500);
    }

    function abrirGate() {
        if (sesionValida(sesion)) {
            entrarAdmin();
            return;
        }
        if (sesion) limpiarSesion();
        renderGate();
        abrirModal("modal-admin");
    }

    async function manejarLogin() {
        if (procesandoGate) return;
        const cred = leerCredencial();
        if (!cred) {
            renderGate();
            return;
        }

        const input = $("#gate-clave", el.gateCuerpo);
        const error = $("#gate-error", el.gateCuerpo);
        const boton = $("#gate-entrar", el.gateCuerpo);
        if (!input || !error || !boton) return;

        const clave = input.value;
        if (!clave) {
            error.textContent = "Escribe la clave maestra.";
            input.focus();
            return;
        }
        if (!cryptoDisponible()) {
            error.textContent = "Este navegador no permite cifrado seguro. Abre el sitio con HTTPS.";
            return;
        }

        const restante = bloqueoRestante();
        if (restante > 0) {
            error.textContent = `Demasiados intentos. Espera ${Math.ceil(restante / 1000)} s.`;
            return;
        }

        procesandoGate = true;
        boton.disabled = true;
        boton.textContent = "Verificando…";

        try {
            const correcta = await verificarClave(clave, cred);
            if (correcta) {
                limpiarFallos();
                if ((Number(cred.iter) || 0) < SEGURIDAD.iteraciones) {
                    await crearCredencial(clave);
                    registrarAuditoria("credencial_actualizada", "Hash reforzado a 250 000 iteraciones");
                }
                sesion = crearSesion();
                el.navAdmin.hidden = false;
                registrarAuditoria("sesion_iniciada", "Acceso correcto al panel");
                cerrarModal("modal-admin");
                entrarAdmin();
                toast("Acceso concedido. Bienvenido al panel.");
            } else {
                const bloqueo = registrarFallo();
                const espera = bloqueoRestante(bloqueo);
                const intentos = Math.max(1, SEGURIDAD.maxIntentos - bloqueo.fallos);
                registrarAuditoria("sesion_fallida", `Intento ${bloqueo.fallos} de ${SEGURIDAD.maxIntentos}`);
                const mensaje = espera > 0
                    ? `Acceso bloqueado durante ${Math.ceil(espera / 1000)} s por demasiados intentos.`
                    : `Clave incorrecta. ${intentos} intento${intentos === 1 ? "" : "s"} restante${intentos === 1 ? "" : "s"}.`;
                renderGate(mensaje);
                const tarjeta = $(".modal", el.modalAdmin);
                if (tarjeta) {
                    tarjeta.classList.remove("sacudir");
                    void tarjeta.offsetWidth;
                    tarjeta.classList.add("sacudir");
                }
                const nuevoInput = $("#gate-clave", el.gateCuerpo);
                if (nuevoInput) nuevoInput.focus();
            }
        } catch {
            error.textContent = "No se pudo verificar la clave en este navegador.";
            boton.disabled = false;
            boton.textContent = "Desbloquear panel";
        } finally {
            procesandoGate = false;
        }
    }

    async function manejarSetup() {
        if (procesandoGate) return;
        const nueva = $("#gate-nueva", el.gateCuerpo);
        const repetir = $("#gate-nueva-2", el.gateCuerpo);
        const error = $("#gate-error", el.gateCuerpo);
        const boton = $("#gate-crear", el.gateCuerpo);
        if (!nueva || !repetir || !error || !boton) return;

        const problema = validarClave(nueva.value);
        if (problema) {
            error.textContent = problema;
            nueva.focus();
            return;
        }
        if (nueva.value !== repetir.value) {
            error.textContent = "Las claves no coinciden.";
            repetir.focus();
            return;
        }
        if (!cryptoDisponible()) {
            error.textContent = "Este navegador no permite cifrado seguro. Abre el sitio con HTTPS.";
            return;
        }

        procesandoGate = true;
        boton.disabled = true;
        boton.textContent = "Creando clave segura…";

        try {
            await crearCredencial(nueva.value);
            if (!leerCredencial()) throw new Error("sin almacenamiento");
            limpiarFallos();
            sesion = crearSesion();
            el.navAdmin.hidden = false;
            registrarAuditoria("credencial_creada", "Clave maestra configurada en este dispositivo");
            registrarAuditoria("sesion_iniciada", "Acceso inicial al panel");
            cerrarModal("modal-admin");
            entrarAdmin();
            toast("Clave maestra creada. Panel desbloqueado.");
        } catch {
            error.textContent = "No se pudo crear la clave. Inténtalo de nuevo.";
            boton.disabled = false;
            boton.textContent = "Crear clave y entrar";
        } finally {
            procesandoGate = false;
        }
    }

    /* ============================================================
       PANEL ADMIN
       ============================================================ */
    function renderAdmin() {
        if (!sesionValida(sesion)) {
            abrirGate();
            return;
        }
        renderStats();
        renderAdminLista();
        renderAuditoria();
        renderSeguridadMeta();
        const restante = Math.min(
            sesion.ultimo + SEGURIDAD.sesionInactividad,
            sesion.inicio + SEGURIDAD.sesionAbsoluta
        ) - Date.now();
        el.sesionTiempo.textContent = formatearTiempo(restante);
    }

    function renderStats() {
        const productos = Object.values(catalogo);
        const disponibles = productos.filter((p) => p.disponible).length;
        const conPrecio = productos.filter((p) =>
            p.presentaciones.some((pres) => precioDe(p, pres) !== null)
        ).length;
        const categorias = new Set(productos.map((p) => p.categoria)).size;

        const datos = [
            { icono: ICONOS.caja, valor: productos.length, etiqueta: "Productos" },
            { icono: ICONOS.check, valor: disponibles, etiqueta: "Disponibles" },
            { icono: ICONOS.moneda, valor: conPrecio, etiqueta: "Con precio" },
            { icono: ICONOS.capas, valor: categorias, etiqueta: "Categorías" }
        ];

        el.adminStats.innerHTML = datos.map((dato) => `
            <article class="stat">
                <span class="stat__icono">${dato.icono}</span>
                <div>
                    <strong>${dato.valor}</strong>
                    <span>${dato.etiqueta}</span>
                </div>
            </article>`).join("");
    }

    function adminItemHTML(producto) {
        const categoria = CATEGORIAS[producto.categoria]
            ? CATEGORIAS[producto.categoria].nombre
            : "Fruta";
        const foto = `<span class="admin-item__foto" data-emoji="${escapar(producto.emoji || "🍎")}">${producto.imagen
            ? `<img src="${escapar(producto.imagen)}" alt="" loading="lazy" decoding="async">`
            : escapar(producto.emoji || "🍎")}</span>`;

        const precios = producto.presentaciones.map((pres) => {
            const valor = precioDe(producto, pres);
            return `
                <label class="campo-admin">
                    <span>Precio ${etiquetaPresentacion(pres).toLowerCase()} (USD)</span>
                    <input type="number" min="0" step="0.01" inputmode="decimal"
                        data-precio="${pres}" value="${valor !== null ? valor : ""}"
                        placeholder="A confirmar">
                </label>`;
        }).join("");

        return `
            <article class="admin-item" data-id="${escapar(producto.id)}">
                <button type="button" class="admin-item__cabecera" data-toggle="${escapar(producto.id)}"
                    aria-expanded="false" aria-label="Editar ${escapar(producto.nombre)}">
                    ${foto}
                    <span>
                        <span class="admin-item__nombre">${escapar(producto.nombre)}</span>
                        <span class="admin-item__meta">${escapar(categoria)} · ${producto.presentaciones.map((p) => escapar(etiquetaPresentacion(p))).join(" / ")}</span>
                    </span>
                    <span class="admin-item__estado ${producto.disponible ? "" : "admin-item__estado--agotado"}">
                        ${producto.disponible ? "Disponible" : "Agotado"}
                    </span>
                    <span class="admin-item__chevron">
                        <svg viewBox="0 0 24 24" fill="none"><path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </span>
                </button>
                <div class="admin-item__cuerpo">
                    <div class="admin-item__interior">
                        <div class="admin-item__contenido">
                            <div class="admin-item__campos">
                                <label class="campo-admin">
                                    <span>Descripción corta</span>
                                    <input type="text" maxlength="80" data-campo="info"
                                        value="${escapar(producto.info)}" placeholder="Ej. Caja o cartón · Dulce">
                                </label>
                                <label class="campo-admin">
                                    <span>Calibres (separados por coma)</span>
                                    <input type="text" maxlength="120" data-campo="calibres"
                                        value="${escapar(producto.calibres.join(", "))}" placeholder="100, 113, 125">
                                </label>
                                <label class="campo-admin">
                                    <span>Nota visible</span>
                                    <input type="text" maxlength="160" data-campo="nota"
                                        value="${escapar(producto.nota)}" placeholder="Opcional">
                                </label>
                                ${precios}
                            </div>
                            <div class="admin-item__acciones">
                                <label class="switch">
                                    <input type="checkbox" data-campo="disponible" ${producto.disponible ? "checked" : ""}>
                                    <span class="switch__track"></span>
                                    Disponible
                                </label>
                                <div class="admin-item__botones">
                                    <button type="button" class="btn btn--peligro btn--sm" data-eliminar="${escapar(producto.id)}">Eliminar</button>
                                    <button type="button" class="btn btn--primario btn--sm" data-guardar="${escapar(producto.id)}">Guardar cambios</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </article>`;
    }

    function renderAdminLista() {
        const productos = Object.values(catalogo);
        if (!productos.length) {
            el.adminLista.innerHTML = `
                <div class="vacio">
                    <span class="vacio__icono">${ICONOS.caja}</span>
                    <p>Catálogo vacío</p>
                    <span>Crea un producto nuevo o importa un respaldo.</span>
                </div>`;
            return;
        }
        el.adminLista.innerHTML = productos.map(adminItemHTML).join("");
    }

    function guardarProductoAdmin(id, contenedor) {
        const producto = catalogo[id];
        if (!producto || !contenedor) return;

        const info = $('[data-campo="info"]', contenedor).value.trim();
        const calibres = $('[data-campo="calibres"]', contenedor).value
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean);
        const nota = $('[data-campo="nota"]', contenedor).value.trim();
        const disponible = $('[data-campo="disponible"]', contenedor).checked;

        const precios = {};
        $$("[data-precio]", contenedor).forEach((input) => {
            const crudo = input.value.trim();
            if (crudo === "") {
                precios[input.dataset.precio] = null;
            } else {
                const numero = Number(crudo);
                precios[input.dataset.precio] = Number.isFinite(numero) && numero >= 0
                    ? Math.round(numero * 100) / 100
                    : null;
            }
        });

        producto.info = info || "Fruta fresca de temporada";
        producto.calibres = calibres;
        producto.calibrePorDefecto = calibres.includes(producto.calibrePorDefecto)
            ? producto.calibrePorDefecto
            : (calibres[0] || "");
        producto.nota = nota;
        producto.disponible = disponible;
        producto.precios = { ...producto.precios, ...precios };

        if (!guardarCatalogo()) {
            toast("No se pudo guardar en este navegador. Revisa el almacenamiento.", "error");
            return;
        }

        registrarAuditoria("producto_actualizado", producto.nombre);
        renderStats();
        renderizarCatalogo();
        renderPedido();

        const estado = $(".admin-item__estado", contenedor);
        if (estado) {
            estado.textContent = producto.disponible ? "Disponible" : "Agotado";
            estado.classList.toggle("admin-item__estado--agotado", !producto.disponible);
        }
        const categoria = CATEGORIAS[producto.categoria] ? CATEGORIAS[producto.categoria].nombre : "Fruta";
        const meta = $(".admin-item__meta", contenedor);
        if (meta) {
            meta.textContent = `${categoria} · ${producto.presentaciones.map((p) => etiquetaPresentacion(p)).join(" / ")}`;
        }

        toast(`${producto.nombre} actualizado.`);
    }

    async function eliminarProducto(id) {
        const producto = catalogo[id];
        if (!producto) return;
        const confirmado = await confirmar({
            titulo: `¿Eliminar ${producto.nombre}?`,
            texto: "Se quitará del catálogo y de los pedidos guardados. Puedes recuperarlo importando un respaldo.",
            boton: "Eliminar producto"
        });
        if (!confirmado) return;

        delete catalogo[id];
        Array.from(pedido.entries()).forEach(([clave, item]) => {
            if (item.idProducto === id) pedido.delete(clave);
        });
        guardarCatalogo();
        guardarPedido();
        registrarAuditoria("producto_eliminado", producto.nombre);
        renderAdmin();
        renderizarCatalogo();
        renderPedido();
        toast(`${producto.nombre} eliminado del catálogo.`);
    }

    function abrirNuevoProducto() {
        el.formNuevo.reset();
        el.nuevoError.textContent = "";
        abrirModal("modal-nuevo");
    }

    function crearProducto(evento) {
        evento.preventDefault();
        if (!sesionValida(sesion)) {
            toast("La sesión expiró. Vuelve a introducir la clave.", "error");
            bloquearAdmin("La sesión expiró. Vuelve a introducir la clave.");
            return;
        }

        const nombre = el.nuevoNombre.value.trim();
        const categoria = el.nuevoCategoria.value;
        const info = el.nuevoInfo.value.trim();
        const imagen = el.nuevoImagen.value.trim();
        const presentaciones = $$('input[type="checkbox"]:checked', el.formNuevo)
            .map((input) => input.value)
            .filter((valor) => PRESENTACIONES[valor]);

        if (nombre.length < 2) {
            el.nuevoError.textContent = "Escribe un nombre de al menos 2 caracteres.";
            el.nuevoNombre.focus();
            return;
        }
        if (!CATEGORIAS[categoria]) {
            el.nuevoError.textContent = "Selecciona una categoría válida.";
            return;
        }
        if (!presentaciones.length) {
            el.nuevoError.textContent = "Selecciona al menos una presentación.";
            return;
        }

        const id = slugUnico(nombre);
        catalogo[id] = {
            id,
            categoria,
            nombre: nombre.slice(0, 80),
            imagen,
            emoji: CATEGORIAS[categoria].emoji,
            info: info.slice(0, 120) || "Fruta fresca de temporada",
            disponible: true,
            presentaciones: [...new Set(presentaciones)],
            precios: Object.fromEntries(presentaciones.map((pres) => [pres, null])),
            calibres: [],
            calibrePorDefecto: "",
            nota: ""
        };

        if (!guardarCatalogo()) {
            el.nuevoError.textContent = "No se pudo guardar en este navegador.";
            return;
        }

        registrarAuditoria("producto_creado", nombre);
        cerrarModal("modal-nuevo");
        renderAdmin();
        renderizarCatalogo();
        toast(`${nombre} agregado al catálogo.`);
    }

    function exportarCatalogo() {
        try {
            const datos = JSON.stringify({
                v: 3,
                exportado: new Date().toISOString(),
                productos: catalogo
            }, null, 2);
            const blob = new Blob([datos], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const enlace = document.createElement("a");
            enlace.href = url;
            enlace.download = `tiendona-catalogo-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(enlace);
            enlace.click();
            enlace.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1500);
            registrarAuditoria("catalogo_exportado", `${Object.keys(catalogo).length} productos`);
            toast("Respaldo del catálogo descargado.");
        } catch {
            toast("No se pudo exportar el catálogo.", "error");
        }
    }

    async function importarCatalogo(archivo) {
        if (!archivo) return;
        try {
            const texto = await archivo.text();
            const datos = JSON.parse(texto);
            const productos = datos && datos.productos ? datos.productos : datos;
            if (!productos || typeof productos !== "object" || Array.isArray(productos) || !Object.keys(productos).length) {
                throw new Error("Formato inválido");
            }
            const normalizados = normalizarCatalogo(productos);
            if (!Object.keys(normalizados).length) throw new Error("Sin productos válidos");

            const confirmado = await confirmar({
                titulo: "¿Importar catálogo?",
                texto: `Se reemplazarán los ${Object.keys(catalogo).length} productos actuales por ${Object.keys(normalizados).length} del respaldo. Esta acción no se puede deshacer.`,
                boton: "Importar respaldo"
            });
            if (!confirmado) return;

            catalogo = normalizados;
            guardarCatalogo();
            limpiarPedidoHuerfano();
            registrarAuditoria("catalogo_importado", `${Object.keys(catalogo).length} productos`);
            renderAdmin();
            renderizarCatalogo();
            renderPedido();
            toast("Catálogo importado correctamente.");
        } catch {
            toast("El archivo no es un respaldo válido de TIENDONA.", "error");
        }
    }

    async function restablecerCatalogo() {
        const confirmado = await confirmar({
            titulo: "¿Restablecer el catálogo?",
            texto: "Todos los precios, calibres y notas volverán a los valores de fábrica. La clave maestra se conserva. Exporta un respaldo antes si quieres guardar tus cambios.",
            boton: "Restablecer todo"
        });
        if (!confirmado) return;

        catalogo = normalizarCatalogo(clonar(CATALOGO_INICIAL));
        guardarCatalogo();
        limpiarPedidoHuerfano();
        registrarAuditoria("catalogo_restablecido", "Valores de fábrica");
        renderAdmin();
        renderizarCatalogo();
        renderPedido();
        toast("Catálogo restablecido a los valores de fábrica.");
    }

    async function cambiarClave(evento) {
        evento.preventDefault();
        if (procesandoClave) return;

        if (!sesionValida(sesion)) {
            toast("La sesión expiró. Vuelve a introducir la clave.", "error");
            bloquearAdmin("La sesión expiró. Vuelve a introducir la clave.");
            return;
        }

        el.claveError.textContent = "";
        const actual = el.claveActual.value;
        const nueva = el.claveNueva.value;
        const repetir = el.claveNueva2.value;
        const cred = leerCredencial();

        if (!cred) {
            el.claveError.textContent = "No hay una clave configurada en este dispositivo.";
            return;
        }
        if (!actual) {
            el.claveError.textContent = "Escribe tu clave actual.";
            el.claveActual.focus();
            return;
        }
        const problema = validarClave(nueva);
        if (problema) {
            el.claveError.textContent = problema;
            el.claveNueva.focus();
            return;
        }
        if (nueva !== repetir) {
            el.claveError.textContent = "Las claves nuevas no coinciden.";
            el.claveNueva2.focus();
            return;
        }
        if (nueva === actual) {
            el.claveError.textContent = "La nueva clave debe ser distinta de la actual.";
            return;
        }
        if (!cryptoDisponible()) {
            el.claveError.textContent = "Este navegador no permite cifrado seguro.";
            return;
        }

        procesandoClave = true;
        el.btnCambiarClave.disabled = true;
        el.btnCambiarClave.textContent = "Actualizando…";

        try {
            const correcta = await verificarClave(actual, cred);
            if (!correcta) {
                el.claveError.textContent = "La clave actual no es correcta.";
                return;
            }
            await crearCredencial(nueva);
            if (!leerCredencial()) throw new Error("sin almacenamiento");
            registrarAuditoria("clave_cambiada", "Clave maestra actualizada");
            el.formClave.reset();
            renderSeguridadMeta();
            toast("Clave maestra actualizada.");
        } catch {
            el.claveError.textContent = "No se pudo actualizar la clave. Inténtalo de nuevo.";
        } finally {
            procesandoClave = false;
            el.btnCambiarClave.disabled = false;
            el.btnCambiarClave.textContent = "Actualizar clave";
        }
    }

    /* ============================================================
       PEDIDO · acciones
       ============================================================ */
    async function limpiarPedido() {
        if (!pedido.size) {
            toast("La cuenta ya está vacía.");
            return;
        }
        const confirmado = await confirmar({
            titulo: "¿Vaciar el pedido?",
            texto: "Se quitarán todos los artículos de la cuenta. Esta acción no se puede deshacer.",
            boton: "Sí, vaciar pedido"
        });
        if (!confirmado) return;
        pedido.clear();
        guardarPedido();
        renderPedido();
        toast("Pedido vacío.");
    }

    /* ============================================================
       PALETA DE COMANDOS
       ============================================================ */
    const COMANDOS = [
        {
            id: "admin",
            etiqueta: "Modo administrador",
            detalle: "Desbloquear el panel con la clave maestra",
            atajo: "/admin",
            icono: "lock",
            accion: () => {
                if (adminActivo) {
                    toast("Ya estás dentro del panel.");
                } else {
                    abrirGate();
                }
            }
        },
        {
            id: "cuenta",
            etiqueta: "Abrir mi cuenta",
            detalle: "Revisar el pedido y generar el recibo",
            atajo: "/cuenta",
            icono: "bolsa",
            accion: abrirCajon
        },
        {
            id: "catalogo",
            etiqueta: "Ir al catálogo",
            detalle: "Explorar todas las frutas disponibles",
            atajo: "/catalogo",
            icono: "grid",
            accion: () => {
                verTienda();
                setTimeout(() => {
                    const destino = document.getElementById("catalogo");
                    if (destino) destino.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 160);
            }
        },
        {
            id: "limpiar",
            etiqueta: "Vaciar el pedido",
            detalle: "Quitar todos los artículos de la cuenta",
            atajo: "/limpiar",
            icono: "basura",
            accion: limpiarPedido
        },
        {
            id: "bloquear",
            etiqueta: "Bloquear el panel",
            detalle: "Cerrar la sesión de administrador ahora",
            atajo: "/bloquear",
            icono: "lock",
            accion: () => {
                if (sesionValida(sesion)) {
                    bloquearAdmin();
                } else {
                    toast("No hay una sesión de administrador activa.");
                }
            }
        },
        {
            id: "tienda",
            etiqueta: "Volver a la tienda",
            detalle: "Salir del panel sin cerrar la sesión",
            atajo: "/tienda",
            icono: "grid",
            accion: verTienda
        }
    ];

    function abrirPaleta() {
        if (!el.paleta.hidden) {
            el.paletaInput.focus();
            return;
        }
        el.paleta.hidden = false;
        el.paletaInput.value = "";
        paletaIndice = 0;
        renderPaleta("");
        actualizarBloqueoScroll();
        requestAnimationFrame(() => el.paleta.classList.add("abierta"));
        setTimeout(() => el.paletaInput.focus({ preventScroll: true }), 80);
    }

    function cerrarPaleta() {
        if (el.paleta.hidden) return;
        el.paleta.classList.remove("abierta");
        setTimeout(() => {
            if (!el.paleta.classList.contains("abierta")) {
                el.paleta.hidden = true;
                actualizarBloqueoScroll();
            }
        }, 230);
    }

    function renderPaleta(consulta = "") {
        const buscado = normalizar(consulta.replace(/^\//, ""));
        comandosVisibles = COMANDOS.filter((comando) => {
            if (!buscado) return true;
            return normalizar(`${comando.etiqueta} ${comando.detalle} ${comando.atajo}`).includes(buscado);
        });

        if (paletaIndice >= comandosVisibles.length) paletaIndice = 0;

        if (!comandosVisibles.length) {
            el.paletaLista.innerHTML = '<p class="paleta__vacia">Sin resultados. Prueba con <b>/admin</b>.</p>';
            return;
        }

        el.paletaLista.innerHTML = comandosVisibles.map((comando, indice) => `
            <button type="button" class="paleta__item ${indice === paletaIndice ? "is-activo" : ""}"
                data-comando="${comando.id}" role="option" aria-selected="${indice === paletaIndice}">
                <span class="paleta__icono">${ICONOS[comando.icono] || ICONOS.grid}</span>
                <span>
                    <strong>${escapar(comando.etiqueta)}</strong>
                    <small>${escapar(comando.detalle)}</small>
                </span>
                <kbd>${escapar(comando.atajo)}</kbd>
            </button>`).join("");
    }

    function ejecutarComando(id) {
        const comando = COMANDOS.find((c) => c.id === id);
        if (!comando) return;
        cerrarPaleta();
        setTimeout(() => comando.accion(), 140);
    }

    function esEscribiendo(objetivo) {
        if (!objetivo) return false;
        return (
            objetivo.tagName === "INPUT" ||
            objetivo.tagName === "TEXTAREA" ||
            objetivo.tagName === "SELECT" ||
            objetivo.isContentEditable
        );
    }

    /* ============================================================
       EVENTOS
       ============================================================ */
    function configurarEventos() {
        /* filtros y búsqueda */
        el.filtros.forEach((boton) => {
            boton.addEventListener("click", () => {
                filtroActivo = boton.dataset.filtro || "todo";
                el.filtros.forEach((otro) => otro.classList.toggle("is-activo", otro === boton));
                renderizarCatalogo();
            });
        });

        el.buscador.addEventListener("input", () => {
            clearTimeout(temporizadorBusqueda);
            temporizadorBusqueda = setTimeout(() => {
                busqueda = el.buscador.value;
                renderizarCatalogo();
            }, 110);
        });

        el.btnVacioLimpiar.addEventListener("click", () => {
            busqueda = "";
            filtroActivo = "todo";
            el.buscador.value = "";
            el.filtros.forEach((boton) => boton.classList.toggle("is-activo", boton.dataset.filtro === "todo"));
            renderizarCatalogo();
        });

        /* catálogo */
        el.grid.addEventListener("click", (evento) => {
            const boton = evento.target.closest("[data-abrir]");
            if (boton) abrirProducto(boton.dataset.abrir);
        });

        el.grid.addEventListener("error", (evento) => {
            if (evento.target.tagName === "IMG") {
                const tarjeta = evento.target.closest(".producto");
                if (tarjeta) tarjeta.classList.add("sin-imagen");
            }
        }, true);

        const punteroFino = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

        el.grid.addEventListener("pointermove", (evento) => {
            if (!punteroFino) return;
            const tarjeta = evento.target.closest(".producto");
            if (!tarjeta) return;
            const caja = tarjeta.getBoundingClientRect();
            const x = (evento.clientX - caja.left) / caja.width;
            const y = (evento.clientY - caja.top) / caja.height;
            tarjeta.style.setProperty("--ry", `${(x - 0.5) * 6}deg`);
            tarjeta.style.setProperty("--rx", `${(y - 0.5) * -6}deg`);
            tarjeta.style.setProperty("--mx", `${x * 100}%`);
            tarjeta.style.setProperty("--my", `${y * 100}%`);
        });

        el.grid.addEventListener("pointerout", (evento) => {
            const tarjeta = evento.target.closest(".producto");
            if (!tarjeta || tarjeta.contains(evento.relatedTarget)) return;
            ["--rx", "--ry", "--mx", "--my"].forEach((propiedad) => tarjeta.style.removeProperty(propiedad));
        });

        /* modal producto */
        el.mpPresentaciones.addEventListener("click", (evento) => {
            const boton = evento.target.closest("[data-presentacion]");
            if (!boton || !seleccion) return;
            seleccion.presentacion = boton.dataset.presentacion;
            renderizarPresentaciones();
            actualizarBotonAgregar();
        });

        el.mpCalibres.addEventListener("click", (evento) => {
            const chip = evento.target.closest("[data-calibre]");
            if (!chip || !seleccion) return;
            seleccion.calibre = chip.dataset.calibre;
            el.mpCalibreOtro.value = "";
            marcarCalibreActivo();
        });

        el.mpCalibreOtro.addEventListener("input", () => {
            if (!seleccion) return;
            const personalizado = el.mpCalibreOtro.value.trim();
            seleccion.calibre = personalizado || seleccion.producto.calibrePorDefecto || seleccion.producto.calibres[0] || "";
            marcarCalibreActivo();
        });

        el.mpMenos.addEventListener("click", () => {
            if (!seleccion) return;
            seleccion.cantidad = Math.max(1, seleccion.cantidad - 1);
            el.mpCantidad.textContent = seleccion.cantidad;
            actualizarBotonAgregar();
        });

        el.mpMas.addEventListener("click", () => {
            if (!seleccion) return;
            seleccion.cantidad = Math.min(99, seleccion.cantidad + 1);
            el.mpCantidad.textContent = seleccion.cantidad;
            actualizarBotonAgregar();
        });

        el.mpAgregar.addEventListener("click", agregarSeleccion);

        el.mpImagen.addEventListener("error", () => {
            if (el.mpImagen.src.startsWith("data:")) {
                el.mpImagen.style.display = "none";
                return;
            }
            if (seleccion && seleccion.producto) {
                el.mpImagen.src = imagenDe({ ...seleccion.producto, imagen: "" });
            } else {
                el.mpImagen.style.display = "none";
            }
        });

        /* cajón */
        [el.btnCarritoCabecera, el.btnHeroCuenta, el.cierreCuenta, el.carritoFlotante].forEach((nodo) => {
            if (nodo) nodo.addEventListener("click", abrirCajon);
        });

        el.velo.addEventListener("click", cerrarCajon);

        el.cajonIrCatalogo.addEventListener("click", () => {
            cerrarCajon();
            setTimeout(() => {
                const destino = document.getElementById("catalogo");
                if (destino) destino.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 240);
        });

        el.cajonLista.addEventListener("click", (evento) => {
            const boton = evento.target.closest("[data-accion][data-clave]");
            if (!boton) return;
            const clave = boton.dataset.clave;
            const item = pedido.get(clave);
            if (!item) return;

            if (boton.dataset.accion === "mas") {
                item.cantidad = Math.min(99, item.cantidad + 1);
            } else if (boton.dataset.accion === "menos") {
                item.cantidad -= 1;
                if (item.cantidad <= 0) pedido.delete(clave);
            } else if (boton.dataset.accion === "quitar") {
                pedido.delete(clave);
            }

            guardarPedido();
            renderPedido();
        });

        el.notaGeneral.addEventListener("input", () => {
            notaGeneral = el.notaGeneral.value;
            guardarTexto(ALMACEN.nota, notaGeneral);
        });

        el.btnLimpiar.addEventListener("click", limpiarPedido);
        el.btnGenerar.addEventListener("click", generarCuenta);
        el.btnCopiarRecibo.addEventListener("click", copiarRecibo);
        el.btnImprimir.addEventListener("click", () => window.print());

        /* cierre de modales y cajón */
        $$(".modal-fondo").forEach((fondo) => {
            fondo.addEventListener("click", (evento) => {
                if (evento.target === fondo) cerrarModal(fondo.id);
            });
        });

        document.addEventListener("click", (evento) => {
            const cerrar = evento.target.closest("[data-cerrar]");
            if (cerrar) cerrarModal(cerrar.dataset.cerrar);
            const cerrarCarrito = evento.target.closest("[data-cerrar-carrito]");
            if (cerrarCarrito) cerrarCajon();
        });

        el.confAceptar.addEventListener("click", () => {
            const resolver = resolverConfirmacion;
            resolverConfirmacion = null;
            cerrarModal("modal-confirmar");
            if (resolver) resolver(true);
        });
        el.confCancelar.addEventListener("click", () => cerrarModal("modal-confirmar"));

        /* admin */
        el.btnVolver.addEventListener("click", verTienda);
        el.btnBloquear.addEventListener("click", () => bloquearAdmin());
        el.btnExportar.addEventListener("click", exportarCatalogo);
        el.btnNuevo.addEventListener("click", abrirNuevoProducto);
        el.btnReset.addEventListener("click", restablecerCatalogo);
        el.formNuevo.addEventListener("submit", crearProducto);
        el.formClave.addEventListener("submit", cambiarClave);
        el.navAdmin.addEventListener("click", () => {
            if (sesionValida(sesion)) entrarAdmin();
            else abrirGate();
        });

        el.inputImportar.addEventListener("change", (evento) => {
            const archivo = evento.target.files && evento.target.files[0];
            evento.target.value = "";
            importarCatalogo(archivo);
        });

        el.adminLista.addEventListener("click", (evento) => {
            const alternar = evento.target.closest("[data-toggle]");
            if (alternar) {
                const item = alternar.closest(".admin-item");
                const abierto = item.classList.toggle("abierto");
                alternar.setAttribute("aria-expanded", String(abierto));
                return;
            }
            const guardar = evento.target.closest("[data-guardar]");
            if (guardar) {
                guardarProductoAdmin(guardar.dataset.guardar, guardar.closest(".admin-item"));
                return;
            }
            const eliminar = evento.target.closest("[data-eliminar]");
            if (eliminar) eliminarProducto(eliminar.dataset.eliminar);
        });

        el.adminLista.addEventListener("error", (evento) => {
            if (evento.target.tagName !== "IMG") return;
            const foto = evento.target.closest(".admin-item__foto");
            if (foto) foto.textContent = foto.dataset.emoji || "🍎";
        }, true);

        /* gate */
        el.gateCuerpo.addEventListener("submit", (evento) => {
            if (evento.target.id === "gate-login") {
                evento.preventDefault();
                manejarLogin();
            } else if (evento.target.id === "gate-setup") {
                evento.preventDefault();
                manejarSetup();
            }
        });

        el.gateCuerpo.addEventListener("click", (evento) => {
            const boton = evento.target.closest("[data-ver-clave]");
            if (!boton) return;
            const envoltura = boton.closest(".gate__input");
            const input = envoltura ? envoltura.querySelector("input") : null;
            if (!input) return;
            input.type = input.type === "password" ? "text" : "password";
            input.focus();
        });

        el.gateCuerpo.addEventListener("input", (evento) => {
            if (evento.target.id !== "gate-nueva") return;
            const fuerza = medirFuerza(evento.target.value);
            const barra = $("#fuerza-barra", el.gateCuerpo);
            const texto = $("#fuerza-texto", el.gateCuerpo);
            if (barra) {
                barra.style.width = `${fuerza.porcentaje}%`;
                barra.style.background = fuerza.color;
            }
            if (texto) {
                texto.textContent = evento.target.value ? fuerza.etiqueta : "—";
                texto.style.color = evento.target.value ? fuerza.color : "";
            }
        });

        /* paleta */
        [el.btnPaleta, el.btnPaletaPie].forEach((nodo) => {
            if (nodo) nodo.addEventListener("click", abrirPaleta);
        });
        if (el.btnPrivado) el.btnPrivado.addEventListener("click", abrirGate);

        /* pulsación larga sobre la marca */
        let temporizadorMarca = null;
        const cancelarMarca = () => {
            clearTimeout(temporizadorMarca);
            temporizadorMarca = null;
        };
        el.marca.addEventListener("pointerdown", () => {
            cancelarMarca();
            temporizadorMarca = setTimeout(() => {
                abrirGate();
            }, 750);
        });
        ["pointerup", "pointerleave", "pointercancel"].forEach((evento) => {
            el.marca.addEventListener(evento, cancelarMarca);
        });
        el.marca.addEventListener("contextmenu", cancelarMarca);

        el.paletaInput.addEventListener("input", () => {
            paletaIndice = 0;
            renderPaleta(el.paletaInput.value);
        });

        el.paletaInput.addEventListener("keydown", (evento) => {
            if (evento.key === "ArrowDown") {
                evento.preventDefault();
                if (!comandosVisibles.length) return;
                paletaIndice = (paletaIndice + 1) % comandosVisibles.length;
                renderPaleta(el.paletaInput.value);
            } else if (evento.key === "ArrowUp") {
                evento.preventDefault();
                if (!comandosVisibles.length) return;
                paletaIndice = (paletaIndice - 1 + comandosVisibles.length) % comandosVisibles.length;
                renderPaleta(el.paletaInput.value);
            } else if (evento.key === "Enter") {
                evento.preventDefault();
                const comando = comandosVisibles[paletaIndice];
                if (comando) ejecutarComando(comando.id);
            }
        });

        el.paletaLista.addEventListener("click", (evento) => {
            const boton = evento.target.closest("[data-comando]");
            if (boton) ejecutarComando(boton.dataset.comando);
        });

        el.paleta.addEventListener("click", (evento) => {
            if (evento.target === el.paleta) cerrarPaleta();
        });

        /* teclado global */
        document.addEventListener("keydown", (evento) => {
            const escribiendo = esEscribiendo(evento.target);

            if ((evento.metaKey || evento.ctrlKey) && evento.key.toLowerCase() === "k") {
                evento.preventDefault();
                abrirPaleta();
                return;
            }

            if ((evento.metaKey || evento.ctrlKey) && evento.shiftKey && evento.key.toLowerCase() === "a") {
                evento.preventDefault();
                abrirGate();
                return;
            }

            if (evento.key === "Escape") {
                if (!el.paleta.hidden) {
                    cerrarPaleta();
                    return;
                }
                const abiertos = Array.from(document.querySelectorAll(".modal-fondo.is-abierto"));
                if (abiertos.length) {
                    cerrarModal(abiertos[abiertos.length - 1].id);
                    return;
                }
                if (el.cajon.classList.contains("abierto")) cerrarCajon();
                return;
            }

            if (evento.key === "/" && !escribiendo && !hayCapasAbiertas()) {
                evento.preventDefault();
                el.buscador.focus();
                return;
            }

            if (
                !escribiendo &&
                !evento.metaKey &&
                !evento.ctrlKey &&
                !evento.altKey &&
                evento.key.length === 1 &&
                !hayCapasAbiertas()
            ) {
                bufferSecreto = (bufferSecreto + evento.key.toLowerCase()).slice(-12);
                clearTimeout(temporizadorSecreto);
                temporizadorSecreto = setTimeout(() => {
                    bufferSecreto = "";
                }, 1800);
                if (bufferSecreto.endsWith("tiendona")) {
                    bufferSecreto = "";
                    abrirGate();
                }
            }
        });

        /* foco atrapado en capas */
        document.addEventListener("keydown", (evento) => {
            if (evento.key !== "Tab") return;
            const capa = !el.paleta.hidden
                ? $(".paleta__panel")
                : (Array.from(document.querySelectorAll(".modal-fondo.is-abierto")).pop()
                    || (el.cajon.classList.contains("abierto") ? el.cajon : null));
            if (!capa) return;

            const enfocables = $$(
                "a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex='-1'])",
                capa
            ).filter((nodo) => nodo.offsetParent !== null);

            if (!enfocables.length) return;
            const primero = enfocables[0];
            const ultimo = enfocables[enfocables.length - 1];

            if (evento.shiftKey && document.activeElement === primero) {
                evento.preventDefault();
                ultimo.focus();
            } else if (!evento.shiftKey && document.activeElement === ultimo) {
                evento.preventDefault();
                primero.focus();
            }
        });

        /* actividad de sesión */
        document.addEventListener("pointerdown", () => {
            if (adminActivo) marcarActividad();
        }, { passive: true });

        document.addEventListener("keydown", () => {
            if (adminActivo) marcarActividad();
        });

        window.addEventListener("scroll", () => {
            if (adminActivo) marcarActividad();
        }, { passive: true });

        document.addEventListener("visibilitychange", () => {
            if (!document.hidden) comprobarSesion();
        });

        /* scroll */
        window.addEventListener("scroll", alScroll, { passive: true });
    }

    function alScroll() {
        const desplazamiento = window.scrollY || 0;
        el.cabecera.classList.toggle("is-scrolled", desplazamiento > 8);
        const alto = document.documentElement.scrollHeight - window.innerHeight;
        el.progreso.style.width = alto > 0
            ? `${Math.min(100, (desplazamiento / alto) * 100)}%`
            : "0%";
    }

    function iniciarObservadores() {
        if (!("IntersectionObserver" in window)) {
            $$(".reveal").forEach((nodo) => nodo.classList.add("is-visible"));
            return;
        }

        const observador = new IntersectionObserver((entradas) => {
            entradas.forEach((entrada) => {
                if (!entrada.isIntersecting) return;
                entrada.target.classList.add("is-visible");
                observador.unobserve(entrada.target);
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

        $$(".reveal").forEach((nodo) => observador.observe(nodo));

        const enlaces = $$("[data-nav]");
        const observadorNav = new IntersectionObserver((entradas) => {
            entradas.forEach((entrada) => {
                if (!entrada.isIntersecting) return;
                enlaces.forEach((enlace) => {
                    enlace.classList.toggle("is-activo", enlace.dataset.nav === entrada.target.id);
                });
            });
        }, { rootMargin: "-45% 0px -45% 0px" });

        ["catalogo", "como-pedir"].forEach((id) => {
            const seccion = document.getElementById(id);
            if (seccion) observadorNav.observe(seccion);
        });
    }

    function iniciarCursor() {
        const fino = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
        if (!fino) return;

        document.body.classList.add("con-puntero");
        let x = window.innerWidth / 2;
        let y = window.innerHeight / 2;
        let destinoX = x;
        let destinoY = y;

        document.addEventListener("pointermove", (evento) => {
            destinoX = evento.clientX;
            destinoY = evento.clientY;
        }, { passive: true });

        const animar = () => {
            x += (destinoX - x) * 0.12;
            y += (destinoY - y) * 0.12;
            el.cursor.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
            requestAnimationFrame(animar);
        };
        requestAnimationFrame(animar);

        if (el.heroVisual) {
            el.heroVisual.addEventListener("pointermove", (evento) => {
                const caja = el.heroVisual.getBoundingClientRect();
                const px = (evento.clientX - caja.left) / caja.width - 0.5;
                const py = (evento.clientY - caja.top) / caja.height - 0.5;
                el.heroVisual.style.transform = `translate3d(${px * 14}px, ${py * 14}px, 0)`;
            });
            el.heroVisual.addEventListener("pointerleave", () => {
                el.heroVisual.style.transform = "";
            });
        }
    }

    /* ============================================================
       INICIO
       ============================================================ */
    function iniciar() {
        el.notaGeneral.value = notaGeneral;

        configurarEventos();
        iniciarObservadores();
        iniciarCursor();

        renderizarCatalogo();
        renderPedido();
        actualizarFechaPie();
        actualizarDatosHero();
        alScroll();

        sesion = leerSesion();
        if (sesion && sesionValida(sesion)) {
            el.navAdmin.hidden = false;
            iniciarTickerSesion();
        } else {
            sesion = null;
            limpiarSesion();
        }
    }

    iniciar();
})();
