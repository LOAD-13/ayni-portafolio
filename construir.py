# -*- coding: utf-8 -*-
"""Construye la bitácora: copia los HTML interactivos y los documentos de cada semana, versiona y genera la portada.

    python construir.py
    python construir.py --nota calidad-funcional-y-vv="Se añade la sección de usabilidad"

Las fuentes viven en las carpetas «Semana XX» del curso (fuera de este repositorio). Este script las copia aquí,
anonimiza el host de producción en los informes que lo nombran y añade a cada página un enlace de vuelta.

VERSIONES. Cada pieza tiene un identificador y un historial en versiones.json. Si la fuente de una pieza ya publicada
cambia, la versión anterior se archiva en versiones/<id>/v<N>/ y la nueva ocupa la ruta de siempre, con la nota que se
pase en --nota (si no se pasa, queda «Actualización»). Las versiones antiguas nunca se borran ni se reescriben.
"""
import datetime as dt, hashlib, html, json, pathlib, re, shutil, subprocess, sys, zipfile

AQUI = pathlib.Path(__file__).parent
CURSO = AQUI.parent

# (semana, mes, tema, [(tipo, título, origen, destino, descripción, en vivo)])
CATALOGO = [
    ("02", "agosto", "Diseño UX/UI", [
        ("Prototipo", "Prototipo navegable de Ayni", "Semana 09/htmls", "semana-02/prototipo",
         "Las pantallas diseñadas en pen.dev convertidas en un recorrido clicable: landing, registro, captura del DNI, "
         "selfie, inicio de sesión, panel y guía de diseño.",
         "Navegar el flujo completo de alta como lo haría un cliente."),
    ]),
    ("05", "septiembre", "APF1 · Optimización del rendimiento web", [
        ("Evidencia", "Lighthouse antes de optimizar", "Semana 05/evidencias-wpo/lighthouse-ANTES-landing.html",
         "semana-05/lighthouse-antes.html", "Auditoría de rendimiento, accesibilidad y buenas prácticas de la landing "
         "antes de aplicar las estrategias WPO.", "Desplegar cada métrica y sus oportunidades de mejora."),
        ("Evidencia", "Lighthouse después de optimizar", "Semana 05/evidencias-wpo/lighthouse-DESPUES-landing.html",
         "semana-05/lighthouse-despues.html", "La misma auditoría tras optimizar imágenes, fuentes y carga diferida: "
         "la mitad de la comparación antes/después del APF1.", "Comparar métrica por métrica con el informe anterior."),
    ]),
    ("06", "septiembre", "Diseño físico de base de datos", [
        ("Entregable", "Diccionario de datos", "Semana 06/entregables/diccionario-bd.html", "semana-06/diccionario-bd.html",
         "21 tablas y 144 columnas de los cuatro schemas: tipo, nulabilidad, clave y por qué se eligió cada tipo de dato.",
         "Buscar columnas, cambiar entre tres temas y abrir la ficha de cada entidad en el ERD."),
        ("Entregable", "Diagrama entidad-relación", "Semana 06/entregables/diagrama/erd.html", "semana-06/erd.html",
         "El modelo físico por schema, con las relaciones internas y la proyección local entre servicios.",
         "Clic en una entidad para ver sus columnas y relaciones."),
    ]),
    ("08", "septiembre", "Diseño de controles de seguridad", [
        ("Entregable", "Controles de seguridad", "Semana 08/entregables/controles-de-seguridad.html",
         "semana-08/controles-de-seguridad.html",
         "Arquitectura de autenticación, matriz RBAC de 5 roles y 12 permisos, mitigación OWASP Top 10, CORS, "
         "trazabilidad y límite de tasa.", "Pulsar un rol filtra la matriz y sus endpoints; pulsar un campo del JWT lo explica."),
    ]),
    ("09", "octubre", "APF2 · Despliegue, datos y seguridad en producción", [
        ("APF", "Informe de pruebas de seguridad", "Semana 09/APF02/evidencias/informe-seguridad.html",
         "semana-09/informe-seguridad.html", "OWASP ZAP, Nikto y escaneo de cabeceras contra producción, antes y después "
         "de la remediación.", "Comparar hallazgos por severidad antes y después."),
        ("APF", "Controles de seguridad · versión 2", "Semana 09/APF02/evidencias/controles-de-seguridad-apf2.html",
         "semana-09/controles-de-seguridad.html", "La actualización del taller de la semana 8 con lo ya implementado: "
         "estado de madurez control por control.", "Semáforo de madurez y matriz RBAC filtrable."),
        ("APF", "Diccionario de datos · versión 2", "Semana 09/APF02/evidencias/diccionario-bd-apf2.html",
         "semana-09/diccionario-bd.html", "El catálogo real de la base de datos en la nube, con las tablas que añadieron "
         "transferencias, auditoría y outbox.", "Buscar columnas y recorrer el ERD actualizado."),
        ("APF", "Informe de pruebas y cobertura", "Semana 09/APF02/evidencias/informe-pruebas.html",
         "semana-09/informe-pruebas.html", "Pirámide de pruebas y cobertura por servicio: JUnit, vitest, pytest y Playwright.",
         "Gráficos de cobertura por servicio."),
        ("Lámina", "Diagramas de arquitectura", "Semana 09/APF02/evidencias/diagramas.html", "semana-09/diagramas.html",
         "Arquitectura de datos y replicación propuesta, patrón Repository y despliegue en AWS.", "Diagramas por capas."),
        ("Lámina", "Diagrama de secuencia", "Semana 09/APF02/evidencias/secuencia.html", "semana-09/secuencia.html",
         "Inicio de sesión con segundo factor (HU-04) atravesando puertos y adaptadores.", "Seguir el mensaje paso a paso."),
        ("Lámina", "Cronograma real", "Semana 09/APF02/evidencias/gantt-apf2.html", "semana-09/cronograma.html",
         "Diagrama de Gantt: línea base contra ejecución real hasta el APF2.", "Comparar lo planificado con lo ejecutado."),
    ]),
    ("10", "octubre", "Calidad funcional (ISO/IEC 25010) y V&V", [
        ("Entregable", "Calidad funcional y V&V", "Semana 10/entregables/calidad-funcional-y-vv.html",
         "semana-10/calidad-funcional-y-vv.html", "Matriz de trazabilidad de 5 HU, auditoría de precisión numérica, métricas "
         "ISO/IEC 25023, modelo en V y guion UAT.",
         "Trazabilidad inversa, 0.1 + 0.2 en vivo, simulación del fraude del redondeo y modelo en V pulsable."),
    ]),
    ("11", "octubre", "Interoperabilidad y coexistencia (ISO/IEC 25010)", [
        ("Entregable", "Interoperabilidad y coexistencia", "Semana 11/entregables/interoperabilidad-y-coexistencia.html",
         "semana-11/interoperabilidad-y-coexistencia.html", "Contratos OpenAPI vivos, 400 uniforme, timeouts, las cuatro capas de la "
         "interoperabilidad, techos de memoria medidos con docker stats y apagado ordenado.",
         "Simular el vecino ruidoso con y sin techos, y un docker stop en plena carga."),
    ]),
]

