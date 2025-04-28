import React from 'react';

export function CoachVCardDownloadButton({ userId }: { userId: number }) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `/api/vcard/coach/${userId}`;
    link.download = '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button onClick={handleDownload} className="bg-gray-700 text-white px-4 py-2 rounded mt-2">
      Save Coach Contact
    </button>
  );
} 