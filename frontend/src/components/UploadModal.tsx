import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File, Loader2, Trash2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadDocuments, getDocuments, deleteDocument } from '@/lib/api';

export default function UploadModal({ onUploadComplete }: { onUploadComplete: () => void }) {
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchDocs = async () => {
    try {
      const docs = await getDocuments();
      setUploadedDocs(docs || []);
    } catch (error) {
      console.error("Failed to fetch documents", error);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] }
  });

  const handleUpload = async () => {
    if (files.length === 0) return;
    setIsUploading(true);
    try {
      await uploadDocuments(files);
      setFiles([]);
      await fetchDocs();
      onUploadComplete();
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload documents.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm(`Are you sure you want to delete ${filename}?`)) return;
    setIsDeleting(filename);
    try {
      await deleteDocument(filename);
      await fetchDocs();
    } catch (error) {
      console.error("Delete failed", error);
      alert("Failed to delete document.");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="w-full">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-4">
          <UploadCloud className="w-12 h-12 text-muted-foreground" />
          <div className="space-y-1">
            <p className="text-lg font-semibold">Drag & Drop PDFs here</p>
            <p className="text-sm text-muted-foreground">or click to browse from your computer</p>
          </div>
        </div>
      </div>
      
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-lg border bg-card">
              <div className="flex items-center space-x-3">
                <File className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">{file.name}</span>
              </div>
              <span className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
          ))}
          <Button 
            className="w-full mt-4" 
            onClick={handleUpload} 
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing & Embedding...
              </>
            ) : (
              'Upload and Process'
            )}
          </Button>
        </div>
      )}
      
      {uploadedDocs.length > 0 && (
        <div className="mt-8 space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
            Currently in Database
          </h3>
          <div className="space-y-2">
            {uploadedDocs.map((doc, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                <div className="flex items-center space-x-3 truncate">
                  <File className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm font-medium truncate">{doc}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 text-destructive hover:bg-destructive/20 shrink-0"
                  onClick={() => handleDelete(doc)}
                  disabled={isDeleting === doc}
                >
                  {isDeleting === doc ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
