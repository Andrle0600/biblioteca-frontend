---
name: exceljs
description: Usa esta skill siempre que el usuario pida crear, leer, editar o manipular archivos Excel (.xlsx) mediante código TypeScript/Node.js usando la librería "exceljs". Aplica a tareas como generar reportes en Excel, exportar datos a spreadsheets, leer y parsear archivos .xlsx existentes, aplicar estilos/formatos (fuentes, colores, bordes, formatos numéricos), insertar fórmulas, fusionar celdas, congelar paneles, agregar autofiltros, validación de datos, formato condicional, insertar imágenes, proteger hojas/libros, trabajar con múltiples hojas, o procesar archivos Excel grandes con streaming. Se asume que la librería "exceljs" (v4.4.0) YA está instalada en el proyecto — esta skill NO cubre instalación ni configuración de package.json, tsconfig, etc. Úsala cada vez que aparezca "exceljs", "Excel", ".xlsx", "spreadsheet", "hoja de cálculo" o "workbook" en una tarea de programación, incluso si no se menciona explícitamente el nombre de la librería.
license: Proprietary. LICENSE.txt has complete terms
---

# ExcelJS (TypeScript) — Guía de Uso

## Overview

Esta guía cubre el uso correcto y riguroso de **ExcelJS v4.4.0** en TypeScript para crear, leer y manipular archivos `.xlsx`. Asume que la librería ya está instalada (`"exceljs": "^4.4.0"` en `package.json`) y que el entorno TypeScript ya está configurado. El foco es exclusivamente el **uso de la API**: creación de workbooks, escritura/lectura de celdas, estilos, fórmulas, streaming, validaciones y errores comunes.

Importación estándar en TypeScript:

```typescript
import * as ExcelJS from 'exceljs';
// o, si esModuleInterop está activo:
import ExcelJS from 'exceljs';
```

> ExcelJS incluye sus propios tipos (`.d.ts`), no se necesita `@types/exceljs`.

---

## Quick Start

```typescript
import * as ExcelJS from 'exceljs';

async function quickStart() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Datos');

  sheet.columns = [
    { header: 'Nombre', key: 'nombre', width: 20 },
    { header: 'Edad', key: 'edad', width: 10 },
  ];

  sheet.addRow({ nombre: 'Ana', edad: 30 });
  sheet.addRow({ nombre: 'Luis', edad: 25 });

  await workbook.xlsx.writeFile('salida.xlsx');
}

quickStart();
```

---

## 1. Crear un Workbook y Worksheets

```typescript
const workbook = new ExcelJS.Workbook();

// Metadatos del workbook (opcional pero recomendado en reportes)
workbook.creator = 'Mi App';
workbook.created = new Date();
workbook.modified = new Date();

// Agregar hoja
const sheet1 = workbook.addWorksheet('Resumen');

// Agregar hoja con opciones (orientación, vista congelada, color de pestaña)
const sheet2 = workbook.addWorksheet('Detalle', {
  properties: { tabColor: { argb: 'FF00FF00' } },
  pageSetup: { paperSize: 9, orientation: 'landscape' },
  views: [{ state: 'frozen', xSplit: 1, ySplit: 1 }],
});

// Acceder a una hoja existente
const sheetByName = workbook.getWorksheet('Resumen');
const sheetByIndex = workbook.getWorksheet(1); // 1-indexed
```

**IMPORTANTE:** ExcelJS es **1-indexed** para filas y columnas (igual que Excel), no 0-indexed como los arrays de JS. `sheet.getCell('A1')` es la esquina superior izquierda; `sheet.getRow(1)` es la primera fila.

---

## 2. Escribir datos

### 2.1 Definir columnas (recomendado para datos tabulares)

```typescript
sheet.columns = [
  { header: 'ID', key: 'id', width: 8 },
  { header: 'Producto', key: 'producto', width: 30 },
  { header: 'Precio', key: 'precio', width: 12, style: { numFmt: '#,##0.00' } },
];

// addRow acepta un objeto (mapea por "key") o un array (posicional)
sheet.addRow({ id: 1, producto: 'Teclado', precio: 49.99 });
sheet.addRow([2, 'Mouse', 19.99]); // también válido

// Agregar múltiples filas de una vez
sheet.addRows([
  { id: 3, producto: 'Monitor', precio: 199.99 },
  { id: 4, producto: 'Webcam', precio: 39.99 },
]);
```