# Piezas HTML que son versiones sucesivas de un mismo entregable: comparten identificador y forman un historial.
SERIE = {
    "semana-06/diccionario-bd.html": "diccionario-de-datos", "semana-09/diccionario-bd.html": "diccionario-de-datos",
    "semana-08/controles-de-seguridad.html": "controles-de-seguridad",
    "semana-09/controles-de-seguridad.html": "controles-de-seguridad",
}

# Documentos publicados: solo los informes de los avances (APF). El resto del trabajo semanal se presenta en los HTML.
# (semana, id, título, [fuentes]). Un mismo id en semanas distintas es una versión nueva del mismo documento.
DOCUMENTOS = [
    ("05", "apf1-informe", "Informe APF1 · Avance de Proyecto Final 1",
     ["Semana 05/APF 1/APF1 - Avance de Proyecto Final 1 - Ayni Bank.docx",
      "Semana 05/APF 1/APF1 - Avance de Proyecto Final 1 - Ayni Bank.pdf"]),
    ("09", "apf2-informe", "Informe APF2 · Avance de Proyecto Final 2", ["Semana 09/APF02/Informe APF2 - Ayni Bank.docx",
                                                                        "Semana 09/APF02/Informe APF2 - Ayni Bank.pdf"]),
]

# Qué cambió en las versiones que ya existían antes de que hubiera versionado (comparando los documentos).
NOTAS_INICIALES = {
    ("acta-de-constitucion", "02"): "Roles Scrum: el docente pasa a Product Owner y Joaquín a Scrum Master. El equipo crece de "
                                    "4 a 6 integrantes. Se añaden OBJ-07 (normativa financiera), la volumetría comprometida "
                                    "y el costo valorizado del equipo.",
    ("acta-de-constitucion", "05"): "OBJ-02 con su línea base (de uno a tres días hábiles en agencia) e indicadores medibles.",
    ("matriz-de-riesgos", "05"): "Mapa de calor probabilidad × impacto, 16 riesgos (3 nuevos: curva de aprendizaje, "
                                 "proveedor de correo y dependencias vulnerables), contingencia con responsable y "
                                 "seguimiento integrado en las ceremonias.",
    ("controles-de-seguridad", "09"): "Actualización con lo ya implementado: estado de madurez control por control.",
    ("diccionario-de-datos", "09"): "El catálogo real de la base en la nube, con las tablas de transferencias, auditoría "
                                    "y outbox.",
}

