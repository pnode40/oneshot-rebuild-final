import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

export function QRCodeBlock({ url }: { url: string }) {
  const handleDownload = () => {
    const canvas = document.getElementById('qr-gen') as HTMLCanvasElement;
    const pngUrl = canvas
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = 'oneshot-profile-qr.png';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <QRCodeCanvas
        id="qr-gen"
        value={url}
        size={200}
        bgColor="#ffffff"
        fgColor="#000000"
        level="H"
      />
      <button
        onClick={handleDownload}
        className="bg-indigo-600 text-white px-4 py-2 rounded mt-2 hover:bg-indigo-700 transition-colors"
      >
        Download QR Code
      </button>
    </div>
  );
} 