### 2.2 Acceso directo a celdas

```typescript
sheet.getCell('A1').value = 'Título';
sheet.getCell(2, 1).value = 'Fila 2, Col 1'; // (row, col) también 1-indexed
sheet.getRow(3).getCell(1).value = 'Otra forma';

// Rangos
sheet.getRow(1).values = [, 'Col A', 'Col B', 'Col C']; // el primer elemento del array se ignora (índice 0)
```

### 2.3 Tipos de valores soportados

```typescript
cell.value = 'texto';
cell.value = 123.45;
cell.value = true;
cell.value = new Date(2026, 0, 15);          // fecha (requiere numFmt para mostrarse como fecha)
cell.value = { formula: 'A1+A2', result: 0 }; // fórmula con resultado en caché
cell.value = { richText: [
  { font: { bold: true }, text: 'Negrita ' },
  { text: 'normal' },
] };
cell.value = { text: 'Anthropic', hyperlink: 'https://anthropic.com' };
cell.value = null; // celda vacía
```

---

## 3. Leer archivos existentes

```typescript
const workbook = new ExcelJS.Workbook();
await workbook.xlsx.readFile('entrada.xlsx');

const sheet = workbook.getWorksheet('Datos');

// Iterar filas
sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
  row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    console.log(`Fila ${rowNumber}, Col ${colNumber}: ${cell.value}`);
  });
});

// Leer una celda puntual
const valor = sheet.getCell('B2').value;

// Convertir toda la hoja a un array de objetos (patrón común)
function sheetToObjects(sheet: ExcelJS.Worksheet): Record<string, ExcelJS.CellValue>[] {
  const headers: string[] = [];
  const rows: Record<string, ExcelJS.CellValue>[] = [];

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      row.eachCell((cell, col) => { headers[col] = String(cell.value ?? ''); });
      return;
    }
    const obj: Record<string, ExcelJS.CellValue> = {};
    row.eachCell({ includeEmpty: true }, (cell, col) => {
      obj[headers[col]] = cell.value;
    });
    rows.push(obj);
  });

  return rows;
}
```

Leer desde un `Buffer` (por ejemplo, un archivo subido en memoria):

```typescript
await workbook.xlsx.load(bufferOrArrayBuffer);
```

---

## 4. Estilos

ExcelJS permite estilar por celda, fila o columna. **Las columnas definidas con `style` en `sheet.columns` solo aplican a celdas creadas después de definir la columna** — para aplicar estilo retroactivo a toda la columna, usa `sheet.getColumn(n).eachCell(...)`.

### 4.1 Fuente

```typescript
cell.font = {
  name: 'Calibri',
  size: 12,
  bold: true,
  italic: false,
  underline: true,
  color: { argb: 'FFFF0000' }, // rojo, formato ARGB (alfa+RGB)
};
```

### 4.2 Relleno (fill)

```typescript
cell.fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFFFFF00' }, // amarillo
};

// Degradado
cell.fill = {
  type: 'gradient',
  gradient: 'angle',
  degree: 0,
  stops: [
    { position: 0, color: { argb: 'FFFFFFFF' } },
    { position: 1, color: { argb: 'FF0000FF' } },
  ],
};
```

### 4.3 Bordes

```typescript
cell.border = {
  top: { style: 'thin', color: { argb: 'FF000000' } },
  left: { style: 'thin' },
  bottom: { style: 'double' },
  right: { style: 'thin' },
};
```

### 4.4 Alineación

```typescript
cell.alignment = {
  vertical: 'middle',
  horizontal: 'center',
  wrapText: true,
  indent: 1,
};
```

### 4.5 Formato numérico (`numFmt`)

