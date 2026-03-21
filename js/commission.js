document.addEventListener('DOMContentLoaded', () => {
    const calcBtn = document.getElementById('calc-btn');
    if (calcBtn) {
        calcBtn.addEventListener('click', () => {
            const salesStr = document.getElementById('sales-amount').value;
            const commStr = document.getElementById('commission-percent').value;
            
            const sales = parseFloat(salesStr);
            const comm = parseFloat(commStr);
            
            const resultBox = document.getElementById('result-display');
            
            if (!salesStr || !commStr || isNaN(sales) || isNaN(comm) || sales < 0 || comm < 0) {
                resultBox.innerHTML = '<span style="color: #b91c1c; font-size: 1.25rem; font-weight: 600;">Please enter valid inputs.</span>';
                return;
            }
            
            const currencySelect = document.getElementById('currency');
            const currencyCode = currencySelect ? currencySelect.value : 'USD';
            const earned = sales * (comm / 100);
            resultBox.textContent = formatCurrencyCode(earned, currencyCode);
        });
    }
});
