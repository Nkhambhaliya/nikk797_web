document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    
    const fileInfo = document.getElementById('file-info');
    const fileName = document.getElementById('file-name');
    const fileSize = document.getElementById('file-size');
    const imagePreview = document.getElementById('image-preview');
    const previewImg = document.getElementById('preview-img');
    const resetUpload = document.getElementById('reset-upload');
    
    const optionsPanel = document.getElementById('options-panel');
    const qualityLevel = document.getElementById('quality-level');
    const qualityDisplay = document.getElementById('quality-display');
    const resizeOption = document.getElementById('resize-option');
    const outputFormat = document.getElementById('output-format');
    
    const compressBtn = document.getElementById('compress-btn');
    const loadingMsg = document.getElementById('loading-msg');
    const resultBox = document.getElementById('result-display');
    
    const resultOriginalSize = document.getElementById('result-original-size');
    const resultNewSize = document.getElementById('result-new-size');
    const downloadTrigger = document.getElementById('download-trigger');

    let currentFile = null;
    let originalSizeBytes = 0;

    qualityLevel.addEventListener('input', (e) => {
        qualityDisplay.textContent = `${e.target.value}%`;
    });

    const formatBytes = (bytes, decimals = 2) => {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    const handleFile = (file) => {
        if (!file || !file.type.startsWith('image/')) {
            alert('Please select a valid image file natively (JPEG, PNG, WEBP).');
            return;
        }

        currentFile = file;
        originalSizeBytes = file.size;

        fileName.textContent = file.name;
        fileSize.textContent = formatBytes(file.size);

        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);

        dropZone.style.display = 'none';
        fileInfo.style.display = 'flex';
        optionsPanel.style.display = 'block';
        compressBtn.style.display = 'block';
        
        resultBox.style.display = 'none';
        loadingMsg.style.display = 'none';
    };

    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.backgroundColor = 'rgba(139, 92, 246, 0.2)';
        dropZone.style.borderColor = '#8b5cf6';
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.style.backgroundColor = 'transparent';
        dropZone.style.borderColor = 'rgba(139, 92, 246, 0.5)';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.backgroundColor = 'transparent';
        dropZone.style.borderColor = 'rgba(139, 92, 246, 0.5)';
        
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    resetUpload.addEventListener('click', () => {
        currentFile = null;
        fileInput.value = '';
        dropZone.style.display = 'block';
        fileInfo.style.display = 'none';
        optionsPanel.style.display = 'none';
        compressBtn.style.display = 'none';
        resultBox.style.display = 'none';
        imagePreview.style.display = 'none';
        previewImg.src = '';
    });

    compressBtn.addEventListener('click', () => {
        if (!currentFile) return;

        compressBtn.style.display = 'none';
        optionsPanel.style.display = 'none';
        loadingMsg.style.display = 'block';
        resultBox.style.display = 'none';

        setTimeout(() => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                const maxDim = resizeOption.value;
                if (maxDim !== 'original') {
                    const max = parseInt(maxDim);
                    if (width > max || height > max) {
                        if (width > height) {
                            height = Math.round((height * max) / width);
                            width = max;
                        } else {
                            width = Math.round((width * max) / height);
                            height = max;
                        }
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);

                const finalFormat = outputFormat.value; 
                const finalQuality = parseInt(qualityLevel.value) / 100;

                canvas.toBlob((blob) => {
                    if(!blob) {
                        alert("Compression failed natively. Please refresh the page.");
                        loadingMsg.style.display = 'none';
                        resetUpload.click();
                        return;
                    }

                    const newSize = blob.size;
                    const blobUrl = URL.createObjectURL(blob);
                    
                    const originalName = currentFile.name.substring(0, currentFile.name.lastIndexOf('.'));
                    const ext = finalFormat === 'image/webp' ? 'webp' : 'jpg';

                    resultOriginalSize.textContent = formatBytes(originalSizeBytes);
                    resultNewSize.textContent = formatBytes(newSize);

                    downloadTrigger.href = blobUrl;
                    downloadTrigger.download = `${originalName}-compressed.${ext}`;

                    loadingMsg.style.display = 'none';
                    resultBox.style.display = 'block';
                    resultBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    compressBtn.style.display = 'block';
                    optionsPanel.style.display = 'block';
                    compressBtn.textContent = 'Re-Compress with Current Image';

                }, finalFormat, finalQuality);
            };

            img.onerror = () => {
                alert('An error occurred reading the structural image file.');
                loadingMsg.style.display = 'none';
                resetUpload.click();
            };

            img.src = previewImg.src;
        }, 100);
    });
});
