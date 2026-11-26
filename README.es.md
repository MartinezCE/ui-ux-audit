# UI/UX Audit Ecosystem

**Un flujo de Claude Code en cinco capas para auditar, dar dirección de arte, especificar, rediseñar y validar la UI/UX de aplicaciones web que ya existen.**

[Read in English](README.md) · Licencia: [CC BY-NC 4.0](LICENSE) (uso libre sin fines comerciales)

```
┌──────────────────────────────────────────────────┐
│ 1. UI/UX Audit                                   │
│    Orquestación y Quality Gates                  │
├──────────────────────────────────────────────────┤
│ 2. Frontend Design                               │
│    Art direction                                 │
├──────────────────────────────────────────────────┤
│ 3. Playwright MCP                                │
│    Browser inspection                            │
├──────────────────────────────────────────────────┤
│ 4. SDD / OpenSpec                                │
│    Specifications · Tasks · Acceptance Criteria  │
├──────────────────────────────────────────────────┤
│ 5. Frontend Implementation                       │
│    Approved changes · Testing · Regression       │
└──────────────────────────────────────────────────┘
```

| Capa | Qué hace | Con qué | ¿Obligatoria? |
|---|---|---|---|
| **1. UI/UX Audit** | Orquestación y quality gates: flujo, verificación de dependencias, aprobaciones, informes, trazabilidad | la skill `ui-ux-audit` (este repo) | Sí |
| **2. Frontend Design** | Dirección de arte: identidad visual, tipografía, color, layout, estética de componentes, design system | el plugin `frontend-design` de Anthropic | Sí |
| **3. Playwright MCP** | Inspección en el navegador: rutas reales, anchos, interacciones, capturas, validación antes/después | `@playwright/mcp` de Microsoft | Sí |
| **4. SDD / OpenSpec** | Especificaciones, tareas y criterios de aceptación, solo a partir de decisiones aprobadas | el framework de SDD de tu proyecto, o las plantillas incluidas | Solo para especificar e implementar |
| **5. Frontend Implementation** | Cambios aprobados, tests y control de regresiones, solo con tu aprobación explícita | Claude Code en modo implementación | Solo con tu aprobación |

El punto de entrada es la skill `ui-ux-audit`. Lee el código fuente, recorre la app en ejecución con Playwright MCP, consulta a frontend-design para la dirección de arte, puntúa diez dimensiones de calidad, propone tres direcciones de diseño bien distintas y convierte la que elijas en un design system y en tareas listas para SDD. No modifica tu código salvo que lo apruebes de forma explícita, y valida el resultado con capturas de antes y después.

## Arquitectura
Cómo trabajan juntas las cinco capas. `ui-ux-audit` es el orquestador: nunca hace el trabajo de un especialista y le pasa a cada capa un paquete estructurado y trazable.

```
            ┌──────────── 1 UI/UX Audit (orquestador) ─────────────┐
  plan de   ▼   Contrato A                         brief  ▼   Contrato B
  recorrido 3 Playwright MCP ───▶ 1 ◀────────── 2 Frontend Design
                                  │ Contrato C (solo decisiones aprobadas)
                                  ▼
                        4 SDD / OpenSpec (o las plantillas propias)
                                  │ Contrato D
                                  ▼
                        5 Implementación frontend (Modo C)
                                  │ Contrato E
                                  ▼
                        3 Playwright MCP (validación) ──▶ 1 (informe de validación)
```

Reglas que sigue el orquestador:
- Cada ejecución empieza verificando los especialistas (gate G1) y muestra su estado: faltante, detectado, exitoso o con error.
- Detectar una herramienta no es invocarla, e invocarla no significa que haya funcionado. Un informe solo dice que se usó un especialista si el registro tiene una llamada exitosa, y un gate solo figura como aprobado si hay evidencia.
- Si falta un especialista, las fases que dependen de él figuran como bloqueadas. La skill no completa ese hueco con razonamiento genérico ni instala nada sin preguntar. OpenSpec nunca lo instala.

