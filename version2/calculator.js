'use strict';
const calcForm = document.querySelector('.calc-form');
    const calcResult = document.getElementById('calcResult');
    const calcResultData = document.getElementById('calcResultData');
    const calcCurrency = document.getElementById('calcCurrency');
    const calcStatus = document.getElementById('calcStatus');
    let revision = 0;

    // A previous estimate is not valid after changing the market or vehicle.
    calcForm.addEventListener('input', () => {
        revision++;
        calcStatus.textContent = '';
        calcResultData.style.display = 'none';
        calcResult.querySelector('.calc-result-placeholder').style.display = '';
    });

    // --- Курсы валют (ЦБ РФ, ориентировочные) ---
    const EUR_RATE = 91.04;
    const USD_RATE = 76.62;
    const CNY_RATE = 10.55;
    const KRW_RATE_PER_1000 = 52.5; // за 1000 вон

    // Маппинг страна → валюта / символ / курс к RUB
    const countryConfig = {
        germany: { symbol: '€', delivery: 280000 },
        china:   { symbol: '¥', rate: CNY_RATE, delivery: 250000 },
        usa:     { symbol: '$', rate: USD_RATE, delivery: 350000 },
        uae:     { symbol: '$', rate: USD_RATE, delivery: 220000 },
        korea:   { symbol: '₩', rate: KRW_RATE_PER_1000 / 1000, delivery: 200000 }
    };

    // --- Таблица таможенного сбора (F) по таможенной стоимости ---
    const customsFeeTbl = [
        { max: 200000,    fee: 1231 },
        { max: 450000,    fee: 2462 },
        { max: 1200000,   fee: 4924 },
        { max: 2700000,   fee: 13541 },
        { max: 4200000,   fee: 18465 },
        { max: 5500000,   fee: 21344 },
        { max: 10000000,  fee: 49240 },
        { max: Infinity,  fee: 73860 }
    ];

    // --- Пошлина: авто до 3 лет (NEW) — max(% от CV, мин €/см³) ---
    const dutyNewBands = [
        { maxEur: 8500,      pct: 0.54, minPerCc: 2.5 },
        { maxEur: 16700,     pct: 0.48, minPerCc: 3.5 },
        { maxEur: 42300,     pct: 0.48, minPerCc: 5.5 },
        { maxEur: 84500,     pct: 0.48, minPerCc: 7.5 },
        { maxEur: 169000,    pct: 0.48, minPerCc: 15.0 },
        { maxEur: Infinity,  pct: 0.48, minPerCc: 20.0 }
    ];

    // --- Пошлина: 3-5 лет — €/см³ по объёму ---
    const duty35 = [
        { maxCc: 1000, rate: 1.5 },
        { maxCc: 1500, rate: 1.7 },
        { maxCc: 1800, rate: 2.5 },
        { maxCc: 2300, rate: 2.7 },
        { maxCc: 3000, rate: 3.0 },
        { maxCc: Infinity, rate: 3.6 }
    ];

    // --- Пошлина: старше 5 лет — €/см³ по объёму ---
    const dutyOver5 = [
        { maxCc: 1000, rate: 3.0 },
        { maxCc: 1500, rate: 3.2 },
        { maxCc: 1800, rate: 3.5 },
        { maxCc: 2300, rate: 4.8 },
        { maxCc: 3000, rate: 5.0 },
        { maxCc: Infinity, rate: 5.7 }
    ];

    // --- Утилизационный сбор (коммерческий, среднее min/max) ---
    const utilTbl = [
        // engine cc → age bucket → avg(min,max)
        { maxCc: 1000,    newAvg: 174500,  oldAvg: 303800 },
        { maxCc: 2000,    newAvg: 1602500, oldAvg: 1901000 },
        { maxCc: 3000,    newAvg: 1726100, oldAvg: 2288600 },
        { maxCc: 3500,    newAvg: 3171900, oldAvg: 4248800 },
        { maxCc: Infinity, newAvg: 3661900, oldAvg: 5245200 }
    ];

    function getCustomsFee(cvRub) {
        for (const row of customsFeeTbl) {
            if (cvRub <= row.max) return row.fee;
        }
        return 73860;
    }

    function getDutyRub(age, engineCc, cvRub, officialEur) {
        if (age === 'new') {
            // CV в евро
            const cvEur = cvRub / officialEur;
            let band = dutyNewBands.find(b => cvEur <= b.maxEur);
            if (!band) band = dutyNewBands[dutyNewBands.length - 1];
            const byPercent = band.pct * cvEur;
            const byMinCc = band.minPerCc * engineCc;
            return Math.max(byPercent, byMinCc) * officialEur;
        }
        const tbl = (age === '3-5') ? duty35 : dutyOver5;
        let ratePerCc = tbl.find(r => engineCc <= r.maxCc);
        if (!ratePerCc) ratePerCc = tbl[tbl.length - 1];
        return ratePerCc.rate * engineCc * officialEur;
    }

    function getUtilFee(engineCc, age) {
        const isNew = (age === 'new');
        for (const row of utilTbl) {
            if (engineCc <= row.maxCc) return isNew ? row.newAvg : row.oldAvg;
        }
        return isNew ? 3661900 : 5245200;
    }

    // Update currency symbol based on country
    document.querySelectorAll('input[name="country"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const cfg = countryConfig[e.target.value];
            calcCurrency.textContent = cfg ? cfg.symbol : '$';
        });
    });

    if (calcForm) {
        calcForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const country = document.querySelector('input[name="country"]:checked').value;
            const price = parseFloat(document.getElementById('calcPrice').value);
            const engineCc = parseInt(document.getElementById('calcEngine').value);
            const age = document.getElementById('calcAge').value;

            if (!document.getElementById("calcPrice").reportValidity() || !Number.isFinite(price) || price <= 0) return;

            const cfg = countryConfig[country] || countryConfig.germany;
            const current = ++revision;
            let priceRate = cfg.rate, officialEur = EUR_RATE, discountLimit = 0;
            const rateNote = document.getElementById('rateNote');
            if (country === 'germany') {
                calcResultData.style.display = 'none';
                calcResult.querySelector('.calc-result-placeholder').style.display = '';
                if (document.documentElement.hasAttribute('data-static-preview')) {
                    calcStatus.textContent = 'В демоверсии нет актуального курса. Пример расчёта доступен по ссылке над формой.';
                    return;
                }
                calcStatus.textContent = 'Проверяем курс евро…';
                try {
                    const res = await fetch('/api/quotes/germany/pricing', {credentials:'omit', signal:AbortSignal.timeout(12000)});
                    if (!res.ok) throw Error();
                    const {fx, service_discount_limit} = await res.json();
                    if (current !== revision) return;
                    priceRate = Number(fx.client_rate);
                    officialEur = Number(fx.rate);
                    if (!(priceRate > 0 && officialEur > 0 && Number.isSafeInteger(service_discount_limit) && service_discount_limit >= 0)) throw Error();
                    discountLimit = service_discount_limit;
                    rateNote.textContent = 'Расчётный курс: '+String(fx.rate).replace('.',',')+' + '+String(fx.markup).replace('.',',')+' = '+String(fx.client_rate).replace('.',',')+' ₽/EUR. Курс ЦБ на '+fx.date+'.';
                } catch {
                    if (current === revision) calcStatus.textContent = 'Не удалось подтвердить курс евро. Повторите расчёт позже.';
                    return;
                }
            }
            rateNote.hidden = country !== 'germany';
            calcStatus.textContent = '';

            // 1. Стоимость авто в рублях
            const carPriceRub = price * priceRate;

            // 2. Доставка до РФ
            const delivery = cfg.delivery;

            // 3. Таможенная стоимость (CV)
            const cvRub = (country === 'germany' ? price * officialEur : carPriceRub) + delivery;

            // 4. Таможенный сбор (F)
            const feeRub = getCustomsFee(cvRub);

            // 5. Таможенная пошлина (D) — единая ставка, физлицо
            const dutyRub = getDutyRub(age, engineCc, cvRub, officialEur);

            // 6. Утилизационный сбор (U) — коммерческий, среднее
            const utilRub = getUtilFee(engineCc, age);

            // 7. СБКТС + ЭПТС
            const sbkts = 150000;

            // 8. Услуги CARBURG — 10% от стоимости авто
            const serviceFee = Math.round(carPriceRub * 0.10);
            const discount = Math.min(serviceFee, discountLimit);

            // Итого
            const total = carPriceRub + delivery + feeRub + dutyRub + utilRub + sbkts + serviceFee - discount;

            // Форматирование
            const fmt = (n) => Math.round(n).toLocaleString('ru-RU') + ' \u20bd';

            document.getElementById('resCarPrice').textContent = fmt(carPriceRub);
            document.getElementById('resDelivery').textContent = fmt(delivery);
            document.getElementById('resFee').textContent = fmt(feeRub);
            document.getElementById('resCustoms').textContent = fmt(dutyRub);
            document.getElementById('resUtil').textContent = fmt(utilRub);
            document.getElementById('resSbkts').textContent = fmt(sbkts);
            document.getElementById('resService').textContent = fmt(serviceFee);
            document.getElementById('discountRow').hidden = !discount;
            document.getElementById('resDiscount').textContent = discount ? '−'+fmt(discount) : '';
            document.getElementById('resTotal').textContent = fmt(total);

            // Show result
            calcResult.querySelector('.calc-result-placeholder').style.display = 'none';
            calcResultData.style.display = 'block';
            if (window.matchMedia('(max-width: 700px)').matches) {
                document.getElementById('estimate-total').focus();
            }
        });
    }
