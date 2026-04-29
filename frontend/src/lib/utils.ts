import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function exportToCSV(data: any[], filename: string) {
  if (!data || !data.length) {
    alert("No data available to export");
    return;
  }
  
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row => headers.map(fieldName => {
      let val = row[fieldName];
      // Handle null/undefined
      if (val === null || val === undefined) val = '';
      // Stringify objects/arrays
      if (typeof val === 'object') val = JSON.stringify(val);
      // Escape quotes and wrap in quotes to handle commas in values
      const escapedVal = String(val).replace(/"/g, '""');
      return `"${escapedVal}"`;
    }).join(','))
  ];
  
  const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