```typescript
cell.numFmt = '#,##0.00';        // 1,234.56
cell.numFmt = '0.00%';           // porcentaje
cell.numFmt = '$#,##0.00';       // moneda
cell.numFmt = 'dd/mm/yyyy';      // fecha
cell.numFmt = 'dd/mm/yyyy hh:mm';// fecha y hora
cell.numFmt = '#,##0;[Red]-#,##0'; // negativos en rojo
```

### 4.6 Estilizar fila/columna completa

```typescript
sheet.getRow(1).font = { bold: true };
sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDDDDDD' } };
sheet.getRow(1).alignment = { horizontal: 'center' };

sheet.getColumn('C').numFmt = '#,##0.00';
sheet.getColumn(3).width = 15;
```

### 4.7 Altura de filas y ancho de columnas

```typescript
sheet.getRow(1).height = 25;
sheet.getColumn(1).width = 12; // en "caracteres", no píxeles

// Autoajuste manual (ExcelJS NO tiene autofit nativo)
sheet.columns.forEach((col) => {
  let maxLength = 10;
  col.eachCell?.({ includeEmpty: true }, (cell) => {
    const len = cell.value ? String(cell.value).length : 0;
    if (len > maxLength) maxLength = len;
  });
  col.width = maxLength + 2;
});
```

---

## 5. Fórmulas

```typescript
sheet.getCell('C1').value = { formula: 'A1+B1' };
sheet.getCell('C2').value = { formula: 'SUM(A1:A10)', result: 55 }; // "result" es opcional, es un caché
sheet.getCell('C3').value = { formula: 'IF(A1>10,"alto","bajo")' };

// Fórmulas con referencia a otra hoja
sheet.getCell('D1').value = { formula: "'Otra Hoja'!A1" };

// Fórmulas compartidas (shared formulas) — útil para rangos grandes
sheet.getCell('E2').value = {
  formula: 'C2*D2',
  shareType: 'shared',
  ref: 'E2:E100',
};
```

**Nota:** ExcelJS no *evalúa* fórmulas, solo las escribe. Excel (o la app que abra el archivo) las calcula al abrir. Si necesitas mostrar un valor sin abrir Excel, provee `result` manualmente.

---

## 6. Fusionar celdas (merge)

```typescript
sheet.mergeCells('A1:C1');
// o por coordenadas
sheet.mergeCells(1, 1, 1, 3); // (startRow, startCol, endRow, endCol)

// Al fusionar, solo la celda superior-izquierda conserva el valor;
// estilar esa celda es suficiente, pero para bordes en todo el rango
// hay que aplicar el borde celda por celda.
sheet.getCell('A1').value = 'Título Fusionado';
sheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
```

---

## 7. Filtros, paneles congelados y vistas

```typescript
// Autofiltro
sheet.autoFilter = 'A1:C1';

// Congelar encabezado (fila 1) y primera columna
sheet.views = [{ state: 'frozen', xSplit: 1, ySplit: 1 }];

// Solo congelar fila de encabezado
sheet.views = [{ state: 'frozen', ySplit: 1 }];

// Ocultar cuadrícula / mostrar en modo "pageBreakPreview", zoom, etc.
sheet.views = [{ showGridLines: false, zoomScale: 85 }];
```

---

## 8. Validación de datos (dropdowns, rangos)

```typescript
sheet.getCell('B2').dataValidation = {
  type: 'list',
  allowBlank: true,
  formulae: ['"Activo,Inactivo,Pendiente"'], // lista inline
  showErrorMessage: true,
  errorStyle: 'error',
  errorTitle: 'Valor inválido',
  error: 'Selecciona un valor de la lista',
};

// Lista desde un rango de celdas
sheet.getCell('B3').dataValidation = {
  type: 'list',
  formulae: ['Hoja2!$A$1:$A$5'],
};

// Validación numérica
sheet.getCell('C2').dataValidation = {
  type: 'whole',
  operator: 'between',
  formulae: [1, 100],
  showErrorMessage: true,
  error: 'Debe ser un número entre 1 y 100',
};
```

---

## 9. Formato condicional

