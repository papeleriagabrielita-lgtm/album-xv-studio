const $ = id => document.getElementById(id);

let fotos = [];
let fotoSeleccionada = null;
let textoSeleccionado = null;

function aplicarNombre() {
  $("nombrePortada").textContent = $("nombreEditar").value;
}

function aplicarTitulo() {
  $("tituloPortada").textContent = $("tituloEditar").value;
}

function borrarNombre() {
  $("nombrePortada").textContent = "";
  $("nombreEditar").value = "";
}

function borrarTitulo() {
  $("tituloPortada").textContent = "";
  $("tituloEditar").value = "";
}

$("aplicarNombre").addEventListener("click", aplicarNombre);
$("aplicarTitulo").addEventListener("click", aplicarTitulo);
$("borrarNombre").addEventListener("click", borrarNombre);
$("borrarTitulo").addEventListener("click", borrarTitulo);

$("tema").addEventListener("change", function () {
  $("pagina").className = "pagina " + this.value;
});

$("colorFondo").addEventListener("input", function () {
  $("pagina").style.backgroundColor = this.value;
});

// FOTOGRAFÍAS
$("fotos").addEventListener("change", function () {
  Array.from(this.files).forEach(archivo => {
    const lector = new FileReader();

    lector.onload = function (evento) {
      fotos.push({
        src: evento.target.result,
        nombre: archivo.name
      });

      mostrarGaleria();

      if (!fotoSeleccionada) {
        seleccionarFoto(fotos.length - 1);
      }
    };

    lector.readAsDataURL(archivo);
  });

  this.value = "";
});

function mostrarGaleria() {
  $("galeria").innerHTML = "";

  fotos.forEach((foto, indice) => {
    const miniatura = document.createElement("img");

    miniatura.src = foto.src;
    miniatura.alt = foto.nombre;
    miniatura.className = "miniatura";

    miniatura.addEventListener("click", () => {
      seleccionarFoto(indice);
    });

    $("galeria").appendChild(miniatura);
  });
}

function seleccionarFoto(indice) {
  if (!fotos[indice]) return;

  fotoSeleccionada = indice;
  $("photoStage").innerHTML = "";

  const imagen = document.createElement("img");
  imagen.src = fotos[indice].src;
  imagen.className = "album-photo selected";
  imagen.alt = fotos[indice].nombre;

  imagen.addEventListener("click", () => {
    document.querySelectorAll(".album-photo").forEach(f => {
      f.classList.remove("selected");
    });

    imagen.classList.add("selected");
  });

  $("photoStage").appendChild(imagen);
  actualizarFoto();
}

function actualizarFoto() {
  const imagen = $("photoStage").querySelector("img");
  if (!imagen) return;

  imagen.style.width = $("zoom").value + "%";
  imagen.style.filter =
    "brightness(" + $("brillo").value + "%)";
}

$("zoom").addEventListener("input", actualizarFoto);
$("brillo").addEventListener("input", actualizarFoto);

$("girar").addEventListener("click", function () {
  const imagen = $("photoStage").querySelector("img");
  if (!imagen) return;

  const actual = Number(imagen.dataset.giro || 0);
  const nuevo = actual + 90;

  imagen.dataset.giro = nuevo;
  imagen.style.transform = "rotate(" + nuevo + "deg)";
});

$("quitarFoto").addEventListener("click", function () {
  if (fotoSeleccionada === null) return;

  fotos.splice(fotoSeleccionada, 1);
  fotoSeleccionada = null;

  $("photoStage").innerHTML = "";
  mostrarGaleria();
});

// TEXTOS
$("agregarTexto").addEventListener("click", function () {
  const contenido = $("textoNuevo").value.trim();
  if (!contenido) {
    alert("Escribe primero un texto.");
    return;
  }

  const elemento = document.createElement("div");

  elemento.className = "movable-text";
  elemento.textContent = contenido;
  elemento.style.color = $("colorTexto").value;
  elemento.style.fontSize = $("tamTexto").value + "px";
  elemento.style.left = "20px";
  elemento.style.top = "20px";
  elemento.contentEditable = "true";

  elemento.addEventListener("click", function (evento) {
    evento.stopPropagation();

    document.querySelectorAll(".movable-text").forEach(t => {
      t.classList.remove("selected");
    });

    elemento.classList.add("selected");
    textoSeleccionado = elemento;
  });

  $("textLayer").appendChild(elemento);
  $("textoNuevo").value = "";
  textoSeleccionado = elemento;
  elemento.classList.add("selected");
});

