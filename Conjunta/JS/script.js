//No esta enlazado, aun no es funcional con el sistema 

class Libro {
    constructor(id, titulo, autor, genero) {
        this.id = id;
        this.titulo = titulo;
        this.autor = autor;
        this.genero = genero;
        this.disponible = true;
        this.fechaPrestamo = null;
    }
}

class BibliotecaDigital {
    constructor() {
        this.libros = [
            new Libro(1, "Cien Años de Soledad", "Gabriel García Márquez", "Realismo Mágico"),
            new Libro(2, "1984", "George Orwell", "Distopía"),
            new Libro(3, "El Principito", "Antoine de Saint-Exupéry", "Infantil"),
            new Libro(4, "Sapiens", "Yuval Noah Harari", "Historia")
        ];
        this.librosPrestados = [];
        this.usuarios = [];
    }

    buscarLibros(termino) {
        return this.libros.filter(libro => 
            libro.titulo.toLowerCase().includes(termino.toLowerCase()) ||
            libro.autor.toLowerCase().includes(termino.toLowerCase()) ||
            libro.genero.toLowerCase().includes(termino.toLowerCase())
        );
    }

    prestarLibro(libroId, usuario) {
        const libro = this.libros.find(l => l.id === libroId);
        if (libro && libro.disponible) {
            libro.disponible = false;
            libro.fechaPrestamo = new Date();
            this.librosPrestados.push({ libro, usuario, fechaPrestamo: new Date() });
            return true;
        }
        return false;
    }

    devolverLibro(libroId) {
        const indicePrestamo = this.librosPrestados.findIndex(p => p.libro.id === libroId);
        if (indicePrestamo !== -1) {
            const prestamo = this.librosPrestados.splice(indicePrestamo, 1)[0];
            prestamo.libro.disponible = true;
            prestamo.libro.fechaPrestamo = null;
            return true;
        }
        return false;
    }
}

class SistemaNotificaciones {
    constructor(biblioteca) {
        this.biblioteca = biblioteca;
        this.notificaciones = [];
    }

    crearNotificacion(mensaje, tipo = 'info') {
        const notificacion = {
            id: Date.now(),
            mensaje,
            tipo,
            fechaCreacion: new Date()
        };
        this.notificaciones.push(notificacion);
        this.mostrarNotificacion(notificacion);
        return notificacion;
    }

    mostrarNotificacion(notificacion) {
        const contenedorNotificaciones = document.getElementById('notificaciones');
        const elementoNotificacion = document.createElement('div');
        elementoNotificacion.classList.add('notificacion', notificacion-${notificacion.tipo});
        elementoNotificacion.textContent = notificacion.mensaje;
        
        contenedorNotificaciones.appendChild(elementoNotificacion);

        setTimeout(() => {
            contenedorNotificaciones.removeChild(elementoNotificacion);
            this.eliminarNotificacion(notificacion.id);
        }, 5000);
    }

    eliminarNotificacion(id) {
        this.notificaciones = this.notificaciones.filter(n => n.id !== id);
    }

    notificarDisponibilidad(libroId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const libro = this.biblioteca.libros.find(l => l.id === libroId);
                if (libro && libro.disponible) {
                    this.crearNotificacion(`El libro "${libro.titulo}" está disponible, 'success'`);
                    resolve(true);
                } else {
                    this.crearNotificacion(`El libro no está disponible, 'error'`);
                    resolve(false);
                }
            }, 1000);
        });
    }

    recordatoriosDevoluciones() {
        const librosPrestados = this.biblioteca.librosPrestados;
        librosPrestados.forEach(prestamo => {
            const diasPrestamo = Math.floor((new Date() - prestamo.fechaPrestamo) / (1000 * 60 * 60 * 24));
            if (diasPrestamo > 14) {
                this.crearNotificacion(`Recordatorio: El libro "${prestamo.libro.titulo}" debe ser devuelto, 'warning'`);
            }
        });
    }
}

class InterfazBiblioteca {
    constructor() {
        this.biblioteca = new BibliotecaDigital();
        this.notificaciones = new SistemaNotificaciones(this.biblioteca);
        this.inicializarEventos();
        this.renderizarLibros();
    }

    inicializarEventos() {
        const campoBusqueda = document.getElementById('buscarLibro');
        campoBusqueda.addEventListener('input', (e) => {
            const termino = e.target.value;
            this.renderizarLibros(termino);
        });
    }

    renderizarLibros(termino = '') {
        const contenedorLibros = document.getElementById('listaLibros');
        contenedorLibros.innerHTML = '';

        const libros = termino ? this.biblioteca.buscarLibros(termino) : this.biblioteca.libros;

        libros.forEach(libro => {
            const tarjetaLibro = document.createElement('div');
            tarjetaLibro.classList.add('libro-card');
            tarjetaLibro.innerHTML = `
                <h3>${libro.titulo}</h3>
                <p>${libro.autor}</p>
                <p>Género: ${libro.genero}</p>
                <button class="btn-prestar" data-libro-id="${libro.id}">
                    ${libro.disponible ? 'Prestar' : 'No Disponible'}
                </button>
            `;

            if (libro.disponible) {
                const botonPrestar = tarjetaLibro.querySelector('.btn-prestar');
                botonPrestar.addEventListener('click', () => {
                    const prestamo = this.biblioteca.prestarLibro(libro.id, 'Usuario Ejemplo');
                    if (prestamo) {
                        this.notificaciones.crearNotificacion(`Libro "${libro.titulo}" prestado con éxito`, 'success');
                        this.renderizarLibros();
                    }
                });
            }

            contenedorLibros.appendChild(tarjetaLibro);
        });
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const interfazBiblioteca = new InterfazBiblioteca();
    

    setInterval(() => {
        interfazBiblioteca.notificaciones.recordatoriosDevoluciones();
    }, 24 * 60 * 60 * 1000);
});