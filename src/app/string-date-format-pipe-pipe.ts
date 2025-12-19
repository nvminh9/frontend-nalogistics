import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stringDateFormatPipe',
  standalone: true
})
export class StringDateFormatPipePipe implements PipeTransform {
  
  transform(value: string | Date | null | undefined, format: string = 'yyyy-MM-dd'): string | null {
    // Kiểm tra giá trị đầu vào
    if (!value) return null;
    
    let date: Date;
    
    try {
      // Nếu đã là Date object
      if (value instanceof Date) {
        date = value;
      } 
      // Nếu là string
      else if (typeof value === 'string') {
        // Xử lý các định dạng string phổ biến
        date = this.parseStringToDate(value);
      }
      // Nếu là number (timestamp)
      else if (typeof value === 'number') {
        date = new Date(value);
      }
      else {
        return null;
      }
      
      // Kiểm tra date hợp lệ
      if (isNaN(date.getTime())) {
        return null;
      }
      
      // Format theo yêu cầu
      return this.formatDate(date, format);
      
    } catch (error) {
      console.warn('StringDateFormatPipe: Invalid date format', value);
      return null;
    }
  }
  
  /**
   * Parse string thành Date object
   * Hỗ trợ nhiều định dạng phổ biến
   */
  private parseStringToDate(dateString: string): Date {
    const cleanString = dateString.trim();
    
    // Định dạng dd/MM/yyyy hoặc dd-MM-yyyy
    const ddMMyyyyRegex = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/;
    const ddMMyyyyMatch = cleanString.match(ddMMyyyyRegex);
    if (ddMMyyyyMatch) {
      const [, day, month, year] = ddMMyyyyMatch;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    
    // Định dạng dd/MM/yy hoặc dd-MM-yy
    const ddMMyyyRegex = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})$/;
    const ddMMyyMatch = cleanString.match(ddMMyyyRegex);
    if (ddMMyyMatch) {
      const [, day, month, year] = ddMMyyMatch;
      const fullYear = parseInt(year) > 50 ? 1900 + parseInt(year) : 2000 + parseInt(year);
      return new Date(fullYear, parseInt(month) - 1, parseInt(day));
    }
    
    // Định dạng yyyy-MM-dd (ISO format)
    const yyyyMMddRegex = /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/;
    const yyyyMMddMatch = cleanString.match(yyyyMMddRegex);
    if (yyyyMMddMatch) {
      const [, year, month, day] = yyyyMMddMatch;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    
    // Định dạng dd/MM/yyyy HH:mm:ss hoặc dd-MM-yyyy HH:mm:ss
    const ddMMyyyyTimeRegex = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/;
    const ddMMyyyyTimeMatch = cleanString.match(ddMMyyyyTimeRegex);
    if (ddMMyyyyTimeMatch) {
      const [, day, month, year, hour, minute, second] = ddMMyyyyTimeMatch;
      return new Date(
        parseInt(year), 
        parseInt(month) - 1, 
        parseInt(day),
        parseInt(hour),
        parseInt(minute),
        parseInt(second || '0')
      );
    }
    
    // Định dạng MM/dd/yyyy (US format)
    const MMddyyyyRegex = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/;
    if (cleanString.includes('/') && cleanString.split('/').length === 3) {
      // Thử parse theo US format nếu không match với VN format
      try {
        const usDate = new Date(cleanString);
        if (!isNaN(usDate.getTime())) {
          return usDate;
        }
      } catch (e) {
        // Ignore và tiếp tục
      }
    }
    
    // Thử parse trực tiếp với Date constructor
    const directParse = new Date(cleanString);
    if (!isNaN(directParse.getTime())) {
      return directParse;
    }
    
    throw new Error(`Cannot parse date string: ${dateString}`);
  }
  
  /**
   * Format Date object thành string theo định dạng yêu cầu
   */
  private formatDate(date: Date, format: string): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    switch (format.toLowerCase()) {
      case 'yyyy-mm-dd':
      case 'iso':
        return `${year}-${month}-${day}`;
        
      case 'dd/mm/yyyy':
      case 'vn':
        return `${day}/${month}/${year}`;
        
      case 'dd-mm-yyyy':
        return `${day}-${month}-${year}`;
        
      case 'mm/dd/yyyy':
      case 'us':
        return `${month}/${day}/${year}`;
        
      case 'yyyy-mm-dd hh:mm':
      case 'datetime':
        return `${year}-${month}-${day} ${hours}:${minutes}`;
        
      case 'yyyy-mm-dd hh:mm:ss':
      case 'full':
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        
      case 'dd/mm/yyyy hh:mm':
      case 'vn-time':
        return `${day}/${month}/${year} ${hours}:${minutes}`;
        
      case 'input-date':
      case 'html-date':
        // Định dạng cho HTML input type="date" (yyyy-MM-dd)
        return `${year}-${month}-${day}`;
        
      case 'input-datetime':
      case 'html-datetime':
        // Định dạng cho HTML input type="datetime-local" (yyyy-MM-ddTHH:mm)
        return `${year}-${month}-${day}T${hours}:${minutes}`;
        
      case 'input-time':
      case 'html-time':
        // Định dạng cho HTML input type="time" (HH:mm)
        return `${hours}:${minutes}`;
        
      default:
        // Mặc định trả về yyyy-MM-dd
        return `${year}-${month}-${day}`;
    }
  }
}