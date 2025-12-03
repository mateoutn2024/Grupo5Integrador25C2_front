// --- frontend/js/productos.js ---

// Comprobamos si el nombre de usuario está guardado en el almacenamiento local (indica que el usuario está logeado)
const nombreUsuario = localStorage.getItem('clienteNombre');


// --- VARIABLES GLOBALES ---
let todosLosProductos = []; // Almacena la lista completa de productos cargada desde la API.
let productosVisibles = []; // Almacena la lista actual de productos a mostrar (después de filtrar por categoría).
let paginaActual = 1; // Contador para la página actual de la vista paginada.
const PRODUCTOS_POR_PAGINA = 8; // Constante que define cuántos productos se muestran por página.

// 1. CARGA DE DATOS DESDE LA API
async function cargarProductos() {
    try {
        // Realiza una petición GET al endpoint de la API para obtener todos los productos.
        const res = await fetch('http://localhost:3000/api/productos');

        // Verifica si la respuesta HTTP fue exitosa (código 200-299).
        if (!res.ok) throw new Error('Error al cargar datos del backend');

        // Convierte la respuesta a un objeto JSON y lo guarda en la lista maestra.
        todosLosProductos = await res.json();

        // Inicialmente, llama a la función para mostrar TODOS los productos.
        cambiarCategoria('todas');
        // Actualiza el número de ítems en el ícono del carrito (badge).
        actualizarBadgeCarrito();

    } catch (error) {
        console.error(error);
        // Muestra un mensaje de error si la carga falla.
        const lista = document.getElementById('lista-productos');
        if (lista) lista.innerHTML = '<p>Error al cargar datos. Por favor, intente más tarde.</p>';
    }
}

// 2. CAMBIO DE CATEGORÍA (Requisito mandatorio)
// Se expone a 'window' para ser llamada directamente desde los botones de HTML (onclick).
window.cambiarCategoria = (categoria) => {
    paginaActual = 1; // Siempre volvemos a la primera página al cambiar la categoría.

    // Obtenemos el elemento para actualizar el título de la sección.
    const titulo = document.getElementById('titulo-seccion');
    if (titulo) {
        if (categoria === 'todas') {
            // Si se selecciona 'todas', la lista visible es igual a la lista maestra.
            productosVisibles = todosLosProductos;
            titulo.textContent = "TODOS LOS PRODUCTOS";
        } else {
            // Filtramos la lista maestra por la categoría seleccionada.
            productosVisibles = todosLosProductos.filter(p => p.categoria === categoria);
            titulo.textContent = categoria.toUpperCase(); // Ej: "CAMISETAS"
        }
    }

    // Renderiza la primera página de la nueva lista de productos visibles.
    renderizarPaginaActual();
};

// 3. PAGINACIÓN Y RENDERIZADO
function renderizarPaginaActual() {
    const contenedor = document.getElementById('lista-productos');
    if (!contenedor) return;

    contenedor.innerHTML = ''; // Limpiamos el contenido anterior.

    // --- Lógica de Paginación ---
    // Calcula el índice de inicio y fin para el slice de la página actual.
    const inicio = (paginaActual - 1) * PRODUCTOS_POR_PAGINA;
    const fin = inicio + PRODUCTOS_POR_PAGINA;
    // Extrae el subconjunto de productos para esta página.
    const productosDeEstaPagina = productosVisibles.slice(inicio, fin);

    // Manejo de caso: No hay productos en la categoría filtrada.
    if (productosDeEstaPagina.length === 0) {
        contenedor.innerHTML = '<p>No hay productos en esta categoría.</p>';
        actualizarControlesPaginacion();
        return;
    }

    // --- Renderizado de Tarjetas (Cards) ---
    productosDeEstaPagina.forEach((prod, index) => {
        let imagenSrc = prod.imagen;
        // Si la ruta de la imagen no es absoluta, la ajustamos para que apunte al servidor local de 'uploads'.
        if (!imagenSrc.startsWith('http')) {
            imagenSrc = `http://localhost:3000/uploads/${prod.imagen}`;
        }

        // Template HTML para cada tarjeta de producto.
        const html = `
            <div class="producto-card" style="animation-delay: ${index * 0.05}s;">
                <div class="img-container">
                    <img src="${imagenSrc}" alt="${prod.nombre}">
                </div>
                <h3>${prod.nombre}</h3>
                <span class="precio">$${prod.precio}</span>
                                <button onclick="agregarAlCarrito(${prod.id}, '${prod.nombre}', ${prod.precio}, '${prod.imagen}')">
                    AGREGAR
                </button>
            </div>
        `;
        contenedor.innerHTML += html;
    });

    // Llama a la función para actualizar el estado de los botones Anterior/Siguiente.
    actualizarControlesPaginacion();
}

function actualizarControlesPaginacion() {
    // Calcula el número total de páginas requerido.
    const totalPaginas = Math.ceil(productosVisibles.length / PRODUCTOS_POR_PAGINA);

    const texto = document.getElementById('info-pagina');
    const btnAnt = document.getElementById('btn-anterior');
    const btnSig = document.getElementById('btn-siguiente');

    // Muestra la información de la página actual y el total.
    if (texto) texto.textContent = `${paginaActual} / ${totalPaginas || 1}`;

    // Deshabilita el botón "Anterior" si estamos en la primera página.
    if (btnAnt) btnAnt.disabled = (paginaActual === 1);
    // Deshabilita el botón "Siguiente" si estamos en la última página o no hay productos.
    if (btnSig) btnSig.disabled = (paginaActual >= totalPaginas || totalPaginas === 0);
}

// Controla el cambio de página (delta es +1 para Siguiente, -1 para Anterior).
window.cambiarPagina = (delta) => {
    paginaActual += delta; // Actualiza el contador de página.
    renderizarPaginaActual(); // Vuelve a renderizar la vista con la nueva página.
    // Mejora de UX: Hace scroll suave a la parte superior de la página.
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// --- FUNCIONES DE CARRITO (CART) ---
function actualizarBadgeCarrito() {
    // Recupera el carrito del localStorage o inicializa un array vacío si no existe.
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    // Suma las cantidades de todos los ítems para obtener el total de productos.
    const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);

    // Actualiza el texto del badge (círculo de notificación) del carrito.
    const badge = document.getElementById('cart-badge');
    if (badge) badge.textContent = totalItems;
}

// Agrega un producto al carrito (llamada desde los botones de las tarjetas).
window.agregarAlCarrito = (id, nombre, precio, imagen) => {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    // Busca si el producto ya existe en el carrito.
    const existe = carrito.find(item => item.id === id);

    if (existe) {
        existe.cantidad++; // Si existe, solo incrementa la cantidad.
    } else {
        // Si es nuevo, añade el objeto completo al carrito con cantidad 1.
        carrito.push({ id, nombre, precio, imagen, cantidad: 1 });
    }

    // Guarda el carrito actualizado en localStorage.
    localStorage.setItem('carrito', JSON.stringify(carrito));

    actualizarBadgeCarrito(); // Actualiza el badge del carrito.
    // Muestra una notificación simple al usuario.
    alert(`✅ ${nombre} agregado!`);
};

// --- INICIO DE LA APLICACIÓN ---
cargarProductos();