```typescript
sheet.addConditionalFormatting({
  ref: 'C2:C100',
  rules: [
    {
      type: 'cellIs',
      operator: 'lessThan',
      formulae: [0],
      style: { font: { color: { argb: 'FFFF0000' } }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC7CE' } } },
      priority: 1,
    },
    {
      type: 'colorScale',
      cfvo: [{ type: 'min' }, { type: 'max' }],
      color: [{ argb: 'FFF8696B' }, { argb: 'FF63BE7B' }],
      priority: 2,
    },
  ],
});
```

---

## 10. Imágenes

```typescript
const imageId = workbook.addImage({
  filename: '/ruta/al/logo.png', // o { base64: '...', extension: 'png' } o { buffer, extension }
  extension: 'png',
});

// Anclada por celda (rango)
sheet.addImage(imageId, 'A1:B3');

// Anclada con posición y tamaño exactos (en píxeles, tl = top-left)
sheet.addImage(imageId, {
  tl: { col: 0, row: 0 },
  ext: { width: 200, height: 100 },
});
```

---

## 11. Múltiples hojas y navegación

```typescript
workbook.eachSheet((sheet, id) => {
  console.log(`Hoja ${id}: ${sheet.name}`);
});

// Reordenar / duplicar
const original = workbook.getWorksheet('Datos');
const copia = workbook.addWorksheet('Datos (copia)');
original.eachRow((row) => {
  copia.addRow(row.values as ExcelJS.CellValue[]);
});

// Eliminar hoja
workbook.removeWorksheet('Detalle'); // acepta nombre o id
```

---

## 12. Proteger hojas y libros

```typescript
await sheet.protect('miPassword', {
  selectLockedCells: true,
  selectUnlockedCells: true,
  formatCells: false,
});

// Desbloquear celdas específicas para edición (por defecto todas están "locked")
sheet.getCell('B2').protection = { locked: false };

// Proteger el workbook (estructura: no agregar/eliminar/reordenar hojas)
workbook.calcProperties.fullCalcOnLoad = true;
```

---

## 13. Guardar y exportar

```typescript
// A archivo
await workbook.xlsx.writeFile('salida.xlsx');

// A Buffer (útil para responder en un endpoint HTTP o subir a S3)
const buffer = await workbook.xlsx.writeBuffer();

// A stream (Node.js)
import { createWriteStream } from 'fs';
const stream = createWriteStream('salida.xlsx');
await workbook.xlsx.write(stream);
```

### CSV

```typescript
// Exportar una hoja a CSV
await sheet.csv.writeFile('salida.csv');
const csvBuffer = await sheet.csv.writeBuffer();

// Importar CSV a un workbook
const wb = new ExcelJS.Workbook();
const sheetFromCsv = await wb.csv.readFile('entrada.csv');
```

---

## 14. Archivos grandes: Streaming API

Para datasets grandes (decenas/cientos de miles de filas), usar la API estándar (`Workbook` en memoria) puede consumir demasiada RAM. ExcelJS ofrece un **streaming writer** que escribe fila por fila directamente a disco/stream.

```typescript
import * as ExcelJS from 'exceljs';
import { createWriteStream } from 'fs';

async function streamGrande() {
  const options = {
    stream: createWriteStream('reporte_grande.xlsx'),
    useStyles: true,
    useSharedStrings: true,
  };
  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter(options);
  const sheet = workbook.addWorksheet('Datos');

  sheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Valor', key: 'valor', width: 15 },
  ];

  for (let i = 1; i <= 500000; i++) {
    sheet.addRow({ id: i, valor: Math.random() * 1000 }).commit(); // .commit() libera la fila de memoria
  }

  sheet.commit();     // finaliza la hoja
  await workbook.commit(); // finaliza y cierra el archivo
}
```

**Reglas clave del streaming writer:**
- Llamar `.commit()` en cada fila (`row.commit()`) tan pronto se termina de escribir, para liberar memoria.
- Llamar `sheet.commit()` al terminar cada hoja y `workbook.commit()` al final — **sin esto el archivo queda corrupto/incompleto**.
- No se puede volver a leer/modificar filas ya "commiteadas".
- No soporta todas las features del modo normal (ej. formato condicional avanzado es limitado).

