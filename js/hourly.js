document.addEventListener('DOMContentLoaded', () => {
    const calcBtn = document.getElementById('calc-btn');
    if (calcBtn) {
        calcBtn.addEventListener('click', () => {
            const rateStr = document.getElementById('hourly-rate').value;
            const hoursStr = document.getElementById('hours-per-week').value;
            
            const rate = parseFloat(rateStr);
            const hours = parseFloat(hoursStr);
            
            const resultWeekly = document.getElementById('result-weekly');
            const resultMonthly = document.getElementById('result-monthly');
            const resultYearly = document.getElementById('result-yearly');
            
            if (!rateStr || !hoursStr || isNaN(rate) || isNaN(hours) || rate < 0 || hours < 0) {
                resultYearly.innerHTML = '<span style="color: #b91c1c; font-size: 1rem; font-weight: 600;">Invalid input</span>';
                resultWeekly.textContent = '-';
                resultMonthly.textContent = '-';
                return;
            }
            
            const currencySelect = document.getElementById('currency');
            const currencyCode = currencySelect ? currencySelect.value : 'USD';
            const weekly = rate * hours;
            const yearly = weekly * 52;
            const monthly = yearly / 12;
            
            resultWeekly.textContent = formatCurrencyCode(weekly, currencyCode);
            resultMonthly.textContent = formatCurrencyCode(monthly, currencyCode);
            resultYearly.textContent = formatCurrencyCode(yearly, currencyCode);
        });
    }
});
