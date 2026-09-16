document.addEventListener('DOMContentLoaded', () => {
    const calcBtn = document.getElementById('calc-btn');
    const amountInput = document.getElementById('amount');
    const rateInput = document.getElementById('gst-rate');
    const gstTypeSelect = document.getElementById('gst-type');
    const taxTypeSelect = document.getElementById('tax-type');
    const currencySelect = document.getElementById('currency');
    const presetBtns = document.querySelectorAll('.preset-btn');

    // Preset Rate Handler
    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            presetBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const rateVal = btn.getAttribute('data-rate');
            if (rateVal) {
                rateInput.value = rateVal;
                calculateGST();
            }
        });
    });

    // Auto calculate on input changes for instant live feedback
    [amountInput, rateInput, gstTypeSelect, taxTypeSelect, currencySelect].forEach(element => {
        if (element) {
            element.addEventListener('input', calculateGST);
            element.addEventListener('change', calculateGST);
        }
    });

    if (calcBtn) {
        calcBtn.addEventListener('click', () => {
            calculateGST();
            const resultBox = document.getElementById('result-display');
            if (resultBox) {
                resultBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }

    function calculateGST() {
        const amountStr = amountInput ? amountInput.value : '';
        const rateStr = rateInput ? rateInput.value : '';
        
        const amount = parseFloat(amountStr);
        const rate = parseFloat(rateStr);

        const resultNet = document.getElementById('result-net');
        const resultGst = document.getElementById('result-gst');
        const resultCgst = document.getElementById('result-cgst');
        const resultSgst = document.getElementById('result-sgst');
        const resultIgst = document.getElementById('result-igst');
        const resultGross = document.getElementById('result-gross');

        const cgstBlock = document.getElementById('cgst-sgst-block');
        const igstBlock = document.getElementById('igst-block');

        if (!amountStr || !rateStr || isNaN(amount) || isNaN(rate) || amount < 0 || rate < 0) {
            if (resultGross) resultGross.textContent = '-';
            if (resultNet) resultNet.textContent = '-';
            if (resultGst) resultGst.textContent = '-';
            if (resultCgst) resultCgst.textContent = '-';
            if (resultSgst) resultSgst.textContent = '-';
            if (resultIgst) resultIgst.textContent = '-';
            return;
        }

        const currencyCode = currencySelect ? currencySelect.value : 'INR';
        const isInclusive = gstTypeSelect ? gstTypeSelect.value === 'inclusive' : false;
        const isInterState = taxTypeSelect ? taxTypeSelect.value === 'inter' : false;

        let netAmount = 0;
        let gstAmount = 0;
        let grossAmount = 0;

        if (isInclusive) {
            // GST Inclusive: Total Amount includes GST
            grossAmount = amount;
            netAmount = grossAmount / (1 + (rate / 100));
            gstAmount = grossAmount - netAmount;
        } else {
            // GST Exclusive: Amount is Net before GST
            netAmount = amount;
            gstAmount = netAmount * (rate / 100);
            grossAmount = netAmount + gstAmount;
        }

        let cgst = 0;
        let sgst = 0;
        let igst = 0;

        if (isInterState) {
            igst = gstAmount;
            if (cgstBlock) cgstBlock.style.display = 'none';
            if (igstBlock) igstBlock.style.display = 'flex';
        } else {
            cgst = gstAmount / 2;
            sgst = gstAmount / 2;
            if (cgstBlock) cgstBlock.style.display = 'flex';
            if (igstBlock) igstBlock.style.display = 'none';
        }

        if (resultNet) resultNet.textContent = formatCurrencyCode(netAmount, currencyCode);
        if (resultGst) resultGst.textContent = formatCurrencyCode(gstAmount, currencyCode);
        if (resultCgst) resultCgst.textContent = formatCurrencyCode(cgst, currencyCode);
        if (resultSgst) resultSgst.textContent = formatCurrencyCode(sgst, currencyCode);
        if (resultIgst) resultIgst.textContent = formatCurrencyCode(igst, currencyCode);
        if (resultGross) resultGross.textContent = formatCurrencyCode(grossAmount, currencyCode);
    }
});
