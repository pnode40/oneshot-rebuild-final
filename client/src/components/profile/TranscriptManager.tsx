import React, { useState, useEffect, useRef } from 'react';
import {
  FaPlus,
  FaTrash,
  FaDownload,
  FaEye,
  FaUpload,
  FaFileAlt,
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
  FaShieldAlt,
  FaClock,
  FaGraduationCap,
  FaCalendarAlt,
  FaSchool
} from 'react-icons/fa';
import { MdCloudUpload, MdVerified, MdPending } from 'react-icons/md';

interface Transcript {
  id: string;
  filename: string;
  originalFilename: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verificationNotes?: string;
  academicYear: string;
  semester: string;
  gpa?: number;
  totalCredits?: number;
  schoolName: string;
  isOfficial: boolean;
}

interface TranscriptManagerProps {
  athleteProfileId: string;
  isOwner: boolean;
  maxTranscripts?: number;
}

const TranscriptManager: React.FC<TranscriptManagerProps> = ({ 
  athleteProfileId, 
  isOwner, 
  maxTranscripts = 3 
}) => {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedTranscript, setSelectedTranscript] = useState<string | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Form state for transcript metadata
  const [formData, setFormData] = useState({
    academicYear: '',
    semester: '',
    gpa: '',
    totalCredits: '',
    schoolName: '',
    isOfficial: false
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTranscripts();
  }, [athleteProfileId]);

  const fetchTranscripts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/athlete/${athleteProfileId}/transcripts`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch transcripts: ${response.status}`);
      }

      const result = await response.json();
      setTranscripts(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transcripts');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type (PDF only for transcripts)
    if (file.type !== 'application/pdf') {
      setError('Please select a PDF file for transcript upload');
      return;
    }

    // Validate file size (10MB limit for transcripts)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    // Check transcript limit
    if (transcripts.length >= maxTranscripts) {
      setError(`Maximum ${maxTranscripts} transcripts allowed`);
      return;
    }

    setShowUploadForm(true);
  };

  const uploadTranscript = async (file: File) => {
    try {
      setUploading(true);
      setError(null);

      const formDataToSend = new FormData();
      formDataToSend.append('transcript', file);
      formDataToSend.append('academicYear', formData.academicYear);
      formDataToSend.append('semester', formData.semester);
      formDataToSend.append('schoolName', formData.schoolName);
      formDataToSend.append('isOfficial', formData.isOfficial.toString());
      
      if (formData.gpa) {
        formDataToSend.append('gpa', formData.gpa);
      }
      if (formData.totalCredits) {
        formDataToSend.append('totalCredits', formData.totalCredits);
      }

      const response = await fetch(`/api/athlete/${athleteProfileId}/transcripts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload transcript: ${response.status}`);
      }

      const result = await response.json();
      setTranscripts([...transcripts, result.data]);
      setShowUploadForm(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload transcript');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteTranscript = async (transcriptId: string) => {
    if (!confirm('Are you sure you want to delete this transcript?')) {
      return;
    }

    try {
      setError(null);

      const response = await fetch(`/api/athlete/${athleteProfileId}/transcripts/${transcriptId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete transcript: ${response.status}`);
      }

      setTranscripts(transcripts.filter(transcript => transcript.id !== transcriptId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete transcript');
    }
  };

  const handleDownloadTranscript = async (transcript: Transcript) => {
    try {
      const response = await fetch(`/api/athlete/${athleteProfileId}/transcripts/${transcript.id}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to download transcript: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = transcript.originalFilename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download transcript');
    }
  };

  const resetForm = () => {
    setFormData({
      academicYear: '',
      semester: '',
      gpa: '',
      totalCredits: '',
      schoolName: '',
      isOfficial: false
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const getVerificationStatusIcon = (status: Transcript['verificationStatus']) => {
    switch (status) {
      case 'verified':
        return <MdVerified className="text-green-500" />;
      case 'pending':
        return <MdPending className="text-yellow-500" />;
      case 'rejected':
        return <FaTimes className="text-red-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const getVerificationStatusColor = (status: Transcript['verificationStatus']) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isFormValid = () => {
    return formData.academicYear.trim() && 
           formData.semester.trim() && 
           formData.schoolName.trim();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FaGraduationCap className="text-2xl text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">Academic Transcripts</h2>
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
            {transcripts.length}/{maxTranscripts}
          </span>
        </div>
        {isOwner && transcripts.length < maxTranscripts && (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            <FaPlus className="w-4 h-4" />
            <span>{uploading ? 'Uploading...' : 'Upload Transcript'}</span>
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <FaExclamationTriangle className="text-red-500 mr-3" />
            <div>
              <h3 className="text-red-800 font-medium">Error</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Area */}
      {isOwner && transcripts.length < maxTranscripts && !showUploadForm && (
        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver
              ? 'border-purple-500 bg-purple-50'
              : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
          }`}
        >
          <MdCloudUpload className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Upload Academic Transcript</h3>
          <p className="mt-1 text-sm text-gray-500">
            Drag and drop your PDF transcript here, or click to browse
          </p>
          <p className="mt-1 text-xs text-gray-400">
            PDF files only, up to 10MB
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
          >
            <FaUpload className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading...' : 'Choose File'}
          </button>
        </div>
      )}

      {/* Upload Form */}
      {showUploadForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Transcript Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Academic Year *
              </label>
              <input
                type="text"
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="e.g., 2023-2024"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Semester *
              </label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">Select Semester</option>
                <option value="Fall">Fall</option>
                <option value="Spring">Spring</option>
                <option value="Summer">Summer</option>
                <option value="Full Year">Full Year</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                School Name *
              </label>
              <input
                type="text"
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="e.g., Lincoln High School"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GPA
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="4.0"
                value={formData.gpa}
                onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="e.g., 3.75"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Credits
              </label>
              <input
                type="number"
                min="0"
                value={formData.totalCredits}
                onChange={(e) => setFormData({ ...formData, totalCredits: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="e.g., 24"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isOfficial"
                checked={formData.isOfficial}
                onChange={(e) => setFormData({ ...formData, isOfficial: e.target.checked })}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="isOfficial" className="ml-2 block text-sm text-gray-900">
                Official Transcript
              </label>
            </div>
          </div>
          <div className="flex items-center justify-end space-x-3 mt-6">
            <button
              onClick={() => {
                setShowUploadForm(false);
                resetForm();
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                const fileInput = fileInputRef.current;
                if (fileInput?.files?.[0]) {
                  uploadTranscript(fileInput.files[0]);
                }
              }}
              disabled={!isFormValid() || uploading}
              className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FaUpload className="w-4 h-4" />
              <span>{uploading ? 'Uploading...' : 'Upload Transcript'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Transcript List */}
      {transcripts.length === 0 ? (
        <div className="text-center py-12">
          <FaFileAlt className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No transcripts yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            {isOwner ? 'Upload your first transcript to get started' : 'No transcripts have been uploaded yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {transcripts.map((transcript) => (
            <div
              key={transcript.id}
              className={`bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow ${
                selectedTranscript === transcript.id ? 'ring-2 ring-purple-500' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <FaFileAlt className="text-purple-600 text-xl" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {transcript.academicYear} - {transcript.semester}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {getVerificationStatusIcon(transcript.verificationStatus)}
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getVerificationStatusColor(transcript.verificationStatus)}`}>
                        {transcript.verificationStatus.charAt(0).toUpperCase() + transcript.verificationStatus.slice(1)}
                      </span>
                      {transcript.isOfficial && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <FaShieldAlt className="w-3 h-3 mr-1" />
                          Official
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-2">
                      <FaSchool className="text-gray-400" />
                      <span>{transcript.schoolName}</span>
                    </div>
                    {transcript.gpa && (
                      <div className="flex items-center space-x-2">
                        <FaGraduationCap className="text-gray-400" />
                        <span>GPA: {transcript.gpa}</span>
                      </div>
                    )}
                    {transcript.totalCredits && (
                      <div className="flex items-center space-x-2">
                        <FaCalendarAlt className="text-gray-400" />
                        <span>{transcript.totalCredits} Credits</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <FaClock className="text-gray-400" />
                      <span>{formatFileSize(transcript.fileSize)}</span>
                    </div>
                  </div>

                  {transcript.verificationNotes && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <p className="text-sm text-gray-700">
                        <strong>Verification Notes:</strong> {transcript.verificationNotes}
                      </p>
                    </div>
                  )}

                  <div className="text-xs text-gray-500">
                    Uploaded {new Date(transcript.uploadedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => setSelectedTranscript(selectedTranscript === transcript.id ? null : transcript.id)}
                    className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                    title="View details"
                  >
                    <FaEye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDownloadTranscript(transcript)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Download transcript"
                  >
                    <FaDownload className="w-4 h-4" />
                  </button>
                  {isOwner && (
                    <button
                      onClick={() => handleDeleteTranscript(transcript.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete transcript"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {selectedTranscript === transcript.id && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">Transcript Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="block font-medium text-gray-700">Original Filename</label>
                      <p className="text-gray-900">{transcript.originalFilename}</p>
                    </div>
                    <div>
                      <label className="block font-medium text-gray-700">File Size</label>
                      <p className="text-gray-900">{formatFileSize(transcript.fileSize)}</p>
                    </div>
                    <div>
                      <label className="block font-medium text-gray-700">Upload Date</label>
                      <p className="text-gray-900">
                        {new Date(transcript.uploadedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div>
                      <label className="block font-medium text-gray-700">Verification Status</label>
                      <div className="flex items-center space-x-2">
                        {getVerificationStatusIcon(transcript.verificationStatus)}
                        <span className="text-gray-900">
                          {transcript.verificationStatus.charAt(0).toUpperCase() + transcript.verificationStatus.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TranscriptManager; 