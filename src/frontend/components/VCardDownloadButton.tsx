import React from 'react';

export function VCardDownloadButton({ userId }: { userId: number }) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `/api/vcard/${userId}`;
    link.download = '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button 
      onClick={handleDownload} 
      className="bg-green-600 text-white px-4 py-2 rounded mt-4 hover:bg-green-700 transition-colors"
    >
      Download vCard
    </button>
  );
} 