Para **lectura** de archivos grandes también existe un modo streaming:

```typescript
const workbookReader = new ExcelJS.stream.xlsx.WorkbookReader('entrada_grande.xlsx', {});

for await (const worksheetReader of workbookReader) {
  for await (const row of worksheetReader) {
    console.log(row.values);
  }
}
```

---

## 15. Errores comunes y buenas prácticas

| Problema | Causa típica | Solución |
|---|---|---|
| Estilo no se aplica a toda la columna | `sheet.columns[i].style` solo afecta celdas nuevas | Iterar con `getColumn(n).eachCell()` y asignar el estilo |
| Fecha se ve como número (ej. `45678`) | Falta `cell.numFmt` | Asignar `cell.numFmt = 'dd/mm/yyyy'` |
| Colores no se ven correctos | Falta el canal alfa | Usar formato **ARGB** de 8 hex, ej. `'FFFF0000'`, no `'FF0000'` |
| `getCell('A1')` fuera de rango / fila vacía inesperada | Confundir índice 0 con 1 | ExcelJS es 1-indexed en filas/columnas |
| Archivo corrupto al usar streaming | Falta `row.commit()`, `sheet.commit()` o `workbook.commit()` | Confirmar los 3 niveles de commit |
| Fórmula no muestra resultado al leer con otra librería | ExcelJS no calcula fórmulas | Proveer `result` explícito en `{ formula, result }` |
| `sheet.addRow(array)` desalinea columnas | El array es posicional, no por `key` | Usar objeto `{key: value}` si las columnas tienen `key` definido, o verificar el orden exacto del array |
| Merge pierde bordes en celdas no-ancla | Solo la celda top-left del merge "existe" visualmente para valor, pero el borde debe aplicarse celda por celda | Aplicar `.border` a cada celda del rango fusionado si se requiere borde completo |
| TypeScript se queja de tipos en `cell.value` | `CellValue` es un tipo unión amplio | Castear explícitamente o usar los tipos exportados (`ExcelJS.CellValue`, `ExcelJS.CellFormulaValue`, etc.) |

---

## Quick Reference

| Tarea | API |
|---|---|
| Crear workbook | `new ExcelJS.Workbook()` |
| Agregar hoja | `workbook.addWorksheet(name, opts?)` |
| Definir columnas | `sheet.columns = [{header, key, width}]` |
| Agregar fila | `sheet.addRow(obj \| array)` |
| Leer archivo | `await workbook.xlsx.readFile(path)` |
| Guardar archivo | `await workbook.xlsx.writeFile(path)` |
| Guardar en Buffer | `await workbook.xlsx.writeBuffer()` |
| Estilo de celda | `cell.font / cell.fill / cell.border / cell.alignment / cell.numFmt` |
| Fórmula | `cell.value = { formula: '...' }` |
| Fusionar celdas | `sheet.mergeCells('A1:C1')` |
| Congelar panel | `sheet.views = [{state:'frozen', ySplit:1}]` |
| Autofiltro | `sheet.autoFilter = 'A1:C1'` |
| Validación de datos | `cell.dataValidation = {...}` |
| Formato condicional | `sheet.addConditionalFormatting({...})` |
| Insertar imagen | `workbook.addImage(...)` + `sheet.addImage(id, range)` |
| Proteger hoja | `await sheet.protect(pass, opts)` |
| CSV export/import | `sheet.csv.writeFile()` / `workbook.csv.readFile()` |
| Streaming (archivos grandes) | `new ExcelJS.stream.xlsx.WorkbookWriter(opts)` |

## Next Steps

- Para reportes con muchas hojas repetitivas, considera generar una hoja "plantilla" y clonarla con `eachRow`/`addRow` como se muestra en la sección 11.
- Para archivos de más de ~50,000 filas, usar siempre la API de streaming (sección 14) para evitar problemas de memoria.
- Verificar siempre el formato ARGB (8 caracteres hex) al definir colores — es el error de estilo más común.