# Datos que no deben quedar en una página pública
# Patrones de lo que no debe quedar en una página pública (host e IP de producción). Viven en un fichero local que
# no se versiona, para que el propio script no publique lo que oculta.
_LOCAL = AQUI / "anonimizar.local.json"
ANONIMIZAR = json.loads(_LOCAL.read_text(encoding="utf-8")) if _LOCAL.exists() else []
# En los documentos, además: la IP de ejemplo del diccionario pasa al rango reservado para documentación (RFC 5737).
ANONIMIZAR_DOCS = ANONIMIZAR + [[r"190\.237\.14\.88", "203.0.113.42"]]

LAMINAS = {"semana-09/diagramas.html", "semana-09/secuencia.html", "semana-09/cronograma.html"}

# Las láminas son lienzos de ancho fijo pensados para capturas: se presentan centradas sobre el fondo de la marca,
# en una placa blanca que se escala al ancho de la pantalla.
LAMINA_CSS = """<style id="ayni-lamina">
html{background:#031321!important}
body{background:transparent!important;margin:0!important;padding:96px 16px 72px!important;display:flex;flex-direction:column;
 align-items:center;gap:36px;min-height:100vh}
body>section,body>div{background:#fff;border-radius:3px;box-shadow:0 1px 0 rgba(214,183,109,.5),0 24px 70px rgba(0,0,0,.5);
 transform-origin:top center;flex:none}
#ayni-barra{position:fixed;inset:0 0 auto;height:60px;display:flex;align-items:center;gap:12px;padding:0 20px;z-index:2147483646;
 background:rgba(3,19,33,.92);border-bottom:1px solid rgba(232,238,244,.09);font:500 14px/1 ui-monospace,Consolas,monospace;color:#e8eef4}
#ayni-barra img{width:26px;height:26px}
#ayni-barra span{color:#6f8397}#ayni-barra b{color:#d6b76d;font-weight:500}
</style>"""
LAMINA_JS = """<script>(function(){var b=document.createElement("div");b.id="ayni-barra";
b.innerHTML='<img src="../marca/icono-64.png" alt=""> ayni bank <span>/ semana 09 /</span> <b>'+(document.title||(document.querySelector("h1,h2")||{}).textContent||"").replace(/^Ayni Bank · /,"").split(" · ")[0]+'</b>';
document.body.prepend(b);var ps=[].slice.call(document.body.children).filter(function(e){return /^(SECTION|DIV)$/.test(e.tagName)&&e.id!=="ayni-barra"});
function ajustar(){ps.forEach(function(e){e.style.zoom=1;var w=e.offsetWidth,m=document.documentElement.clientWidth-32;e.style.zoom=w>m?(m/w).toFixed(3):1})}
ajustar();addEventListener("resize",ajustar)})();</script>"""

