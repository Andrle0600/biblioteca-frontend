---
name: pdfmaker
description: Usa esta skill siempre que se necesite generar, componer o exportar archivos PDF con la librería "pdfmake" (paquete npm `pdfmake`, versión ^0.3.11) desde código TypeScript/Node.js. Aplica a peticiones como "genera un PDF con pdfmake", "crea una factura/reporte/informe en PDF", "arma un documento con tablas/columnas/encabezados en PDF", "exporta este JSON a PDF", o cualquier tarea que involucre construir un Document Definition Object (DDO) de pdfmake, tablas, listas, imágenes, QR, encabezados/pies de página, tabla de contenidos o metadatos de PDF. NO cubre instalación del paquete ni configuración de bundlers/webpack (se asume que `pdfmake` ya está instalado en el proyecto, versión ^0.3.11) — para eso no uses esta skill. Tampoco cubre lectura/edición/fusión de PDFs existentes (usa la skill "pdf" para eso); esta skill es exclusivamente para GENERAR PDFs nuevos con pdfmake.
license: Proprietary. LICENSE.txt has complete terms
---

# pdfmake (TypeScript) — Guía de uso

## Contexto de versión

Esta guía asume `pdfmake` en `package.json` fijado en:

```json
"pdfmake": "^0.3.11"
```

La serie **0.3.x** introdujo una API unificada (cliente y servidor comparten la misma interfaz) y **todos los métodos de salida devuelven Promesas** (antes usaban callbacks). No mezclar patrones de la serie 0.1.x/0.2.x (callbacks, `PdfPrinter` como única vía) salvo que se indique explícitamente que el proyecto sigue en esa serie antigua — ver sección "API de bajo nivel" más abajo para cuándo sí aplica.

No se cubre instalación (`npm install`) ni configuración de bundlers: se asume que el paquete ya está instalado y disponible para importar.

## Inicio rápido (API recomendada, unificada 0.3.x)

```typescript
import pdfmake from 'pdfmake';
import * as fs from 'fs';

// 1. Registrar fuentes (OBLIGATORIO, ver siguiente sección)
pdfmake.addFonts({
  Roboto: {
    normal: 'fonts/Roboto-Regular.ttf',
    bold: 'fonts/Roboto-Medium.ttf',
    italics: 'fonts/Roboto-Italic.ttf',
    bolditalics: 'fonts/Roboto-MediumItalic.ttf',
  },
});

// 2. Definir el documento (Document Definition Object / DDO)
const docDefinition = {
  content: [
    { text: 'Título del documento', fontSize: 18, bold: true },
    'Un párrafo simple de texto.',
  ],
};

// 3. Generar y obtener la salida (todo es async/Promise en 0.3.x)
async function generar() {
  const pdfDoc = pdfmake.createPdf(docDefinition);
  await pdfDoc.write('salida.pdf'); // o usar getBuffer()/getStream()/getBase64()
}

generar();
```

Puntos clave que un agente debe respetar siempre:

- `pdfmake.createPdf(docDefinition, options?)` crea el generador; **no** escribe nada por sí solo.
- Los métodos de salida (`write`, `getBuffer`, `getStream`, `getBase64`, `getDataUrl`, `getBlob` en browser) **devuelven una `Promise`**. Nunca usar la forma antigua `getBuffer((buffer) => {...})` con callback: eso es de 0.2.x y no funciona en 0.3.x.
- Las fuentes deben registrarse con `pdfmake.addFonts(...)` **antes** de llamar a `createPdf`. Si no hay fuentes registradas y el DDO usa una fuente (por defecto `Roboto`) que no está definida, pdfmake lanza `Error: Font 'Roboto' in style 'normal' is not defined in the font section of the document definition`.

## Registro de fuentes

pdfmake no trae una fuente embebida por defecto en Node: hay que apuntar a archivos `.ttf`/`.otf` reales para cada estilo (`normal`, `bold`, `italics`, `bolditalics`). El nombre que se le da a la fuente al registrarla es el que se usa luego en el DDO (`style.font` o `defaultStyle.font`).

