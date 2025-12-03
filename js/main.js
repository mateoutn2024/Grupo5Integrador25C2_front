// --- frontend/js/main.js ---

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. SALUDO DE USUARIO
    // ==========================================
    const nombreUsuario = localStorage.getItem('clienteNombre');
    const saludoSpan = document.querySelector('#saludo .user-name-actual');
    
    if (nombreUsuario && saludoSpan) {
        saludoSpan.textContent = nombreUsuario.toUpperCase();
    } else if (saludoSpan) {
        saludoSpan.textContent = 'INVITADO';
    }

    // ==========================================
    // 2. LÓGICA DEL TEMA (DARK / LIGHT)
    // ==========================================
    // Buscamos los botones en el DOM (puede estar uno, el otro, o ninguno según la página)
    const btnTemaHeader = document.getElementById('btnTema');       // En Productos/Carrito
    const btnTemaIndex = document.getElementById('btnTemaIndex');   // En Bienvenida

    // Función para aplicar los cambios visuales
    const aplicarTema = (esOscuro) => {
        if (esOscuro) {
            document.body.classList.add('dark-mode');
            // Si está oscuro, mostramos el Sol (para pasar a claro)
            if(btnTemaHeader) btnTemaHeader.innerHTML = '<i class="fas fa-sun"></i>';
            if(btnTemaIndex) btnTemaIndex.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            document.body.classList.remove('dark-mode');
            // Si está claro, mostramos la Luna (para pasar a oscuro)
            if(btnTemaHeader) btnTemaHeader.innerHTML = '<i class="fas fa-moon"></i>';
            if(btnTemaIndex) btnTemaIndex.innerHTML = '<i class="fas fa-moon"></i>';
        }
    };

    // Función Toggle (Interruptor)
    const alternarTema = () => {
        const esOscuroActual = document.body.classList.contains('dark-mode');
        const nuevoEstado = !esOscuroActual; // Invertimos

        aplicarTema(nuevoEstado);

        // Guardamos la preferencia
        localStorage.setItem('theme', nuevoEstado ? 'dark' : 'light');
    };

    // --- INICIALIZACIÓN ---
    // Leemos la memoria al cargar la página
    const temaGuardado = localStorage.getItem('theme');
    
    // Si guardó 'dark', lo aplicamos. Si no, por defecto es Light (no hace nada).
    if (temaGuardado === 'dark') {
        aplicarTema(true);
    } else {
        aplicarTema(false);
    }

    // --- EVENT LISTENERS ---
    // Agregamos el click a los botones si existen
    if (btnTemaHeader) {
        btnTemaHeader.addEventListener('click', (e) => {
            e.preventDefault(); // Evita saltos raros
            alternarTema();
        });
    }

    if (btnTemaIndex) {
        btnTemaIndex.addEventListener('click', (e) => {
            e.preventDefault();
            alternarTema();
        });
    }

    // ==========================================
    // 3. BADGE DEL CARRITO
    // ==========================================
    actualizarBadgeCarrito();
});

function actualizarBadgeCarrito() {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    const badge = document.getElementById('cart-badge');
    if(badge) badge.textContent = totalItems;
}

// Función Global para Salir
window.salir = () => {
    localStorage.removeItem('clienteNombre');
    localStorage.removeItem('carrito');
    window.location.href = 'index.html';
};