$("colorTexto").addEventListener("input", function () {
  if (textoSeleccionado) {
    textoSeleccionado.style.color = this.value;
  }
});

$("tamTexto").addEventListener("input", function () {
  if (textoSeleccionado) {
    textoSeleccionado.style.fontSize = this.value + "px";
  }
});

$("borrarTexto").addEventListener("click", function () {
  if (textoSeleccionado) {
    textoSeleccionado.remove();
    textoSeleccionado = null;
  }
});

// VIDEO
$("videoArchivo").addEventListener("change", function () {
  const archivo = this.files[0];
  if (!archivo) return;

  const direccion = URL.createObjectURL(archivo);
  $("videoArea").innerHTML = "";

  const video = document.createElement("video");
  video.src = direccion;
  video.controls = true;
  video.style.width = "100%";

  $("videoArea").appendChild(video);
});

// CÓDIGO QR
$("crearQR").addEventListener("click", function () {
  const direccion = $("urlAlbum").value.trim();

  if (!direccion.startsWith("https://") &&
      !direccion.startsWith("http://")) {
    alert("Primero publica tu álbum y pega aquí su enlace público.");
    return;
  }

  if (typeof QRCode === "undefined") {
    alert("No se pudo cargar el generador QR. Revisa tu conexión a Internet.");
    return;
  }

  $("qrArea").innerHTML = "";

  new QRCode($("qrArea"), {
    text: direccion,
    width: 220,
    height: 220
  });
});

$("descargarQR").addEventListener("click", function () {
  const imagen = $("qrArea").querySelector("img");
  const lienzo = $("qrArea").querySelector("canvas");

  let enlace = "";

  if (imagen) {
    enlace = imagen.src;
  } else if (lienzo) {
    enlace = lienzo.toDataURL("image/png");
  }

  if (!enlace) {
    alert("Primero crea tu código QR.");
    return;
  }

  const descarga = document.createElement("a");
  descarga.href = enlace;
  descarga.download = "QR_Album_XV.png";
  descarga.click();
});

// GUARDAR PROYECTO
$("guardar").addEventListener("click", function () {
  const proyecto = {
    nombre: $("nombrePortada").textContent,
    titulo: $("tituloPortada").textContent,
    tema: $("tema").value,
    fondo: $("colorFondo").value,
    fotos: fotos,
    textos: Array.from(
      $("textLayer").children
    ).map(t => ({
      texto: t.textContent,
      color: t.style.color,
      tamano: t.style.fontSize,
      izquierda: t.style.left,
      arriba: t.style.top
    }))
  };

  try {
    localStorage.setItem(
      "albumXVStudio",
      JSON.stringify(proyecto)
    );

    alert("¡Álbum guardado correctamente!");
  } catch (error) {
    alert("No se pudo guardar. Quizá las fotografías ocupan demasiado espacio.");
  }
});

// RECUPERAR PROYECTO
window.addEventListener("load", function () {
  const guardado = localStorage.getItem("albumXVStudio");
  if (!guardado) return;

  try {
    const proyecto = JSON.parse(guardado);

    $("nombrePortada").textContent = proyecto.nombre || "";
    $("tituloPortada").textContent = proyecto.titulo || "";

    $("nombreEditar").value = proyecto.nombre || "";
    $("tituloEditar").value = proyecto.titulo || "";

    $("tema").value = proyecto.tema || "princesa";
    $("pagina").className = "pagina " + $("tema").value;

    $("colorFondo").value = proyecto.fondo || "#f4e8ff";
    $("pagina").style.backgroundColor = $("colorFondo").value;

    fotos = proyecto.fotos || [];
    mostrarGaleria();

    if (fotos.length) {
      seleccionarFoto(0);
    }

    (proyecto.textos || []).forEach(t => {
      const elemento = document.createElement("div");

      elemento.className = "movable-text";
      elemento.textContent = t.texto;
      elemento.style.color = t.color;
      elemento.style.fontSize = t.tamano;
      elemento.style.left = t.izquierda;
      elemento.style.top = t.arriba;
      elemento.contentEditable = "true";

      elemento.addEventListener("click", function (evento) {
        evento.stopPropagation();

        document.querySelectorAll(".movable-text").forEach(x => {
          x.classList.remove("selected");
        });

        elemento.classList.add("selected");
        textoSeleccionado = elemento;
      });

      $("textLayer").appendChild(elemento);
    });
  } catch (error) {
    console.log("No se pudo recuperar el álbum:", error);
  }
});