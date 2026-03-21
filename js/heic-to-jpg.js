document.addEventListener('DOMContentLoaded', () => {
    const convertBtn = document.getElementById('convert-btn');
    const fileInput = document.getElementById('heic-file');
    const loadingMsg = document.getElementById('loading-msg');
    const resultBox = document.getElementById('result-box');
    const downloadLink = document.getElementById('download-link');
    const imagePreview = document.getElementById('image-preview');
    
    // UI Elements
    const dropZone = document.getElementById('drop-zone');
    const fileInfo = document.getElementById('file-info');
    const textFileName = document.getElementById('file-name');
    const textFileSize = document.getElementById('file-size');
    const resetBtn = document.getElementById('reset-btn');
    const qualitySelect = document.getElementById('jpeg-quality');
    
    let selectedFile = null;

    // Drag and Drop Logic
    if (dropZone) {
        dropZone.addEventListener('click', () => fileInput.click());
        
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleFileSelect(e.dataTransfer.files[0]);
            }
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                handleFileSelect(e.target.files[0]);
            }
        });
    }

    function handleFileSelect(file) {
        // Broadly accept HEIC strings
        const fileNameLower = file.name.toLowerCase();
        if (!fileNameLower.endsWith('.heic') && !fileNameLower.endsWith('.heif') && file.type !== 'image/heic') {
            alert('Please select a valid HEIC/HEIF image file.');
            return;
        }
        selectedFile = file;
        
        // Show file info securely
        textFileName.textContent = file.name;
        textFileSize.textContent = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
        
        dropZone.style.display = 'none';
        fileInfo.style.display = 'flex';
        convertBtn.style.display = 'block';
        
        // Hide result or loading if present
        resultBox.style.display = 'none';
        loadingMsg.style.display = 'none';
        imagePreview.style.display = 'none';
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            selectedFile = null;
            fileInput.value = '';
            dropZone.style.display = 'block';
            fileInfo.style.display = 'none';
            convertBtn.style.display = 'none';
            resultBox.style.display = 'none';
            loadingMsg.style.display = 'none';
            if (imagePreview.src) {
                URL.revokeObjectURL(imagePreview.src); // Free memory
                imagePreview.src = "";
            }
            imagePreview.style.display = 'none';
        });
    }

    if (convertBtn) {
        convertBtn.addEventListener('click', async () => {
            if (!selectedFile) {
                alert('Please select a HEIC file first.');
                return;
            }

            if (typeof heic2any === 'undefined') {
                alert('Decoder library failed to load. Please check your internet connection.');
                return;
            }

            loadingMsg.style.display = 'block';
            resultBox.style.display = 'none';
            convertBtn.style.display = 'none';
            fileInfo.style.display = 'none'; // hide the form select during processing too

            const quality = parseFloat(qualitySelect.value) || 0.8;

            try {
                // heic2any performs heavily blocking loops natively, await gracefully
                const conversionResult = await heic2any({
                    blob: selectedFile,
                    toType: "image/jpeg",
                    quality: quality
                });

                // heic2any can return an array if the HEIC has multiple images natively
                const jpgBlob = Array.isArray(conversionResult) ? conversionResult[0] : conversionResult;
                
                // Create preview URL natively
                const url = URL.createObjectURL(jpgBlob);
                imagePreview.src = url;
                imagePreview.style.display = 'block';
                
                downloadLink.href = url;
                
                // Extract filename dynamically
                const fileName = selectedFile.name.split('.').slice(0, -1).join('.') || 'converted_photo';
                downloadLink.download = `${fileName}.jpg`;
                
                loadingMsg.style.display = 'none';
                resultBox.style.display = 'block';
                resultBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } catch (err) {
                console.error(err);
                alert('An error occurred. The HEIC file may be corrupted or too massive for your device core limits.');
                loadingMsg.style.display = 'none';
                convertBtn.style.display = 'block'; 
                fileInfo.style.display = 'flex';
            }
        });
    }
});
