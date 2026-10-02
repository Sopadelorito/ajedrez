// ============================================================
//                       AJEDREZ WEB
// ============================================================

const tableroHTML = document.getElementById("tablero");
const turnoHTML = document.getElementById("turno");
const modoActualHTML = document.getElementById("modoActual");
const mensajeHTML = document.getElementById("mensaje");

const btnDosJugadores = document.getElementById("btnDosJugadores");
const btnMaquina = document.getElementById("btnMaquina");
const btnReiniciar = document.getElementById("btnReiniciar");

const capturadasBlancasHTML =
    document.getElementById("capturadasBlancas");

const capturadasNegrasHTML =
    document.getElementById("capturadasNegras");

// ============================================================
// PIEZAS
// Se usa la misma silueta para ambos colores.
// CSS las pinta de blanco o negro.
// ============================================================

const simbolos = {
    rey: {
        blanco: "♚",
        negro: "♚"
    },
    dama: {
        blanco: "♛",
        negro: "♛"
    },
    torre: {
        blanco: "♜",
        negro: "♜"
    },
    alfil: {
        blanco: "♝",
        negro: "♝"
    },
    caballo: {
        blanco: "♞",
        negro: "♞"
    },
    peon: {
        blanco: "♟",
        negro: "♟"
    }
};

// ============================================================
// ESTADO
// ============================================================

let tablero = [];
let turno = "blanco";
let modo = "dos";
let seleccion = null;
let movimientosDisponibles = [];
let juegoTerminado = false;
let capturadasBlancas = [];
let capturadasNegras = [];

// ============================================================
// CREAR PIEZA
// ============================================================

function pieza(tipo, color) {
    return {
        tipo,
        color
    };
}

// ============================================================
// TABLERO INICIAL
// ============================================================

function crearTableroInicial() {

    tablero = [

        [
            pieza("torre", "negro"),
            pieza("caballo", "negro"),
            pieza("alfil", "negro"),
            pieza("dama", "negro"),
            pieza("rey", "negro"),
            pieza("alfil", "negro"),
            pieza("caballo", "negro"),
            pieza("torre", "negro")
        ],

        [
            pieza("peon", "negro"),
            pieza("peon", "negro"),
            pieza("peon", "negro"),
            pieza("peon", "negro"),
            pieza("peon", "negro"),
            pieza("peon", "negro"),
            pieza("peon", "negro"),
            pieza("peon", "negro")
        ],

        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],

        [
            pieza("peon", "blanco"),
            pieza("peon", "blanco"),
            pieza("peon", "blanco"),
            pieza("peon", "blanco"),
            pieza("peon", "blanco"),
            pieza("peon", "blanco"),
            pieza("peon", "blanco"),
            pieza("peon", "blanco")
        ],

        [
            pieza("torre", "blanco"),
            pieza("caballo", "blanco"),
            pieza("alfil", "blanco"),
            pieza("dama", "blanco"),
            pieza("rey", "blanco"),
            pieza("alfil", "blanco"),
            pieza("caballo", "blanco"),
            pieza("torre", "blanco")
        ]
    ];
}

// ============================================================
// DIBUJAR TABLERO
// ============================================================

