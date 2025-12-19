import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NumberUtilService {

  /**
   * Parse string hoặc number thành integer với default value
   */
  tryParseInt(value: string | number, defaultValue: number = 0): number {
    // Nếu là string có dấu phẩy, remove trước
    if (typeof value === 'string') {
      value = value.replace(/,/g, '');
    }

    // Use Number() constructor to handle various inputs
    const parsed = Number(value);

    // Check if the result is a valid number and not NaN
    if (!isNaN(parsed) && isFinite(parsed)) {
      // Return integer value
      return Math.floor(parsed);
    }

    // If parsing fails, return the default value
    return defaultValue;
  }

  /**
   * Parse thành float với số thập phân
   */
  tryParseFloat(value: string | number, defaultValue: number = 0, decimals: number = 2): number {
    if (typeof value === 'string') {
      value = value.replace(/,/g, '');
    }

    const parsed = Number(value);

    if (!isNaN(parsed) && isFinite(parsed)) {
      return parseFloat(parsed.toFixed(decimals));
    }

    return defaultValue;
  }

  /**
   * Format number với dấu phẩy ngăn cách hàng nghìn
   */
  formatNumber(value: number | string, locale: string = 'en-US'): string {
    const num = this.tryParseInt(value);
    return num.toLocaleString(locale);
  }

  /**
   * Format currency VND
   */
  formatVND(value: number | string): string {
    const num = this.tryParseInt(value);
    return num.toLocaleString('vi-VN') + ' đ';
  }

  /**
   * Validate số có hợp lệ không
   */
  isValidNumber(value: any): boolean {
    const parsed = Number(value);
    return !isNaN(parsed) && isFinite(parsed);
  }

  /**
   * Clamp số trong khoảng min-max
   */
  clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Parse cost từ formatted string
   */
  parseCostFromInput(inputValue: string): number {
    // Remove tất cả ký tự không phải số
    const cleaned = inputValue.replace(/[^0-9]/g, '');
    return this.tryParseInt(cleaned);
  }

  /**
   * Format cost cho display
   */
  formatCost(cost: number): string {
    return this.formatNumber(cost);
  }
}











