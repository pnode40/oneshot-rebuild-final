declare module 'react-qr-code' {
  import React from 'react';
  
  interface QRCodeProps {
    value: string;
    size?: number;
    level?: 'L' | 'M' | 'Q' | 'H';
    bgColor?: string;
    fgColor?: string;
    style?: React.CSSProperties;
    includeMargin?: boolean;
    marginSize?: number;
    title?: string;
    viewBox?: string;
  }
  
  const QRCode: React.FC<QRCodeProps>;
  
  export default QRCode;
} 