function dibujarTablero() {

    tableroHTML.innerHTML = "";

    for (let fila = 0; fila < 8; fila++) {

        for (let columna = 0; columna < 8; columna++) {

            const casilla = document.createElement("div");

            casilla.classList.add("casilla");

            if ((fila + columna) % 2 === 0) {
                casilla.classList.add("clara");
            } else {
                casilla.classList.add("oscura");
            }

            casilla.dataset.fila = fila;
            casilla.dataset.columna = columna;

            const piezaActual = tablero[fila][columna];

            if (piezaActual) {

                const elementoPieza =
                    document.createElement("span");

                elementoPieza.classList.add("pieza");
                elementoPieza.classList.add(piezaActual.color);

                elementoPieza.textContent =
                    simbolos[piezaActual.tipo][piezaActual.color];

                casilla.appendChild(elementoPieza);
            }

            if (
                seleccion &&
                seleccion.fila === fila &&
                seleccion.columna === columna
            ) {
                casilla.classList.add("seleccionada");
            }

            const movimiento =
                movimientosDisponibles.find(
                    m => m.fila === fila && m.columna === columna
                );

            if (movimiento) {

                if (tablero[fila][columna]) {
                    casilla.classList.add("captura");
                } else {
                    casilla.classList.add("movimiento");
                }
            }

            // Marcar cualquier rey que esté en jaque.
            const piezaEnCasilla = tablero[fila][columna];

            if (
                piezaEnCasilla &&
                piezaEnCasilla.tipo === "rey" &&
                estaEnJaque(piezaEnCasilla.color)
            ) {
                casilla.classList.add("rey-jaque");
            }

            casilla.addEventListener("click", manejarClick);

            tableroHTML.appendChild(casilla);
        }
    }

    actualizarInformacion();
}

// ============================================================
// CLICK EN CASILLA
// ============================================================

function manejarClick(e) {

    if (juegoTerminado) {
        return;
    }

    if (modo === "maquina" && turno === "negro") {
        return;
    }

    const casilla = e.currentTarget;

    const fila = Number(casilla.dataset.fila);
    const columna = Number(casilla.dataset.columna);

    const piezaActual = tablero[fila][columna];

    // Si ya hay una pieza seleccionada, intentar mover.
    if (seleccion) {

        const movimiento =
            movimientosDisponibles.find(
                m => m.fila === fila && m.columna === columna
            );

        if (movimiento) {

            moverPieza(
                seleccion.fila,
                seleccion.columna,
                fila,
                columna
            );

            return;
        }
    }

    // Seleccionar una pieza propia.
    if (piezaActual && piezaActual.color === turno) {

        seleccion = {
            fila,
            columna
        };

        movimientosDisponibles =
            obtenerMovimientosValidos(fila, columna);

        mensajeHTML.textContent =
            "Elegí dónde mover la pieza.";

        dibujarTablero();

        return;
    }

    // Deseleccionar.
    seleccion = null;
    movimientosDisponibles = [];

    dibujarTablero();
}

// ============================================================
// MOVIMIENTOS VÁLIDOS
//
// IMPORTANTE:
// No se bloquean las jugadas que dejan al propio rey en jaque.
// El jugador puede equivocarse.
// ============================================================

function obtenerMovimientosValidos(fila, columna) {

    const piezaActual = tablero[fila][columna];

    if (!piezaActual) {
        return [];
    }

    return obtenerMovimientosPseudo(fila, columna);
}

// ============================================================
// MOVIMIENTOS SEGÚN LA PIEZA
// ============================================================

function obtenerMovimientosPseudo(fila, columna) {

    const piezaActual = tablero[fila][columna];
    const movimientos = [];

    switch (piezaActual.tipo) {

        case "peon":
            movimientos.push(
                ...movimientosPeon(fila, columna, piezaActual)
            );
            break;

        case "torre":
            movimientos.push(
                ...movimientosDireccion(
                    fila,
                    columna,
                    piezaActual,
                    [
                        [-1, 0],
                        [1, 0],
                        [0, -1],
                        [0, 1]
                    ]
                )
            );
            break;

        case "alfil":
            movimientos.push(
                ...movimientosDireccion(
                    fila,
                    columna,
                    piezaActual,
                    [
                        [-1, -1],
                        [-1, 1],
                        [1, -1],
                        [1, 1]
                    ]
                )
            );
            break;

        case "dama":
            movimientos.push(
                ...movimientosDireccion(
                    fila,
                    columna,
                    piezaActual,
                    [
                        [-1, 0],
                        [1, 0],
                        [0, -1],
                        [0, 1],
                        [-1, -1],
                        [-1, 1],
                        [1, -1],
                        [1, 1]
                    ]
                )
            );
            break;

        case "caballo":
            movimientos.push(
                ...movimientosCaballo(
                    fila,
                    columna,
                    piezaActual
                )
            );
            break;

        case "rey":
            movimientos.push(
                ...movimientosRey(
                    fila,
                    columna,
                    piezaActual
                )
            );
            break;
    }

    return movimientos;
}

