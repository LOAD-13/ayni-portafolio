# Bitácora · Ayni Bank

Los entregables interactivos del Curso Integrador II: Software (UTP 2026-II), semana a semana.

**Publicada en:** https://load-13.github.io/ayni-portafolio/

Para añadir una semana:
1. Agrega su entrada a `CATALOGO` en `construir.py`.
2. Ejecuta `python construir.py`: copia el HTML desde la carpeta «Semana XX» del curso, le añade el enlace de vuelta y regenera la portada.
3. Si la semana trae documentos (Word, PDF, Excel), agrégalos a `DOCUMENTOS`. Un mismo `id` en otra semana es una
   versión nueva del mismo documento.

## Versiones

Cada pieza y cada documento tiene su historial en `versiones.json`. Cuando la fuente de algo ya publicado cambia, el
script archiva la versión anterior en `versiones/<id>/v<N>/` y publica la nueva en la ruta de siempre:

```bash
python construir.py --nota calidad-funcional-y-vv="Se añade la sección de usabilidad"
```

Las versiones archivadas no se borran ni se reescriben. La portada muestra las versiones de cada pieza y el registro de
cambios completo.

## Anonimización

Los patrones de lo que no debe publicarse (host e IP de producción) viven en `anonimizar.local.json`, que no se
versiona. Se aplican a los HTML y al XML interno de los .docx y .xlsx. Si un .docx necesitó anonimizarse, su PDF se
regenera con Word a partir del .docx ya limpio, porque el PDF original nombra lo que se ocultó.
