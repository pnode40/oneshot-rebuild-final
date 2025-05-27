declare module 'vcf' {
  interface VCardProperties {
    [key: string]: any;
  }
  
  class VCF {
    constructor(data?: string);
    set(property: string, value: string | string[]): void;
    add(property: string, value: string, params?: Record<string, any>): void;
    get(property: string): any;
    toString(): string;
  }
  
  export = VCF;
} 