VOLVER = ('<a href="{raiz}" style="position:fixed;left:16px;bottom:16px;z-index:2147483647;font:500 13px/1 ui-monospace,Consolas,monospace;'
          'background:#031321;color:#d6b76d;padding:10px 14px;border-radius:999px;text-decoration:none;'
          'box-shadow:0 6px 20px rgba(0,0,0,.35);border:1px solid #c59e41">← Bitácora Ayni</a>')


def raiz_de(ruta):
    return "../" * ruta.count("/") or "./"


def reubicar(texto, ruta):
    """Ajusta los enlaces relativos que inyecta este script cuando una página se archiva a otra profundidad."""
    raiz = raiz_de(ruta)
    texto = re.sub(r'<a href="[^"]*"( style="position:fixed;left:16px;bottom:16px)', rf'<a href="{raiz}"\1', texto)
    return texto.replace('src="../marca/icono-64.png"', f'src="{raiz}marca/icono-64.png"')


def copiar(origen, destino):
    o, d = CURSO / origen, AQUI / destino
    if o.is_dir():
        if d.exists():
            shutil.rmtree(d)
        shutil.copytree(o, d, ignore=shutil.ignore_patterns("_originales", "LEEME.md", "*.rar", "develop icon.png"))
        for extra in ("develop icon.png",):
            if (o / extra).exists():
                shutil.copy2(o / extra, d / extra)
        objetivo = d / "index.html"
        raiz = raiz_de(destino + "/index.html")
    else:
        d.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(o, d)
        objetivo = d
        raiz = raiz_de(destino)
    texto = objetivo.read_text(encoding="utf-8", errors="strict")
    for patron, cambio in ANONIMIZAR:
        texto = re.sub(patron, cambio, texto)
    if destino in LAMINAS and 'id="ayni-lamina"' not in texto:
        texto = texto.replace("</head>", LAMINA_CSS + "</head>", 1)
        texto = texto.replace("</body>", LAMINA_JS + "</body>", 1)
    if "Bitácora Ayni</a>" not in texto:
        texto = texto.replace("</body>", VOLVER.format(raiz=raiz) + "</body>", 1) if "</body>" in texto \
            else texto + VOLVER.format(raiz=raiz)
    objetivo.write_text(texto, encoding="utf-8")
    peso = sum(f.stat().st_size for f in d.rglob("*") if f.is_file()) if d.is_dir() else d.stat().st_size
    return destino + ("/index.html" if o.is_dir() else ""), peso


def legible(peso):
    return f"{peso / 1048576:.1f} MB" if peso > 1048576 else f"{max(1, peso // 1024)} KB"


def huella(rutas):
    h = hashlib.sha256()
    for r in rutas:
        r = CURSO / r
        for f in sorted(r.rglob("*")) if r.is_dir() else [r]:
            if f.is_file() and "_originales" not in f.parts:
                h.update(f.name.encode())
                h.update(f.read_bytes())
    return h.hexdigest()[:16]


def fecha_de(rutas):
    """Fecha de una versión que ya existía antes del versionado: la de su fuente, que es cuando se entregó."""
    return min(dt.date.fromtimestamp((CURSO / r).stat().st_mtime) for r in rutas).isoformat()