```typescript
pdfmake.addFonts({
  Roboto: {
    normal: 'fonts/Roboto-Regular.ttf',
    bold: 'fonts/Roboto-Medium.ttf',
    italics: 'fonts/Roboto-Italic.ttf',
    bolditalics: 'fonts/Roboto-MediumItalic.ttf',
  },
  // Se pueden registrar varias familias tipográficas
  OpenSans: {
    normal: 'fonts/OpenSans-Regular.ttf',
    bold: 'fonts/OpenSans-Bold.ttf',
    italics: 'fonts/OpenSans-Italic.ttf',
    bolditalics: 'fonts/OpenSans-BoldItalic.ttf',
  },
  // Fuentes de colección (.ttc): [archivo, nombre-interno]
  PingFangSC: {
    normal: ['pingfang.ttc', 'PingFangSC-Regular'],
    bold: ['pingfang.ttc', 'PingFangSC-Semibold'],
  },
});
```

- En 0.3.x, `pdfmake.addFonts(...)` también acepta **URLs `http(s)://`** como valor de cada estilo (se descargan vía `fetch`), útil si las fuentes no están en disco local.
- Definir la fuente por defecto del documento con `defaultStyle: { font: 'OpenSans' }` en el DDO; si no se especifica, pdfmake usa `Roboto`.
- Si el contenido incluye caracteres no latinos (cirílico, árabe, CJK, etc.), la fuente registrada debe soportar esos glifos — Roboto estándar no cubre todo Unicode.

## El Document Definition Object (DDO)

Todo documento se define como un objeto plano. La propiedad obligatoria es `content` (string, objeto, o arreglo de ambos). El resto son opcionales.

```typescript
const docDefinition = {
  content: [ /* ... */ ],
  styles: { /* estilos reutilizables por nombre */ },
  defaultStyle: { font: 'Roboto', fontSize: 11 },
  pageSize: 'A4',
  pageOrientation: 'portrait', // 'portrait' | 'landscape'
  pageMargins: [40, 60, 40, 60], // [izq, arriba, der, abajo]
  header: (currentPage: number, pageCount: number) => ({ text: `Pág ${currentPage}/${pageCount}`, alignment: 'right' }),
  footer: (currentPage: number, pageCount: number) => ({ text: 'Confidencial', alignment: 'center' }),
  info: { title: 'Reporte', author: 'Sistema', subject: 'Ventas Q3' },
};
```

### Texto y estilos

```typescript
content: [
  { text: 'Encabezado', style: 'header' },
  { text: [ 'Texto normal, ', { text: 'texto en negrita', bold: true }, ' y sigue.' ] },
  { text: 'Párrafo justificado con interlineado.', alignment: 'justify', lineHeight: 1.4 },
],
styles: {
  header: { fontSize: 20, bold: true, margin: [0, 0, 0, 10] },
},
```

- Los estilos definidos en `styles` se referencian por nombre con la propiedad `style` (acepta un string o un arreglo de nombres, aplicados en orden).
- Las propiedades inline (`bold`, `fontSize`, `color`, `alignment`, etc.) siempre sobrescriben lo heredado del `style`.
- `margin` sigue el orden `[izquierda, arriba, derecha, abajo]`; con 2 valores es `[horizontal, vertical]`; con 1 valor es uniforme.

### Columnas

```typescript
content: [
  {
    columns: [
      { width: 'auto', text: 'Columna de ancho automático' },
      { width: '*', text: 'Columna que ocupa el espacio restante (estrella)' },
      { width: 100, text: 'Columna de ancho fijo en puntos' },
    ],
    columnGap: 10,
  },
],
```

### Tablas

```typescript
content: [
  {
    table: {
      headerRows: 1,
      widths: ['*', 'auto', 100],
      body: [
        [{ text: 'Producto', bold: true }, { text: 'Cantidad', bold: true }, { text: 'Precio', bold: true }],
        ['Widget A', '3', '$10.00'],
        [{ text: 'Widget B', colSpan: 2 }, {}, '$25.00'],
      ],
    },
    layout: 'lightHorizontalLines', // o un objeto de layout custom
  },
],
```

