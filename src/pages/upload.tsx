import React, { useRef, useState } from 'react';
const { ipcRenderer } = window.require('electron');

const Upload = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [uploadStatus, setUploadStatus] = useState('');
    const [includeIos, setIncludeIos] = useState(true);
    const [includeAndroid, setIncludeAndroid] = useState(true);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            updateFiles(Array.from(event.target.files));
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        if (event.dataTransfer.files) {
            updateFiles(Array.from(event.dataTransfer.files));
        }
    };

    const updateFiles = (newFiles: File[]) => {
        setFiles(newFiles);
        const previews = newFiles.map(file => URL.createObjectURL(file));
        setImagePreviews(previews);
    };

    const removeImage = (index: number) => {
        const newFiles = [...files];
        newFiles.splice(index, 1);
        updateFiles(newFiles);
    };

    const uploadImages = async () => {
        try {
            setUploadStatus('Processing...');
            // Convert FileList to array of file paths for Electron processing
            const filePaths = files.map(file => file.path);
            // Invoke the main process function via IPC
            await ipcRenderer.invoke('resize-and-zip-images', filePaths, includeIos, includeAndroid);
            setUploadStatus('Images processed successfully! Check your desktop.');
            setFiles([]);
            setImagePreviews([]);
        } catch (error) {
            setUploadStatus('Error during processing. Please try again.');
            console.error('Error processing files:', error);
        }
    };

    const inputRef = useRef<HTMLInputElement>(null);
    const focusInput = () => {
        inputRef.current?.click();
    };

    return (
        <div onClick={focusInput} className="container mx-auto p-4 cursor-pointer">
            <div className="upload-area border-dashed border-4 border-gray-200 p-4 text-center"
                onDragOver={handleDragOver}
                onDrop={handleDrop}>
                <input ref={inputRef} type="file" multiple onChange={handleFileChange} className="hidden" accept="image/*" />
                <p >Drag and drop your files here or click to select files</p>
                {imagePreviews.length > 0 && (
                    <div className="image-previews mt-4 flex justify-center gap-4 flex-wrap">
                        {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative">
                                <img src={preview} alt="Preview" className="w-24 h-24 object-cover" />
                                <button onClick={() => removeImage(index)} className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full">
                                    x
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <input
                        id="includeAndroid"
                        type="checkbox"
                        checked={includeAndroid}
                        onChange={() => setIncludeAndroid(!includeAndroid)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="includeAndroid" className="text-sm font-medium dark:text-gray-300">
                        Include Android
                    </label>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        id="includeIos"
                        type="checkbox"
                        checked={includeIos}
                        onChange={() => setIncludeIos(!includeIos)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="includeIos" className="text-sm font-medium dark:text-gray-300">
                        Include IOs
                    </label>
                </div>
                <button disabled={!files.length} onClick={uploadImages} className={`mt-4 ${!files.length ? "bg-blue-300" : "bg-blue-500"} text-white p-2 rounded`}>
                    Process Images
                </button>
            </div>
            {uploadStatus && <p className="text-center mt-4">{uploadStatus}</p>}
        </div>
    );
};

export default Upload;
