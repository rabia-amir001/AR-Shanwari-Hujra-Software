/**
 * Universal High-Performance CSV & JSON Data Exporter
 * Supports UTF-8 BOM encoding for Excel Urdu support, field escaping, chunking, and progress tracking.
 */

export function sanitizeCsvValue(val) {
  if (val === null || val === undefined) return '""';
  let str = String(val);
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    str = '"' + str.replace(/"/g, '""') + '"';
  } else {
    str = '"' + str + '"';
  }
  return str;
}

export async function exportToCsv({ filename, headers, rows, onProgress = null, chunkSize = 1000 }) {
  if (!Array.isArray(headers) || !Array.isArray(rows)) {
    throw new Error('Headers and rows must be arrays.');
  }

  const cleanFilename = filename.endsWith('.csv') ? filename : filename + '.csv';
  const headerLine = headers.map(h => sanitizeCsvValue(typeof h === 'object' ? h.label : h)).join(',');
  const csvLines = [headerLine];

  const total = rows.length;
  if (total === 0) {
    const csvContent = '\uFEFF' + csvLines.join('\r\n');
    downloadBlob(csvContent, cleanFilename, 'text/csv;charset=utf-8;');
    if (onProgress) onProgress(0, 0, true);
    return;
  }

  const keys = headers.map(h => (typeof h === 'object' ? h.key : h));

  for (let i = 0; i < total; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    chunk.forEach(row => {
      const line = keys.map(k => {
        const val = typeof row === 'object' && row !== null ? row[k] : '';
        return sanitizeCsvValue(val);
      }).join(',');
      csvLines.push(line);
    });

    if (onProgress) {
      onProgress(Math.min(i + chunkSize, total), total, false);
      await new Promise(r => setTimeout(r, 0));
    }
  }

  const csvContent = '\uFEFF' + csvLines.join('\r\n');
  downloadBlob(csvContent, cleanFilename, 'text/csv;charset=utf-8;');

  if (onProgress) {
    onProgress(total, total, true);
  }
}

export function exportToJson({ filename, data }) {
  const cleanFilename = filename.endsWith('.json') ? filename : filename + '.json';
  const jsonStr = JSON.stringify(data, null, 2);
  downloadBlob(jsonStr, cleanFilename, 'application/json;charset=utf-8;');
}

function downloadBlob(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => window.URL.revokeObjectURL(url), 1000);
}