// ============================================================
// PEÓN
// ============================================================

function movimientosPeon(fila, columna, piezaActual) {

    const movimientos = [];

    const direccion =
        piezaActual.color === "blanco" ? -1 : 1;

    const filaInicial =
        piezaActual.color === "blanco" ? 6 : 1;

    const una = fila + direccion;

    if (
        dentro(una, columna) &&
        !tablero[una][columna]
    ) {

        movimientos.push({
            fila: una,
            columna
        });

        const dos = fila + direccion * 2;

        if (
            fila === filaInicial &&
            dentro(dos, columna) &&
            !tablero[dos][columna]
        ) {

            movimientos.push({
                fila: dos,
                columna
            });
        }
    }

    // Capturas diagonales.
    for (const dc of [-1, 1]) {

        const nf = fila + direccion;
        const nc = columna + dc;

        if (!dentro(nf, nc)) {
            continue;
        }

        const objetivo = tablero[nf][nc];

        if (
            objetivo &&
            objetivo.color !== piezaActual.color
        ) {

            movimientos.push({
                fila: nf,
                columna: nc
            });
        }
    }

    return movimientos;
}

// ============================================================
// TORRE / ALFIL / DAMA
// ============================================================

function movimientosDireccion(
    fila,
    columna,
    piezaActual,
    direcciones
) {

    const movimientos = [];

    for (const [df, dc] of direcciones) {

        let nf = fila + df;
        let nc = columna + dc;

        while (dentro(nf, nc)) {

            const objetivo = tablero[nf][nc];

            if (!objetivo) {

                movimientos.push({
                    fila: nf,
                    columna: nc
                });

            } else {

                // Ahora SÍ permitimos capturar al rey.
                if (objetivo.color !== piezaActual.color) {

                    movimientos.push({
                        fila: nf,
                        columna: nc
                    });
                }

                break;
            }

            nf += df;
            nc += dc;
        }
    }

    return movimientos;
}

// ============================================================
// CABALLO
// ============================================================

function movimientosCaballo(
    fila,
    columna,
    piezaActual
) {

    const movimientos = [];

    const posiciones = [
        [-2, -1],
        [-2, 1],
        [-1, -2],
        [-1, 2],
        [1, -2],
        [1, 2],
        [2, -1],
        [2, 1]
    ];

    for (const [df, dc] of posiciones) {

        const nf = fila + df;
        const nc = columna + dc;

        if (!dentro(nf, nc)) {
            continue;
        }

        const objetivo = tablero[nf][nc];

        if (
            !objetivo ||
            objetivo.color !== piezaActual.color
        ) {

            movimientos.push({
                fila: nf,
                columna: nc
            });
        }
    }

    return movimientos;
}

// ============================================================
// REY
// ============================================================

function movimientosRey(
    fila,
    columna,
    piezaActual
) {

    const movimientos = [];

    for (let df = -1; df <= 1; df++) {

        for (let dc = -1; dc <= 1; dc++) {

            if (df === 0 && dc === 0) {
                continue;
            }

            const nf = fila + df;
            const nc = columna + dc;

            if (!dentro(nf, nc)) {
                continue;
            }

            const objetivo = tablero[nf][nc];

            if (
                !objetivo ||
                objetivo.color !== piezaActual.color
            ) {

                movimientos.push({
                    fila: nf,
                    columna: nc
                });
            }
        }
    }

    return movimientos;
}

// ============================================================
// MOVER PIEZA
// ============================================================

