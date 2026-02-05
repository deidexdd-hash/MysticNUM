let selectedGender = null;

function setGender(gender) {
    selectedGender = gender;
    document.getElementById('btn-male').classList.toggle('border-yellow-500', gender === 'male');
    document.getElementById('btn-female').classList.toggle('border-yellow-500', gender === 'female');
}

function calculate() {
    const date = document.getElementById('birthDate').value;
    if (!date || !selectedGender) {
        alert("Пожалуйста, выберите дату и пол");
        return;
    }

    // Показываем блок результатов
    document.getElementById('results').classList.remove('hidden');

    // ПРИМЕР: Логика "Матрицы" (тебе нужно заменить на свои формулы)
    // В нумерологии обычно все числа складываются до 22
    const reduceNum = (n) => {
        while (n > 22) {
            n = String(n).split('').reduce((a, b) => Number(a) + Number(b), 0);
        }
        return n;
    };

    const [y, m, d] = date.split('-');
    const dayArcane = reduceNum(Number(d));
    const monthArcane = reduceNum(Number(m));
    const yearArcane = reduceNum(Number(y));
    const centerArcane = reduceNum(dayArcane + monthArcane + yearArcane);

    // Вывод в таблицу
    document.getElementById('matrixDisplay').innerHTML = `
        <div class="p-4 border border-white/5">${dayArcane}</div>
        <div class="p-4 border border-white/5">${monthArcane}</div>
        <div class="p-4 border border-white/5">${yearArcane}</div>
        <div class="col-span-3 p-8 mystic-gold text-6xl">${centerArcane}</div>
    `;

    document.getElementById('interpretation').innerHTML = `
        <h4 class="text-xl font-bold mb-4">Ваше предназначение</h4>
        <p class="text-gray-300 leading-relaxed">Число вашего центра — ${centerArcane}. Это говорит о том, что...</p>
    `;
}