def anonimizar_office(origen, destino):
    """Copia un .docx/.xlsx aplicando los patrones de anonimización a su XML. Devuelve cuántos reemplazos hizo."""
    cambios = 0
    with zipfile.ZipFile(origen) as zi, zipfile.ZipFile(destino, "w", zipfile.ZIP_DEFLATED) as zo:
        for item in zi.infolist():
            datos = zi.read(item.filename)
            if item.filename.endswith((".xml", ".rels")):
                texto = datos.decode("utf-8")
                for patron, cambio in ANONIMIZAR_DOCS:
                    texto, n = re.subn(patron, cambio, texto)
                    cambios += n
                datos = texto.encode("utf-8")
            zo.writestr(item, datos)
    return cambios


def pdf_con_word(docx, pdf):
    """Exporta un .docx a PDF con Word: el PDF original nombra lo que el .docx publicado ya oculta."""
    ps = (f"$w=New-Object -ComObject Word.Application;$w.Visible=$false;"
          f"$d=$w.Documents.Open('{docx}',$false,$true);$d.SaveAs([ref]'{pdf}',[ref]17);$d.Close($false);$w.Quit()")
    subprocess.run(["powershell", "-NoProfile", "-Command", ps], check=True)


def publicar_documento(id_, fuentes, carpeta):
    """Copia las fuentes anonimizadas a <carpeta>/ y devuelve [(formato, ruta, peso)]."""
    destino = AQUI / carpeta
    destino.mkdir(parents=True, exist_ok=True)
    archivos, docx_anon = [], None
    for f in fuentes:
        o = CURSO / f
        ext = o.suffix.lower()
        d = destino / f"{id_}{ext}"
        if ext in (".docx", ".xlsx"):
            if anonimizar_office(o, d) and ext == ".docx":
                docx_anon = d
        elif ext == ".pdf" and docx_anon:
            # Word deja una marca de tiempo en el PDF: regenerarlo en cada construcción cambiaría el archivo sin
            # cambiar nada. Solo se regenera si la fuente es más reciente que el PDF publicado.
            if not d.exists() or d.stat().st_mtime < o.stat().st_mtime:
                pdf_con_word(str(docx_anon.resolve()), str(d.resolve()))
        else:
            shutil.copy2(o, d)
        archivos.append((ext[1:].upper(), d.relative_to(AQUI).as_posix(), d.stat().st_size))
    return archivos


def archivar(registro, id_):
    """Copia los archivos publicados de una versión a versiones/<id>/v<N>/ y devuelve sus rutas nuevas."""
    base = f"versiones/{id_}/v{registro['v']}"
    nuevas = {}
    for fmt, ruta in registro["archivos"].items():
        o = AQUI / ruta
        if ruta.endswith("/index.html"):
            o, ruta = o.parent, ruta[: -len("/index.html")]
        destino = f"{base}/{pathlib.PurePosixPath(ruta).name}"
        d = AQUI / destino
        d.parent.mkdir(parents=True, exist_ok=True)
        if o.is_dir():
            shutil.copytree(o, d, dirs_exist_ok=True)
            pagina = d / "index.html"
            pagina.write_text(reubicar(pagina.read_text(encoding="utf-8"), destino + "/index.html"), encoding="utf-8")
            nuevas[fmt] = destino + "/index.html"
        else:
            shutil.copy2(o, d)
            if d.suffix == ".html":
                d.write_text(reubicar(d.read_text(encoding="utf-8"), destino), encoding="utf-8")
            nuevas[fmt] = destino
    return nuevas


NOTAS = {}
if "--nota" in sys.argv:
    for arg in sys.argv[sys.argv.index("--nota") + 1:]:
        if "=" in arg:
            k, v = arg.split("=", 1)
            NOTAS[k] = v


def versionar(manifiesto, id_, clave, fuentes, sem, publicar, publicado=None):
    """Publica una pieza y mantiene su historial. `publicar()` escribe la versión vigente y devuelve {formato: ruta}."""
    historial = manifiesto.setdefault(id_, [])
    h = huella(fuentes)
    vigente = next((r for r in reversed(historial) if r["clave"] == clave), None)
    if vigente and vigente["huella"] != h:
        vigente["archivos"] = archivar(vigente, id_)        # la versión anterior queda congelada donde se archivó
        vigente, nota, fecha = None, NOTAS.get(id_, "Actualización"), dt.date.today().isoformat()
    else:
        nota = NOTAS_INICIALES.get((id_, sem), "Primera versión publicada." if not historial else "Nueva versión.")
        fecha = fecha_de(fuentes)
    archivos = publicar()
    if vigente:
        vigente["archivos"] = archivos
    else:
        historial.append({"v": len(historial) + 1, "clave": clave, "semana": sem, "fecha": fecha, "nota": nota,
                          "huella": h, "archivos": archivos})


