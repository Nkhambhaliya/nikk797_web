document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('md-file');
    const dropZone = document.getElementById('drop-zone');
    const editorTextarea = document.getElementById('md-editor');
    const previewArea = document.getElementById('md-preview');
    
    const copyMdBtn = document.getElementById('copy-md-btn');
    const copyHtmlBtn = document.getElementById('copy-html-btn');
    const downloadMdBtn = document.getElementById('download-md-btn');
    const downloadHtmlBtn = document.getElementById('download-html-btn');
    const clearBtn = document.getElementById('clear-btn');
    const loadSampleBtn = document.getElementById('sample-btn');
    const toggleSplitBtn = document.getElementById('toggle-split-btn');

    const editorPane = document.getElementById('editor-pane');
    const previewPane = document.getElementById('preview-pane');

    let currentFileName = "document.md";

    const defaultSampleText = `# Welcome to NIKK 797 Markdown Viewer 🚀

## Fast, Offline & 100% Private Markdown Rendering

This tool allows you to **view, edit, and convert** Markdown (\`.md\`) files directly in your web browser. 

---

### Features at a Glance

- **Privacy First**: Zero server uploads—everything is rendered locally.
- **Live Preview**: Type on the left, see rendered HTML instantly on the right.
- **Export Options**: Copy raw Markdown, copy formatted HTML, or download \`.md\` / \`.html\` files.

---

### Markdown Formatting Examples

#### 1. Lists & Checkboxes
- [x] Create a sleek Apple-inspired UI
- [x] Client-side Markdown parsing with \`marked.js\`
- [ ] Add your custom notes and documentation

#### 2. Code Block
\`\`\`javascript
function calculateGST(amount, rate) {
    const gstAmount = (amount * rate) / 100;
    return { net: amount, gst: gstAmount, total: amount + gstAmount };
}
console.log(calculateGST(1000, 18));
\`\`\`

#### 3. Table
| Feature | Client-Side | Cloud Servers |
| :--- | :---: | :---: |
| Speed | Instant ⚡ | Slow 🐢 |
| Privacy | 100% Secure 🔒 | Exposed ⚠️ |
| Offline Use | Yes ✅ | No ❌ |

> "Simplicity is the ultimate sophistication." — Leonardo da Vinci
`;

    // Configure marked if available
    if (window.marked) {
        window.marked.setOptions({
            gfm: true,
            breaks: true,
            headerIds: true
        });
    }

    // Drag and drop handlers
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
                readMdFile(e.dataTransfer.files[0]);
            }
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                readMdFile(e.target.files[0]);
            }
        });
    }

    function readMdFile(file) {
        currentFileName = file.name;
        const reader = new FileReader();
        reader.onload = (e) => {
            if (editorTextarea) {
                editorTextarea.value = e.target.result;
                renderMarkdown();
            }
        };
        reader.readAsText(file);
    }

    // Live Render Event
    if (editorTextarea) {
        editorTextarea.addEventListener('input', renderMarkdown);
        // Load initial content or sample if empty
        if (!editorTextarea.value.trim()) {
            editorTextarea.value = defaultSampleText;
        }
        renderMarkdown();
    }

    function renderMarkdown() {
        if (!previewArea) return;
        const rawText = editorTextarea ? editorTextarea.value : '';
        if (!rawText.trim()) {
            previewArea.innerHTML = '<p style="color: var(--text-muted); font-style: italic;">HTML preview will appear here...</p>';
            return;
        }

        if (window.marked) {
            previewArea.innerHTML = window.marked.parse(rawText);
        } else {
            // Fallback plain preview
            previewArea.textContent = rawText;
        }
    }

    // Toolbar Action Buttons
    if (loadSampleBtn) {
        loadSampleBtn.addEventListener('click', () => {
            currentFileName = "sample.md";
            editorTextarea.value = defaultSampleText;
            renderMarkdown();
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            editorTextarea.value = '';
            renderMarkdown();
        });
    }

    if (copyMdBtn) {
        copyMdBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(editorTextarea.value).then(() => {
                showToast(copyMdBtn, 'Copied MD!');
            });
        });
    }

    if (copyHtmlBtn) {
        copyHtmlBtn.addEventListener('click', () => {
            const htmlText = previewArea ? previewArea.innerHTML : '';
            navigator.clipboard.writeText(htmlText).then(() => {
                showToast(copyHtmlBtn, 'Copied HTML!');
            });
        });
    }

    if (downloadMdBtn) {
        downloadMdBtn.addEventListener('click', () => {
            const mdBlob = new Blob([editorTextarea.value], { type: 'text/markdown;charset=utf-8;' });
            triggerDownload(mdBlob, currentFileName.endsWith('.md') ? currentFileName : `${currentFileName}.md`);
        });
    }

    if (downloadHtmlBtn) {
        downloadHtmlBtn.addEventListener('click', () => {
            const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${currentFileName}</title>
<style>
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #111; max-width: 800px; margin: 2rem auto; padding: 0 1rem; }
code { background: #f4f4f4; padding: 0.2em 0.4em; border-radius: 4px; font-family: monospace; }
pre { background: #f4f4f4; padding: 1em; border-radius: 8px; overflow-x: auto; }
blockquote { border-left: 4px solid #0071e3; margin: 0; padding-left: 1rem; color: #555; }
table { border-collapse: collapse; width: 100%; margin: 1.5rem 0; }
th, td { border: 1px solid #ddd; padding: 0.5rem 0.75rem; text-align: left; }
th { background: #f8f8f8; }
</style>
</head>
<body>
${previewArea ? previewArea.innerHTML : ''}
</body>
</html>`;
            const htmlBlob = new Blob([fullHtml], { type: 'text/html;charset=utf-8;' });
            const htmlName = currentFileName.replace(/\.[^/.]+$/, "") + ".html";
            triggerDownload(htmlBlob, htmlName);
        });
    }

    if (toggleSplitBtn) {
        let isPreviewOnly = false;
        const splitGrid = document.querySelector('.split-grid');
        toggleSplitBtn.addEventListener('click', () => {
            isPreviewOnly = !isPreviewOnly;
            if (isPreviewOnly) {
                editorPane.style.display = 'none';
                if (splitGrid) splitGrid.classList.add('preview-full-mode');
                toggleSplitBtn.textContent = 'Split Editor Mode';
            } else {
                editorPane.style.display = 'flex';
                if (splitGrid) splitGrid.classList.remove('preview-full-mode');
                toggleSplitBtn.textContent = 'Preview Only Mode';
            }
        });
    }

    function triggerDownload(blob, fileName) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(link.href);
    }

    function showToast(btnElement, message) {
        const origText = btnElement.textContent;
        btnElement.textContent = message;
        setTimeout(() => {
            btnElement.textContent = origText;
        }, 1500);
    }
});
