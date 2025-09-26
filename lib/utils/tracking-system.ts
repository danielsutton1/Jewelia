/**
 * Unified Tracking System for Jewelia CRM
 * 
 * This system ensures that the same numeric identifier flows through
 * the entire pipeline: Call Log → Quote → Order → Production
 * 
 * Format: [PREFIX]-[YEAR]-[SEQUENTIAL_NUMBER]
 * 
 * Examples:
 * - Call Log: CL-2024-0001
 * - Quote: Q-2024-0001
 * - Order: ORD-2024-0001
 * - Production: PRD-2024-0001
 */

export interface TrackingNumber {
  prefix: string;
  year: number;
  sequence: number;
  fullNumber: string;
}

export type TrackingPrefix = 'CL' | 'Q' | 'ORD' | 'PRD';

export class TrackingSystem {
  private static instance: TrackingSystem;
  private currentSequence: number = 0;
  private year: number = new Date().getFullYear();

  private constructor() {
    // Initialize with a starting sequence number
    // In production, this would be loaded from database
    this.currentSequence = 1000;
  }

  public static getInstance(): TrackingSystem {
    if (!TrackingSystem.instance) {
      TrackingSystem.instance = new TrackingSystem();
    }
    return TrackingSystem.instance;
  }

  /**
   * Generate a new tracking number for a call log
   */
  public generateCallLogNumber(): string {
    this.currentSequence++;
    return this.formatTrackingNumber('CL', this.currentSequence);
  }

  /**
   * Generate a tracking number for a quote based on call log number
   */
  public generateQuoteNumber(callLogNumber: string): string {
    const parsed = this.parseTrackingNumber(callLogNumber);
    return this.formatTrackingNumber('Q', parsed.sequence);
  }

  /**
   * Generate a tracking number for an order based on call log number
   */
  public generateOrderNumber(callLogNumber: string): string {
    const parsed = this.parseTrackingNumber(callLogNumber);
    return this.formatTrackingNumber('ORD', parsed.sequence);
  }

  /**
   * Generate a tracking number for production based on call log number
   */
  public generateProductionNumber(callLogNumber: string): string {
    const parsed = this.parseTrackingNumber(callLogNumber);
    return this.formatTrackingNumber('PRD', parsed.sequence);
  }

  /**
   * Parse a tracking number to extract its components
   */
  public parseTrackingNumber(trackingNumber: string): TrackingNumber {
    const match = trackingNumber.match(/^([A-Z]+)-(\d{4})-(\d{4})$/);
    if (!match) {
      throw new Error(`Invalid tracking number format: ${trackingNumber}`);
    }

    const [, prefix, yearStr, sequenceStr] = match;
    const year = parseInt(yearStr, 10);
    const sequence = parseInt(sequenceStr, 10);

    return {
      prefix: prefix as TrackingPrefix,
      year,
      sequence,
      fullNumber: trackingNumber,
    };
  }

  /**
   * Format a tracking number with the given prefix and sequence
   */
  private formatTrackingNumber(prefix: TrackingPrefix, sequence: number): string {
    return `${prefix}-${this.year}-${sequence.toString().padStart(4, '0')}`;
  }

  /**
   * Get all related tracking numbers for a given call log number
   */
  public getRelatedTrackingNumbers(callLogNumber: string): {
    callLog: string;
    quote: string;
    order: string;
    production: string;
  } {
    const parsed = this.parseTrackingNumber(callLogNumber);
    
    return {
      callLog: this.formatTrackingNumber('CL', parsed.sequence),
      quote: this.formatTrackingNumber('Q', parsed.sequence),
      order: this.formatTrackingNumber('ORD', parsed.sequence),
      production: this.formatTrackingNumber('PRD', parsed.sequence),
    };
  }

  /**
   * Validate if a tracking number follows the correct format
   */
  public isValidTrackingNumber(trackingNumber: string): boolean {
    try {
      this.parseTrackingNumber(trackingNumber);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get the base sequence number from any tracking number
   */
  public getBaseSequence(trackingNumber: string): number {
    const parsed = this.parseTrackingNumber(trackingNumber);
    return parsed.sequence;
  }

  /**
   * Check if two tracking numbers are related (same sequence)
   */
  public areRelated(trackingNumber1: string, trackingNumber2: string): boolean {
    try {
      const parsed1 = this.parseTrackingNumber(trackingNumber1);
      const parsed2 = this.parseTrackingNumber(trackingNumber2);
      return parsed1.sequence === parsed2.sequence && parsed1.year === parsed2.year;
    } catch {
      return false;
    }
  }

  /**
   * Get the next available sequence number
   */
  public getNextSequence(): number {
    return this.currentSequence + 1;
  }

  /**
   * Set the current sequence number (useful for database synchronization)
   */
  public setCurrentSequence(sequence: number): void {
    this.currentSequence = sequence;
  }

  /**
   * Get the current year
   */
  public getCurrentYear(): number {
    return this.year;
  }

  /**
   * Update the year (useful for year transitions)
   */
  public updateYear(newYear: number): void {
    this.year = newYear;
    this.currentSequence = 0; // Reset sequence for new year
  }
}

// Export singleton instance
export const trackingSystem = TrackingSystem.getInstance();

// Convenience functions
export const generateCallLogNumber = () => trackingSystem.generateCallLogNumber();
export const generateQuoteNumber = (callLogNumber: string) => trackingSystem.generateQuoteNumber(callLogNumber);
export const generateOrderNumber = (callLogNumber: string) => trackingSystem.generateOrderNumber(callLogNumber);
export const generateProductionNumber = (callLogNumber: string) => trackingSystem.generateProductionNumber(callLogNumber);
export const parseTrackingNumber = (trackingNumber: string) => trackingSystem.parseTrackingNumber(trackingNumber);
export const getRelatedTrackingNumbers = (callLogNumber: string) => trackingSystem.getRelatedTrackingNumbers(callLogNumber);
export const isValidTrackingNumber = (trackingNumber: string) => trackingSystem.isValidTrackingNumber(trackingNumber);
export const areRelated = (trackingNumber1: string, trackingNumber2: string) => trackingSystem.areRelated(trackingNumber1, trackingNumber2); 