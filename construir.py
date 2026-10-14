# -*- coding: utf-8 -*-
"""Construye la bitácora: copia los HTML interactivos de cada semana y genera la portada.

    python construir.py

Las fuentes viven en las carpetas «Semana XX» del curso (fuera de este repositorio). Este script las copia aquí,
anonimiza el host de producción en los informes que lo nombran y añade a cada página un enlace de vuelta.
"""
import html, json, pathlib, re, shutil

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
]

# Datos que no deben quedar en una página pública
# Patrones de lo que no debe quedar en una página pública (host e IP de producción). Viven en un fichero local que
# no se versiona, para que el propio script no publique lo que oculta.
_LOCAL = AQUI / "anonimizar.local.json"
ANONIMIZAR = json.loads(_LOCAL.read_text(encoding="utf-8")) if _LOCAL.exists() else []

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
        raiz = "../../"
    else:
        d.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(o, d)
        objetivo = d
        raiz = "../"
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


def main():
    semanas = []
    for sem, mes, tema, items in CATALOGO:
        fichas = []
        for tipo, titulo, origen, destino, desc, vivo in items:
            ruta, peso = copiar(origen, destino)
            fichas.append({"tipo": tipo, "titulo": titulo, "ruta": ruta, "desc": desc, "vivo": vivo,
                           "peso": f"{peso / 1048576:.1f} MB" if peso > 1048576 else f"{peso // 1024} KB"})
        semanas.append({"semana": sem, "mes": mes, "tema": tema, "fichas": fichas})
    plantilla = (AQUI / "plantilla.html").read_text(encoding="utf-8")
    datos = json.dumps(semanas, ensure_ascii=False).replace("</", "<\\/")
    (AQUI / "index.html").write_text(plantilla.replace("/*__SEMANAS__*/[]", datos), encoding="utf-8")
    total = sum(len(s["fichas"]) for s in semanas)
    print(f"Bitácora construida: {total} piezas en {len(semanas)} semanas")


if __name__ == "__main__":
    main()
