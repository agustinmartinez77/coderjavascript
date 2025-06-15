function mostrarMensaje(texto) {
  alert(texto);
}

function pedirDecision(pregunta, opcionesValidas) {
  let decision;
  do {
    decision = prompt(pregunta);
  } while (!opcionesValidas.includes(decision));
  return decision;
}

function finalizarJuego(tipo) {
  if (tipo === "fin") {
    alert("💀 Fin del juego");
  } else if (tipo === "continuar") {
    alert("🔮 Continuará...");
  } else {
    alert("⚠️ Estado desconocido");
  }
}

// Inicio de la aventura
mostrarMensaje("✨ Baldur's Gate 3: Aventura interactiva ✨\n\n" +
  "Te despertás en una playa desierta. La nave en la que viajabas se estrelló.\n" +
  "Sentís un dolor extraño en la cabeza... un parásito vive en tu interior.\n" +
  "Restos de la nave humean a lo lejos, y escuchás gritos dispersos...");

// Primera decisión
let decision1 = pedirDecision(
  "¿Qué hacés?\n1. Te acercás al humo\n2. Buscás sobrevivientes\n3. Te escondés",
  ["1", "2", "3"]
);

let decision2; // Segunda decisión

// Ramas según decisión 1
if (decision1 === "1") {
  mostrarMensaje("Caminás hacia el humo, encontrás a una mujer atrapada en una jaula.");

  decision2 = pedirDecision(
    "¿Qué hacés?\n1. La ayudás a salir\n2. Desconfiás y la atacás",
    ["1", "2"]
  );

  if (decision2 === "1") {
    mostrarMensaje("La liberás. Se une a vos, aunque no te da las gracias. Parece saber luchar.");
    finalizarJuego("continuar");
  } else {
    mostrarMensaje("La atacás. Es rápida y letal, característico de la educación en su raza. Te derrota sin esfuerzo.");
    finalizarJuego("fin");
  }
} else if (decision1 === "2") {
  mostrarMensaje("Revisando entre los restos encontrás a una clériga inconsciente. Parece que carga una reliquia poderosa.");

  decision2 = pedirDecision(
    "¿Qué hacés?\n1. Intentás quitarle la reliquia\n2. Intentás despertarla",
    ["1", "2"]
  );

  if (decision2 === "1") {
    mostrarMensaje("Apenas tocás la reliquia, esta emite un pulso de energía que te lanza por los aires, no tenías casco para resistir el golpe por la caída.");
    finalizarJuego("fin");
  } else {
    mostrarMensaje("La despertás. Agradecida, se une a vos. Dice que esa reliquia puede salvarlos.");
    finalizarJuego("continuar");
  }
} else {
  mostrarMensaje("Te escondiste a la sombra de un árbol, un vampiro aprovechó para hacerse con tu vida, no volviste a despertar.");
  finalizarJuego("fin");
}