### Trazabilidad
Cada hallazgo relevante se puede seguir de punta a punta con identificadores estables:

`AUD-001` jerarquía de botones inconsistente → `DES-001` unificar botones primarios y secundarios → `SPEC-001` tokens y variantes del botón → `TASK-001` actualizar el componente Button compartido → `VAL-001` consistencia visual verificada en las rutas afectadas.

Los hallazgos tienen prioridad (Crítica, Alta, Media, Baja) y se clasifican como `usability` (problema de uso) o `preference` (gusto visual). Una preferencia nunca es Crítica ni Alta, y no toda observación cosmética tiene que terminar en una tarea. La matriz queda en `.ui-audit/TRACEABILITY.md`.

Los cinco contratos (A a E), las reglas de los identificadores y los gates están en [references/integration-contracts.md](references/integration-contracts.md).

## Contenido
1. [Qué hace](#qué-hace)
2. [Requisitos](#requisitos)
3. [Instalación](#instalación)
4. [Configurar frontend-design](#configurar-frontend-design)
5. [Configurar Playwright MCP](#configurar-playwright-mcp)
6. [Primeros pasos](#primeros-pasos)
7. [Uso](#uso)
8. [Flujo y puntos de aprobación](#flujo-y-puntos-de-aprobación)
9. [Modos de trabajo](#modos-de-trabajo)
10. [Qué genera](#qué-genera)
11. [Integración con SDD](#integración-con-sdd)
12. [Scripts](#scripts)
13. [Seguridad](#seguridad)
14. [Limitaciones](#limitaciones)
15. [Estructura del repo](#estructura-del-repo)
16. [Actualizar y desinstalar](#actualizar-y-desinstalar)
17. [Contribuir](#contribuir)
18. [Licencia](#licencia)

---

## Qué hace
| Capacidad | Detalle |
|---|---|
| Relevamiento del proyecto | Framework, ruteo, estilos, librería de componentes, tokens, temas, breakpoints, íconos, patrones duplicados o inconsistentes y una lista de lo que no se toca |
| Inspección visual en vivo | Pantallas reales a 1440, 1280, 768 y 390 px, además de hover, foco, menús, modales y estados vacíos, de carga y de error |
| Auditoría visual y de UX | Jerarquía, tipografía, color, layout, componentes, interacción y heurísticas de usabilidad. Cada hallazgo dice dónde está, con qué evidencia, por qué importa y cómo se arregla |
| Auditoría de accesibilidad | Chequeos de WCAG 2.2 AA que separan los incumplimientos verificados de los posibles problemas. Nunca afirma cumplimiento a partir de capturas |
| Puntajes | Diez dimensiones de 0 a 10, cada una con su razonamiento, la evidencia, los problemas principales y las mejoras, e indicando si se apoya más en mediciones o en criterio |
| Dirección de arte | Tres direcciones: refinamiento conservador, modernización y rebranding completo. Cada una trae paleta en HEX con contraste verificado, tipografía, componentes, navegación, layout y ejemplos sobre pantallas reales |
| Design system | Tokens semánticos y guías de componentes en el formato que ya usa tu proyecto |
| Especificación de implementación | Tareas chicas con criterios de aceptación visuales, responsive y de accesibilidad, riesgos de regresión y pasos de validación |
| Implementación | Solo con aprobación. Cambia la presentación; la lógica, las APIs, las rutas, los permisos y las validaciones quedan igual |
| Validación | Capturas de antes y después en los mismos anchos, revisión de la consola y corrida de tus tests |

## Requisitos
| Dependencia | ¿Obligatoria? | Para qué | Cómo conseguirla |
|---|---|---|---|
| [Claude Code](https://code.claude.com/docs) | sí | Ejecuta la skill | Ver la documentación oficial |
| Node.js 18+ | sí | Playwright MCP con `npx`, los scripts y el guard de ediciones | [nodejs.org](https://nodejs.org) |
| Git | para instalar desde este repo | Clonar y actualizar | [git-scm.com](https://git-scm.com) |
| Playwright MCP (`@playwright/mcp`, de Microsoft) | **sí** | Navegar la app, cambiar el tamaño de la ventana, sacar capturas, leer el árbol de accesibilidad y la consola, validar antes/después | [Ver abajo](#configurar-playwright-mcp) |
| Plugin `frontend-design` (Anthropic) | **sí** | Dirección de arte, identidad visual, tipografía, color, estética del design system | [Ver abajo](#configurar-frontend-design) |
| axe-core en tu proyecto | opcional | Resultados automáticos de accesibilidad, si ya lo tenés | La skill nunca lo instala sin preguntar |

Sin Playwright MCP la skill solo puede hacer el relevamiento: la auditoría en el navegador, las direcciones y la validación quedan bloqueadas. Sin frontend-design puede auditar, pero las fases de dirección de arte quedan bloqueadas. En los dos casos te dice qué falta y con qué comando se instala.

## Instalación
Claude Code busca skills en `~/.claude/skills/<nombre>/SKILL.md` (personales, para todos tus proyectos) y en `<repo>/.claude/skills/<nombre>/SKILL.md` (de un proyecto, compartidas por git). La raíz de este repo ya es la carpeta de la skill, así que alcanza con clonarlo en el lugar correcto.

### Instalación personal (recomendada)
macOS / Linux:
```bash
git clone https://github.com/MartinezCE/ui-ux-audit.git ~/.claude/skills/ui-ux-audit
```

Windows (PowerShell):
```powershell
git clone https://github.com/MartinezCE/ui-ux-audit.git "$env:USERPROFILE\.claude\skills\ui-ux-audit"
```

### Instalación en un proyecto
Desde la raíz del proyecto que querés auditar:
```bash
git clone https://github.com/MartinezCE/ui-ux-audit.git .claude/skills/ui-ux-audit
rm -rf .claude/skills/ui-ux-audit/.git   # opcional: para commitear la skill como archivos comunes
```
Si preferís seguir las actualizaciones, sumala como submódulo:
```bash
git submodule add https://github.com/MartinezCE/ui-ux-audit.git .claude/skills/ui-ux-audit
```

### Sin git
Descargá el ZIP desde **Code → Download ZIP**, descomprimilo, renombrá la carpeta a `ui-ux-audit` y movela a alguna de las ubicaciones de arriba.

### Comprobar que cargó
Abrí `claude` y escribí `/`. Tiene que aparecer `ui-ux-audit` en la lista. Las skills se detectan en el momento; si no aparece, reiniciá la sesión.

> **Para claude.ai o la API de Skills:** el frontmatter usa dos campos que solo entiende Claude Code (`when_to_use` y `argument-hint`). Borrá esas dos líneas de `SKILL.md` antes de subirla a otro lado, porque ahí los campos desconocidos dan error.

## Configurar frontend-design
Es el plugin oficial de Anthropic, del marketplace `claude-plugins-official`:
```bash
claude plugin install frontend-design@claude-plugins-official
```
También se puede instalar desde una sesión con `/plugin install frontend-design@claude-plugins-official`. Después corré `/reload-plugins` (o abrí una sesión nueva) y fijate que aparezca `/frontend-design:frontend-design` al escribir `/`. `claude plugin list` también lo muestra con su estado.

frontend-design es una skill de instrucciones: cuando el orquestador la invoca, sus pautas de diseño se cargan en la conversación y el trabajo de diseño se hace siguiéndolas. El orquestador guarda el brief y el resultado en `.ui-audit/03-frontend-design-consultation.md`.

## Configurar Playwright MCP
Usá el servidor oficial de Microsoft: [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp). Instalalo de **una** sola forma, como servidor MCP independiente o como el plugin oficial que trae el mismo servidor. La skill detecta cualquiera de las dos y nunca agrega una segunda.

Como plugin:
```bash
claude plugin install playwright@claude-plugins-official
```

Como servidor independiente:

```bash
# Disponible en todos tus proyectos
claude mcp add --scope user playwright -- npx @playwright/mcp@latest --isolated

# O compartido en un solo repo mediante .mcp.json
claude mcp add --scope project playwright -- npx @playwright/mcp@latest --isolated
```

Si todavía no tenés Chromium:
```bash
npx playwright install chromium
```

Para comprobar la conexión, dentro de Claude Code corré `/mcp`; `playwright` tiene que figurar como conectado.

Opciones útiles (todo lo que va después de `--` se le pasa al servidor, no a Claude Code):

| Opción | Uso |
|---|---|
| `--isolated` | Mantiene el perfil del navegador en memoria, así no quedan cookies guardadas entre sesiones. Recomendada para auditar |
| `--viewport-size 1440x900` | Tamaño inicial de la ventana. La skill igual la ajusta a cada ancho |
| `--headless` | Sin ventana visible, útil para correr sin supervisión |
| `--storage-state ./auth.json` | Arranca con la sesión de una cuenta de prueba que guardaste vos. No subas ese archivo a git |
| `--output-dir ./.ui-audit/playwright` | Dónde guarda el servidor sus propios archivos |

La propia documentación de Playwright MCP aclara que no es una barrera de seguridad. Usalo solo contra entornos locales o de prueba en los que confíes.

## Primeros pasos
```bash
cd ruta/a/tu-frontend
npm run dev          # o dejá que la skill encuentre el comando y te pregunte antes de levantarlo
claude
```
Después, dentro de Claude Code:
```text
/ui-ux-audit audit
```
Cuando termine la auditoría, pedí las direcciones, elegí una y seguí paso a paso (ver [Uso](#uso)).

## Uso
El primer argumento indica hasta dónde avanza la skill; lo que escribas después es texto libre.

| Comando | Qué hace |
|---|---|
| `/ui-ux-audit` | Retoma desde el estado guardado y avanza hasta el próximo punto de aprobación |
| `/ui-ux-audit audit` | Solo relevamiento y auditoría, y se detiene |
| `/ui-ux-audit directions` | Propone las tres direcciones (reutiliza una auditoría existente) y espera tu elección |
| `/ui-ux-audit design-system` | Arma el design system de la dirección que elegiste |
| `/ui-ux-audit spec` | Escribe las tareas de implementación |
| `/ui-ux-audit implement <tareas>` | Implementa las tareas que apruebes y después valida |
| `/ui-ux-audit validate` | Vuelve a capturar las pantallas y las compara con las originales |

Ejemplos:
```text
/ui-ux-audit audit Auditá la aplicación actual sin modificar el código.
/ui-ux-audit directions Recorré la aplicación y proponé tres direcciones completas de rebranding.
/ui-ux-audit design-system Usá la dirección 2, pero con la tipografía de la 3.
/ui-ux-audit implement Implementá la dirección aprobada con las especificaciones generadas, tareas TASK-001 a TASK-004.
```

Claude también puede activar la skill por su cuenta si le pedís algo como "revisá la UX de esta app" o "este dashboard se ve viejo, proponé un rediseño". En ese caso también trabaja en modo solo auditoría.

## Flujo y puntos de aprobación
| Fase | Qué pasa | Capa | Modo | Gate |
|---|---|---|---|---|
| 0 Verificación de dependencias | Detecta y prueba los especialistas, revisa el guard de ediciones e informa qué fases quedan bloqueadas | 1 (+2, 3 prueba) | cualquiera | G1 Dependencias |
| 1 Relevamiento del proyecto | Framework, ruteo, componentes, estilos, tokens, librerías, recursos, convenciones y framework de SDD | 1 | A | |
| 2 Inspección real en el navegador | Rutas × 1440/1280/768/390 px × estados, capturas, snapshots, consola, inventario de estilos (Contrato A) | 3 | A | |
| 3 Consulta a Frontend Design | Crítica del diseño actual (Contrato B) | 2 | A | |
| 4 Informe de auditoría combinado | Hallazgos `AUD` con prioridad y tipo, puntajes, accesibilidad, responsive | 1 | A | G2 Evidencia |
| 5 Tres direcciones de diseño | Refinamiento conservador, modernización y rebranding completo, revisadas por el orquestador | 2 | A | G3 Dirección de arte |
| 6 ⛔ Aprobación | Elegís una dirección, que se convierte en decisiones `DES` | 1 | A | G4 Aprobación |
| 7 Design system y especificación | Tokens, componentes, ítems `SPEC` y `TASK` con criterios de aceptación (Contratos C y D) | 2 + 4 | B | G5 Especificación |
| 8 ⛔ Implementación aprobada | Solo las `TASK` que nombres | 5 | C | G6 Implementación |
| 9 Validación visual | Mismas rutas, anchos y estados, comparación antes/después, resultados `VAL` (Contrato E) | 3 | C | G7 Validación |

La skill se frena y te espera:
- antes de levantar un servidor de desarrollo o cualquier otro proceso
- después de mostrar las tres direcciones, hasta que elijas una
- antes de escribir en las carpetas de especificaciones de tu proyecto
- antes de implementar, y solo para las tareas que nombres

La aprobación nunca se genera sola: pedir "auditá e implementá todo" en el primer mensaje no aprueba ningún gate. El progreso, los gates y el registro de herramientas quedan en `.ui-audit/AUDIT_STATE.md`, así que podés cerrar la sesión y seguir otro día.

## Modos de trabajo
| Modo | Qué hace | Dónde puede escribir |
|---|---|---|
| **A, Auditoría** (por defecto) | Lee el código, recorre la app, saca capturas, revisa el diseño, escribe el informe y las tres direcciones | solo en `.ui-audit/` |
| **B, Especificación** | Convierte la dirección aprobada en design system, artefactos de SDD y plan de implementación | `.ui-audit/` y las carpetas de SDD que apruebes |
| **C, Implementación** | Implementa las tareas aprobadas, corre tus tests, valida con Playwright e informa regresiones | los archivos de las tareas aprobadas |

Los modos nunca cambian solos. El Modo B empieza cuando elegís una dirección y pedís la especificación; el C, solo cuando nombrás las `TASK` a implementar. En el Modo C, antes de cada cambio lee los archivos afectados y explica el plan, reutiliza los componentes existentes y no toca la lógica de negocio, los contratos de API, las rutas, los permisos, los flujos, las validaciones, el manejo de estado, los eventos de analytics ni los test ids. Después de validar vuelve al Modo B.

## Qué genera
Todo queda en `.ui-audit/`, en la raíz del proyecto auditado:

```
.ui-audit/
├── AUDIT_STATE.md                      fase, modo, dirección, tareas aprobadas, registro de uso de herramientas
├── 00-dependencies.md                  estado de los especialistas y fases bloqueadas
├── 01-discovery.md                     stack, rutas, tokens, componentes, lista de lo que no se toca
├── 02-browser-inspection.md            plan de recorrido con Playwright y resultados
├── 03-frontend-design-consultation.md  briefs enviados a frontend-design y su resultado
├── 04-audit-report.md                  puntajes, hallazgos, accesibilidad, tabla responsive
├── 05-design-directions.md             tres direcciones con paletas, tipografía y ejemplos
├── 07-design-system-spec.md            tokens y guías de componentes
├── 07-implementation-spec.md           ítems SPEC y TASK (o los archivos de tu framework de SDD)
├── TRACEABILITY.md                     matriz AUD → DES → SPEC → TASK → VAL
├── 09-validation-report.md             comparación antes/después y criterios cumplidos
├── guard.log                           decisiones del guard de ediciones
├── screenshots/
│   ├── baseline/               <pantalla>--<ancho>--<estado>.png
│   └── after/
├── evidence/                   inventarios de estilos (JSON)
└── mockups/                    mockups HTML estáticos, opcionales
```

Antes de sumar `.ui-audit/` a tu `.gitignore`, la skill te pregunta.

## Integración con SDD
El SDD es opcional y una auditoría visual nunca lo necesita. En el Modo B la skill detecta el framework que ya usa tu proyecto y escribe en su formato. Nunca instala uno ni arma un segundo sistema de especificaciones.

| Framework | Cómo lo detecta | Qué genera |
|---|---|---|
| OpenSpec | `openspec/` con `specs/` o `changes/` | un cambio en `openspec/changes/<change-id>/` (`proposal.md`, `design.md`, `tasks.md` y deltas de specs), siguiendo tus cambios existentes |
| spec-kit | `.specify/`, `specs/NNN-<feature>/` | un `specs/NNN-ui-redesign/` nuevo con la misma estructura |
| Specs estilo Kiro | `.kiro/specs/` o `specs/<feature>/requirements.md`, `design.md`, `tasks.md` | `ui-redesign-<slug>/` con los mismos tres archivos y la misma sintaxis de requisitos |
| Otro (ADRs, `docs/specs`) | documentado en README, CLAUDE.md o AGENTS.md | la convención documentada |
| Ninguno | | `.ui-audit/07-implementation-spec.md` |

Escribir en tus carpetas de especificaciones cuenta como un cambio en el proyecto, así que primero te pregunta, y el guard solo habilita las carpetas que aprobaste. `.ui-audit/TRACEABILITY.md` mantiene la referencia cruzada de AUD a VAL en cualquier caso.

## Scripts
Ninguno tiene dependencias.

**`scripts/contrast.mjs`** calcula el contraste WCAG exacto.
```bash
node scripts/contrast.mjs "#6b7280" "#ffffff"
node scripts/contrast.mjs "#666/#fff" "rgba(0,0,0,0.6)/#ffffff"
node scripts/contrast.mjs --json pares.json
node scripts/contrast.mjs --inventory .ui-audit/evidence/dashboard-styles.json
```
Si algún par no llega a AA, termina con código 1, así que también sirve en CI.

**`scripts/style-inventory.js`** es una función que se le pasa a `browser_evaluate` de Playwright MCP. Devuelve las fuentes, tamaños, colores, radios, sombras y espaciados que la página usa de verdad, los pares de texto y fondo para medir contraste, los elementos interactivos de menos de 24×24 px, el scroll horizontal, la jerarquía de títulos y las imágenes sin `alt`.

**`scripts/guard-source-edits.mjs`** es un hook `PreToolUse` declarado en `SKILL.md`. Bloquea Edit, Write y NotebookEdit fuera de lo que permite el modo actual: `.ui-audit/` en el Modo A, más las carpetas de SDD aprobadas en el B y los archivos de las tareas aprobadas en el C. Anota cada decisión en `.ui-audit/guard.log`. Cuando termina la auditoría, pedile que ponga `Mode: off`, porque los hooks de una skill quedan activos hasta el final de la sesión.

## Seguridad
- No muestra en el chat ni guarda en archivos credenciales, API keys, tokens ni cookies.
- No envía código ni capturas a servicios externos sin tu permiso.
- No instala nada, no levanta procesos y no escribe fuera de `.ui-audit/` sin tu aprobación.
- En un rediseño visual no toca el backend, los esquemas de base de datos ni los contratos de API.
- Nunca saltea la autenticación: te pide una cuenta de prueba o usa una sesión que le des vos.
- Revisa las capturas antes de guardarlas para no registrar datos personales.

## Limitaciones
- Los puntajes son evaluaciones de experto, no mediciones. Cada uno aclara en qué se apoya.
- Los resultados de accesibilidad no afirman cumplimiento de WCAG. El comportamiento con lectores de pantalla y los aspectos cognitivos hay que probarlos a mano.
- Las pantallas detrás de un login, de feature flags o de ciertos datos solo se cubren si le das acceso o datos de prueba.
- Las diferencias finas de píxeles se detectan mejor con `toHaveScreenshot` de Playwright que mirando imágenes.
- Quedan fuera de alcance las interfaces basadas en canvas o WebGL, las apps móviles nativas y los templates de email.
- Las fuentes y recursos que sugieren las direcciones requieren revisar su licencia.
- El guard cubre las herramientas de edición de archivos de Claude, no los comandos de shell; en modo auditoría, que no se escriba con Bash depende solo de las instrucciones. El comando del hook usa `${CLAUDE_SKILL_DIR}`: si tu shell no la resuelve (por ejemplo PowerShell sin Git Bash), el hook no bloquea nada y la fase 0 informa el guard como faltante.
- El flujo se probó contra `@playwright/mcp` 0.0.68 y el código del plugin oficial frontend-design 1.1.1, no contra todas las versiones.
- Una auditoría larga consume bastante contexto. Los informes se guardan en archivos y las respuestas en el chat son cortas; podés retomar cuando quieras con `/ui-ux-audit`.

## Estructura del repo
```
ui-ux-audit/
├── SKILL.md                     punto de entrada: flujo, aprobaciones, modos, seguridad
├── README.md / README.es.md
├── LICENSE                      CC BY-NC 4.0
├── references/
│   ├── design-principles.md
│   ├── accessibility-guidelines.md
│   ├── design-system-guidelines.md
│   ├── responsive-guidelines.md
│   ├── visual-audit-checklist.md
│   ├── branding-guidelines.md
│   ├── frontend-implementation-guidelines.md
│   ├── orchestration.md         detección, invocación y briefs de los especialistas, registro de uso
│   └── integration-contracts.md capas, contratos A a E, identificadores, trazabilidad, gates, SDD
├── templates/
│   ├── audit-report.md
│   ├── design-proposal.md
│   ├── design-system-spec.md
│   ├── implementation-spec.md
│   └── validation-report.md
└── scripts/
    ├── contrast.mjs
    ├── style-inventory.js
    └── guard-source-edits.mjs   hook PreToolUse: límites de escritura por modo
```
`SKILL.md` es corto a propósito. Claude lee las referencias y plantillas solo cuando una fase las necesita.

## Actualizar y desinstalar
```bash
# actualizar
git -C ~/.claude/skills/ui-ux-audit pull

# desinstalar
rm -rf ~/.claude/skills/ui-ux-audit
```
En Windows usá `"$env:USERPROFILE\.claude\skills\ui-ux-audit"` como ruta y `Remove-Item -Recurse -Force` para desinstalar.

## Contribuir
Los issues y pull requests son bienvenidos. Al contribuir, aceptás que tu aporte quede bajo la misma licencia CC BY-NC 4.0. Sirven especialmente:
- reglas de detección para más stacks, librerías de componentes o frameworks de SDD
- checklists más precisas o nuevos chequeos de WCAG
- ejemplos de auditorías reales (con permiso y sin datos personales)

Mantené `SKILL.md` por debajo de 500 líneas y poné el detalle en `references/`.

## Licencia
© 2026 Cristian Martinez. Se distribuye bajo la licencia [Creative Commons Atribución-NoComercial 4.0 Internacional (CC BY-NC 4.0)](LICENSE).

Podés:
- usar la skill gratis en tus propios proyectos, en tus estudios o en proyectos open source
- copiarla, modificarla y compartirla, incluso versiones adaptadas

Siempre que:
- menciones al autor y enlaces este repositorio y la licencia
- aclares si hiciste cambios
- no la uses con fines comerciales, por ejemplo venderla, incluirla en un producto o servicio pago u ofrecer auditorías pagas basadas en ella

Para un uso comercial, abrí un issue o contactá al autor para pedir permiso.

Aclaración: como restringe el uso comercial, técnicamente es una licencia de código disponible (*source-available*) y no open source según la definición de la OSI.
