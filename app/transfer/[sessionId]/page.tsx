'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { FileIcon, Trash2, Download, Upload, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface FileRecord {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  blobUrl: string;
  uploadedAt: number;
}

export default function TransferPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [files, setFiles] = useState<FileRecord[]>([]);
  const [code, setCode] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState('');

  // Initialize session and load files
  useEffect(() => {
    const initSession = async () => {
      try {
        const response = await fetch('/api/session/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: sessionId }),
        });

        if (response.ok) {
          const session = await response.json();
          setCode(session.code);
          setExpiresAt(session.expiresAt);
          setQrUrl(window.location.href);
          await pollFiles();
        }
      } catch (error) {
        console.error('Failed to initialize session:', error);
      } finally {
        setLoading(false);
      }
    };

    initSession();
  }, [sessionId]);

  // Poll for file changes
  useEffect(() => {
    const interval = setInterval(pollFiles, 5000);
    return () => clearInterval(interval);
  }, [sessionId]);

  // Update time remaining
  useEffect(() => {
    const interval = setInterval(() => {
      if (expiresAt) {
        const remaining = expiresAt - Date.now();
        if (remaining > 0) {
          const minutes = Math.floor(remaining / 60000);
          const seconds = Math.floor((remaining % 60000) / 1000);
          setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        } else {
          setTimeRemaining('Expired');
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const pollFiles = async () => {
    try {
      const response = await fetch('/api/files', {
        headers: { 'x-session-id': sessionId },
      });
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files);
      }
    } catch (error) {
      console.error('Failed to poll files:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.currentTarget.files;
    if (!fileList) return;

    setUploading(true);
    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'x-session-id': sessionId },
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          alert(`Failed to upload ${file.name}: ${error.error}`);
        }
      }
      await pollFiles();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      const response = await fetch('/api/files', {
        method: 'DELETE',
        headers: {
          'x-session-id': sessionId,
          'x-file-id': fileId,
        },
      });

      if (response.ok) {
        await pollFiles();
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleDownloadFile = async (file: FileRecord) => {
    try {
      const response = await fetch('/api/download', {
        method: 'GET',
        headers: {
          'x-session-id': sessionId,
          'x-file-id': file.id,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Download failed');
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed');
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">File Transfer</h1>
          <p className="text-slate-300">Transfer files up to 5MB between devices</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* QR Code Section */}
          <Card className="bg-slate-800 border-slate-700 p-6 flex flex-col items-center">
            <h2 className="text-lg font-semibold text-white mb-4">Scan QR Code</h2>
            {qrUrl && (
              <div className="bg-white p-4 rounded-lg">
                <QRCodeSVG value={qrUrl} size={200} />
              </div>
            )}
          </Card>

          {/* Numeric Code Section */}
          <Card className="bg-slate-800 border-slate-700 p-6 flex flex-col justify-center">
            <h2 className="text-lg font-semibold text-white mb-4">Connection Code</h2>
            <div className="bg-slate-700 rounded-lg p-4 mb-4">
              <p className="text-3xl font-bold text-blue-400 text-center tracking-widest">{code}</p>
            </div>
            <Button
              onClick={copyCode}
              variant="outline"
              className="bg-slate-700 border-slate-600 hover:bg-slate-600 text-white"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Code
                </>
              )}
            </Button>
          </Card>

          {/* Session Info */}
          <Card className="bg-slate-800 border-slate-700 p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Session Info</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-400">Time Remaining</p>
                  <p className="text-2xl font-bold text-orange-400">{timeRemaining}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Files Shared</p>
                  <p className="text-2xl font-bold text-green-400">{files.length}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Upload Section */}
        <Card className="bg-slate-800 border-slate-700 p-8 mb-8">
          <h2 className="text-xl font-semibold text-white mb-6">Upload Files</h2>
          <label className="block">
            <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition">
              <Upload className="w-12 h-12 mx-auto text-slate-400 mb-3" />
              <p className="text-white font-medium mb-1">Click or drag files here</p>
              <p className="text-slate-400 text-sm">Max 5MB per file</p>
            </div>
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
          {uploading && <p className="text-blue-400 text-center mt-4">Uploading...</p>}
        </Card>

        {/* Files Section */}
        {files.length > 0 && (
          <Card className="bg-slate-800 border-slate-700 p-8">
            <h2 className="text-xl font-semibold text-white mb-6">Available Files</h2>
            <div className="grid gap-3">
              {files.map(file => (
                <div
                  key={file.id}
                  className="flex items-center justify-between bg-slate-700 p-4 rounded-lg hover:bg-slate-600 transition"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <FileIcon className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-medium truncate">{file.name}</p>
                      <p className="text-sm text-slate-400">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      onClick={() => handleDownloadFile(file)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteFile(file.id)}
                      size="sm"
                      variant="destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
