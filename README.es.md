# ui-ux-audit

**Skill de Claude Code para auditar, dar dirección de arte y rediseñar la UI/UX de aplicaciones web que ya existen.**

[Read in English](README.md) · Licencia: [CC BY-NC 4.0](LICENSE) (uso libre sin fines comerciales)

Con `ui-ux-audit`, Claude Code trabaja como un diseñador de producto senior y un ingeniero de design systems sobre un proyecto que ya tenés andando. Lee el código fuente, recorre la app en ejecución con [Playwright MCP](https://github.com/microsoft/playwright-mcp), puntúa diez dimensiones de calidad, propone tres direcciones de diseño bien distintas y convierte la que elijas en una especificación de design system y en tareas chicas, listas para SDD.

No modifica tu código salvo que lo apruebes de forma explícita, y verifica el resultado comparando capturas de antes y después.

- Funciona con cualquier stack: React, Next.js, Vue, Nuxt, Svelte, Angular, Astro, templates del lado del servidor…
- Respeta lo que ya hay: tu forma de manejar tokens, tu librería de componentes, tus convenciones y tu framework de SDD.
- Se detiene en puntos de aprobación, así que las decisiones del rediseño siempre las tomás vos.

---

## Contenido
1. [Qué hace](#qué-hace)
2. [Requisitos](#requisitos)
3. [Instalación](#instalación)
4. [Configurar Playwright MCP](#configurar-playwright-mcp)
5. [Primeros pasos](#primeros-pasos)
6. [Uso](#uso)
7. [Flujo y puntos de aprobación](#flujo-y-puntos-de-aprobación)
8. [Modos de trabajo](#modos-de-trabajo)
9. [Qué genera](#qué-genera)
10. [Integración con SDD](#integración-con-sdd)
11. [Scripts](#scripts)
12. [Seguridad](#seguridad)
13. [Limitaciones](#limitaciones)
14. [Estructura del repo](#estructura-del-repo)
15. [Actualizar y desinstalar](#actualizar-y-desinstalar)
16. [Contribuir](#contribuir)
17. [Licencia](#licencia)

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
| Node.js 18+ | sí | Corre Playwright MCP con `npx` y `scripts/contrast.mjs` | [nodejs.org](https://nodejs.org) |
| Git | para instalar desde este repo | Clonar y actualizar | [git-scm.com](https://git-scm.com) |
| Playwright MCP (`@playwright/mcp`, de Microsoft) | muy recomendable | Navegar la app, cambiar el tamaño de la ventana, sacar capturas, leer el árbol de accesibilidad y la consola | [Ver abajo](#configurar-playwright-mcp) |
| Plugin `frontend-design` (Anthropic) | opcional | Exploración estética más rica en la dirección de arte | `/plugin install frontend-design@claude-plugins-official` |
| axe-core en tu proyecto | opcional | Resultados automáticos de accesibilidad, si ya lo tenés | La skill nunca lo instala sin preguntar |

Sin Playwright MCP la skill igual funciona, pero hace una auditoría basada solo en el código y lo aclara en cada informe.

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

## Configurar Playwright MCP
Usá el servidor oficial de Microsoft: [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp).

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
/ui-ux-audit implement Implementá la dirección aprobada con las especificaciones generadas, tareas UI-001 a UI-004.
```

Claude también puede activar la skill por su cuenta si le pedís algo como "revisá la UX de esta app" o "este dashboard se ve viejo, proponé un rediseño". En ese caso también trabaja en modo solo auditoría.

## Flujo y puntos de aprobación
```
1 Relevamiento ─▶ 2 Auditoría ─▶ 3 Dirección de arte ─▶ ⛔ 4 Aprobación ─▶ 5 Design system ─▶ 6 Spec SDD ─▶ ⛔ 7 Implementación ─▶ 8 Validación
```

La skill se frena y te espera:
- antes de levantar un servidor de desarrollo o cualquier otro proceso
- después de mostrar las tres direcciones, hasta que elijas una
- antes de escribir en las carpetas de especificaciones de tu proyecto
- antes de implementar, y solo para las tareas que nombres

El progreso queda en `.ui-audit/AUDIT_STATE.md`, así que podés cerrar la sesión y seguir otro día.

## Modos de trabajo
**Modo A, solo auditoría (por defecto).** Lee el código, recorre la app, saca capturas y escribe informes y especificaciones. Nunca edita código, configuración, lockfiles ni dependencias. La única carpeta en la que escribe es `.ui-audit/`.

**Modo B, implementación aprobada.** Solo si lo autorizás de forma explícita en la conversación actual. Antes de cada cambio importante lee los archivos afectados y explica el plan. Reutiliza los componentes existentes, actualiza los tokens y no toca la lógica de negocio, los contratos de API, las rutas, los permisos, los flujos, las validaciones, el manejo de estado, los eventos de analytics ni los test ids. Después de cada tarea corre tu lint, el chequeo de tipos y los tests que ya tenés, y revisa las pantallas.

## Qué genera
Todo queda en `.ui-audit/`, en la raíz del proyecto auditado:

```
.ui-audit/
├── AUDIT_STATE.md              fase actual, modo, dirección elegida, tareas aprobadas
├── 01-discovery.md             stack, rutas, tokens, componentes, lista de lo que no se toca
├── 02-audit-report.md          puntajes, hallazgos, accesibilidad, tabla responsive
├── 03-design-directions.md     tres direcciones con paletas, tipografía y ejemplos
├── 05-design-system-spec.md    tokens y guías de componentes
├── 06-implementation-spec.md   tareas UI-001… (o los archivos de tu framework de SDD)
├── 08-validation-report.md     comparación antes/después y criterios cumplidos
├── screenshots/
│   ├── baseline/               <pantalla>--<ancho>--<estado>.png
│   └── after/
├── evidence/                   inventarios de estilos (JSON)
└── mockups/                    mockups HTML estáticos, opcionales
```

Antes de sumar `.ui-audit/` a tu `.gitignore`, la skill te pregunta.

## Integración con SDD
La skill detecta si el proyecto ya usa desarrollo guiado por especificaciones y escribe en ese formato, en lugar de armar una especificación paralela:

| Framework | Cómo lo detecta | Qué genera |
|---|---|---|
| OpenSpec | `openspec/` | Propuesta de cambio con la estructura de OpenSpec |
| Specs estilo Kiro | `specs/<feature>/requirements.md`, `design.md`, `tasks.md` | `specs/ui-redesign-<slug>/` con los mismos tres archivos |
| spec-kit | `.specify/` | Artefactos según sus plantillas |
| Ninguno | | `.ui-audit/06-implementation-spec.md` |

Escribir en tus carpetas de especificaciones cuenta como un cambio en el proyecto, así que primero te pregunta.

## Scripts
Los dos son de solo lectura y no tienen dependencias.

**`scripts/contrast.mjs`** calcula el contraste WCAG exacto.
```bash
node scripts/contrast.mjs "#6b7280" "#ffffff"
node scripts/contrast.mjs "#666/#fff" "rgba(0,0,0,0.6)/#ffffff"
node scripts/contrast.mjs --json pares.json
node scripts/contrast.mjs --inventory .ui-audit/evidence/dashboard-styles.json
```
Si algún par no llega a AA, termina con código 1, así que también sirve en CI.

**`scripts/style-inventory.js`** es una función que se le pasa a `browser_evaluate` de Playwright MCP. Devuelve las fuentes, tamaños, colores, radios, sombras y espaciados que la página usa de verdad, los pares de texto y fondo para medir contraste, los elementos interactivos de menos de 24×24 px, el scroll horizontal, la jerarquía de títulos y las imágenes sin `alt`.

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
│   └── frontend-implementation-guidelines.md
├── templates/
│   ├── audit-report.md
│   ├── design-proposal.md
│   ├── design-system-spec.md
│   └── implementation-spec.md
└── scripts/
    ├── contrast.mjs
    └── style-inventory.js
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
