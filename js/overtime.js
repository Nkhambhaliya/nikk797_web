document.addEventListener('DOMContentLoaded', () => {
    const calcBtn = document.getElementById('calc-btn');
    if (calcBtn) {
        calcBtn.addEventListener('click', () => {
            const wageStr = document.getElementById('hourly-wage').value;
            const hoursStr = document.getElementById('overtime-hours').value;
            const multiplierStr = document.getElementById('multiplier').value;
            
            const wage = parseFloat(wageStr);
            const hours = parseFloat(hoursStr);
            const multiplier = parseFloat(multiplierStr);
            
            const resultBox = document.getElementById('result-display');
            
            if (!wageStr || !hoursStr || !multiplierStr || isNaN(wage) || isNaN(hours) || isNaN(multiplier) || wage < 0 || hours < 0 || multiplier < 0) {
                resultBox.innerHTML = '<span style="color: #b91c1c; font-size: 1.25rem; font-weight: 600;">Please enter valid inputs.</span>';
                return;
            }
            
            const currencySelect = document.getElementById('currency');
            const currencyCode = currencySelect ? currencySelect.value : 'USD';
            const pay = wage * hours * multiplier;
            resultBox.textContent = formatCurrencyCode(pay, currencyCode);
        });
    }
});
