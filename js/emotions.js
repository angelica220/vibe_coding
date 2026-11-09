document.addEventListener('DOMContentLoaded', () => {

    // ===== Бургер-меню =====
    const burger = document.getElementById('burger');
    const nav = document.getElementById('nav');

    burger.addEventListener('click', () => {
        nav.classList.toggle('active');
    });

    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
        });
    });

    // ===== Выбор эмоций =====
    const btnNext = document.getElementById('btnNext');
    const emotionRows = document.querySelectorAll('.emotion-row');

    // Хранилище выбранных эмоций
    const selectedEmotions = new Set();

    // Выбор эмоций
    emotionRows.forEach(row => {
        row.addEventListener('click', () => {
            const emotion = row.dataset.emotion;

            if (selectedEmotions.has(emotion)) {
                selectedEmotions.delete(emotion);
                row.classList.remove('active');
            } else {
                selectedEmotions.add(emotion);
                row.classList.add('active');
            }

            // Активация кнопки "Далее"
            if (selectedEmotions.size > 0) {
                btnNext.disabled = false;
            } else {
                btnNext.disabled = true;
            }
        });
    });

    // Кнопка "Далее"
    if (btnNext) {
        btnNext.addEventListener('click', () => {
            console.log('Выбранные эмоции:', Array.from(selectedEmotions));
            // Здесь будет переход на следующий этап
            alert('Эмоции сохранены: ' + Array.from(selectedEmotions).join(', '));
        });
    }

});