function moverPieza(
    filaOrigen,
    columnaOrigen,
    filaDestino,
    columnaDestino
) {

    const piezaMovida =
        tablero[filaOrigen][columnaOrigen];

    const piezaCapturada =
        tablero[filaDestino][columnaDestino];

    // Si se captura un rey, termina la partida.
    if (
        piezaCapturada &&
        piezaCapturada.tipo === "rey"
    ) {

        tablero[filaDestino][columnaDestino] =
            piezaMovida;

        tablero[filaOrigen][columnaOrigen] = null;

        juegoTerminado = true;

        seleccion = null;
        movimientosDisponibles = [];

        const ganador =
            piezaMovida.color === "blanco"
                ? "Blancas"
                : "Negras";

        dibujarTablero();

        mostrarFinal(
            "👑",
            "¡Partida terminada!",
            `Las ${ganador.toLowerCase()} capturaron al rey.`
        );

        return;
    }

    // Guardar pieza capturada.
    if (piezaCapturada) {

        if (piezaCapturada.color === "blanco") {
            capturadasBlancas.push(piezaCapturada);
        } else {
            capturadasNegras.push(piezaCapturada);
        }
    }

    tablero[filaDestino][columnaDestino] =
        piezaMovida;

    tablero[filaOrigen][columnaOrigen] =
        null;

    // Promoción automática a dama.
    if (
        piezaMovida.tipo === "peon" &&
        (filaDestino === 0 || filaDestino === 7)
    ) {
        piezaMovida.tipo = "dama";
    }

    seleccion = null;
    movimientosDisponibles = [];

    turno =
        turno === "blanco"
            ? "negro"
            : "blanco";

    comprobarEstado();

    dibujarTablero();

    // Máquina.
    if (
        !juegoTerminado &&
        modo === "maquina" &&
        turno === "negro"
    ) {

        mensajeHTML.textContent =
            "🤖 La máquina está pensando...";

        setTimeout(movimientoMaquina, 600);
    }
}

// ============================================================
// ESTADO DEL JUEGO
// ============================================================

function comprobarEstado() {

    if (!encontrarRey("blanco")) {
        juegoTerminado = true;
        mostrarFinal(
            "♚",
            "¡Partida terminada!",
            "Las negras ganaron."
        );
        return;
    }

    if (!encontrarRey("negro")) {
        juegoTerminado = true;
        mostrarFinal(
            "♔",
            "¡Partida terminada!",
            "Las blancas ganaron."
        );
        return;
    }

    if (estaEnJaque(turno)) {

        mensajeHTML.textContent =
            turno === "blanco"
                ? "⚠️ ¡JAQUE! El rey blanco está amenazado."
                : "⚠️ ¡JAQUE! El rey negro está amenazado.";

    } else {

        mensajeHTML.textContent =
            turno === "blanco"
                ? "Turno de las blancas."
                : "Turno de las negras.";
    }
}

// ============================================================
// JAQUE
// ============================================================

function estaEnJaque(
    color,
    tableroActual = tablero
) {

    const rey =
        encontrarRey(color, tableroActual);

    if (!rey) {
        return false;
    }

    const enemigo =
        color === "blanco"
            ? "negro"
            : "blanco";

    return casillaAmenazada(
        rey.fila,
        rey.columna,
        enemigo,
        tableroActual
    );
}

// ============================================================
// ENCONTRAR REY
// ============================================================

function encontrarRey(
    color,
    tableroActual = tablero
) {

    for (let fila = 0; fila < 8; fila++) {

        for (let columna = 0; columna < 8; columna++) {

            const p =
                tableroActual[fila][columna];

            if (
                p &&
                p.tipo === "rey" &&
                p.color === color
            ) {

                return {
                    fila,
                    columna
                };
            }
        }
    }

    return null;
}

// ============================================================
// CASILLA AMENAZADA
// ============================================================