def main():
    f_man = AQUI / "versiones.json"
    manifiesto = json.loads(f_man.read_text(encoding="utf-8")) if f_man.exists() else {}
    semanas, titulos = [], {}
    for sem, mes, tema, items in CATALOGO:
        fichas = []
        for tipo, titulo, origen, destino, desc, vivo in items:
            id_ = SERIE.get(destino, re.sub(r"\.html$", "", destino.split("/", 1)[1]))
            titulos.setdefault(id_, re.sub(r" · versión \d+$", "", titulo))
            versionar(manifiesto, id_, destino, [origen], sem,
                      lambda o=origen, d=destino: {"HTML": copiar(o, d)[0]}, destino)
            fichas.append({"tipo": tipo, "titulo": titulo, "id": id_, "clave": destino, "desc": desc, "vivo": vivo})
        docs = []
        for dsem, id_, titulo, fuentes in DOCUMENTOS:
            if dsem != sem:
                continue
            titulos.setdefault(id_, titulo)
            carpeta = f"documentos/semana-{dsem}"
            versionar(manifiesto, id_, f"{carpeta}/{id_}", fuentes, dsem,
                      lambda i=id_, f=fuentes, c=carpeta: {fmt: ruta for fmt, ruta, _ in publicar_documento(i, f, c)})
            docs.append({"titulo": titulo, "id": id_, "clave": f"{carpeta}/{id_}"})
        semanas.append({"semana": sem, "mes": mes, "tema": tema, "fichas": fichas, "documentos": docs})
    f_man.write_text(json.dumps(manifiesto, ensure_ascii=False, indent=1), encoding="utf-8")

    def peso(ruta):
        r = AQUI / ruta
        r = r.parent if ruta.endswith("/index.html") and (r.parent / "index.html").exists() and r.parent.name != "" else r
        total = sum(f.stat().st_size for f in r.rglob("*") if f.is_file()) if r.is_dir() else r.stat().st_size
        return legible(total)

    def historial(id_):
        return [{"v": r["v"], "semana": r["semana"], "fecha": r["fecha"], "nota": r["nota"], "clave": r["clave"],
                 "archivos": [{"fmt": f, "ruta": ru, "peso": peso(ru)} for f, ru in r["archivos"].items()]}
                for r in manifiesto[id_]]
    for s in semanas:
        for x in s["fichas"] + s["documentos"]:
            x["versiones"] = historial(x["id"])
    registro = sorted(({"fecha": r["fecha"], "titulo": titulos.get(i, i), "v": r["v"], "semana": r["semana"],
                        "nota": r["nota"], "ruta": next(iter(r["archivos"].values())),
                        "fmt": " · ".join(r["archivos"])}
                       for i, rs in manifiesto.items() for r in rs), key=lambda r: (r["fecha"], r["v"]), reverse=True)
    plantilla = (AQUI / "plantilla.html").read_text(encoding="utf-8")
    datos = json.dumps({"semanas": semanas, "registro": registro}, ensure_ascii=False).replace("</", "<\\/")
    (AQUI / "index.html").write_text(plantilla.replace("/*__SEMANAS__*/[]", datos), encoding="utf-8")
    total = sum(len(s["fichas"]) for s in semanas)
    ndocs = sum(len(s["documentos"]) for s in semanas)
    print(f"Bitácora construida: {total} piezas, {ndocs} documentos y {len(registro)} versiones en {len(semanas)} semanas")


if __name__ == "__main__":
    main()
