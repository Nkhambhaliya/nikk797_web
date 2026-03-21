document.addEventListener('DOMContentLoaded', () => {
    const convertBtn = document.getElementById('convert-btn');
    const fileInput = document.getElementById('image-files');
    const dropZone = document.getElementById('drop-zone');
    const fileListBlock = document.getElementById('file-list');
    const optionsPanel = document.getElementById('options-panel');
    const loadingMsg = document.getElementById('loading-msg');
    const resultBox = document.getElementById('result-box');
    const downloadLink = document.getElementById('download-link');
    const resetBtn = document.getElementById('reset-btn');

    let selectedFiles = [];

    if (dropZone) {
        dropZone.addEventListener('click', () => fileInput.click());
        dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
        dropZone.addEventListener('dragleave', (e) => { e.preventDefault(); dropZone.classList.remove('dragover'); });
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleFiles(e.dataTransfer.files);
            }
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                handleFiles(e.target.files);
            }
        });
    }

    function handleFiles(files) {
        // Filter strictly for typical images
        const newFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
        if (newFiles.length === 0) {
            alert('Please select valid image files only (e.g. JPG, PNG).');
            return;
        }

        selectedFiles = [...selectedFiles, ...newFiles];
        renderFileList();
        
        dropZone.querySelector('.drop-zone-text').textContent = 'Add more images';
        optionsPanel.style.display = 'grid';
        convertBtn.style.display = 'block';
        resultBox.style.display = 'none';
        loadingMsg.style.display = 'none';
    }

    function renderFileList() {
        fileListBlock.innerHTML = '';
        if (selectedFiles.length > 0) {
            fileListBlock.style.display = 'flex';
            selectedFiles.forEach((file, index) => {
                const item = document.createElement('div');
                item.className = 'file-item';
                
                const sizeStr = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
                let name = file.name;
                if (name.length > 35) name = name.substring(0, 35) + '...';

                item.innerHTML = `
                    <span style="color: #e2e8f0; font-weight: 600; display:flex; align-items:center;">
                        <span style="background: rgba(139, 92, 246, 0.3); color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 0.8rem;">${index + 1}</span> 
                        ${name} <span style="color: #94a3b8; font-weight: 400; margin-left:12px;">(${sizeStr})</span>
                    </span>
                    <button class="remove-btn" data-index="${index}" style="background: none; border: none; color: #f43f5e; cursor: pointer; font-size: 1.5rem; transition: transform 0.2s;">&times;</button>
                `;
                fileListBlock.appendChild(item);
            });

            document.querySelectorAll('.remove-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const idx = parseInt(e.target.getAttribute('data-index'));
                    selectedFiles.splice(idx, 1);
                    if (selectedFiles.length === 0) {
                        resetUI();
                    } else {
                        renderFileList();
                    }
                });
            });
        } else {
            fileListBlock.style.display = 'none';
        }
    }

    function resetUI() {
        selectedFiles = [];
        fileInput.value = '';
        fileListBlock.style.display = 'none';
        optionsPanel.style.display = 'none';
        convertBtn.style.display = 'none';
        resultBox.style.display = 'none';
        loadingMsg.style.display = 'none';
        dropZone.style.display = 'block';
        dropZone.querySelector('.drop-zone-text').textContent = 'Drag & Drop your images here';
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', resetUI);
    }

    // Wrap FileReader explicitly to load async
    function loadImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    if (convertBtn) {
        convertBtn.addEventListener('click', async () => {
            if (selectedFiles.length === 0) return;
            if (typeof window.jspdf === 'undefined') {
                alert('Document framework failed to load. Please check your network connection.');
                return;
            }

            const format = document.getElementById('pdf-size').value; // a4, letter, auto
            const orientation = document.getElementById('pdf-orientation').value; // p, l
            const margin = parseInt(document.getElementById('pdf-margin').value); // 0, 20, 40
            const compression = parseFloat(document.getElementById('pdf-compression').value); // 0.3 - 0.9

            loadingMsg.style.display = 'block';
            convertBtn.style.display = 'none';
            optionsPanel.style.display = 'none';
            dropZone.style.display = 'none';
            fileListBlock.style.display = 'none';

            try {
                const { jsPDF } = window.jspdf;
                let doc;

                // Loop images async
                for (let i = 0; i < selectedFiles.length; i++) {
                    const img = await loadImage(selectedFiles[i]);
                    
                    // Route the image through a temporary Canvas explicitly to forcefully compress the output stream
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    
                    // Aggressively output a lower-grade JPEG dynamically handling massive transparency sizes flawlessly.
                    const compressedData = canvas.toDataURL('image/jpeg', compression);

                    if (format === 'auto') {
                        // Dynamically trace the Canvas size + strict margins
                        if (i === 0) {
                            doc = new jsPDF({
                                orientation: canvas.width > canvas.height ? 'l' : 'p',
                                unit: 'px',
                                format: [canvas.width + margin * 2, canvas.height + margin * 2]
                            });
                        } else {
                            doc.addPage([canvas.width + margin * 2, canvas.height + margin * 2], canvas.width > canvas.height ? 'l' : 'p');
                        }
                        doc.addImage(compressedData, 'JPEG', margin, margin, canvas.width, canvas.height);
                    } else {
                        // Standard Page dimensions structure (A4 / Letter)
                        if (i === 0) {
                            doc = new jsPDF({
                                orientation: orientation,
                                unit: 'px',
                                format: format 
                            });
                        } else {
                            doc.addPage();
                        }
                        
                        const pageWidth = doc.internal.pageSize.getWidth();
                        const pageHeight = doc.internal.pageSize.getHeight();
                        
                        const maxW = pageWidth - margin * 2;
                        const maxH = pageHeight - margin * 2;
                        
                        let ratio = Math.min(maxW / canvas.width, maxH / canvas.height);
                        let finalW = canvas.width * ratio;
                        let finalH = canvas.height * ratio;
                        
                        // Center specifically on standard static sheets
                        let x = margin + (maxW - finalW) / 2;
                        let y = margin + (maxH - finalH) / 2;
                        
                        doc.addImage(compressedData, 'JPEG', x, y, finalW, finalH);
                    }
                }

                // Render specific Blob array output explicitly
                const pdfBlob = doc.output('blob');
                const url = URL.createObjectURL(pdfBlob);
                
                downloadLink.href = url;
                downloadLink.download = `Compiled_Document.pdf`;
                
                loadingMsg.style.display = 'none';
                resultBox.style.display = 'block';
                resultBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } catch (err) {
                console.error(err);
                alert('A fatal memory fault occurred generating the PDF. Reduce the maximum file batch amount or check your specific file encoding parameters.');
                resetUI();
            }
        });
    }
});
