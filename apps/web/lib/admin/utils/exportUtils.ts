import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { font } from '@/lib/admin/fonts/amiri-regular';

// Extend jsPDF types
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface ExportColumn {
  key: string;
  label: string;
  width?: number;
}

interface ExportOptions {
  filename: string;
  sheetName?: string;
  title?: string;
  subtitle?: string;
  rtl?: boolean;
  author?: string;
  date?: boolean;
}

/**
 * تصدير البيانات إلى Excel
 */
export function exportToExcel(
  data: any[],
  columns: ExportColumn[],
  options: ExportOptions
) {
  try {
    // إنشاء workbook جديد
    const wb = XLSX.utils.book_new();

    // تحضير البيانات
    const headers = columns.map(col => col.label);
    const rows = data.map(item => 
      columns.map(col => {
        const value = item[col.key];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        return value;
      })
    );

    // إضافة المعلومات الأساسية
    const sheetData = [];
    
    if (options.title) {
      sheetData.push([options.title]);
      sheetData.push([]); // سطر فارغ
    }
    
    if (options.subtitle) {
      sheetData.push([options.subtitle]);
      sheetData.push([]); // سطر فارغ
    }
    
    if (options.date) {
      sheetData.push([`التاريخ: ${new Date().toLocaleDateString('ar-LY')}`]);
      sheetData.push([]); // سطر فارغ
    }

    // إضافة الهيدر والبيانات
    sheetData.push(headers);
    sheetData.push(...rows);

    // إضافة معلومات الملخص
    sheetData.push([]); // سطر فارغ
    sheetData.push([`إجمالي السجلات: ${data.length}`]);
    sheetData.push([`تاريخ التصدير: ${new Date().toLocaleString('ar-LY')}`]);

    // إنشاء ورقة العمل
    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // تحديد عرض الأعمدة
    const colWidths = columns.map(col => ({ wch: col.width || 15 }));
    ws['!cols'] = colWidths;

    // إضافة الورقة للملف
    XLSX.utils.book_append_sheet(wb, ws, options.sheetName || 'البيانات');

    // تصدير الملف
    XLSX.writeFile(wb, `${options.filename}.xlsx`);

    return true;
  } catch (error) {
    console.error('Excel export error:', error);
    return false;
  }
}

/**
 * تصدير البيانات إلى PDF
 */
export function exportToPDF(
  data: any[],
  columns: ExportColumn[],
  options: ExportOptions
) {
  try {
    // إنشاء مستند PDF جديد
    const doc = new jsPDF({
      orientation: columns.length > 6 ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // إضافة الخط العربي
    doc.addFileToVFS('Amiri-Regular.ttf', font);
    doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    doc.setFont('Amiri');
    doc.setR2L(true);

    // إضافة العنوان
    if (options.title) {
      doc.setFontSize(18);
      doc.text(options.title, doc.internal.pageSize.width / 2, 20, {
        align: 'center',
      });
    }

    // إضافة العنوان الفرعي
    if (options.subtitle) {
      doc.setFontSize(12);
      doc.text(options.subtitle, doc.internal.pageSize.width / 2, 30, {
        align: 'center',
      });
    }

    // إضافة التاريخ
    if (options.date) {
      doc.setFontSize(10);
      doc.text(
        `التاريخ: ${new Date().toLocaleDateString('ar-LY')}`,
        doc.internal.pageSize.width - 20,
        40,
        { align: 'right' }
      );
    }

    // تحضير بيانات الجدول
    const headers = columns.map(col => col.label);
    const rows = data.map(item =>
      columns.map(col => {
        const value = item[col.key];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
      })
    );

    // إضافة الجدول
    doc.autoTable({
      head: [headers],
      body: rows,
      startY: options.title ? 50 : 20,
      styles: {
        font: 'Amiri',
        fontSize: 10,
        cellPadding: 3,
        halign: 'right',
      },
      headStyles: {
        fillColor: [15, 23, 42], // #0F172A
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { top: 10, right: 10, bottom: 10, left: 10 },
      didDrawPage: (data: any) => {
        // إضافة رقم الصفحة
        const pageCount = doc.internal.pages.length - 1;
        doc.setFontSize(8);
        doc.text(
          `صفحة ${data.pageNumber} من ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      },
    });

    // إضافة معلومات الملخص في النهاية
    const finalY = (doc as any).lastAutoTable.finalY || 50;
    doc.setFontSize(10);
    doc.text(
      `إجمالي السجلات: ${data.length}`,
      20,
      finalY + 10
    );
    doc.text(
      `تاريخ التصدير: ${new Date().toLocaleString('ar-LY')}`,
      20,
      finalY + 20
    );

    if (options.author) {
      doc.text(
        `تم التصدير بواسطة: ${options.author}`,
        20,
        finalY + 30
      );
    }

    // حفظ الملف
    doc.save(`${options.filename}.pdf`);

    return true;
  } catch (error) {
    console.error('PDF export error:', error);
    return false;
  }
}

/**
 * تصدير البيانات إلى CSV
 */
export function exportToCSV(
  data: any[],
  columns: ExportColumn[],
  options: ExportOptions
) {
  try {
    // إعداد BOM لدعم UTF-8
    const BOM = '\uFEFF';
    
    // تحضير الهيدر
    const headers = columns.map(col => col.label).join(',');
    
    // تحضير الصفوف
    const rows = data.map(item => {
      return columns.map(col => {
        const value = item[col.key];
        if (value === null || value === undefined) return '""';
        
        // معالجة القيم الخاصة
        let processed = String(value);
        
        // إذا كانت القيمة تحتوي على فاصلة أو اقتباس أو سطر جديد
        if (processed.includes(',') || processed.includes('"') || processed.includes('\n')) {
          // استبدال الاقتباسات المزدوجة
          processed = processed.replace(/"/g, '""');
          // وضع القيمة بين اقتباسات
          processed = `"${processed}"`;
        }
        
        return processed;
      }).join(',');
    }).join('\n');
    
    // دمج كل شيء
    let csvContent = BOM;
    
    if (options.title) {
      csvContent += `"${options.title}"\n\n`;
    }
    
    if (options.subtitle) {
      csvContent += `"${options.subtitle}"\n\n`;
    }
    
    if (options.date) {
      csvContent += `"التاريخ: ${new Date().toLocaleDateString('ar-LY')}"\n\n`;
    }
    
    csvContent += headers + '\n' + rows;
    
    // إضافة معلومات الملخص
    csvContent += `\n\n"إجمالي السجلات: ${data.length}"`;
    csvContent += `\n"تاريخ التصدير: ${new Date().toLocaleString('ar-LY')}"`;
    
    // إنشاء Blob وتحميله
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${options.filename}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error('CSV export error:', error);
    return false;
  }
}

/**
 * تصدير البيانات بالصيغة المطلوبة
 */
export function exportData(
  format: 'excel' | 'pdf' | 'csv',
  data: any[],
  columns: ExportColumn[],
  options: ExportOptions
) {
  switch (format) {
    case 'excel':
      return exportToExcel(data, columns, options);
    case 'pdf':
      return exportToPDF(data, columns, options);
    case 'csv':
      return exportToCSV(data, columns, options);
    default:
      console.error('Unsupported export format:', format);
      return false;
  }
}
