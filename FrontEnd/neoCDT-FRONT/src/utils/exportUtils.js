// Función para exportar a CSV
export const exportToCSV = async (data, filename) => {
  if (!data || !data.length) throw new Error('No hay datos para exportar');

  // Convertir objetos a CSV
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','), // encabezados
    ...data.map(row => headers.map(key => JSON.stringify(row[key] || '')).join(','))
  ].join('\n');

  // Crear blob y descargar
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Función para exportar a PDF
export const exportToPDF = async (data, filename) => {
  throw new Error('Exportación a PDF no implementada');
};