- `widths` acepta `'auto'`, `'*'` (estrella, reparte espacio libre) o números/porcentajes (`'50%'`).
- `headerRows` indica cuántas filas iniciales se repiten automáticamente si la tabla cruza un salto de página.
- Para `colSpan`/`rowSpan`, las celdas "cubiertas" deben existir como objetos vacíos `{}` en la matriz — nunca omitirlas, o el índice de columnas se desalinea.
- Layouts predefinidos: `'noBorders'`, `'headerLineOnly'`, `'lightHorizontalLines'`. Para control fino, pasar un objeto con funciones `hLineWidth`, `vLineWidth`, `hLineColor`, `paddingLeft`, etc.
- Si se necesita eliminar bordes de celda puntuales, usar `border: [izq, arriba, der, abajo]` (booleanos) por celda.

### Listas

```typescript
content: [
  { ul: ['Elemento 1', 'Elemento 2', { text: 'Elemento anidado', ul: ['Sub A', 'Sub B'] }] },
  { ol: ['Primero', 'Segundo', 'Tercero'], type: 'lower-alpha' }, // 'decimal' | 'lower-roman' | 'upper-roman' | 'lower-alpha' | 'upper-alpha'
],
```

### Imágenes

```typescript
content: [
  { image: 'imagenes/logo.png', width: 150 }, // ruta local
  { image: 'data:image/png;base64,iVBORw0KG...', fit: [200, 200] }, // data URL / base64
  { image: 'https://example.com/foto.jpg', width: 100 }, // URL remota (0.3.x soporta http/https en Node)
],
```

- `width`/`height` fuerzan un tamaño (puede deformar la imagen); `fit: [w, h]` escala manteniendo proporción dentro de esa caja.
- Formatos soportados: JPG y PNG. Para SVG, usar la propiedad `svg` (ver abajo), no `image`.

### SVG

```typescript
content: [
  { svg: '<svg width="100" height="100"><circle cx="50" cy="50" r="40" fill="red"/></svg>', width: 100 },
],
```

### Enlaces

```typescript
content: [
  { text: 'Visita el sitio', link: 'https://example.com', color: 'blue', decoration: 'underline' },
  { text: 'Ir al final', linkToDestination: 'finalDoc' },
  { text: 'Ancla', id: 'finalDoc' },
],
```

### Código QR

```typescript
content: [
  { qr: 'https://example.com', fit: 150 },
],
```

### Saltos de página

```typescript
content: [
  { text: 'Página 1', pageBreak: 'after' }, // 'before' | 'after' | 'beforeOdd' | 'beforeEven' | 'afterOdd' | 'afterEven'
  { text: 'Página 2' },
],
```

### Encabezados, pies de página y capa de fondo

```typescript
const docDefinition = {
  header: (currentPage: number, pageCount: number, pageSize: { width: number; height: number }) => ({
    text: `Página ${currentPage} de ${pageCount}`,
    alignment: 'right',
    margin: [0, 20, 40, 0],
  }),
  footer: {
    columns: [
      { text: 'Empresa S.A.', alignment: 'left', margin: [40, 0] },
      { text: new Date().toLocaleDateString(), alignment: 'right', margin: [0, 0, 40, 0] },
    ],
  },
  background: (currentPage: number, pageSize: { width: number; height: number }) => ({
    text: 'BORRADOR',
    color: 'gray',
    opacity: 0.15,
    fontSize: 60,
    bold: true,
    alignment: 'center',
    margin: [0, pageSize.height / 2 - 30, 0, 0],
  }),
  content: [ /* ... */ ],
};
```

- `header`, `footer` y `background` pueden ser un objeto estático o una **función** que recibe `(currentPage, pageCount, pageSize)` y retorna el contenido de esa página — usar función siempre que el contenido dependa del número de página.

### Tabla de contenidos (TOC)

```typescript
content: [
  { toc: { title: { text: 'Índice', style: 'header' } } },
  { text: 'Introducción', style: 'header', tocItem: true, pageBreak: 'before' },
  { text: 'Capítulo 1', style: 'header', tocItem: true, pageBreak: 'before' },
],
```

