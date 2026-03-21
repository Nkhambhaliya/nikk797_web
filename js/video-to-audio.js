document.addEventListener('DOMContentLoaded', () => {
    const extractBtn = document.getElementById('extract-btn');
    const fileInput = document.getElementById('video-file');
    const loadingMsg = document.getElementById('loading-msg');
    const resultBox = document.getElementById('result-box');
    const downloadLink = document.getElementById('download-link');
    
    // UI Elements
    const dropZone = document.getElementById('drop-zone');
    const fileInfo = document.getElementById('file-info');
    const textFileName = document.getElementById('file-name');
    const textFileSize = document.getElementById('file-size');
    const resetBtn = document.getElementById('reset-btn');
    
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
        if (!file.type.startsWith('video/')) {
            alert('Please select a valid video file format.');
            return;
        }
        selectedFile = file;
        
        // Show file info securely
        textFileName.textContent = file.name;
        textFileSize.textContent = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
        
        dropZone.style.display = 'none';
        fileInfo.style.display = 'flex';
        extractBtn.style.display = 'block';
        
        // Hide result or loading if present
        resultBox.style.display = 'none';
        loadingMsg.style.display = 'none';
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            selectedFile = null;
            fileInput.value = '';
            dropZone.style.display = 'block';
            fileInfo.style.display = 'none';
            extractBtn.style.display = 'none';
            resultBox.style.display = 'none';
            loadingMsg.style.display = 'none';
        });
    }

    if (extractBtn) {
        extractBtn.addEventListener('click', async () => {
            if (!selectedFile) {
                alert('Please select a video file first.');
                return;
            }

            const formatSelect = document.getElementById('audio-format');
            const format = formatSelect ? formatSelect.value : 'mp3';

            loadingMsg.style.display = 'block';
            resultBox.style.display = 'none';
            extractBtn.style.display = 'none';

            try {
                // Read file to ArrayBuffer natively
                const arrayBuffer = await selectedFile.arrayBuffer();
                
                // Decode Audio Offline
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                
                let outputBlob;
                if (format === 'mp3') {
                    if (typeof lamejs === 'undefined') {
                        alert('MP3 encoder not loaded. Falling back to WAV.');
                        outputBlob = audioBufferToWav(audioBuffer);
                    } else {
                        outputBlob = audioBufferToMp3(audioBuffer);
                    }
                } else {
                    outputBlob = audioBufferToWav(audioBuffer);
                }
                
                // Create Native Download Link
                const url = URL.createObjectURL(outputBlob);
                downloadLink.href = url;
                
                // Extract filename dynamically
                const fileName = selectedFile.name.split('.').slice(0, -1).join('.') || 'extracted_audio';
                downloadLink.download = `${fileName}.${format}`;
                downloadLink.innerHTML = `⬇️ Download .${format.toUpperCase()}`;
                
                loadingMsg.style.display = 'none';
                resultBox.style.display = 'block';
                resultBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } catch (err) {
                console.error(err);
                alert('An error occurred. The file might not be a valid format, or it may be too massive for the browser tab to render locally.');
                loadingMsg.style.display = 'none';
                extractBtn.style.display = 'block'; 
            }
        });
    }
});

// Helper function to encode AudioBuffer to MP3 format using lamejs
function audioBufferToMp3(buffer) {
    const channels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    // For extreme performance, fold to mono if it's over ~44100 to prevent browser crash, or compress at 128kbps
    const mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, 128); 
    const mp3Data = [];

    const leftBuffer = buffer.getChannelData(0);
    const rightBuffer = channels > 1 ? buffer.getChannelData(1) : leftBuffer;
    
    // Convert Float32 native buffer to Int16 heavily required by LameJS
    const sampleBlockSize = 1152; // Needs to be multiple of 576
    const int16Left = new Int16Array(leftBuffer.length);
    const int16Right = new Int16Array(rightBuffer.length);
    
    for (let i = 0; i < leftBuffer.length; i++) {
        let l = Math.max(-1, Math.min(1, leftBuffer[i]));
        int16Left[i] = l < 0 ? l * 0x8000 : l * 0x7FFF;
        
        if (channels > 1) {
            let r = Math.max(-1, Math.min(1, rightBuffer[i]));
            int16Right[i] = r < 0 ? r * 0x8000 : r * 0x7FFF;
        }
    }

    // Process chunk encoding slowly so memory buffer handles large streams
    for (let i = 0; i < leftBuffer.length; i += sampleBlockSize) {
        let leftChunk = int16Left.subarray(i, i + sampleBlockSize);
        let rightChunk = int16Right.subarray(i, i + sampleBlockSize);
        let mp3buf;
        
        if (channels === 2) {
            mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
        } else {
            mp3buf = mp3encoder.encodeBuffer(leftChunk);
        }
        
        if (mp3buf.length > 0) {
            mp3Data.push(new Int8Array(mp3buf));
        }
    }
    
    const mp3buf = mp3encoder.flush();
    if (mp3buf.length > 0) {
        mp3Data.push(new Int8Array(mp3buf));
    }
    
    return new Blob(mp3Data, { type: 'audio/mp3' });
}

// Helper function to encode AudioBuffer to WAV format
function audioBufferToWav(buffer) {
    let numOfChan = buffer.numberOfChannels;
    let length = buffer.length * numOfChan * 2;
    let bufferWav = new ArrayBuffer(44 + length);
    let view = new DataView(bufferWav);
    let channels = [], i, sample;
    let offset = 0;
    
    // Write WAV header
    const setUint32 = (data) => { view.setUint32(offset, data, true); offset += 4; }
    const setUint16 = (data) => { view.setUint16(offset, data, true); offset += 2; }
    const writeString = (txt) => { for (let i = 0; i < txt.length; i++) { view.setUint8(offset, txt.charCodeAt(i)); offset += 1; } }
    
    writeString('RIFF');
    setUint32(36 + length);
    writeString('WAVE');
    writeString('fmt ');
    setUint32(16);
    setUint16(1);
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2);
    setUint16(16);
    writeString('data');
    setUint32(length);
    
    // Write interleaved audio data
    for (i = 0; i < buffer.numberOfChannels; i++) {
        channels.push(buffer.getChannelData(i));
    }
    
    let pos = 0;
    while(pos < buffer.length) {
        for (i = 0; i < numOfChan; i++) {
            sample = Math.max(-1, Math.min(1, channels[i][pos]));
            sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767)|0;
            view.setInt16(offset, sample, true);
            offset += 2;
        }
        pos++;
    }
    
    return new Blob([view], { type: 'audio/wav' });
}
