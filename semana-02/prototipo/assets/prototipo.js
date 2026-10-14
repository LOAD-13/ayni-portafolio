/* ============================================================
   AYNI BANK · Motor del prototipo interactivo
   ------------------------------------------------------------
   Convierte los HTML exportados desde pen.dev en un prototipo
   navegable: enlaza los botones del diseño con las pantallas
   correspondientes, simula campos, y manda a la pantalla
   "Funcionalidad en progreso" todo lo que aún no existe.

   Los elementos se localizan por el atributo data-pencil-name
   que el exportador de pen.dev deja en cada capa del diseño.
   ============================================================ */

(function () {
  "use strict";

  /* ---------------------------------------------------------
     1. Pantallas del prototipo
     f = archivo · m = nombre del marco dentro del archivo
     g = grupo del menú · next = siguiente paso del flujo
     --------------------------------------------------------- */

  var SCREENS = {
    landing: {
      f: "landing.html",
      t: "Landing pública",
      g: "Público",
      next: "registro"
    },
    registro: {
      f: "register.html",
      t: "1 · Datos personales",
      g: "Onboarding",
      next: "dni-anverso"
    },
    "dni-anverso": {
      f: "DNI anverso.html",
      t: "2 · DNI anverso",
      g: "Onboarding",
      next: "dni-reverso"
    },
    "dni-reverso": {
      f: "DNI reverso.html",
      t: "3 · DNI reverso y datos leídos",
      g: "Onboarding",
      next: "rostro-1"
    },
    "rostro-1": {
      f: "Captura de rostro.html",
      m: "4.1 · Vivacidad · Centra tu rostro en el óvalo",
      t: "4.1 · Centra tu rostro",
      g: "Onboarding",
      next: "rostro-2"
    },
    "rostro-2": {
      f: "Captura de rostro.html",
      m: "4.2 · Vivacidad · Acércate lentamente",
      t: "4.2 · Acércate lentamente",
      g: "Onboarding",
      next: "rostro-3"
    },
    "rostro-3": {
      f: "Captura de rostro.html",
      m: "4.3 · Vivacidad · Gira despacio a la derecha",
      t: "4.3 · Gira a la derecha",
      g: "Onboarding",
      next: "rostro-4"
    },
    "rostro-4": {
      f: "Captura de rostro.html",
      m: "4.4 · Vivacidad · Parpadea dos veces",
      t: "4.4 · Parpadea dos veces",
      g: "Onboarding",
      next: "resultado-ok"
    },
    "resultado-ok": {
      f: "Result register.html",
      m: "5a · Resultado · Verificación aprobada",
      t: "5a · Verificación aprobada",
      g: "Onboarding",
      next: "login"
    },
    "resultado-revision": {
      f: "Result register.html",
      m: "5b · Resultado · Derivada a revisión",
      t: "5b · Derivada a revisión",
      g: "Onboarding",
      next: "dni-anverso"
    },
    login: {
      f: "Inicio de sesion01.html",
      t: "6a · Credenciales",
      g: "Sesión",
      next: "login-2fa"
    },
    "login-2fa": {
      f: "Inicio de sesion02.html",
      t: "6b · Segundo factor",
      g: "Sesión",
      next: "panel"
    },
    panel: {
      f: "Dashboard.html",
      m: "7 · Banca por Internet · Panel",
      t: "7 · Panel de banca",
      g: "Banca",
      next: "panel-error"
    },
    "panel-error": {
      f: "Dashboard.html",
      m: "7b · Panel · Error de conexión en saldos",
      t: "7b · Error en saldos",
      g: "Banca",
      next: "panel"
    },
    guia: { f: "Design guide.html", t: "Guía de estilo", g: "Extras" },
    desarrollo: { f: "en-desarrollo.html", t: "En desarrollo", g: "Extras" },
    inicio: { f: "index.html", t: "Índice del prototipo", g: "Extras" }
  };

  /* ---------------------------------------------------------
     2. Reglas de interacción por pantalla
     n / ns  → data-pencil-name del elemento (uno o varios)
     in      → limita la búsqueda a un contenedor por nombre
     go      → navega a otra pantalla
     dev     → manda a "funcionalidad en progreso"
               (true = usa el texto del propio elemento)
     scroll  → desplaza hasta una sección de la misma pantalla
     toast   → muestra un aviso
     --------------------------------------------------------- */

  function navBanca(extra) {
    var base = [
      {
        ns: [
          "Cuentas",
          "Transferir",
          "Tarjetas",
          "Movimientos",
          "Tipo de cambio",
          "Configuración"
        ],
        in: "Secciones",
        dev: true
      },
      { n: "Resumen", in: "Secciones", toast: "Ya estás en el resumen." },
      { n: "Ayuda", in: "Pie Nav", dev: "Centro de ayuda de la banca" },
      {
        n: "Cerrar sesión",
        in: "Pie Nav",
        go: "login",
        toast: "Cerraste sesión."
      },
      { n: "Botón search", dev: "Buscador de la banca en línea" },
      { n: "Botón bell", dev: "Centro de notificaciones" },
      { n: "Usuario", dev: "Perfil y preferencias" },
      { n: "Marca App", toast: "Ya estás en el panel principal." },
      { n: "Ocultar", hideBalances: true },
      {
        ns: ["Congelar", "Ver datos", "Límites"],
        in: "Controles Tarjeta",
        dev: true
      },
      {
        ns: ["Transferir", "Mi tarjeta", "Estado de cuenta"],
        in: "Accesos Rápidos",
        dev: true
      },
      { n: "Ver Todos", dev: "Historial completo de movimientos" },
      { n: "Cambiar", in: "Card Tipo de Cambio", dev: "Cambio de moneda" },
      {
        n: "Enlace",
        in: "Card Tipo de Cambio",
        dev: "Cómo calculamos el tipo de cambio"
      },
      { n: "Cuenta Ayni Soles", in: "Cuentas", dev: "Detalle de la cuenta en soles" },
      {
        n: "Cuenta Ayni Dólares",
        in: "Cuentas",
        dev: "Detalle de la cuenta en dólares"
      }
    ];
    return base.concat(extra || []);
  }

  var ROUTES = {
    landing: [
      { n: "Btn Ingresar", go: "login" },
      { n: "Btn Abrir", go: "registro" },
      { n: "CTA Primario", go: "registro" },
      { n: "CTA Secundario", dev: "Video · Cómo funciona Ayni" },
      { n: "Primario", in: "CTA Final", go: "registro" },
      { n: "Secundario", in: "CTA Final", dev: "Hablar con un asesor" },
      { n: "Marca", in: "Nav", top: true },
      { n: "Cuentas", in: "Enlaces", scroll: "Sección Cuenta" },
      { n: "Tarjetas", in: "Enlaces", scroll: "Sección Productos" },
      { n: "Préstamos", in: "Enlaces", scroll: "Sección Productos" },
      { n: "Inversiones", in: "Enlaces", scroll: "Sección Productos" },
      { n: "Negocios", in: "Enlaces", dev: "Banca para negocios" },
      { n: "Ayuda", in: "Enlaces", scroll: "Footer" },
      { n: "Botón", in: "Sección Productos", dev: "Catálogo de productos" },
      { n: "Cuenta de ahorro", in: "Fila 1", go: "registro" },
      {
        ns: ["Depósito a plazo", "Tarjeta de crédito"],
        in: "Fila 1",
        dev: true
      },
      {
        ns: ["Préstamo personal", "Seguros simples", "Cuenta negocio"],
        in: "Fila 2",
        dev: true
      },
      { n: "Enlace", in: "Sección Cuenta", dev: "Detalle de la Cuenta Ayni" },
      { ns: ["App Store", "Google Play"], in: "Descargas", dev: true },
      {
        linksIn: ["Productos", "Negocios", "Ayni Bank", "Ayuda"],
        within: "Superior",
        skip: "Título"
      },
      { n: "Logo", in: "Footer", top: true }
    ],

    registro: [
      { n: "Continuar", go: "dni-anverso" },
      { n: "Enlace Login", go: "login" },
      { n: "Salir", go: "landing", toast: "Guardamos tu avance." },
      { n: "Marca", in: "Barra Superior", go: "landing" },
      { n: "Casilla", in: "Consentimiento", check: true },
      {
        n: "Tipo de documento",
        toast: "En el prototipo solo está habilitado el DNI."
      },
      {
        fields: [
          "Nombres",
          "Apellidos",
          "Número de documento",
          "Fecha de nacimiento",
          "Celular",
          "Correo electrónico",
          "Contraseña",
          "Confirmar contraseña"
        ]
      }
    ],

    "dni-anverso": [
      { n: "Continuar", go: "dni-reverso" },
      { n: "Atrás", go: "registro" },
      { n: "Repetir", toast: "Reiniciando la captura del anverso…" },
      { n: "Salir", go: "landing", toast: "Guardamos tu avance." },
      { n: "Marca", in: "Barra Superior", go: "landing" },
      {
        n: "Marco Anverso",
        toast: "Cámara simulada · pulsa «Continuar» para avanzar."
      }
    ],

    "dni-reverso": [
      { n: "Continuar", go: "rostro-1" },
      { n: "Atrás", go: "dni-anverso" },
      { n: "Salir", go: "landing", toast: "Guardamos tu avance." },
      { n: "Marca", in: "Barra Superior", go: "landing" }
    ],

    "rostro-1": [{ n: "Salir", go: "landing", toast: "Guardamos tu avance." }],
    "rostro-2": [{ n: "Salir", go: "landing", toast: "Guardamos tu avance." }],
    "rostro-3": [{ n: "Salir", go: "landing", toast: "Guardamos tu avance." }],
    "rostro-4": [{ n: "Salir", go: "landing", toast: "Guardamos tu avance." }],

    "resultado-ok": [
      { n: "Entrar", go: "login" },
      { n: "Constancia", dev: "Constancia de apertura en PDF" },
      { n: "Marca", in: "Barra Superior", go: "landing" }
    ],

    "resultado-revision": [
      { n: "Reintentar", go: "dni-anverso" },
      { n: "Ayuda", dev: "Centro de ayuda" },
      { n: "Marca", in: "Barra Superior", go: "landing" }
    ],

    login: [
      { n: "Ingresar", go: "login-2fa" },
      {
        n: "Biometría",
        go: "login-2fa",
        toast: "Biometría del dispositivo verificada."
      },
      { n: "Enlace", in: "Alta", go: "registro" },
      { n: "Olvidé", dev: "Recuperación de contraseña" },
      { n: "Recordar", check: "Casilla" },
      { n: "Marca", in: "Panel Marca", go: "landing" },
      { fields: ["Correo", "Contraseña"] }
    ],

    "login-2fa": [
      { n: "Verificar", go: "panel" },
      { n: "Volver", go: "login" },
      {
        n: "Reenviar",
        toast: "Enviamos un código nuevo a tu app de autenticación."
      },
      { n: "Otro método", dev: "Otros métodos de verificación" },
      { n: "Marca", in: "Panel Marca", go: "landing" },
      { otp: "Casillas" }
    ],

    panel: navBanca(),
    "panel-error": navBanca([
      {
        n: "Reintentar",
        in: "Aviso Error",
        go: "panel",
        toast: "Saldos actualizados correctamente."
      }
    ])
  };

  /* Marco del diseño → clave de pantalla */
  var FRAME_TO_KEY = {};
  for (var k in SCREENS) {
    if (SCREENS[k].m) FRAME_TO_KEY[SCREENS[k].m] = k;
  }
  FRAME_TO_KEY["1. Landing Definitiva · A"] = "landing";
  FRAME_TO_KEY["1 · Registro · Datos personales"] = "registro";
  FRAME_TO_KEY["2 · Registro · DNI anverso"] = "dni-anverso";
  FRAME_TO_KEY["3 · Registro · DNI reverso y datos leídos"] = "dni-reverso";
  FRAME_TO_KEY["6a · Inicio de sesión · Credenciales"] = "login";
  FRAME_TO_KEY["6b · Inicio de sesión · Segundo factor"] = "login-2fa";
  FRAME_TO_KEY["Guía de Estilo · Ayni Bank"] = "guia";

  /* ---------------------------------------------------------
     3. Utilidades
     --------------------------------------------------------- */

  var state = {
    key: null,
    root: null,
    stage: null,
    frames: [],
    stageW: 1440,
    timers: [],
    mode: (function () {
      try {
        return localStorage.getItem("ayni-proto-modo") === "design"
          ? "design"
          : "web";
      } catch (e) {
        return "web";
      }
    })()
  };

  function $(sel, ctx) {
    return (ctx || document).querySelector(sel);
  }
  function $$(sel, ctx) {
    return [].slice.call((ctx || document).querySelectorAll(sel));
  }
  function byName(name, ctx) {
    return $$('[data-pencil-name="' + cssEscape(name) + '"]', ctx || state.root);
  }
  function cssEscape(v) {
    return String(v).replace(/"/g, '\\"');
  }
  function txt(el) {
    return (el.textContent || "").replace(/\s+/g, " ").trim();
  }
  function url(key, extra) {
    var s = SCREENS[key];
    if (!s) return null;
    return encodeURI(s.f) + (extra || "") + (s.m ? "#" + key : "");
  }
  function clearTimers() {
    state.timers.forEach(clearTimeout);
    state.timers = [];
    var a = $("#proto-auto");
    if (a) a.remove();
  }
  function later(fn, ms) {
    var id = setTimeout(fn, ms);
    state.timers.push(id);
    return id;
  }

  /* ---------------------------------------------------------
     4. Navegación
     --------------------------------------------------------- */

  function go(key, opts) {
    opts = opts || {};
    var target = SCREENS[key];
    if (!target) return;
    clearTimers();

    var here = SCREENS[state.key];
    var sameFile = here && here.f === target.f && target.m;

    if (opts.toast) toast(opts.toast);
    var delay = opts.toast ? 420 : 0;

    if (sameFile) {
      later(function () {
        location.hash = key;
      }, delay);
      return;
    }
    document.body.classList.add("proto-leaving");
    later(function () {
      location.href = url(key, opts.query);
    }, Math.max(delay, 170));
  }

  function goDev(label, el) {
    var name = label === true ? txt(el).slice(0, 70) : label;
    document.body.classList.add("proto-leaving");
    later(function () {
      location.href =
        "en-desarrollo.html?f=" +
        encodeURIComponent(name || "Esta función") +
        "&from=" +
        encodeURIComponent(state.key || "");
    }, 170);
  }

  /* ---------------------------------------------------------
     5. Cableado de las reglas
     --------------------------------------------------------- */

  function hot(el, handler) {
    if (!el || el.dataset.protoHot) return;
    el.dataset.protoHot = "1";
    el.addEventListener("click", function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      handler(el, ev);
    });
  }

  function scoped(rule) {
    var names = rule.ns || [rule.n];
    var out = [];
    names.forEach(function (name) {
      byName(name).forEach(function (el) {
        if (rule.in && !el.closest('[data-pencil-name="' + cssEscape(rule.in) + '"]'))
          return;
        out.push(el);
      });
    });
    return out;
  }

  function applyRule(rule) {
    /* Enlaces de columnas (pie de página) */
    if (rule.linksIn) {
      rule.linksIn.forEach(function (col) {
        byName(col).forEach(function (colEl) {
          if (rule.within && !colEl.closest('[data-pencil-name="' + cssEscape(rule.within) + '"]'))
            return;
          $$(":scope > [data-pencil-name]", colEl).forEach(function (item) {
            if (item.dataset.pencilName === rule.skip) return;
            hot(item, function (el) {
              goDev(txt(el), el);
            });
          });
        });
      });
      return;
    }

    /* Campos de texto simulados */
    if (rule.fields) {
      rule.fields.forEach(function (name) {
        byName(name).forEach(makeField);
      });
      return;
    }

    /* Casillas de código de un solo uso */
    if (rule.otp) {
      byName(rule.otp).forEach(makeOtp);
      return;
    }

    scoped(rule).forEach(function (el) {
      if (rule.check) {
        var box = rule.check === true ? el : byName(rule.check, el)[0] || el;
        hot(el, function () {
          box.classList.toggle("proto-checked");
        });
        return;
      }
      if (rule.hideBalances) {
        hot(el, toggleBalances);
        return;
      }
      hot(el, function (target) {
        if (rule.dev) return goDev(rule.dev, target);
        if (rule.scroll) {
          var s = byName(rule.scroll)[0];
          if (s) s.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
        if (rule.top) {
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
        if (rule.go) return go(rule.go, { toast: rule.toast });
        if (rule.toast) toast(rule.toast);
      });
    });
  }

  /* ---------------------------------------------------------
     6. Comportamientos simulados
     --------------------------------------------------------- */

  function lastTextLeaf(el) {
    var best = null;
    $$("*", el).forEach(function (n) {
      if (!txt(n)) return;
      if ($$("*", n).some(function (c) { return txt(c); })) return;
      best = n;
    });
    return best;
  }

  function makeField(el) {
    /* Estructura del componente «Cmp · Campo»: Etiqueta / Caja > Valor / Ayuda */
    var box = byName("Caja", el)[0] || el;
    if (box.dataset.protoField) return;
    var input = byName("Valor", box)[0] || lastTextLeaf(box);
    if (!input) return;
    box.dataset.protoField = "1";
    el = box;
    input.setAttribute("contenteditable", "true");
    input.setAttribute("spellcheck", "false");
    input.style.outline = "none";
    var placeholder = input.textContent;
    var touched = false;
    el.addEventListener("mousedown", function (ev) {
      ev.preventDefault();
      input.focus();
    });
    input.addEventListener("focus", function () {
      el.classList.add("proto-field--focus");
      if (!touched) {
        touched = true;
        input.textContent = "";
        input.dataset.protoTyped = "1";
      }
    });
    input.addEventListener("blur", function () {
      el.classList.remove("proto-field--focus");
      if (!input.textContent.trim()) {
        touched = false;
        input.textContent = placeholder;
        delete input.dataset.protoTyped;
      }
    });
  }

  function digitBoxes() {
    var out = [];
    for (var i = 1; i <= 6; i++) {
      var b = byName("Dígito " + i)[0];
      if (b) out.push(b);
    }
    return out;
  }

  function paintDigit(box, value) {
    box.textContent = value;
    box.style.display = "flex";
    box.style.alignItems = "center";
    box.style.justifyContent = "center";
    box.style.fontFamily = "Inter, system-ui, sans-serif";
    box.style.fontSize = "24px";
    box.style.fontWeight = "600";
    box.style.color = "#0d2a44";
  }

  function isDigit(el) {
    return /^[0-9]$/.test(txt(el));
  }

  /* El diseño ya trae parte del código escrito: solo completamos lo que falta */
  function fillOtp() {
    var boxes = digitBoxes();
    if (!boxes.length) return;
    var pool = "482913";
    var step = 0;
    boxes.forEach(function (b, i) {
      if (isDigit(b)) return;
      later(function () {
        paintDigit(b, pool[i]);
      }, step++ * 110);
    });
    if (step) toast("Código completado · pulsa «Verificar y entrar»");
  }

  function makeOtp(el) {
    hot(el, fillOtp);
    if (state.otpKeys) return;
    state.otpKeys = true;
    document.addEventListener("keydown", function (ev) {
      if (state.key !== "login-2fa") return;
      if (ev.target && ev.target.isContentEditable) return;
      var boxes = digitBoxes();
      if (/^[0-9]$/.test(ev.key)) {
        for (var i = 0; i < boxes.length; i++) {
          if (!isDigit(boxes[i])) return paintDigit(boxes[i], ev.key);
        }
      } else if (ev.key === "Backspace") {
        for (var j = boxes.length - 1; j >= 0; j--) {
          if (isDigit(boxes[j])) {
            boxes[j].textContent = "";
            return;
          }
        }
      }
    });
  }

  var balancesHidden = false;
  function toggleBalances() {
    var card = byName("Card Saldos")[0];
    if (!card) return;
    balancesHidden = !balancesHidden;
    ["Valor", "Saldo"].forEach(function (name) {
      byName(name, card).forEach(function (el) {
        if (balancesHidden) {
          el.dataset.protoReal = el.textContent;
          el.textContent = "••••••";
        } else if (el.dataset.protoReal) {
          el.textContent = el.dataset.protoReal;
        }
      });
    });
    var label = byName("Etiqueta", byName("Ocultar")[0] || card)[0];
    if (label) label.textContent = balancesHidden ? "Mostrar saldos" : "Ocultar saldos";
  }

  /* Vivacidad: la cámara avanza sola de 4.1 a 4.4 y termina en 5a */
  function autoAdvance(nextKey, ms, caption) {
    var box = document.createElement("div");
    box.id = "proto-auto";
    box.innerHTML =
      '<span class="proto-dot"></span><span>' +
      caption +
      '</span><span class="proto-track"><b class="proto-fill"></b></span>' +
      '<span style="opacity:.6">clic para avanzar</span>';
    document.body.appendChild(box);
    var fill = $(".proto-fill", box);
    later(function () {
      fill.style.transition = "width " + ms + "ms linear";
      fill.style.width = "100%";
    }, 40);
    var jump = function () {
      state.root.removeEventListener("click", jump);
      go(nextKey);
    };
    later(jump, ms);
    state.root.addEventListener("click", jump);
  }

  /* Algunas barras se exportan con box-sizing:content-box y ancho fijo:
     el relleno lateral las saca del marco y el diseño las recorta.
     Al pasarlas a border-box vuelven a caber exactamente. */
  function fixContentBox(frame) {
    var fw = frame.clientWidth;
    $$('[class*="box-sizing:content-box"]', frame).forEach(function (el) {
      var m = String(el.className).match(/w-\[(\d+(?:\.\d+)?)px\]/);
      if (!m || parseFloat(m[1]) < fw) return;
      var cs = getComputedStyle(el);
      if (cs.position === "absolute" || cs.position === "fixed") return;
      if (parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight) === 0) return;
      el.style.boxSizing = "border-box";
    });
  }

  /* ---------------------------------------------------------
     6 bis. Conversión a maquetado fluido (responsive de escritorio)
     ---------------------------------------------------------
     pen.dev exporta cada pantalla como un lienzo de 1440 px: el marco
     raíz lleva ancho fijo y las secciones "compuestas" (hero, CTA…)
     colocan sus piezas con posiciones absolutas.

     Aquí se convierte ese lienzo en una página fluida:

     1. El marco raíz pasa a `width:100%`, igual que las barras y los
        fondos que medían exactamente 1440 px.
     2. Las secciones de flujo (las que ya usan flexbox) estiran solas,
        porque el diseño las definió con `fill_container`. Solo se les
        limita el contenido con `padding: max(original, (100% - MAXW)/2)`,
        de modo que el fondo sigue ocupando toda la ventana.
     3. Las secciones compuestas se anclan: lo que está en la mitad
        izquierda conserva su `left`, lo que está en la derecha pasa a
        `right`. Así la columna de texto queda pegada a la izquierda, la
        composición gráfica a la derecha, y lo que crece es el centro.

     La conversión es neutra a 1440 px exactos, así que el modo «Diseño»
     puede seguir usando el mismo DOM y limitarse a escalarlo.
     --------------------------------------------------------- */

  var MAXW = 1920;

  /* La banca por internet es una aplicación de pantalla completa: la barra
     lateral va pegada al borde y el contenido ocupa todo el ancho, como en
     cualquier panel bancario. El tope de ancho solo tiene sentido en las
     páginas de contenido, donde una línea de texto de 2000 px no se lee. */
  var FULL_WIDTH = { panel: 1, "panel-error": 1 };

  function makeFluid(frame) {
    if (frame.dataset.protoFluid) return;
    var stageW = frame.offsetWidth || state.stageW;
    if (!stageW) return;

    /* --- 1. medir la composición ANTES de tocar nada --- */
    var plan = $$(":scope > *", frame).map(function (sec) {
      var cs = getComputedStyle(sec);
      return {
        el: sec,
        w: sec.offsetWidth,
        padL: parseFloat(cs.paddingLeft) || 0,
        padR: parseFloat(cs.paddingRight) || 0,
        kids: $$(":scope > *", sec).map(function (k) {
          return {
            el: k,
            abs: getComputedStyle(k).position === "absolute",
            left: k.offsetLeft,
            w: k.offsetWidth,
            plain: !k.firstElementChild
          };
        })
      };
    });

    /* --- 2. el lienzo deja de tener ancho fijo --- */
    frame.dataset.protoFluid = "1";
    frame.style.width = "100%";
    frame.style.maxWidth = "none";

    /* Pantallas de alto fijo (login): que ocupen al menos toda la ventana */
    var hm = String(frame.className).match(/h-\[(\d+(?:\.\d+)?)px\]/);
    if (hm && parseFloat(hm[1]) >= 900) {
      frame.style.height = "max(" + hm[1] + "px, 100vh)";
    }

    $$('[class*="w-[' + stageW + 'px]"]', frame).forEach(function (el) {
      el.style.boxSizing = "border-box";
      el.style.width = "100%";
    });

    /* --- 3. sección por sección --- */
    plan.forEach(function (s) {
      var composed = s.kids.filter(function (k) {
        return k.abs;
      });

      /* Sección de flujo: estira sola, solo limitamos el contenido */
      if (!composed.length) {
        if (FULL_WIDTH[state.key]) return;
        s.el.style.paddingLeft =
          "max(" + s.padL + "px, (100% - " + MAXW + "px) / 2)";
        s.el.style.paddingRight =
          "max(" + s.padR + "px, (100% - " + MAXW + "px) / 2)";
        return;
      }

      /* Paneles de ancho fijo (p. ej. el panel de marca del login):
         no estiran, se quedan exactamente como los diseñaron */
      if (s.w < stageW - 2) return;

      var wrap = document.createElement("div");
      wrap.className = "proto-canvas";
      wrap.style.maxWidth = MAXW + "px";
      s.el.insertBefore(wrap, s.el.firstChild);

      s.kids.forEach(function (k) {
        wrap.appendChild(k.el); /* conserva el orden y, con él, el apilado */
        if (!k.abs) return;

        var fullWidth = k.left <= 1 && k.w >= s.w - 2;
        if (fullWidth && k.plain) {
          /* Fondo sin contenido: que ocupe toda la ventana */
          k.el.dataset.protoBleed = "1";
          k.el.style.left = "50%";
          k.el.style.right = "auto";
          k.el.style.transform = "translateX(-50%)";
        } else if (fullWidth) {
          k.el.style.left = "0";
          k.el.style.right = "0";
          k.el.style.width = "auto";
        } else if (k.left + k.w / 2 > s.w / 2) {
          /* Está en la mitad derecha: se ancla al borde derecho */
          k.el.style.left = "auto";
          k.el.style.right = s.w - k.left - k.w + "px";
        }
      });
    });
  }

  /* ---------------------------------------------------------
     7. Interfaz del prototipo (barra, menú, avisos)
     --------------------------------------------------------- */

  function toast(msg) {
    var host = $("#proto-toasts");
    if (!host) {
      host = document.createElement("div");
      host.id = "proto-toasts";
      document.body.appendChild(host);
    }
    var t = document.createElement("div");
    t.className = "proto-toast";
    t.textContent = msg;
    host.appendChild(t);
    setTimeout(function () {
      t.remove();
    }, 2900);
  }

  function buildBar() {
    if ($("#proto-bar")) return;

    var bar = document.createElement("div");
    bar.id = "proto-bar";
    bar.innerHTML =
      '<button class="proto-btn" id="proto-back" title="Atrás">&#8592;</button>' +
      '<button class="proto-btn" id="proto-next" title="Siguiente paso">&#8594;</button>' +
      '<span class="proto-sep"></span>' +
      '<span class="proto-title" id="proto-name"></span>' +
      '<span class="proto-sep"></span>' +
      '<button class="proto-btn" id="proto-zoom" title="Maquetado fluido / diseño original (Z)">Web</button>' +
      '<button class="proto-btn" id="proto-hints" title="Resaltar zonas (H)">&#9678; Zonas</button>' +
      '<button class="proto-btn" id="proto-open" title="Pantallas (M)">&#9776; Pantallas</button>';
    document.body.appendChild(bar);

    var menu = document.createElement("div");
    menu.id = "proto-menu";
    var groups = {};
    Object.keys(SCREENS).forEach(function (key) {
      var s = SCREENS[key];
      (groups[s.g] = groups[s.g] || []).push(key);
    });
    var html = "";
    ["Público", "Onboarding", "Sesión", "Banca", "Extras"].forEach(function (g) {
      if (!groups[g]) return;
      html += '<div class="proto-group"><h4>' + g + '</h4><div class="proto-grid">';
      groups[g].forEach(function (key) {
        var s = SCREENS[key];
        var n = (s.t.match(/^[\d.]+[a-z]?/) || [""])[0] || "•";
        html +=
          '<a class="proto-item' +
          (key === state.key ? " proto-item--current" : "") +
          '" data-key="' +
          key +
          '" href="' +
          (key === "desarrollo" ? "en-desarrollo.html" : url(key)) +
          '"><i>' +
          n +
          "</i><span>" +
          s.t +
          "</span></a>";
      });
      html += "</div></div>";
    });
    html +=
      '<div class="proto-menu-foot">' +
      "<span><kbd>←</kbd><kbd>→</kbd> navegar</span>" +
      "<span><kbd>Z</kbd> ajustar / tamaño real</span>" +
      "<span><kbd>H</kbd> resaltar zonas</span>" +
      "<span><kbd>M</kbd> este menú</span>" +
      "<span><kbd>Esc</kbd> cerrar</span>" +
      "</div>";
    menu.innerHTML = html;
    document.body.appendChild(menu);

    $("#proto-back").addEventListener("click", function () {
      history.length > 1 ? history.back() : go("landing");
    });
    $("#proto-next").addEventListener("click", function () {
      var s = SCREENS[state.key];
      s && s.next ? go(s.next) : toast("Es la última pantalla del flujo.");
    });
    $("#proto-zoom").addEventListener("click", toggleFit);
    $("#proto-hints").addEventListener("click", toggleHints);
    $("#proto-open").addEventListener("click", toggleMenu);

    document.addEventListener("keydown", function (ev) {
      if (ev.target && (ev.target.isContentEditable || /input|textarea/i.test(ev.target.tagName)))
        return;
      var s = SCREENS[state.key] || {};
      if (ev.key === "z" || ev.key === "Z") toggleFit();
      else if (ev.key === "h" || ev.key === "H") toggleHints();
      else if (ev.key === "m" || ev.key === "M") toggleMenu();
      else if (ev.key === "Escape") closeMenu();
      else if (ev.key === "ArrowRight" && s.next) go(s.next);
      else if (ev.key === "ArrowLeft") history.back();
    });

    /* La barra se atenúa sola para no tapar el diseño */
    var dimTimer;
    function wake() {
      bar.classList.remove("proto-bar--dim");
      clearTimeout(dimTimer);
      dimTimer = setTimeout(function () {
        if (!menu.classList.contains("proto-open"))
          bar.classList.add("proto-bar--dim");
      }, 2800);
    }
    ["mousemove", "scroll", "keydown", "click"].forEach(function (e) {
      window.addEventListener(e, wake, { passive: true });
    });
    wake();

    document.addEventListener("click", function (ev) {
      if (!menu.classList.contains("proto-open")) return;
      if (menu.contains(ev.target) || $("#proto-open").contains(ev.target)) return;
      closeMenu();
    });
  }

  function toggleHints() {
    var on = document.body.classList.toggle("proto-hints");
    $("#proto-hints").classList.toggle("proto-btn--on", on);
  }
  function toggleMenu() {
    var m = $("#proto-menu");
    m.classList.toggle("proto-open");
    $("#proto-open").classList.toggle("proto-btn--on", m.classList.contains("proto-open"));
  }
  function closeMenu() {
    $("#proto-menu").classList.remove("proto-open");
    $("#proto-open").classList.remove("proto-btn--on");
  }

  function refreshBar() {
    var s = SCREENS[state.key] || { t: "Pantalla", g: "" };
    $("#proto-name").innerHTML = "<span>" + (s.g || "") + "</span><b>" + s.t + "</b>";
    $("#proto-next").disabled = !s.next;
    $$("#proto-menu .proto-item").forEach(function (a) {
      a.classList.toggle("proto-item--current", a.dataset.key === state.key);
    });
    document.title = "Ayni Bank · " + s.t;
  }

  /* ---------------------------------------------------------
     8. Escenario: escala y centra el lienzo de ancho fijo
     --------------------------------------------------------- */

  function buildViewport() {
    var body = document.body;
    var kids = [].slice.call(body.children).filter(function (el) {
      return el.nodeType === 1 && !/^(SCRIPT|STYLE|LINK)$/.test(el.tagName) && !el.id;
    });
    if (!kids.length) return false;

    var named = kids.filter(function (el) {
      return el.hasAttribute("data-pencil-name");
    });
    var host, frames;
    if (named.length) {
      host = named[0];
      frames = named;
    } else {
      host = kids[0];
      frames = $$(":scope > [data-pencil-name]", host);
      host.classList.add("proto-stage");
    }
    if (!frames.length) return false;

    var fitBox = document.createElement("div");
    fitBox.id = "proto-fit";
    var vp = document.createElement("div");
    vp.id = "proto-viewport";
    body.insertBefore(fitBox, host);
    fitBox.appendChild(vp);
    vp.appendChild(host);

    state.stage = named.length ? null : host;
    state.frames = frames;
    state.stageW =
      parseFloat((frames[0].className.match(/w-\[(\d+(?:\.\d+)?)px\]/) || [])[1]) ||
      frames[0].offsetWidth ||
      1440;
    return true;
  }

  /* Zoom del navegador al cargar la página: sirve de referencia para que el
     ajuste al ancho NO se recalcule cuando el usuario hace Ctrl + / Ctrl −.
     Al alejar, clientWidth crece y devicePixelRatio baja en la misma
     proporción, así que el producto se mantiene y la escala no cambia:
     el zoom vuelve a comportarse como en cualquier página web. */
  var baseDpr = window.devicePixelRatio || 1;

  function fit() {
    var vp = $("#proto-viewport");
    var box = $("#proto-fit");
    if (!vp || !box) return;

    /* clientWidth excluye la barra de desplazamiento: evita el corte lateral */
    var cw = document.documentElement.clientWidth || window.innerWidth;
    var web = state.mode === "web";
    /* En modo web la página fluye de verdad; solo se escala si la ventana es
       más angosta que el diseño, para que nada se rompa en pantallas chicas. */
    var fluid = web && cw >= state.stageW;

    if (fluid) {
      vp.style.width = "100%";
      vp.style.transform = "none";
      box.style.width = "100%";
      box.style.height = "auto";
    } else {
      /* En modo diseño se compensa el zoom del navegador (clientWidth sube y
         devicePixelRatio baja en la misma proporción), así Ctrl + / Ctrl −
         siguen funcionando en lugar de anularse contra el reescalado. */
      var avail = web ? cw : cw * ((window.devicePixelRatio || 1) / baseDpr);
      var s = Math.min(web ? 1 : 1.4, Math.max(0.25, avail / state.stageW));
      vp.style.width = state.stageW + "px";
      vp.style.transform = "scale(" + s + ")";
      box.style.width = state.stageW * s + "px";
      box.style.height =
        (vp.scrollHeight || (state.root ? state.root.scrollHeight : 0)) * s +
        "px";
    }

    /* Fondos que deben ocupar toda la ventana */
    var bleed = fluid ? cw : state.stageW;
    $$("[data-proto-bleed]", state.root || document).forEach(function (el) {
      el.style.width = bleed + "px";
    });

    var btn = $("#proto-zoom");
    if (btn) {
      btn.textContent = web ? "Web" : "Diseño";
      btn.classList.toggle("proto-btn--on", !web);
      btn.title = web
        ? "Maquetado fluido · pulsa para ver el diseño original de 1440 px (Z)"
        : "Diseño original de 1440 px · pulsa para volver al maquetado fluido (Z)";
    }
  }

  function toggleFit() {
    state.mode = state.mode === "web" ? "design" : "web";
    try {
      localStorage.setItem("ayni-proto-modo", state.mode);
    } catch (e) {}
    fit();
    toast(
      state.mode === "web"
        ? "Maquetado fluido: la página se adapta al ancho de la ventana."
        : "Diseño original: lienzo fijo de " + state.stageW + " px."
    );
  }

  /* ---------------------------------------------------------
     9. Montaje
     --------------------------------------------------------- */

  function mount(key) {
    clearTimers();

    var frame = null;
    state.frames.forEach(function (f) {
      var fk = FRAME_TO_KEY[f.dataset.pencilName];
      var on = key ? fk === key : f === state.frames[0];
      f.classList.toggle("proto-screen--on", on);
      f.classList.toggle("proto-screen--off", !on);
      if (on) frame = f;
    });
    if (!frame) {
      frame = state.frames[0];
      frame.classList.add("proto-screen--on");
      frame.classList.remove("proto-screen--off");
    }

    state.root = frame;
    state.key = FRAME_TO_KEY[frame.dataset.pencilName] || key || null;

    fixContentBox(frame);
    makeFluid(frame);
    (ROUTES[state.key] || []).forEach(applyRule);

    if (/^rostro-/.test(state.key)) {
      var nxt = SCREENS[state.key].next;
      autoAdvance(
        nxt,
        3600,
        state.key === "rostro-4" ? "Analizando la prueba de vida…" : "Detectando el gesto…"
      );
    }

    refreshBar();
    fit();
    window.scrollTo(0, 0);
  }

  function boot() {
    var custom = document.body.dataset.protoScreen;
    buildBar();

    if (custom) {
      /* index.html y en-desarrollo.html ya son responsive: no llevan escala */
      state.key = custom;
      $("#proto-zoom").style.display = "none";
      $("#proto-hints").style.display = "none";
      refreshBar();
      return;
    }
    if (!buildViewport()) return;

    var hash = decodeURIComponent((location.hash || "").replace("#", ""));
    mount(SCREENS[hash] ? hash : null);

    window.addEventListener("hashchange", function () {
      var h = decodeURIComponent((location.hash || "").replace("#", ""));
      document.body.classList.remove("proto-leaving");
      var box = $("#proto-fit");
      box.style.animation = "none";
      void box.offsetWidth;
      box.style.animation = "";
      mount(SCREENS[h] ? h : null);
    });
    window.addEventListener("resize", fit);
    window.addEventListener("load", fit);
    if (window.ResizeObserver) {
      new ResizeObserver(function () {
        fit();
      }).observe($("#proto-viewport"));
    }
    window.addEventListener("pageshow", function () {
      document.body.classList.remove("proto-leaving");
    });
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", boot);
  else boot();

  window.AyniProto = { go: go, toast: toast, screens: SCREENS };
})();
