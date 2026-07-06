"use client";
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/Serviceprovidersidbar';
import { Folder, File, Plus, Grid, List, Trash2, ChevronRight, FileText, ImageIcon, Music, Video, ArrowLeft, HardDrive } from 'lucide-react';

export default function FilesPage() {
    const [viewMode, setViewMode] = useState("grid");
    const [files, setFiles] = useState([]);
    const [storage, setStorage] = useState({ storageUsed: 0, storageLimit: 100 });
    const [loading, setLoading] = useState(true);
    const [currentFolder, setCurrentFolder] = useState(null);
    const [folderPath, setFolderPath] = useState([]);
    const [showNewFolderModal, setShowNewFolderModal] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [uploading, setUploading] = useState(false);

    const fetchFiles = async (parentId = null) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/files?parentId=${parentId || 'null'}`);
            const data = await res.json();
            if (data.ok) {
                setFiles(data.data);
                if (data.storage) setStorage(data.storage);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles(currentFolder);
    }, [currentFolder]);

    const fileInputRef = useRef(null);

    const handleUploadClick = () => {
        if (storage.storageUsed >= storage.storageLimit) {
            return alert("Storage limit reached! Please upgrade to get more space.");
        }
        fileInputRef.current?.click();
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const simulatedUrl = `/uploads/${file.name}`;
            const res = await fetch('/api/files', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: file.name,
                    type: 'file',
                    size: file.size,
                    url: simulatedUrl,
                    parentId: currentFolder,
                    mimetype: file.type
                })
            });

            const data = await res.json();
            if (data.ok) {
                alert(`File "${file.name}" uploaded successfully.`);
                fetchFiles(currentFolder);
            } else {
                alert(data.error || "Upload failed");
            }
        } catch (error) {
            alert("Connection error during upload");
        } finally {
            setUploading(false);
        }
    };

    const createFolder = async () => {
        if (!newFolderName) return;
        try {
            const res = await fetch('/api/files', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newFolderName,
                    type: 'folder',
                    parentId: currentFolder
                })
            });
            if (res.ok) {
                setShowNewFolderModal(false);
                setNewFolderName("");
                fetchFiles(currentFolder);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const deleteItem = async (id) => {
        if (!confirm("Are you sure you want to delete this?")) return;
        try {
            const res = await fetch(`/api/files?id=${id}`, { method: 'DELETE' });
            if (res.ok) fetchFiles(currentFolder);
        } catch (error) {
            console.error(error);
        }
    };

    const navigateToFolder = (folder) => {
        setFolderPath([...folderPath, { id: folder._id, name: folder.name }]);
        setCurrentFolder(folder._id);
    };

    const navigateBack = () => {
        const newPath = [...folderPath];
        newPath.pop();
        setFolderPath(newPath);
        setCurrentFolder(newPath.length > 0 ? newPath[newPath.length - 1].id : null);
    };

    const getFileIcon = (mimetype) => {
        if (mimetype?.includes('pdf')) return <FileText size={24} />;
        if (mimetype?.includes('image')) return <ImageIcon size={24} />;
        if (mimetype?.includes('video')) return <Video size={24} />;
        if (mimetype?.includes('audio')) return <Music size={24} />;
        return <File size={24} />;
    };

    const formatSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const storagePercent = Math.min((storage.storageUsed / storage.storageLimit) * 100, 100);

    return (
        <div className="flex min-h-screen bg-[#FDFEFF]">
            <Sidebar activePage="files" />
            
            <main className="flex-1 p-4 lg:p-10">
                <div className="max-w-7xl mx-auto space-y-10">
                    
                    {/* Header */}
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                                {currentFolder && (
                                    <button onClick={navigateBack} className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all">
                                        <ArrowLeft size={20} />
                                    </button>
                                )}
                                Files & Folder
                            </h1>
                            <div className="flex items-center gap-2 mt-2 text-slate-400 font-bold text-sm">
                                <span className="hover:text-indigo-600 cursor-pointer" onClick={() => {setCurrentFolder(null); setFolderPath([]);}}>Root</span>
                                {folderPath.map((p) => (
                                    <React.Fragment key={p.id}>
                                        <ChevronRight size={14} />
                                        <span className="hover:text-indigo-600 cursor-pointer" onClick={() => {
                                            const idxInPath = folderPath.findIndex(x => x.id === p.id);
                                            const newPath = folderPath.slice(0, idxInPath + 1);
                                            setFolderPath(newPath);
                                            setCurrentFolder(p.id);
                                        }}>
                                            {p.name}
                                        </span>
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setShowNewFolderModal(true)} className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-6 py-4 rounded-[24px] font-black hover:bg-indigo-100 transition-all">
                                <Folder size={20} /> New Folder
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                            <button onClick={handleUploadClick} disabled={uploading} className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-[24px] font-black shadow-xl shadow-slate-200 hover:-translate-y-1 transition-all">
                                {uploading ? "Uploading..." : <><Plus size={20} /> Upload File</>}
                            </button>
                        </div>
                    </header>

                    {/* Storage Info */}
                    <div className="bg-slate-900 rounded-[40px] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl">
                        <div className="flex-1 w-full space-y-3">
                            <div className="flex justify-between items-center text-sm font-bold">
                                <span className="flex items-center gap-2">
                                    <HardDrive size={16} className="text-indigo-400" />
                                    Storage Used ({storagePercent.toFixed(1)}%)
                                </span>
                                <span className="text-indigo-400">
                                    {storage.storageUsed.toFixed(2)} MB / {storage.storageLimit} MB
                                </span>
                            </div>
                            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)] ${storagePercent > 90 ? 'bg-rose-500' : 'bg-indigo-500'}`}
                                    style={{ width: `${storagePercent}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="shrink-0">
                            <button className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">Upgrade Plan</button>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center px-2">
                            <h3 className="text-2xl font-black text-slate-900">{loading ? "Synchronizing..." : files.length > 0 ? "Items" : "No Items"}</h3>
                            <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                                <button onClick={() => setViewMode("grid")} className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}><Grid size={18} /></button>
                                <button onClick={() => setViewMode("list")} className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}><List size={18} /></button>
                            </div>
                        </div>

                        {viewMode === "grid" ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {files.map((item) => (
                                    <div key={item._id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group cursor-pointer relative" onClick={() => item.type === 'folder' ? navigateToFolder(item) : null}>
                                        <button onClick={(e) => { e.stopPropagation(); deleteItem(item._id); }} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>
                                        <div className={`w-14 h-14 ${item.type === 'folder' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                            {item.type === 'folder' ? <Folder size={28} /> : getFileIcon(item.mimetype)}
                                        </div>
                                        <h4 className="text-lg font-black text-slate-900 mb-1 truncate">{item.name}</h4>
                                        <p className="text-slate-400 font-bold text-xs">{item.type === 'folder' ? "Folder" : formatSize(item.size)}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {files.map((item) => (
                                    <div key={item._id} className="bg-white p-5 rounded-3xl border border-slate-50 hover:border-indigo-100 transition-all flex items-center gap-6 group cursor-pointer" onClick={() => item.type === 'folder' ? navigateToFolder(item) : null}>
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.type === 'folder' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>{item.type === 'folder' ? <Folder size={20} /> : getFileIcon(item.mimetype)}</div>
                                        <div className="flex-1"><h4 className="font-bold text-slate-900">{item.name}</h4><p className="text-xs font-bold text-slate-400">{item.type === 'folder' ? 'Folder' : formatSize(item.size)}</p></div>
                                        <button onClick={(e) => { e.stopPropagation(); deleteItem(item._id); }} className="p-3 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18} /></button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!loading && files.length === 0 && (
                            <div className="py-20 text-center bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-200">
                                <Folder size={48} className="mx-auto mb-4 text-slate-200" />
                                <p className="text-slate-400 font-bold">No files here yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Modal */}
            {showNewFolderModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
                    <div className="bg-white rounded-[40px] p-10 w-full max-w-md shadow-2xl">
                        <h3 className="text-2xl font-black text-slate-900 mb-6">Create New Folder</h3>
                        <input type="text" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} placeholder="Folder Name" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold outline-none focus:ring-2 focus:ring-indigo-600 mb-8" autoFocus />
                        <div className="flex gap-4">
                            <button onClick={() => setShowNewFolderModal(false)} className="flex-1 py-4 rounded-2xl font-black text-slate-400 hover:bg-slate-50">Cancel</button>
                            <button onClick={createFolder} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl">Create</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