function casillaAmenazada(
    fila,
    columna,
    colorAtacante,
    tableroActual
) {

    // Peones
    const direccion =
        colorAtacante === "blanco"
            ? -1
            : 1;

    const filaPeon =
        fila - direccion;

    for (const dc of [-1, 1]) {

        const nc = columna + dc;

        if (!dentro(filaPeon, nc)) {
            continue;
        }

        const p =
            tableroActual[filaPeon][nc];

        if (
            p &&
            p.color === colorAtacante &&
            p.tipo === "peon"
        ) {
            return true;
        }
    }

    // Caballos
    const posicionesCaballo = [
        [-2, -1],
        [-2, 1],
        [-1, -2],
        [-1, 2],
        [1, -2],
        [1, 2],
        [2, -1],
        [2, 1]
    ];

    for (const [df, dc] of posicionesCaballo) {

        const nf = fila + df;
        const nc = columna + dc;

        if (!dentro(nf, nc)) {
            continue;
        }

        const p =
            tableroActual[nf][nc];

        if (
            p &&
            p.color === colorAtacante &&
            p.tipo === "caballo"
        ) {
            return true;
        }
    }

    // Rey
    for (let df = -1; df <= 1; df++) {

        for (let dc = -1; dc <= 1; dc++) {

            if (df === 0 && dc === 0) {
                continue;
            }

            const nf = fila + df;
            const nc = columna + dc;

            if (!dentro(nf, nc)) {
                continue;
            }

            const p =
                tableroActual[nf][nc];

            if (
                p &&
                p.color === colorAtacante &&
                p.tipo === "rey"
            ) {
                return true;
            }
        }
    }

    // Torres y damas
    const rectas = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
    ];

    if (
        buscarAmenazaDireccion(
            fila,
            columna,
            colorAtacante,
            ["torre", "dama"],
            rectas,
            tableroActual
        )
    ) {
        return true;
    }

    // Alfiles y damas
    const diagonales = [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1]
    ];

    if (
        buscarAmenazaDireccion(
            fila,
            columna,
            colorAtacante,
            ["alfil", "dama"],
            diagonales,
            tableroActual
        )
    ) {
        return true;
    }

    return false;
}

// ============================================================
// BUSCAR AMENAZA
// ============================================================

function buscarAmenazaDireccion(
    fila,
    columna,
    color,
    tipos,
    direcciones,
    tableroActual
) {

    for (const [df, dc] of direcciones) {

        let nf = fila + df;
        let nc = columna + dc;

        while (dentro(nf, nc)) {

            const p =
                tableroActual[nf][nc];

            if (p) {

                if (
                    p.color === color &&
                    tipos.includes(p.tipo)
                ) {
                    return true;
                }

                break;
            }

            nf += df;
            nc += dc;
        }
    }

    return false;
}

// ============================================================
// MOVIMIENTO DE LA MÁQUINA
// ============================================================

function movimientoMaquina() {

    if (juegoTerminado) {
        return;
    }

    const movimientos = [];

    for (let fila = 0; fila < 8; fila++) {

        for (let columna = 0; columna < 8; columna++) {

            const p = tablero[fila][columna];

            if (
                p &&
                p.color === "negro"
            ) {

                const posibles =
                    obtenerMovimientosValidos(
                        fila,
                        columna
                    );

                for (const destino of posibles) {

                    movimientos.push({
                        origen: {
                            fila,
                            columna
                        },
                        destino
                    });
                }
            }
        }
    }

    if (movimientos.length === 0) {
        return;
    }

    // La máquina prioriza capturas.
    const capturas =
        movimientos.filter(m =>
            tablero[
                m.destino.fila
            ][
                m.destino.columna
            ]
        );

    let elegido;

    if (capturas.length > 0) {
        elegido =
            elegirMejorCaptura(capturas);
    } else {
        elegido =
            movimientos[
                Math.floor(
                    Math.random() *
                    movimientos.length
                )
            ];
    }

    moverPieza(
        elegido.origen.fila,
        elegido.origen.columna,
        elegido.destino.fila,
        elegido.destino.columna
    );
}