### Márgenes, tamaño y orientación de página

```typescript
const docDefinition = {
  pageSize: 'A4', // o { width: 595.28, height: 841.89 } en puntos
  pageOrientation: 'landscape',
  pageMargins: [40, 60, 40, 60],
  content: [ /* ... */ ],
};
```

### Metadatos del documento

```typescript
const docDefinition = {
  info: {
    title: 'Reporte de ventas',
    author: 'Sistema de Reportes',
    subject: 'Ventas Q3 2026',
    keywords: 'ventas, reporte, Q3',
  },
  content: [ /* ... */ ],
};
```

## Obtención de la salida

Todos estos métodos son **asíncronos (Promise)** en 0.3.x. Encadenar con `.then()`/`.catch()` o usar `await` dentro de una función `async`.

```typescript
const pdfDoc = pdfmake.createPdf(docDefinition);

// Guardar directamente a disco
await pdfDoc.write('reporte.pdf');

// Obtener un Buffer (por ejemplo, para responder en una API HTTP)
const buffer: Buffer = await pdfDoc.getBuffer();
res.setHeader('Content-Type', 'application/pdf');
res.send(buffer);

// Obtener un stream Node legible
const stream = await pdfDoc.getStream();
stream.pipe(fs.createWriteStream('reporte.pdf'));

// Base64 / Data URL (útil para incrustar en JSON o <iframe src>)
const base64: string = await pdfDoc.getBase64();
const dataUrl: string = await pdfDoc.getDataUrl();
```

Manejo de errores — siempre capturar el rechazo de la promesa (por ejemplo, fuente no registrada, imagen inaccesible, layout inválido):

```typescript
try {
  const buffer = await pdfmake.createPdf(docDefinition).getBuffer();
} catch (err) {
  console.error('Error generando PDF:', err);
  throw err;
}
```

## API de bajo nivel: `PdfPrinter` (streaming directo con PDFKit)

Existe también una clase `PdfPrinter` (heredada de versiones anteriores, sigue disponible en 0.3.x) que expone directamente el documento de **PDFKit** en lugar de la API por promesas. Es útil cuando se necesita control fino sobre el stream o integrarlo con otras librerías basadas en PDFKit. **No mezclar** ambos estilos en el mismo módulo sin necesidad — preferir siempre `pdfmake.createPdf(...)` salvo que el proyecto ya use `PdfPrinter` explícitamente.

```typescript
import PdfPrinter from 'pdfmake';
import * as fs from 'fs';

const fonts = {
  Roboto: {
    normal: 'fonts/Roboto-Regular.ttf',
    bold: 'fonts/Roboto-Medium.ttf',
    italics: 'fonts/Roboto-Italic.ttf',
    bolditalics: 'fonts/Roboto-MediumItalic.ttf',
  },
};

const printer = new PdfPrinter(fonts);
const pdfDoc = printer.createPdfKitDocument(docDefinition); // devuelve un stream PDFKit, NO una promesa
pdfDoc.pipe(fs.createWriteStream('reporte.pdf'));
pdfDoc.end(); // imprescindible: sin end() el archivo queda incompleto
```

Diferencia clave: `createPdfKitDocument` retorna el stream de forma **síncrona** y hay que llamar `.end()` manualmente; no devuelve buffer/base64 directo (para eso hay que acumular los chunks del stream a mano).

## Tipado en TypeScript

- El paquete `@types/pdfmake` de DefinitelyTyped **está desactualizado respecto a 0.3.x**: todavía documenta la firma antigua basada en callbacks (`getBuffer(cb)`) y no refleja `createPdf(...).getBuffer(): Promise<Buffer>`. Si el proyecto tiene instalado `@types/pdfmake`, es probable que el editor marque error de tipos al usar `.then()`/`await` sobre estos métodos aunque el código funcione en runtime.
- Ante ese desajuste, opciones válidas (sin tocar configuración del proyecto, solo en el código que se escribe):
  - Anotar el resultado explícitamente: `const buffer = (await pdfDoc.getBuffer()) as Buffer;`
  - Si el error de compilación bloquea, usar un `// @ts-expect-error` puntual documentando que es un desfase de tipos conocido de `@types/pdfmake` con la API promise-based de 0.3.x, nunca `any` disperso por todo el archivo.
