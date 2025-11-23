declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf';

  interface AutoTableOptions {
    head?: any[][];
    body?: any[][];
    startY?: number;
    styles?: any;
    headStyles?: any;
    alternateRowStyles?: any;
    margin?: { top?: number; right?: number; bottom?: number; left?: number };
    theme?: 'striped' | 'grid' | 'plain';
  }

  function autoTable(doc: jsPDF, options: AutoTableOptions): void;

  export default autoTable;
}