// ============================================================
// ELEGIR CAPTURA
// ============================================================

function elegirMejorCaptura(movimientos) {

    const valores = {
        peon: 1,
        caballo: 3,
        alfil: 3,
        torre: 5,
        dama: 9,
        rey: 100
    };

    movimientos.sort((a, b) => {

        const piezaA =
            tablero[
                a.destino.fila
            ][
                a.destino.columna
            ];

        const piezaB =
            tablero[
                b.destino.fila
            ][
                b.destino.columna
            ];

        return (
            valores[piezaB.tipo] -
            valores[piezaA.tipo]
        );
    });

    const cantidad =
        Math.min(3, movimientos.length);

    return movimientos[
        Math.floor(
            Math.random() * cantidad
        )
    ];
}

// ============================================================
// CARTEL FINAL
// ============================================================

function mostrarFinal(
    icono,
    titulo,
    texto
) {

    const anterior =
        document.querySelector(".final-partida");

    if (anterior) {
        anterior.remove();
    }

    const modal =
        document.createElement("div");

    modal.className = "final-partida";

    modal.innerHTML = `
        <div class="final-contenido">

            <div class="icono">
                ${icono}
            </div>

            <h2>${titulo}</h2>

            <p>${texto}</p>

            <button id="finalReiniciar">
                🔄 Jugar otra vez
            </button>

        </div>
    `;

    document.body.appendChild(modal);

    document
        .getElementById("finalReiniciar")
        .addEventListener(
            "click",
            () => {
                modal.remove();
                reiniciarJuego();
            }
        );
}

// ============================================================
// INFORMACIÓN
// ============================================================

function actualizarInformacion() {

    turnoHTML.textContent =
        turno === "blanco"
            ? "Blancas"
            : "Negras";

    modoActualHTML.textContent =
        modo === "dos"
            ? "2 Jugadores"
            : "Contra la máquina";

    capturadasBlancasHTML.textContent =
        capturadasBlancas.length > 0
            ? "Capturadas: " +
              capturadasBlancas
                  .map(
                      p =>
                          simbolos[p.tipo][p.color]
                  )
                  .join(" ")
            : "";

    capturadasNegrasHTML.textContent =
        capturadasNegras.length > 0
            ? "Capturadas: " +
              capturadasNegras
                  .map(
                      p =>
                          simbolos[p.tipo][p.color]
                  )
                  .join(" ")
            : "";
}

// ============================================================
// CAMBIAR MODO
// ============================================================

btnDosJugadores.addEventListener(
    "click",
    () => {

        modo = "dos";

        btnDosJugadores.classList.add("activo");
        btnMaquina.classList.remove("activo");

        reiniciarJuego();
    }
);

btnMaquina.addEventListener(
    "click",
    () => {

        modo = "maquina";

        btnMaquina.classList.add("activo");
        btnDosJugadores.classList.remove("activo");

        reiniciarJuego();
    }
);

// ============================================================
// REINICIAR
// ============================================================

btnReiniciar.addEventListener(
    "click",
    reiniciarJuego
);

function reiniciarJuego() {

    const modal =
        document.querySelector(".final-partida");

    if (modal) {
        modal.remove();
    }

    crearTableroInicial();

    turno = "blanco";
    seleccion = null;
    movimientosDisponibles = [];
    juegoTerminado = false;

    capturadasBlancas = [];
    capturadasNegras = [];

    mensajeHTML.textContent =
        "Seleccioná una pieza para comenzar.";

    dibujarTablero();
}

// ============================================================
// UTILIDAD
// ============================================================

function dentro(fila, columna) {

    return (
        fila >= 0 &&
        fila < 8 &&
        columna >= 0 &&
        columna < 8
    );
}

// ============================================================
// INICIAR
// ============================================================

reiniciarJuego();
