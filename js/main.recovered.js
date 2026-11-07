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

    // ===== Подсветка активного пункта меню при скролле =====
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY + 100;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            const link = nav.querySelector(`a[href="#${id}"]`);

            if (link) {
                if (scrollY >= top && scrollY < top + height) {
                    link.style.color = '#fff';
                } else {
                    link.style.color = '';
                }
            }
        });
    });

    // ===== Генеративная canvas-графика =====
    const canvas = document.getElementById('heroCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let w, h, particles, blobs, lines;
        let animId;

        // Палитра Neon Generative Art
        const palette = [
            { r: 168, g: 85, b: 247, a: 0.4 },    // electric purple
            { r: 0, g: 220, b: 255, a: 0.45 },    // bright cyan
            { r: 37, g: 99, b: 235, a: 0.35 },    // ultramarine
            { r: 163, g: 230, b: 53, a: 0.35 },   // acid lime
            { r: 139, g: 92, b: 246, a: 0.3 },    // soft violet
        ];

        // Частицы
        class Particle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * w;
                this.y = Math.random() * h;
                this.r = Math.random() * 2.5 + 0.5;
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                this.alpha = Math.random() * 0.6 + 0.2;
                this.color = palette[Math.floor(Math.random() * palette.length)];
                this.pulse = Math.random() * Math.PI * 2;
                this.pulseSpeed = Math.random() * 0.02 + 0.005;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.pulse += this.pulseSpeed;

                if (this.x < -10 || this.x > w + 10 || this.y < -10 || this.y > h + 10) {
                    this.reset();
                }
            }

            draw() {
                const currentAlpha = this.alpha * (0.6 + 0.4 * Math.sin(this.pulse));
                const c = this.color;

                // Внешний ореол — мягкое неоновое свечение
                ctx.save();
                ctx.globalCompositeOperation = 'lighter';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.r * 8, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${currentAlpha * 0.12})`;
                ctx.fill();

                // Средний ореол
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.r * 4, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${currentAlpha * 0.3})`;
                ctx.fill();

                // Яркое ядро
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${Math.min(c.r + 60, 255)}, ${Math.min(c.g + 60, 255)}, ${Math.min(c.b + 60, 255)}, ${currentAlpha * 1.2})`;
                ctx.fill();

                ctx.restore();
            }
        }

        // Органический blob
        class Blob {
            constructor(index) {
                this.index = index;
                this.cx = Math.random() * w;
                this.cy = Math.random() * h;
                this.baseR = Math.random() * 120 + 80;
                this.vx = (Math.random() - 0.5) * 0.6;
                this.vy = (Math.random() - 0.5) * 0.6;
                this.color = palette[index % palette.length];
                this.phase = Math.random() * Math.PI * 2;
                this.phaseSpeed = Math.random() * 0.008 + 0.003;
                this.amplitude = Math.random() * 30 + 15;
                this.points = 60;

                // === Базовые волны деформации — постоянная асимметричная форма ===
                this.deformWaves = [];
                const waveCount = 4 + Math.floor(Math.random() * 3); // 4–6 волн
                for (let i = 0; i < waveCount; i++) {
                    this.deformWaves.push({
                        freq: 2 + Math.floor(Math.random() * 6),
                        amp: Math.random() * 22 + 10,
                        speed: (Math.random() - 0.5) * 0.5,          // ×10: 0.05→0.5
                        phase: Math.random() * Math.PI * 2
                    });
                }
                this.deformPhase = Math.random() * Math.PI * 2;
                this.deformSpeed = Math.random() * 2.0 + 1.5;     // ×2: 0.5–1.5→1.5–3.5
                this.deformAxisX = Math.random() * Math.PI * 2;    // ось вытяжения
                this.deformAxisY = Math.random() * Math.PI * 2;    // ось вытяжения
                this.asymPulsePhase = Math.random() * Math.PI * 2;

                // === Локальные зоны деформации — перетекающие выпуклости ===
                this.bulgeZones = [];
                const zoneCount = 3 + Math.floor(Math.random() * 3); // 3–5 зон
                for (let i = 0; i < zoneCount; i++) {
                    this.bulgeZones.push({
                        angle: (i / zoneCount) * Math.PI * 2 + Math.random() * 0.3,
                        target: (Math.random() - 0.5) * this.baseR * 0.28,
                        current: (Math.random() - 0.5) * this.baseR * 0.15,
                        speed: 0.04 + Math.random() * 0.08,             // ×10: 0.004–0.012→0.04–0.12
                        phase: Math.random() * Math.PI * 2,
                        width: 0.35 + Math.random() * 0.25,              // ширина зоны: 0.35–0.60 рад (20–35°)
                        driftSpeed: (Math.random() - 0.5) * 0.005        // ×5: 0.001→0.005
                    });
                }
                // Скорость интерполяции — заметно за 2–3 секунды
                this.lerpSpeed = 0.02 + Math.random() * 0.015;
            }

            update() {
                this.phase += this.phaseSpeed;
                this.deformPhase += this.deformSpeed * 0.01;

                // === Интерполяция зон деформации к целевым значениям ===
                for (let i = 0; i < this.bulgeZones.length; i++) {
                    const bz = this.bulgeZones[i];
                    const diff = bz.target - bz.current;
                    bz.current += diff * this.lerpSpeed;

                    // Периодическая смена цели
                    bz.phase += bz.speed;
                    if (Math.sin(bz.phase) < -0.95) {
                        bz.target = (Math.random() - 0.5) * this.baseR * 0.28;
                    }

                    // Медленный дрейф угла зоны — выпуклость «ползёт» по контуру
                    bz.angle += bz.driftSpeed;
                }

                // === Независимое блуждание с плавным хаотичным изменением направления ===
                // Медленное случайное блуждание вектора скорости
                this.vx += (Math.random() - 0.5) * 0.03;
                this.vy += (Math.random() - 0.5) * 0.03;

                // Ограничение максимальной скорости — плавное движение
                const maxSpeed = 0.8;
                const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                if (speed > maxSpeed) {
                    this.vx = (this.vx / speed) * maxSpeed;
                    this.vy = (this.vy / speed) * maxSpeed;
                }

                // Минимальная скорость — фигура не замирает
                const minSpeed = 0.2;
                if (speed < minSpeed && speed > 0) {
                    this.vx = (this.vx / speed) * minSpeed;
                    this.vy = (this.vy / speed) * minSpeed;
                }

                this.cx += this.vx;
                this.cy += this.vy;

                // Мягкое отталкивание от краёв с запасом
                const margin = this.baseR * 1.5;
                if (this.cx < margin) this.vx += 0.05;
                if (this.cx > w - margin) this.vx -= 0.05;
                if (this.cy < margin) this.vy += 0.05;
                if (this.cy > h - margin) this.vy -= 0.05;
            }

            // Получить радиус фигуры в заданном угле с учётом волн и локальных зон
            getRadius(angle, time) {
                let r = this.baseR;

                // === Базовые волны — постоянная асимметричная форма ===
                for (let i = 0; i < this.deformWaves.length; i++) {
                    const w = this.deformWaves[i];
                    r += Math.sin(angle * w.freq + this.deformPhase + w.phase + time * w.speed) * w.amp;
                }

                // === Асимметричное вытяжение с пульсацией ===
                const asymPulse = Math.sin(this.asymPulsePhase + time * 0.03) * 0.5 + 0.5; // ×10: 0.003→0.03
                r += Math.sin(angle + this.deformAxisX) * this.baseR * (0.15 + asymPulse * 0.08);
                r += Math.cos(angle * 2 + this.deformAxisY) * this.baseR * (0.10 + asymPulse * 0.06);

                // === Глобальное дыхание ===
                r += Math.sin(time * 0.03 + this.phase) * this.baseR * 0.08; // ×10: 0.003→0.03

                // === Локальные зоны деформации — перетекающие выпуклости ===
                for (let i = 0; i < this.bulgeZones.length; i++) {
                    const bz = this.bulgeZones[i];
                    let diff = angle - bz.angle;
                    // Нормализация в [-PI, PI]
                    while (diff > Math.PI) diff -= Math.PI * 2;
                    while (diff < -Math.PI) diff += Math.PI * 2;

                    // Узкий Gaussian — влияние только вблизи центра зоны
                    const width = bz.width;
                    const influence = Math.exp(-(diff * diff) / (2 * width * width));
                    r += bz.current * influence;
                }

                // Защита от отрицательного и слишком маленького радиуса
                r = Math.max(r, this.baseR * 0.2);

                return r;
            }

            draw() {
                const c = this.color;
                const t = performance.now() * 0.001; // время в секундах для синхронизации
                const pts = this.points;

                // === Вычисляем все точки контура один раз для оптимизации ===
                const contour = [];
                for (let i = 0; i <= pts; i++) {
                    const angle = (i / pts) * Math.PI * 2;
                    const r = this.getRadius(angle, t);
                    contour.push({
                        x: this.cx + Math.cos(angle) * r,
                        y: this.cy + Math.sin(angle) * r
                    });
                }

                // === Слой 1: объёмное внутреннее свечение с радиальным градиентом ===
                ctx.save();
                ctx.globalCompositeOperation = 'lighter';

                // Основной градиент — яркое ядро с плавным затуханием
                ctx.beginPath();
                ctx.moveTo(contour[0].x, contour[0].y);
                for (let i = 1; i <= pts; i++) {
                    const prev = contour[i - 1];
                    const curr = contour[i];
                    const mx = (prev.x + curr.x) / 2;
                    const my = (prev.y + curr.y) / 2;
                    ctx.quadraticCurveTo(prev.x, prev.y, mx, my);
                }
                ctx.closePath();

                // Многослойный градиент: яркое ядро → насыщенный цвет → прозрачные края
                const glowGrad = ctx.createRadialGradient(
                    this.cx - this.baseR * 0.15, this.cy - this.baseR * 0.15, 0,
                    this.cx, this.cy, this.baseR * 1.8
                );
                glowGrad.addColorStop(0, `rgba(${Math.min(c.r + 80, 255)}, ${Math.min(c.g + 80, 255)}, ${Math.min(c.b + 80, 255)}, ${c.a * 2.5})`);
                glowGrad.addColorStop(0.3, `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a * 1.6})`);
                glowGrad.addColorStop(0.7, `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a * 0.5})`);
                glowGrad.addColorStop(1, `rgba(${c.r}, ${c.g}, ${c.b}, 0)`);
                ctx.fillStyle = glowGrad;
                ctx.fill();

                ctx.restore();

                // === Слой 2: светотень для объёма ===
                ctx.save();
                ctx.globalAlpha = 0.25;

                // Смещённый источник света — тень на противоположной стороне
                const lightAngle = Math.atan2(this.cy - this.baseR * 0.3, this.cx - this.baseR * 0.3);
                const shadowGrad = ctx.createRadialGradient(
                    this.cx + Math.cos(lightAngle) * this.baseR * 0.3,
                    this.cy + Math.sin(lightAngle) * this.baseR * 0.3,
                    0,
                    this.cx, this.cy, this.baseR * 1.2
                );
                shadowGrad.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
                shadowGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.05)');
                shadowGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.15)');
                shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0.4)');

                ctx.beginPath();
                ctx.moveTo(contour[0].x, contour[0].y);
                for (let i = 1; i <= pts; i++) {
                    const prev = contour[i - 1];
                    const curr = contour[i];
                    const mx = (prev.x + curr.x) / 2;
                    const my = (prev.y + curr.y) / 2;
                    ctx.quadraticCurveTo(prev.x, prev.y, mx, my);
                }
                ctx.closePath();
                ctx.fillStyle = shadowGrad;
                ctx.fill();

                ctx.restore();

                // === Слой 3: биолюминесцентное свечение (additive) ===
                ctx.save();
                ctx.globalCompositeOperation = 'lighter';
                ctx.globalAlpha = 0.2;

                // Светящиеся участки — блики на поверхности
                for (let i = 0; i < 3; i++) {
                    const specularAngle = (i * Math.PI * 2 / 3) + t * 0.3 + this.index;
                    const specX = this.cx + Math.cos(specularAngle) * this.baseR * 0.4;
                    const specY = this.cy + Math.sin(specularAngle) * this.baseR * 0.4;

                    const specGrad = ctx.createRadialGradient(specX, specY, 0, specX, specY, this.baseR * 0.5);
                    specGrad.addColorStop(0, `rgba(${Math.min(c.r + 100, 255)}, ${Math.min(c.g + 100, 255)}, ${Math.min(c.b + 100, 255)}, ${c.a * 1.2})`);
                    specGrad.addColorStop(1, `rgba(${c.r}, ${c.g}, ${c.b}, 0)`);

                    ctx.beginPath();
                    ctx.arc(specX, specY, this.baseR * 0.5, 0, Math.PI * 2);
                    ctx.fillStyle = specGrad;
                    ctx.fill();
                }

                ctx.restore();

                // === Слой 4: неоновый контур с усиленным свечением ===
                ctx.save();
                ctx.globalAlpha = 0.65;
                ctx.strokeStyle = `rgba(${Math.min(c.r + 40, 255)}, ${Math.min(c.g + 40, 255)}, ${Math.min(c.b + 40, 255)}, 0.85)`;
                ctx.lineWidth = 1.8;
                ctx.shadowColor = `rgba(${c.r}, ${c.g}, ${c.b}, 1)`;
                ctx.shadowBlur = 28;
                ctx.beginPath();

                ctx.moveTo(contour[0].x, contour[0].y);
                for (let i = 1; i <= pts; i++) {
                    const prev = contour[i - 1];
                    const curr = contour[i];
                    const mx = (prev.x + curr.x) / 2;
                    const my = (prev.y + curr.y) / 2;
                    ctx.quadraticCurveTo(prev.x, prev.y, mx, my);
                }
                ctx.closePath();
                ctx.stroke();
                ctx.restore();

                // === Слой 5: тонкая яркая обводка для чёткости ===
                ctx.save();
                ctx.globalAlpha = 0.35;
                ctx.strokeStyle = `rgba(${Math.min(c.r + 60, 255)}, ${Math.min(c.g + 60, 255)}, ${Math.min(c.b + 60, 255)}, 0.5)`;
                ctx.lineWidth = 0.8;
                ctx.shadowColor = `rgba(${c.r}, ${c.g}, ${c.b}, 0.6)`;
                ctx.shadowBlur = 10;
                ctx.beginPath();

                ctx.moveTo(contour[0].x, contour[0].y);
                for (let i = 1; i <= pts; i++) {
                    const prev = contour[i - 1];
                    const curr = contour[i];
                    const mx = (prev.x + curr.x) / 2;
                    const my = (prev.y + curr.y) / 2;
                    ctx.quadraticCurveTo(prev.x, prev.y, mx, my);
                }
                ctx.closePath();
                ctx.stroke();
                ctx.restore();
            }
        }
        class Thread {
            constructor() {
                this.reset();
            }

            reset() {
                this.x1 = Math.random() * w;
                this.y1 = Math.random() * h;
                this.x2 = this.x1 + (Math.random() - 0.5) * 300;
                this.y2 = this.y1 + (Math.random() - 0.5) * 300;
                this.color = palette[Math.floor(Math.random() * palette.length)];
                this.alpha = Math.random() * 0.2 + 0.08;
                this.phase = Math.random() * Math.PI * 2;
                this.phaseSpeed = Math.random() * 0.01 + 0.003;
                this.amplitude = Math.random() * 40 + 20;
                this.segments = 20;
            }

            update() {
                this.phase += this.phaseSpeed;
            }

            draw() {
                const c = this.color;
                ctx.save();

                // Неоновое свечение линии
                ctx.strokeStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${this.alpha * (0.5 + 0.5 * Math.sin(this.phase))})`;
                ctx.lineWidth = 1.5;
                ctx.lineCap = 'round';
                ctx.shadowColor = `rgba(${c.r}, ${c.g}, ${c.b}, 0.8)`;
                ctx.shadowBlur = 14;

                ctx.beginPath();

                for (let i = 0; i <= this.segments; i++) {
                    const t = i / this.segments;
                    const x = this.x1 + (this.x2 - this.x1) * t
                        + Math.sin(this.phase + t * Math.PI * 2) * this.amplitude;
                    const y = this.y1 + (this.y2 - this.y1) * t
                        + Math.cos(this.phase * 0.7 + t * Math.PI * 2) * this.amplitude;

                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }

                ctx.stroke();
                ctx.restore();
            }
        }

        // Инициализация
        function init() {
            const rect = canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            w = rect.width;
            h = rect.height;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            ctx.scale(dpr, dpr);

            particles = Array.from({ length: 60 }, () => new Particle());
            blobs = Array.from({ length: 5 }, (_, i) => new Blob(i));
            lines = Array.from({ length: 12 }, () => new Thread());
        }

        // Рендер-цикл
        function render() {
            ctx.clearRect(0, 0, w, h);

            // Более глубокий фон
            const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, w * 0.7);
            bgGrad.addColorStop(0, 'rgba(12, 12, 24, 1)');
            bgGrad.addColorStop(1, 'rgba(6, 6, 14, 1)');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, w, h);

            // Общая additive-подложка для свечения
            ctx.globalCompositeOperation = 'lighter';
            lines.forEach(l => { l.update(); l.draw(); });
            blobs.forEach(b => { b.update(); b.draw(); });
            particles.forEach(p => { p.update(); p.draw(); });
            ctx.globalCompositeOperation = 'source-over';

            // Мягкое затухание по краям
            const fadeGrad = ctx.createRadialGradient(w * 0.5, h * 0.5, w * 0.2, w * 0.5, h * 0.5, w * 0.75);
            fadeGrad.addColorStop(0, 'rgba(6, 6, 14, 0)');
            fadeGrad.addColorStop(1, 'rgba(6, 6, 14, 1)');
            ctx.fillStyle = fadeGrad;
            ctx.fillRect(0, 0, w, h);

            animId = requestAnimationFrame(render);
        }

        // Запуск
        init();
        render();

        // Ресайз
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                cancelAnimationFrame(animId);
                init();
                render();
            }, 250);
        });
    }

    // ===== Слайдер создания композиции =====
    const btnStartCreation = document.getElementById('btnStartCreation');
    const creatorArea = document.getElementById('creatorArea');
    const creatorTrack = document.getElementById('creatorTrack');
    const creatorClose = document.getElementById('creatorClose');
    const creatorSlides = document.querySelectorAll('.creator-slide');
    const creatorTotal = creatorSlides.length;
    let creatorCurrent = 0;
    let creatorTransitioning = false;

    function creatorOpen() {
        creatorCurrent = 0;
        creatorUpdate();
        creatorArea.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function creatorCloseFn() {
        creatorArea.classList.remove('active');
        document.body.style.overflow = '';
    }

    function creatorGoTo(index) {
        if (creatorTransitioning || index < 0 || index >= creatorTotal) return;
        creatorTransitioning = true;
        creatorCurrent = index;
        creatorUpdate();
        setTimeout(function() {
            creatorTransitioning = false;
        }, 600);
    }

    function creatorUpdate() {
        if (creatorTrack) {
            creatorTrack.style.transform = 'translateX(-' + (creatorCurrent * 25) + '%)';
        }
    }

    if (btnStartCreation) {
        btnStartCreation.addEventListener('click', function(e) {
            e.preventDefault();
            creatorOpen();
        });
    }

    if (creatorClose) {
        creatorClose.addEventListener('click', creatorCloseFn);
    }

    // ===== Выбор эмоций (Слайд 1) =====
    const selectedEmotions = new Set();
    const btnNextEmotion = document.getElementById('btnNextEmotion');
    const emotionRows = document.querySelectorAll('.emotion-row');

    emotionRows.forEach(function(row) {
        row.addEventListener('click', function() {
            var emotion = row.dataset.emotion;

            if (selectedEmotions.has(emotion)) {
                selectedEmotions.delete(emotion);
                row.classList.remove('active');
            } else {
                selectedEmotions.add(emotion);
                row.classList.add('active');
            }

            if (selectedEmotions.size > 0) {
                btnNextEmotion.disabled = false;
            } else {
                btnNextEmotion.disabled = true;
            }
        });
    });

    if (btnNextEmotion) {
        btnNextEmotion.addEventListener('click', function() {
            creatorGoTo(1);
        });
    }

    // ===== Выбор палитры (Слайд 2) =====
    var selectedPalette = null;
    var btnBackPalette = document.getElementById('btnBackPalette');
    var btnNextPalette = document.getElementById('btnNextPalette');
    var paletteCards = document.querySelectorAll('.palette-card');

    paletteCards.forEach(function(card) {
        card.addEventListener('click', function() {
            paletteCards.forEach(function(c) { c.classList.remove('active'); });
            card.classList.add('active');
            selectedPalette = card.dataset.palette;
            if (btnNextPalette) {
                btnNextPalette.disabled = false;
            }
        });
    });

    if (btnBackPalette) {
        btnBackPalette.addEventListener('click', function() {
            creatorGoTo(0);
        });
    }

    if (btnNextPalette) {
        btnNextPalette.addEventListener('click', function() {
            creatorGoTo(2);
        });
    }

    // ===== Выбор формы (Слайд 3) =====
    var selectedShape = null;
    var btnBackShape = document.getElementById('btnBackShape');
    var btnNextShape = document.getElementById('btnNextShape');
    var shapeCards = document.querySelectorAll('.shape-card');

    shapeCards.forEach(function(card) {
        card.addEventListener('click', function() {
            shapeCards.forEach(function(c) { c.classList.remove('active'); });
            card.classList.add('active');
            selectedShape = card.dataset.shape;
            if (btnNextShape) {
                btnNextShape.disabled = false;
            }
        });
    });

    if (btnBackShape) {
        btnBackShape.addEventListener('click', function() {
            creatorGoTo(1);
        });
    }

    if (btnNextShape) {
        btnNextShape.addEventListener('click', function() {
            creatorGoTo(3);
        });
    }

    // ===== Генерация результата (Слайд 4) =====
    var resultCanvas = document.getElementById('resultCanvas');
    var resultTitle = document.getElementById('resultTitle');
    var resultEmotionsEl = null;
    var resultPaletteEl = null;
    var btnSaveResult = document.getElementById('btnSaveResult');
    var btnRegenerate = document.getElementById('btnRegenerate');
    var btnChangeSettings = document.getElementById('btnChangeSettings');

    // Названия палитр
    var paletteNames = {
        cosmic: 'Космическое свечение',
        warm: 'Янтарная вспышка',
        quiet: 'Сапфировый импульс',
        contrast: 'Контраст чувств',
        lavender: 'Лавандовый туман',
        emerald: 'Изумрудный сон',
        neon: 'Алый резонанс',
        mono: 'Монохромная тишина'
    };

    // Названия форм
    var shapeNames = {
        organic: 'Органика',
        geometry: 'Геометрия',
        flow: 'Поток',
        particles: 'Частицы',
        neural: 'Нейронные связи',
        layers: 'Многослойность'
    };

    // Цвета для каждой палитры
    var paletteColors = {
        cosmic: [
            { r: 139, g: 53, b: 255 },
            { r: 168, g: 85, b: 247 },
            { r: 0, g: 245, b: 233 },
            { r: 0, g: 229, b: 255 },
            { r: 0, g: 184, b: 255 },
            { r: 36, g: 91, b: 255 },
            { r: 20, g: 85, b: 255 }
        ],
        warm: [
            { r: 255, g: 106, b: 0 },
            { r: 255, g: 69, b: 0 },
            { r: 255, g: 23, b: 68 },
            { r: 255, g: 0, b: 128 },
            { r: 230, g: 0, b: 92 },
            { r: 255, g: 196, b: 0 },
            { r: 255, g: 208, b: 0 }
        ],
        quiet: [
            { r: 0, g: 59, b: 206 },
            { r: 7, g: 91, b: 255 },
            { r: 23, g: 70, b: 162 },
            { r: 0, g: 191, b: 255 },
            { r: 184, g: 243, b: 255 },
            { r: 0, g: 27, b: 85 },
            { r: 65, g: 105, b: 225 }
        ],
        contrast: [
            { r: 215, g: 255, b: 0 },
            { r: 198, g: 255, b: 0 },
            { r: 168, g: 255, b: 0 },
            { r: 255, g: 0, b: 200 },
            { r: 255, g: 20, b: 147 },
            { r: 245, g: 0, b: 255 },
            { r: 48, g: 0, b: 79 },
            { r: 23, g: 0, b: 43 }
        ],
        lavender: [
            { r: 192, g: 132, b: 252 },
            { r: 249, g: 168, b: 212 },
            { r: 254, g: 243, b: 199 }
        ],
        emerald: [
            { r: 0, g: 230, b: 118 },
            { r: 0, g: 255, b: 102 },
            { r: 0, g: 223, b: 162 },
            { r: 0, g: 245, b: 196 },
            { r: 0, g: 207, b: 255 },
            { r: 255, g: 214, b: 0 },
            { r: 255, g: 234, b: 0 }
        ],
        neon: [
            { r: 255, g: 0, b: 51 },
            { r: 230, g: 0, b: 38 },
            { r: 192, g: 0, b: 53 },
            { r: 139, g: 0, b: 0 },
            { r: 255, g: 23, b: 68 },
            { r: 255, g: 0, b: 168 },
            { r: 255, g: 0, b: 140 },
            { r: 213, g: 0, b: 109 }
        ],
        mono: [
            { r: 55, g: 65, b: 81 },
            { r: 156, g: 163, b: 175 },
            { r: 249, g: 250, b: 251 }
        ]
    };

    // ===== Эмоциональные цветовые профили =====
    var emotionColors = {
        calm: {
            main: [
                { r: 0, g: 180, b: 200 },
                { r: 0, g: 140, b: 180 },
                { r: 30, g: 100, b: 160 }
            ],
            accent: { r: 80, g: 220, b: 230 },
            transition: 'smooth'
        },
        sadness: {
            main: [
                { r: 20, g: 40, b: 140 },
                { r: 40, g: 60, b: 180 },
                { r: 80, g: 120, b: 200 }
            ],
            accent: { r: 100, g: 160, b: 255 },
            transition: 'gradual'
        },
        anxiety: {
            main: [
                { r: 120, g: 200, b: 30 },
                { r: 140, g: 40, b: 200 },
                { r: 15, g: 10, b: 25 }
            ],
            accent: { r: 200, g: 255, b: 50 },
            transition: 'sharp'
        },
        anger: {
            main: [
                { r: 200, g: 20, b: 20 },
                { r: 180, g: 30, b: 40 },
                { r: 120, g: 10, b: 30 }
            ],
            accent: { r: 255, g: 80, b: 50 },
            transition: 'harsh'
        },
        inspiration: {
            main: [
                { r: 220, g: 40, b: 180 },
                { r: 160, g: 40, b: 240 },
                { r: 30, g: 180, b: 255 }
            ],
            accent: { r: 255, g: 120, b: 255 },
            transition: 'vivid'
        },
        hope: {
            main: [
                { r: 40, g: 200, b: 80 },
                { r: 30, g: 200, b: 180 },
                { r: 240, g: 200, b: 60 }
            ],
            accent: { r: 255, g: 240, b: 100 },
            transition: 'bright'
        },
        joy: {
            main: [
                { r: 255, g: 200, b: 30 },
                { r: 255, g: 120, b: 50 },
                { r: 255, g: 80, b: 80 }
            ],
            accent: { r: 255, g: 255, b: 150 },
            transition: 'warm'
        },
        doubt: {
            main: [
                { r: 100, g: 60, b: 160 },
                { r: 80, g: 100, b: 140 },
                { r: 180, g: 130, b: 160 }
            ],
            accent: { r: 140, g: 120, b: 180 },
            transition: 'muted'
        },
        ecstasy: {
            main: [
                { r: 255, g: 30, b: 120 },
                { r: 255, g: 140, b: 20 },
                { r: 20, g: 180, b: 255 }
            ],
            accent: { r: 255, g: 200, b: 100 },
            transition: 'explosive'
        },
        fatigue: {
            main: [
                { r: 50, g: 50, b: 60 },
                { r: 60, g: 40, b: 80 },
                { r: 140, g: 100, b: 40 }
            ],
            accent: { r: 100, g: 90, b: 120 },
            transition: 'dull'
        },
        curiosity: {
            main: [
                { r: 0, g: 200, b: 220 },
                { r: 140, g: 40, b: 220 },
                { r: 240, g: 230, b: 40 }
            ],
            accent: { r: 100, g: 255, b: 255 },
            transition: 'vibrant'
        },
        longing: {
            main: [
                { r: 120, g: 30, b: 80 },
                { r: 20, g: 30, b: 100 },
                { r: 30, g: 140, b: 160 }
            ],
            accent: { r: 160, g: 60, b: 120 },
            transition: 'melancholy'
        }
    };

    // ===== Распределение цветов палитры по ролям =====
    function getPaletteColors() {
        var palette = paletteColors[selectedPalette] || paletteColors.cosmic;
        var result = {
            main: [],
            accent: [],
            secondary: [],
            dark: [],
            light: []
        };

        // Распределяем цвета по ролям на основе яркости и насыщенности
        for (var i = 0; i < palette.length; i++) {
            var c = palette[i];
            var brightness = (c.r * 0.299 + c.g * 0.587 + c.b * 0.114);

            if (brightness < 60) {
                result.dark.push(c);
            } else if (brightness > 200) {
                result.light.push(c);
            } else if (i < Math.ceil(palette.length * 0.3)) {
                result.main.push(c);
            } else if (i < Math.ceil(palette.length * 0.6)) {
                result.accent.push(c);
            } else {
                result.secondary.push(c);
            }
        }

        // Если роли пустые — заполняем равномерно
        if (result.main.length === 0) {
            var half = Math.ceil(palette.length / 2);
            for (var i = 0; i < half; i++) result.main.push(palette[i]);
        }
        if (result.accent.length === 0) {
            var start = Math.ceil(palette.length * 0.3);
            var end = Math.ceil(palette.length * 0.6);
            for (var i = start; i < end; i++) result.accent.push(palette[i]);
        }
        if (result.secondary.length === 0) {
            var start = Math.ceil(palette.length * 0.6);
            for (var i = start; i < palette.length; i++) result.secondary.push(palette[i]);
        }
        if (result.dark.length === 0) {
            result.dark.push({ r: 10, g: 8, b: 22 });
        }
        if (result.light.length === 0) {
            result.light.push({ r: 255, g: 255, b: 255 });
        }

        return result;
    }

    // ===== Выбор цветов из палитры для генерации =====
    function getGenerationColors() {
        var palette = getPaletteColors();
        var result = [];

        // Основные цвета — крупные элементы
        for (var i = 0; i < palette.main.length; i++) result.push(palette.main[i]);
        // Акцентные — яркие детали
        for (var i = 0; i < palette.accent.length; i++) result.push(palette.accent[i]);
        // Дополнительные — частицы и линии
        for (var i = 0; i < palette.secondary.length; i++) result.push(palette.secondary[i]);
        // Тёмные — фон и тени
        for (var i = 0; i < palette.dark.length; i++) result.push(palette.dark[i]);
        // Светлые — блики
        for (var i = 0; i < palette.light.length; i++) result.push(palette.light[i]);

        return result;
    }

    // ===== Библиотека насыщенных цветов для итоговой композиции =====
    var compositionColors = {
        reds: [
            { r: 255, g: 0, b: 51 },
            { r: 230, g: 0, b: 38 },
            { r: 192, g: 0, b: 53 },
            { r: 255, g: 23, b: 68 },
            { r: 139, g: 0, b: 0 },
            { r: 255, g: 77, b: 109 }
        ],
        blues: [
            { r: 0, g: 59, b: 255 },
            { r: 0, g: 87, b: 255 },
            { r: 0, g: 71, b: 171 },
            { r: 0, g: 102, b: 255 },
            { r: 0, g: 166, b: 255 },
            { r: 0, g: 207, b: 255 }
        ],
        greens: [
            { r: 0, g: 200, b: 83 },
            { r: 0, g: 255, b: 102 },
            { r: 57, g: 255, b: 20 },
            { r: 0, g: 143, b: 69 },
            { r: 0, g: 168, b: 107 },
            { r: 182, g: 255, b: 0 }
        ],
        yellows: [
            { r: 255, g: 208, b: 0 },
            { r: 255, g: 234, b: 0 },
            { r: 255, g: 176, b: 0 },
            { r: 255, g: 122, b: 0 },
            { r: 255, g: 69, b: 0 },
            { r: 255, g: 149, b: 0 }
        ],
        pinks: [
            { r: 255, g: 20, b: 147 },
            { r: 255, g: 0, b: 168 },
            { r: 255, g: 79, b: 203 },
            { r: 255, g: 105, b: 180 },
            { r: 230, g: 0, b: 115 },
            { r: 255, g: 45, b: 149 }
        ],
        purples: [
            { r: 123, g: 0, b: 255 },
            { r: 148, g: 0, b: 255 },
            { r: 160, g: 32, b: 240 },
            { r: 106, g: 0, b: 255 },
            { r: 192, g: 0, b: 255 },
            { r: 75, g: 0, b: 130 }
        ],
        cyans: [
            { r: 0, g: 191, b: 255 },
            { r: 0, g: 229, b: 255 },
            { r: 0, g: 255, b: 209 },
            { r: 0, g: 166, b: 200 },
            { r: 64, g: 224, b: 208 },
            { r: 0, g: 255, b: 255 }
        ],
        neutrals: [
            { r: 255, g: 255, b: 255 },
            { r: 245, g: 245, b: 245 },
            { r: 217, g: 226, b: 242 },
            { r: 23, g: 23, b: 23 },
            { r: 8, g: 8, b: 8 },
            { r: 0, g: 0, b: 0 }
        ]
    };

    // Выбор цветов для генерации — использует paletteColors напрямую
    function getGenerationColors() {
        var palette = getPaletteColors();
        var result = [];

        // Основные цвета — крупные элементы
        for (var i = 0; i < palette.main.length; i++) result.push(palette.main[i]);
        // Акцентные — яркие детали
        for (var i = 0; i < palette.accent.length; i++) result.push(palette.accent[i]);
        // Дополнительные — частицы и линии
        for (var i = 0; i < palette.secondary.length; i++) result.push(palette.secondary[i]);
        // Тёмные — фон и тени
        for (var i = 0; i < palette.dark.length; i++) result.push(palette.dark[i]);
        // Светлые — блики
        for (var i = 0; i < palette.light.length; i++) result.push(palette.light[i]);

        return result;
    }

    // Генератор названий произведений
    function generateTitle(emotions, palette, shape) {
        var prefixes = ['Тихий', 'Пульсирующий', 'Между', 'Внутри', 'За', 'Сквозь', 'После', 'До'];
        var middles = ['космос', 'свет', 'тьма', 'шум', 'тишина', 'пuls', 'эхо', 'путь'];
        var suffixes = ['и тени', 'и звука', 'мечты', 'надежды', 'вечности', 'момент', 'пространство'];

        var emotionIndex = emotions.length > 0 ? emotions[0].length % prefixes.length : 0;
        var title = prefixes[emotionIndex] + ' ' + middles[(emotions.length + shape.length) % middles.length] + ' ' + suffixes[(palette.length + shape.length) % suffixes.length];

        return title.charAt(0).toUpperCase() + title.slice(1);
    }

    // Генерация композиции — улучшенная версия
    function generateComposition() {
        if (!resultCanvas) return;

        var ctx = resultCanvas.getContext('2d');
        var rect = resultCanvas.getBoundingClientRect();
        var dpr = window.devicePixelRatio || 1;
        var w = rect.width || 900;
        var h = rect.height || 506;
        resultCanvas.width = w * dpr;
        resultCanvas.height = h * dpr;
        ctx.scale(dpr, dpr);

        // === Глубокий фон с текстурой ===
        var bgGrad = ctx.createRadialGradient(w * 0.45, h * 0.4, 0, w * 0.5, h * 0.5, w * 0.75);
        bgGrad.addColorStop(0, 'rgba(18, 14, 35, 1)');
        bgGrad.addColorStop(0.5, 'rgba(10, 8, 22, 1)');
        bgGrad.addColorStop(1, 'rgba(4, 3, 10, 1)');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // Сетка точек на фоне
        ctx.save();
        ctx.globalAlpha = 0.03;
        for (var bx = 0; bx < w; bx += 20) {
            for (var by = 0; by < h; by += 20) {
                ctx.beginPath();
                ctx.arc(bx, by, 0.5, 0, Math.PI * 2);
                ctx.fillStyle = '#fff';
                ctx.fill();
            }
        }
        ctx.restore();

        // Получаем цвета ИЗ ВЫБРАННОЙ ПАЛИТРЫ — не из библиотеки
        var colors = getGenerationColors();

        // Определяем композиционный центр
        var cx1 = w * (0.3 + Math.random() * 0.4);
        var cy1 = h * (0.25 + Math.random() * 0.5);
        var cx2 = w * (0.2 + Math.random() * 0.6);
        var cy2 = h * (0.2 + Math.random() * 0.6);
        var cx3 = w * (0.15 + Math.random() * 0.7);
        var cy3 = h * (0.15 + Math.random() * 0.7);

        // Количество элементов зависит от формы
        var shapeType = selectedShape || 'organic';
        var emotionIntensity = selectedEmotions.size / 12;
        var intensityFactor = 0.5 + emotionIntensity * 0.5;

        // ===== Эмоциональные характеристики рендеринга =====
        var hasAnger = selectedEmotions.has('anger');
        var hasAnxiety = selectedEmotions.has('anxiety');
        var hasJoy = selectedEmotions.has('joy');
        var hasEcstasy = selectedEmotions.has('ecstasy');
        var hasSadness = selectedEmotions.has('sadness');
        var hasFatigue = selectedEmotions.has('fatigue');
        var hasInspiration = selectedEmotions.has('inspiration');

        // Контраст и насыщенность — теперь эмоции НЕ уничтожают палитру
        var contrastBoost = 1.0;
        var saturationBoost = 1.0;
        var glowIntensity = 1.0;

        if (hasAnger) {
            contrastBoost = 1.15;
            saturationBoost = 1.1;
            glowIntensity = 1.3;
        }
        if (hasAnxiety) {
            contrastBoost = 1.1;
            saturationBoost = 1.1;
            glowIntensity = 1.4;
        }
        if (hasJoy || hasEcstasy) {
            saturationBoost = 1.15;
            glowIntensity = 1.3;
        }
        if (hasSadness) {
            contrastBoost = 0.95;
            glowIntensity = 0.85;
        }
        if (hasFatigue) {
            contrastBoost = 0.92;
            saturationBoost = 0.88;
            glowIntensity = 0.7;
        }
        if (hasInspiration) {
            saturationBoost = 1.15;
            glowIntensity = 1.3;
        }

        // Функция для лёгкой коррекции цвета — эмоции НЕ подменяют палитру
        function boostColor(c) {
            return {
                r: Math.min(Math.round(c.r * saturationBoost * contrastBoost), 255),
                g: Math.min(Math.round(c.g * saturationBoost * contrastBoost), 255),
                b: Math.min(Math.round(c.b * saturationBoost * contrastBoost), 255)
            };
        }

        // Функция для прозрачности — эмоции влияют мягко
        function emotionOpacity(base) {
            // Интенсивность эмоций влияет на прозрачность очень слабо
            var opacityFactor = 0.85 + intensityFactor * 0.15;
            return base * opacityFactor * (hasAnger || hasAnxiety ? 1.1 : 1.0);
        }

        // === ЗАДНИЙ ПЛАН: крупные формы ===
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        if (shapeType === 'organic') {
            // Органика: 5 крупных blob-форм
            for (var i = 0; i < 5; i++) {
                var c = boostColor(colors[i % colors.length]);
                var px = [cx1, cx2, cx3, w * 0.15, w * 0.85][i];
                var py = [cy1, cy2, cy3, h * 0.2, h * 0.8][i];
                var br = 80 + Math.random() * 120;
                var grad = ctx.createRadialGradient(px, py, 0, px, py, br * 2);
                grad.addColorStop(0, 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + emotionOpacity(0.35) + ')');
                grad.addColorStop(0.4, 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + emotionOpacity(0.18) + ')');
                grad.addColorStop(0.7, 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + emotionOpacity(0.06) + ')');
                grad.addColorStop(1, 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', 0)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(px, py, br * 2, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (shapeType === 'geometry') {
            // Геометрия: крупные многоугольники
            for (var i = 0; i < 8; i++) {
                var c = boostColor(colors[i % colors.length]);
                var px = [cx1, cx2, cx3, w * 0.2, w * 0.8, w * 0.5, w * 0.15, w * 0.85][i];
                var py = [cy1, cy2, cy3, h * 0.3, h * 0.7, h * 0.5, h * 0.2, h * 0.8][i];
                var br = 50 + Math.random() * 100;
                var sides = 3 + Math.floor(Math.random() * 5);
                ctx.beginPath();
                for (var j = 0; j <= sides; j++) {
                    var angle = (j / sides) * Math.PI * 2 - Math.PI / 2 + Math.random() * 0.2;
                    var x = px + Math.cos(angle) * br;
                    var y = py + Math.sin(angle) * br;
                    if (j === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.fillStyle = 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + emotionOpacity(0.25) + ')';
                ctx.fill();
                var edgeC = { r: Math.min(c.r + 80, 255), g: Math.min(c.g + 80, 255), b: Math.min(c.b + 80, 255) };
                ctx.strokeStyle = 'rgba(' + edgeC.r + ', ' + edgeC.g + ', ' + edgeC.b + ', ' + emotionOpacity(0.5) + ')';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        } else if (shapeType === 'flow') {
            // Поток: 10 плотных волн
            for (var i = 0; i < 10; i++) {
                var c = boostColor(colors[i % colors.length]);
                var yBase = h * (0.1 + i * 0.09);
                var amp = 20 + Math.random() * 40 * intensityFactor;
                var freq = 2 + Math.floor(Math.random() * 3);
                ctx.strokeStyle = 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + emotionOpacity(0.4) + ')';
                ctx.lineWidth = 3 + Math.random() * 5;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(-10, yBase);
                for (var t = 0; t <= 1; t += 0.02) {
                    var x = t * (w + 20) - 10;
                    var y = yBase + Math.sin(t * Math.PI * 2 * freq + i) * amp;
                    ctx.lineTo(x, y);
                }
                ctx.stroke();
            }
        } else if (shapeType === 'particles') {
            // Частицы: фоновые крупные
            for (var i = 0; i < 80; i++) {
                var c = boostColor(colors[Math.floor(Math.random() * colors.length)]);
                var px = Math.random() * w;
                var py = Math.random() * h;
                var pr = 3 + Math.random() * 8;
                ctx.beginPath();
                ctx.arc(px, py, pr * 4, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + emotionOpacity(0.08) + ')';
                ctx.fill();
            }
        } else if (shapeType === 'neural') {
            // Нейронные связи: крупные узлы
            var nodes = [];
            for (var i = 0; i < 15; i++) {
                var c = boostColor(colors[i % colors.length]);
                var px = [cx1, cx2, cx3, w * 0.2, w * 0.8, w * 0.5, w * 0.3, w * 0.7, w * 0.15, w * 0.85, w * 0.5, w * 0.4, w * 0.6, w * 0.25, w * 0.75][i];
                var py = [cy1, cy2, cy3, h * 0.3, h * 0.7, h * 0.5, h * 0.2, h * 0.8, h * 0.25, h * 0.75, h * 0.4, h * 0.6, h * 0.35, h * 0.65, h * 0.5][i];
                var nr = 8 + Math.random() * 15;
                nodes.push({ x: px, y: py, r: nr, c: c });
                ctx.beginPath();
                ctx.arc(px, py, nr, 0, Math.PI * 2);
                var ng = ctx.createRadialGradient(px, py, 0, px, py, nr);
                ng.addColorStop(0, 'rgba(' + Math.min(c.r + 100, 255) + ', ' + Math.min(c.g + 100, 255) + ', ' + Math.min(c.b + 100, 255) + ', ' + emotionOpacity(0.8) + ')');
                ng.addColorStop(1, 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + emotionOpacity(0.3) + ')');
                ctx.fillStyle = ng;
                ctx.fill();
            }
            // Связи между узлами
            for (var i = 0; i < nodes.length; i++) {
                for (var j = i + 1; j < nodes.length; j++) {
                    var dx = nodes[i].x - nodes[j].x;
                    var dy = nodes[i].y - nodes[j].y;
                    var dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 300) {
                        ctx.beginPath();
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.strokeStyle = 'rgba(' + nodes[i].c.r + ', ' + nodes[i].c.g + ', ' + nodes[i].c.b + ', ' + emotionOpacity(0.2 * (1 - dist / 300)) + ')';
                        ctx.lineWidth = 1 + Math.random() * 2;
                        ctx.stroke();
                    }
                }
            }
        } else if (shapeType === 'layers') {
            // Многослойность: крупные полупрозрачные формы
            for (var i = 0; i < 6; i++) {
                var c = boostColor(colors[i % colors.length]);
                var px = [cx1, cx2, cx3, w * 0.2, w * 0.8, w * 0.5][i];
                var py = [cy1, cy2, cy3, h * 0.3, h * 0.7, h * 0.5][i];
                var br = 80 + Math.random() * 100;
                var rot = Math.random() * Math.PI;
                ctx.save();
                ctx.translate(px, py);
                ctx.rotate(rot);
                var lg = ctx.createRadialGradient(0, 0, 0, 0, 0, br * 1.5);
                lg.addColorStop(0, 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + emotionOpacity(0.25) + ')');
                lg.addColorStop(0.5, 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + emotionOpacity(0.12) + ')');
                lg.addColorStop(1, 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', 0)');
                ctx.fillStyle = lg;
                ctx.beginPath();
                ctx.ellipse(0, 0, br * 1.5, br, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }
        ctx.restore();

        // === СРЕДНИЙ ПЛАН: основные элементы ===
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        if (shapeType === 'organic') {
            // Органика: средние blob-формы
            for (var i = 0; i < 6; i++) {
                var c = boostColor(colors[i % colors.length]);
                var px = [cx1, cx2, cx3, w * 0.3, w * 0.7, w * 0.5][i];
                var py = [cy1, cy2, cy3, h * 0.35, h * 0.65, h * 0.5][i];
                var br = 40 + Math.random() * 60;
                var grad = ctx.createRadialGradient(px - br * 0.2, py - br * 0.2, 0, px, py, br * 1.3);
                grad.addColorStop(0, 'rgba(' + Math.min(c.r + 60, 255) + ', ' + Math.min(c.g + 60, 255) + ', ' + Math.min(c.b + 60, 255) + ', ' + emotionOpacity(0.45) + ')');
                grad.addColorStop(0.5, 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + emotionOpacity(0.2) + ')');
                grad.addColorStop(1, 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', 0)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(px, py, br * 1.3, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (shapeType === 'geometry') {
            // Геометрия: средние фигуры
            for (var i = 0; i < 10; i++) {
                var c = boostColor(colors[i % colors.length]);
                var px = [cx1, cx2, cx3, w * 0.25, w * 0.75, w * 0.5, w * 0.35, w * 0.65, w * 0.15, w * 0.85][i];
                var py = [cy1, cy2, cy3, h * 0.35, h * 0.65, h * 0.5, h * 0.25, h * 0.75, h * 0.3, h * 0.7][i];
                var br = 25 + Math.random() * 50;
                var sides = 3 + Math.floor(Math.random() * 5);
                ctx.beginPath();
                for (var j = 0; j <= sides; j++) {
                    var angle = (j / sides) * Math.PI * 2 - Math.PI / 2 + Math.random() * 0.15;
                    var x = px + Math.cos(angle) * br;
                    var y = py + Math.sin(angle) * br;
                    if (j === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.fillStyle = 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + emotionOpacity(0.3) + ')';
                ctx.fill();
                var edgeC = { r: Math.min(c.r + 80, 255), g: Math.min(c.g + 80, 255), b: Math.min(c.b + 80, 255) };
                ctx.strokeStyle = 'rgba(' + edgeC.r + ', ' + edgeC.g + ', ' + edgeC.b + ', ' + emotionOpacity(0.7) + ')';
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }
        } else if (shapeType === 'flow') {
            // Поток: яркие линии поверх волн
            for (var i = 0; i < 6; i++) {
                var c = boostColor(colors[i % colors.length]);
                var yBase = h * (0.15 + i * 0.13);
                var amp = 15 + Math.random() * 30 * intensityFactor;
                var freq = 3 + Math.floor(Math.random() * 2);
                var brightC = { r: Math.min(c.r + 40, 255), g: Math.min(c.g + 40, 255), b: Math.min(c.b + 40, 255) };
                ctx.strokeStyle = 'rgba(' + brightC.r + ', ' + brightC.g + ', ' + brightC.b + ', ' + emotionOpacity(0.6) + ')';
                ctx.lineWidth = 2 + Math.random() * 3;
                ctx.lineCap = 'round';
                ctx.shadowColor = 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + (0.5 * glowIntensity) + ')';
                ctx.shadowBlur = 12;
                ctx.beginPath();
                ctx.moveTo(-10, yBase);
                for (var t = 0; t <= 1; t += 0.02) {
                    var x = t * (w + 20) - 10;
                    var y = yBase + Math.sin(t * Math.PI * 2 * freq + i * 0.7) * amp;
                    ctx.lineTo(x, y);
                }
                ctx.stroke();
                ctx.shadowBlur = 0;
            }
        } else if (shapeType === 'particles') {
            // Частицы: средние яркие
            for (var i = 0; i < 120; i++) {
                var c = boostColor(colors[Math.floor(Math.random() * colors.length)]);
                var px = Math.random() * w;
                var py = Math.random() * h;
                var pr = 1 + Math.random() * 3;
                ctx.beginPath();
                ctx.arc(px, py, pr * 3, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + emotionOpacity(0.15) + ')';
                ctx.fill();
                var brightC = { r: Math.min(c.r + 100, 255), g: Math.min(c.g + 100, 255), b: Math.min(c.b + 100, 255) };
                ctx.beginPath();
                ctx.arc(px, py, pr, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(' + brightC.r + ', ' + brightC.g + ', ' + brightC.b + ', ' + emotionOpacity(0.7) + ')';
                ctx.fill();
            }
        } else if (shapeType === 'neural') {
            // Нейронные связи: яркие соединения
            for (var i = 0; i < nodes.length; i++) {
                for (var j = i + 1; j < nodes.length; j++) {
                    var dx = nodes[i].x - nodes[j].x;
                    var dy = nodes[i].y - nodes[j].y;
                    var dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 200) {
                        ctx.beginPath();
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        var connC = { r: Math.min(nodes[i].c.r + 60, 255), g: Math.min(nodes[i].c.g + 60, 255), b: Math.min(nodes[i].c.b + 60, 255) };
                        ctx.strokeStyle = 'rgba(' + connC.r + ', ' + connC.g + ', ' + connC.b + ', ' + emotionOpacity(0.4 * (1 - dist / 200)) + ')';
                        ctx.lineWidth = 1.5 + Math.random();
                        ctx.stroke();
                    }
                }
            }
        } else if (shapeType === 'layers') {
            // Многослойность: яркие пересечения
            for (var i = 0; i < 4; i++) {
                var c = boostColor(colors[i % colors.length]);
                var px = [cx1, cx2, cx3, w * 0.5][i];
                var py = [cy1, cy2, cy3, h * 0.5][i];
                var br = 50 + Math.random() * 70;
                var rot = Math.random() * Math.PI;
                ctx.save();
                ctx.translate(px, py);
                ctx.rotate(rot);
                var brightC = { r: Math.min(c.r + 60, 255), g: Math.min(c.g + 60, 255), b: Math.min(c.b + 60, 255) };
                var lg = ctx.createRadialGradient(0, 0, 0, 0, 0, br * 1.2);
                lg.addColorStop(0, 'rgba(' + brightC.r + ', ' + brightC.g + ', ' + brightC.b + ', ' + emotionOpacity(0.35) + ')');
                lg.addColorStop(0.6, 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + emotionOpacity(0.15) + ')');
                lg.addColorStop(1, 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', 0)');
                ctx.fillStyle = lg;
                ctx.beginPath();
                ctx.ellipse(0, 0, br * 1.2, br * 0.8, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }
        ctx.restore();

        // === ПЕРЕДНИЙ ПЛАН: мелкие детали и свечение ===
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        // Тонкие светящиеся линии
        for (var i = 0; i < 8; i++) {
            var c = boostColor(colors[Math.floor(Math.random() * colors.length)]);
            var sx = Math.random() * w;
            var sy = Math.random() * h;
            var brightC = { r: Math.min(c.r + 80, 255), g: Math.min(c.g + 80, 255), b: Math.min(c.b + 80, 255) };
            ctx.strokeStyle = 'rgba(' + brightC.r + ', ' + brightC.g + ', ' + brightC.b + ', ' + emotionOpacity(0.15) + ')';
            ctx.lineWidth = 0.5 + Math.random();
            ctx.shadowColor = 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + (0.6 * glowIntensity) + ')';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx + (Math.random() - 0.5) * 100, sy + (Math.random() - 0.5) * 100);
            ctx.stroke();
        }
        ctx.shadowBlur = 0;

        // Яркие акцентные точки
        for (var i = 0; i < 30; i++) {
            var c = boostColor(colors[Math.floor(Math.random() * colors.length)]);
            var px = Math.random() * w;
            var py = Math.random() * h;
            var pr = 0.5 + Math.random() * 2;
            var brightC = { r: Math.min(c.r + 120, 255), g: Math.min(c.g + 120, 255), b: Math.min(c.b + 120, 255) };
            ctx.beginPath();
            ctx.arc(px, py, pr, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(' + brightC.r + ', ' + brightC.g + ', ' + brightC.b + ', ' + emotionOpacity(0.8) + ')';
            ctx.fill();
        }

        // Световые блики на основных элементах
        for (var i = 0; i < 4; i++) {
            var hx = [cx1, cx2, cx3, w * 0.5][i];
            var hy = [cy1, cy2, cy3, h * 0.5][i];
            var hg = ctx.createRadialGradient(hx, hy, 0, hx, hy, 30);
            hg.addColorStop(0, 'rgba(255, 255, 255, ' + (0.12 * intensityFactor * glowIntensity) + ')');
            hg.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = hg;
            ctx.beginPath();
            ctx.arc(hx, hy, 30, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();

        // === Виньетка ===
        var edgeGrad = ctx.createRadialGradient(w * 0.5, h * 0.5, w * 0.15, w * 0.5, h * 0.5, w * 0.65);
        edgeGrad.addColorStop(0, 'rgba(4, 3, 10, 0)');
        edgeGrad.addColorStop(0.6, 'rgba(4, 3, 10, 0.3)');
        edgeGrad.addColorStop(1, 'rgba(2, 1, 5, 0.85)');
        ctx.fillStyle = edgeGrad;
        ctx.fillRect(0, 0, w, h);

        // Обновляем информацию
        if (resultTitle) {
            resultTitle.textContent = generateTitle(Array.from(selectedEmotions), selectedPalette || 'cosmic', shapeType);
        }

        if (resultEmotionsEl) {
            var emotionLabels = Array.from(selectedEmotions);
            resultEmotionsEl.innerHTML = '<strong>Эмоции</strong>' + emotionLabels.join(', ');
        }

        if (resultPaletteEl) {
            resultPaletteEl.innerHTML = '<strong>Палитра</strong>' + (paletteNames[selectedPalette] || 'Космическое свечение');
        }
    }

    // Генерируем при переходе на слайд 4
    var originalGoToSlide = creatorGoTo;
    creatorGoTo = function(index) {
        originalGoToSlide(index);
        if (index === 3) {
            setTimeout(generateComposition, 100);
        }
    };

    // Кнопка сохранения
    if (btnSaveResult) {
        btnSaveResult.addEventListener('click', function() {
            if (resultCanvas) {
                var link = document.createElement('a');
                link.download = 'sound-of-me-composition.png';
                link.href = resultCanvas.toDataURL('image/png');
                link.click();
            }
        });
    }

    // Кнопка повторной генерации
    if (btnRegenerate) {
        btnRegenerate.addEventListener('click', function() {
            generateComposition();
        });
    }

    // Кнопка возврата к настройкам
    if (btnChangeSettings) {
        btnChangeSettings.addEventListener('click', function() {
            creatorGoTo(0);
        });
    }

});
