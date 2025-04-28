import { apiRequest } from '@/lib/apiRequest';
import { toast } from 'react-hot-toast';

export function ChecklistEmailButton({ userId }: { userId: number }) {
  const handleSendChecklist = async () => {
    const result = await apiRequest('/api/email/checklist', 'POST', { userId });

    if (result.success) {
      toast.success('Checklist Sent!');
    } else {
      toast.error('Failed to send checklist.');
    }
  };

  return (
    <button
      onClick={handleSendChecklist}
      className="bg-indigo-600 text-white px-6 py-2 rounded mt-4 hover:bg-indigo-700 transition-colors"
    >
      Send Me the Recruiting Checklist
    </button>
  );
} 