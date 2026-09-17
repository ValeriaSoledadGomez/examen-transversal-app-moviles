# CLAUDE.md — AvistAves

@AGENTS.md
@BRIEF.md

Los dos documentos importados arriba son vinculantes. `BRIEF.md` define qué se construye y en qué
orden; `AGENTS.md` define cómo se escribe el código. Ante cualquier duda, se consultan antes de
improvisar.

## Idioma

Todo en español: código del dominio, comentarios, textos de la interfaz, mensajes de commit y
respuestas en esta conversación. Sin emojis en ninguna parte.

## Trabajo por fases

Se trabaja siguiendo el plan por fases de la sección 13 de `BRIEF.md`, una fase a la vez y en el
orden establecido. No se adelanta trabajo de una fase posterior mientras la actual esté abierta. Al
cerrar una fase se informa qué quedó hecho y qué criterios de aceptación de la sección 3 de
`BRIEF.md` quedaron verificados.

## Verificación obligatoria

Ningún cambio se da por hecho sin haber ejecutado la aplicación en el emulador de Android y haber
visto el comportamiento funcionando. Que compile no es que funcione. La definición completa de
terminado está en la sección 9 de `AGENTS.md` y se aplica a cada tarea.

Si el emulador no está disponible o el cambio no pudo verificarse, se dice de forma explícita y la
tarea queda abierta.

## Límites

1. **No hacer `git commit` ni `git push` sin que Otton lo pida de forma explícita.** Tampoco crear
   ramas, etiquetas ni repositorios remotos por iniciativa propia.
2. **No agregar ninguna dependencia que no esté en la sección 1 de `AGENTS.md`** sin proponerlo
   antes y esperar respuesta. Si la propuesta se acepta, se agrega también a esa tabla.
3. **No dar por terminada una tarea cuyo resultado no se haya visto funcionando** en el emulador.
4. No modificar `BRIEF.md`, `AGENTS.md` ni este archivo por iniciativa propia. Si una decisión del
   plan resulta equivocada durante la implementación, se plantea el problema y se espera la
   decisión.
5. No inventar versiones de paquetes ni firmas de API. Se verifican con la documentación oficial y,
   si no se pueden verificar, se dice en lugar de suponerlas.
