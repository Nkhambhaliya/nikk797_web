document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');

    const fileListBlock = document.getElementById('file-list-block');
    const fileListContainer = document.getElementById('file-list');
    const addMoreBtn = document.getElementById('add-more-btn');
    const resetUpload = document.getElementById('reset-upload');

    const mergeBtn = document.getElementById('merge-btn');
    const loadingMsg = document.getElementById('loading-msg');
    const resultBox = document.getElementById('result-display');
    const mergedCount = document.getElementById('merged-count');
    const downloadTrigger = document.getElementById('download-trigger');

    let selectedFiles = [];

    const formatBytes = (bytes, decimals = 2) => {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    const renderFileList = () => {
        if (selectedFiles.length === 0) {
            fileListBlock.style.display = 'none';
            mergeBtn.style.display = 'none';
            dropZone.style.display = 'block';
            return;
        }

        dropZone.style.display = 'none';
        fileListBlock.style.display = 'flex';

        if (selectedFiles.length > 1) {
            mergeBtn.style.display = 'block';
        } else {
            mergeBtn.style.display = 'none';
        }

        fileListContainer.innerHTML = '';
        selectedFiles.forEach((fileObj, index) => {
            const row = document.createElement('div');
            row.style.cssText = 'display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.05); padding: 0.75rem 1rem; border-radius: 8px; font-size: 0.95rem; border: 1px solid rgba(255,255,255,0.1);';

            const infoDiv = document.createElement('div');
            infoDiv.style.cssText = 'flex: 1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; display: flex; align-items: center; gap: 0.75rem; color: #fff;';
            infoDiv.innerHTML = `<span style="display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; background: rgba(139, 92, 246, 0.2); border-radius: 50%; color: #c4b5fd; font-size: 0.75rem; font-weight: bold;">${index + 1}</span> ${fileObj.file.name} <span style="color: var(--text-muted); font-size: 0.8rem;">(${formatBytes(fileObj.file.size)})</span>`;

            const actionsDiv = document.createElement('div');
            actionsDiv.style.cssText = 'display: flex; gap: 0.5rem;';

            if (index > 0) {
                const upBtn = document.createElement('button');
                upBtn.innerHTML = '↑';
                upBtn.style.cssText = 'background: rgba(255,255,255,0.1); border: none; color: #fff; width: 30px; height: 30px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center;';
                upBtn.onclick = () => moveFile(index, -1);
                actionsDiv.appendChild(upBtn);
            }

            if (index < selectedFiles.length - 1) {
                const downBtn = document.createElement('button');
                downBtn.innerHTML = '↓';
                downBtn.style.cssText = 'background: rgba(255,255,255,0.1); border: none; color: #fff; width: 30px; height: 30px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center;';
                downBtn.onclick = () => moveFile(index, 1);
                actionsDiv.appendChild(downBtn);
            }

            const removeBtn = document.createElement('button');
            removeBtn.innerHTML = '✕';
            removeBtn.style.cssText = 'background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.3); color: #fca5a5; width: 30px; height: 30px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; margin-left: 0.5rem;';
            removeBtn.title = "Remove File";
            removeBtn.onclick = () => {
                selectedFiles.splice(index, 1);
                renderFileList();
            };

            actionsDiv.appendChild(removeBtn);

            row.appendChild(infoDiv);
            row.appendChild(actionsDiv);
            fileListContainer.appendChild(row);
        });
    };

    const moveFile = (index, direction) => {
        const item = selectedFiles.splice(index, 1)[0];
        selectedFiles.splice(index + direction, 0, item);
        renderFileList();
    };

    const handleFiles = (files) => {
        const fileArray = Array.from(files);
        const pdfFiles = fileArray.filter(file => file.type === 'application/pdf');

        if (pdfFiles.length !== fileArray.length) {
            alert('Only standard PDF (.pdf) documents are strictly allowed natively in this merger tool.');
        }

        pdfFiles.forEach(file => {
            if (!selectedFiles.find(f => f.file.name === file.name && f.file.size === file.size)) {
                selectedFiles.push({ file: file, id: Date.now() + Math.random() });
            }
        });

        resultBox.style.display = 'none';
        renderFileList();
    };

    dropZone.addEventListener('click', () => fileInput.click());
    addMoreBtn.addEventListener('click', () => fileInput.click());

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

        if (e.dataTransfer.files) {
            handleFiles(e.dataTransfer.files);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files) {
            handleFiles(e.target.files);
        }
    });

    resetUpload.addEventListener('click', () => {
        selectedFiles = [];
        fileInput.value = '';
        const previewContainer = document.getElementById('pdf-preview-container');
        const previewFrame = document.getElementById('pdf-preview-frame');
        if (previewContainer) previewContainer.style.display = 'none';
        if (previewFrame) previewFrame.src = '';
        renderFileList();
    });

    const loadPdfFile = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsArrayBuffer(file);
        });
    };

    mergeBtn.addEventListener('click', async () => {
        if (selectedFiles.length < 2) return;

        mergeBtn.style.display = 'none';
        fileListBlock.style.display = 'none';
        loadingMsg.style.display = 'block';
        resultBox.style.display = 'none';

        try {
            const mergedPdf = await PDFLib.PDFDocument.create();

            for (const fileObj of selectedFiles) {
                const pdfBytes = await loadPdfFile(fileObj.file);
                const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes, { ignoreEncryption: true });

                const pagesArray = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());

                for (const page of pagesArray) {
                    mergedPdf.addPage(page);
                }
            }

            const mergedPdfBytes = await mergedPdf.save();

            const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
            const blobUrl = URL.createObjectURL(blob);

            mergedCount.textContent = selectedFiles.length;

            const firstFileName = selectedFiles[0].file.name.replace('.pdf', '');
            downloadTrigger.href = blobUrl;
            downloadTrigger.download = `${firstFileName}_merged.pdf`;

            const previewContainer = document.getElementById('pdf-preview-container');
            const previewFrame = document.getElementById('pdf-preview-frame');
            if (previewContainer && previewFrame) {
                previewFrame.src = blobUrl;
                previewContainer.style.display = 'block';
            }

            loadingMsg.style.display = 'none';
            resultBox.style.display = 'block';
            resultBox.scrollIntoView({ behavior: 'smooth', block: 'center' });

            mergeBtn.style.display = 'block';
            fileListBlock.style.display = 'flex';
            mergeBtn.textContent = 'Merge Docs Again';

        } catch (error) {
            console.error(error);
            alert("A foundational memory error specifically crashed the library generation logic natively. Please check your PDF securities.");
            loadingMsg.style.display = 'none';
            fileListBlock.style.display = 'flex';
            mergeBtn.style.display = 'block';
        }
    });
});
