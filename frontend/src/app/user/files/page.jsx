"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Folder, File, Upload, Plus, Trash2, Download, Search, 
  ChevronRight, HardDrive, Loader2, FileText, Image as ImageIcon,
  MoreVertical, X
} from "lucide-react";
import UserSidebar from '@/components/UserSidebar';

export default function FilesFoldersPage() {
  const { data: session } = useSession();
  const [files, setFiles] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null); // null means root
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: null, name: "Home" }]);
  
  const [totalSize, setTotalSize] = useState(0);
  const [maxStorage, setMaxStorage] = useState(50 * 1024 * 1024);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (session) {
      fetchFiles();
    }
  }, [session]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/user/files");
      const data = await res.json();
      if (data.success) {
        setFiles(data.files);
        setTotalSize(data.totalSize);
        setMaxStorage(data.maxStorage);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext)) return <ImageIcon className="text-indigo-500" size={24} />;
    if (['pdf', 'doc', 'docx', 'txt'].includes(ext)) return <FileText className="text-rose-500" size={24} />;
    return <File className="text-slate-500" size={24} />;
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    
    try {
      const formData = new FormData();
      formData.append("action", "create-folder");
      formData.append("name", newFolderName);
      formData.append("parentId", currentFolder || "null");

      const res = await fetch("/api/user/files", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (data.success) {
        setFiles(prev => [data.file, ...prev]);
        setShowNewFolderModal(false);
        setNewFolderName("");
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (totalSize + file.size > maxStorage) {
      alert("Storage limit exceeded! You can only store up to 50MB.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("action", "upload-file");
      formData.append("file", file);
      formData.append("parentId", currentFolder || "null");

      const res = await fetch("/api/user/files", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (data.success) {
        setFiles(prev => [data.file, ...prev]);
        setTotalSize(prev => prev + file.size);
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error(error);
      alert("Upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id, size) => {
    if (!confirm("Are you sure you want to delete this? Folders will delete all inner files too.")) return;
    try {
      const res = await fetch(`/api/user/files?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setFiles(prev => prev.filter(f => f._id !== id));
        fetchFiles(); // Re-fetch to get correct total size
      }
    } catch (error) {
      console.error(error);
    }
  };

  const navigateToFolder = (folderId, folderName) => {
    setCurrentFolder(folderId);
    setBreadcrumbs(prev => [...prev, { id: folderId, name: folderName }]);
  };

  const navigateToBreadcrumb = (index) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    setCurrentFolder(newBreadcrumbs[newBreadcrumbs.length - 1].id);
  };

  // Filter logic
  const currentFiles = files.filter(f => 
    f.parentId === currentFolder && 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const folders = currentFiles.filter(f => f.type === 'folder');
  const items = currentFiles.filter(f => f.type === 'file');

  const storagePercentage = Math.min((totalSize / maxStorage) * 100, 100);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#f8fafc]">
      <UserSidebar />
      
      <main className="flex-1 w-full p-4 sm:p-8 lg:p-10 mt-16 lg:mt-0 lg:ml-72 transition-all duration-300">
        <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">Files & Folders</h1>
            <p className="text-slate-500 font-medium">Manage your resumes, portfolios, and other documents securely.</p>
          </div>
          
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 w-full md:w-72">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5"><HardDrive size={14}/> Storage</span>
              <span className="text-xs font-black text-indigo-600">{formatBytes(totalSize)} / 50 MB</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${storagePercentage > 90 ? 'bg-rose-500' : 'bg-indigo-500'}`} 
                style={{ width: `${storagePercentage}%` }} 
              />
            </div>
            {storagePercentage > 90 && <p className="text-[10px] text-rose-500 font-bold mt-2">Almost full!</p>}
          </div>
        </div>

        {/* Toolbar Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm font-bold w-full md:w-auto overflow-x-auto no-scrollbar pb-2 md:pb-0">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <button 
                  onClick={() => navigateToBreadcrumb(idx)}
                  className={`whitespace-nowrap transition-colors ${idx === breadcrumbs.length - 1 ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
                >
                  {crumb.name}
                </button>
                {idx < breadcrumbs.length - 1 && <ChevronRight size={16} className="text-slate-300 flex-shrink-0" />}
              </React.Fragment>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-medium text-slate-700 focus:border-indigo-500 focus:ring-2 ring-indigo-500/20"
              />
            </div>
            
            <button 
              onClick={() => setShowNewFolderModal(true)}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 p-3 rounded-xl transition-all shadow-sm flex-shrink-0"
              title="New Folder"
            >
              <Plus size={20} />
            </button>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileUpload} 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl transition-all shadow-lg shadow-indigo-200 flex items-center gap-2 font-bold text-sm whitespace-nowrap"
            >
              {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
              Upload File
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <Loader2 size={40} className="animate-spin mb-4 text-indigo-500" />
              <p className="font-bold tracking-widest uppercase text-xs">Loading Files...</p>
            </div>
          ) : currentFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <Folder size={64} className="text-slate-200 mb-6" />
              <h3 className="text-xl font-black text-slate-700 mb-2">This folder is empty</h3>
              <p className="font-medium text-sm text-center max-w-sm">Upload files or create folders to keep your career documents organized here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Folders */}
              {folders.map(folder => (
                <div 
                  key={folder._id} 
                  onDoubleClick={() => navigateToFolder(folder._id, folder.name)}
                  className="group bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 p-5 rounded-2xl flex items-center justify-between cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Folder size={28} className="text-amber-400 fill-amber-100 flex-shrink-0" />
                    <span className="font-bold text-slate-700 truncate">{folder.name}</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(folder._id, 0); }} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-white rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              {/* Files */}
              {items.map(file => (
                <div key={file._id} className="group bg-white border border-slate-100 hover:border-indigo-200 p-5 rounded-2xl flex flex-col justify-between transition-all shadow-sm hover:shadow-md relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-indigo-50 transition-colors">
                      {getFileIcon(file.name)}
                    </div>
                    <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                      <a href={file.url} download target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg">
                        <Download size={16} />
                      </a>
                      <button onClick={() => handleDelete(file._id, file.size)} className="p-2 text-slate-400 hover:text-rose-500 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 truncate mb-1" title={file.name}>{file.name}</h4>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">{formatBytes(file.size)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* New Folder Modal */}
      <AnimatePresence>
        {showNewFolderModal && (
          <>
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200]" onClick={() => setShowNewFolderModal(false)} />
            <motion.div 
              initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} 
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white p-8 rounded-[2rem] shadow-2xl z-[201]"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-900">Create Folder</h3>
                <button onClick={() => setShowNewFolderModal(false)} className="text-slate-400 hover:text-slate-600 p-2"><X size={20}/></button>
              </div>
              <form onSubmit={handleCreateFolder}>
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Folder Name" 
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-800 focus:border-indigo-500 mb-6"
                />
                <button 
                  type="submit" 
                  disabled={!newFolderName.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-4 rounded-xl font-black transition-all active:scale-95 shadow-lg shadow-indigo-200"
                >
                  Create
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      </main>
    </div>
  );
}