- El DDO (`docDefinition`) no tiene un tipo estricto público confiable para 0.3.x; es razonable tipar las variables propias del dominio (p. ej. `interface Factura { ... }`) y dejar que el objeto que se pasa a `createPdf` sea inferido o tipado como `Record<string, unknown>` / la interfaz local que se use para construirlo, en vez de pelear contra tipos desactualizados de terceros.

## Errores comunes (gotchas)

- **`Font 'Roboto' in style 'normal' is not defined`**: falta llamar `pdfmake.addFonts(...)` antes de `createPdf`, o el DDO referencia una fuente (`font: 'X'`) que no fue registrada con ese nombre exacto.
- **Usar callbacks en vez de promesas**: código copiado de tutoriales de la serie 0.1.x/0.2.x (`getBuffer((buffer) => {...})`) no funciona en 0.3.x — siempre `await`/`.then()`.
- **`colSpan`/`rowSpan` sin celdas vacías**: omitir las celdas `{}` que cubre un `colSpan` rompe el conteo de columnas de toda la fila.
- **Texto con caracteres Unicode no soportados**: si aparecen cuadros vacíos o glifos faltantes, la fuente registrada no incluye esos caracteres — registrar una fuente que sí los soporte (p. ej. DejaVu Sans, Noto Sans) en vez de forzar Roboto.
- **Olvidar `.end()` con `PdfPrinter`**: al usar la API de bajo nivel (`createPdfKitDocument`), el archivo queda truncado/corrupto si no se llama `pdfDoc.end()` tras el `.pipe(...)`.
- **Confundir `image` con `svg`**: `image` solo acepta rutas/base64/URLs de PNG o JPG; contenido SVG va en la propiedad `svg`.
- **Anchos de tabla mal balanceados**: usar `'*'` en más de una columna reparte el espacio libre entre todas ellas; si se espera que solo una columna "flexible" absorba el espacio, las demás deben tener ancho `'auto'` o fijo, no `'*'`.

## Referencia rápida

| Tarea | Propiedad / API |
|---|---|
| Registrar fuentes | `pdfmake.addFonts({ NombreFuente: { normal, bold, italics, bolditalics } })` |
| Crear el generador | `pdfmake.createPdf(docDefinition, options?)` |
| Guardar a disco | `await pdfDoc.write('archivo.pdf')` |
| Obtener Buffer | `await pdfDoc.getBuffer()` |
| Obtener stream | `await pdfDoc.getStream()` |
| Obtener base64 | `await pdfDoc.getBase64()` |
| Obtener data URL | `await pdfDoc.getDataUrl()` |
| Texto con estilo | `{ text: '...', style: 'nombreEstilo' }` |
| Columnas | `{ columns: [...], columnGap: n }` |
| Tabla | `{ table: { headerRows, widths, body }, layout: '...' }` |
| Lista con viñetas | `{ ul: [...] }` |
| Lista numerada | `{ ol: [...], type: '...' }` |
| Imagen | `{ image: 'ruta\|base64\|url', width\|height\|fit }` |
| SVG | `{ svg: '<svg>...</svg>' }` |
| Enlace | `{ text: '...', link: 'https://...' }` |
| Código QR | `{ qr: 'contenido', fit: n }` |
| Salto de página | `{ ..., pageBreak: 'before'\|'after' }` |
| Encabezado / pie | `header:` / `footer:` (objeto o función `(page, pageCount, pageSize) => ({...})`) |
| Capa de fondo | `background:` (objeto o función) |
| Tabla de contenidos | `{ toc: {...} }` + `tocItem: true` en cada entrada |
| Tamaño / orientación | `pageSize`, `pageOrientation`, `pageMargins` |
| Metadatos | `info: { title, author, subject, keywords }` |
| API de bajo nivel (stream PDFKit directo) | `new PdfPrinter(fonts).createPdfKitDocument(docDefinition)` + `.pipe(...)` + `.end()` |
