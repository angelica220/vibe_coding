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
        symmetry: 'Симметрия'
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

        // ===== Параметры симметрии (для shape === 'symmetry') =====
        var symmetryAxes = 0;
        var symmetryAngleStep = 0;
        var symmetryCX = w * 0.5;
        var symmetryCY = h * 0.5;

        if (shapeType === 'symmetry') {
            symmetryAxes = [3, 4, 6, 8][Math.floor(Math.random() * 4)];
            symmetryAngleStep = (Math.PI * 2) / symmetryAxes;
        }

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

        // ===== ЭМОЦИОНАЛЬНАЯ ГЕОМЕТРИЯ =====
        // ===== Выбор и распределение эмоций =====
        var emotionList = Array.from(selectedEmotions);
        var emotionCount = emotionList.length;

        // Распределение ролей эмоций при множественном выборе
        var primaryEmotions = [];
        var secondaryEmotions = [];

        if (emotionCount === 1) {
            primaryEmotions = emotionList.slice();
        } else if (emotionCount === 2) {
            primaryEmotions = [emotionList[0]];
            secondaryEmotions = [emotionList[1]];
        } else if (emotionCount === 3) {
            primaryEmotions = [emotionList[0], emotionList[1]];
            secondaryEmotions = [emotionList[2]];
        } else {
            primaryEmotions = [emotionList[0], emotionList[1]];
            secondaryEmotions = emotionList.slice(2);
        }

        // Функция выбора эмоции для элемента
        function pickEmotion() {
            if (secondaryEmotions.length === 0) return primaryEmotions[0];
            var r = Math.random();
            var primaryThreshold = emotionCount === 2 ? 0.6 :
                                   emotionCount === 3 ? 0.7 : 0.65;
            if (r < primaryThreshold) return primaryEmotions[Math.floor(Math.random() * primaryEmotions.length)];
            return secondaryEmotions[Math.floor(Math.random() * secondaryEmotions.length)];
        }

        // Функция определения роли эмоции
        function getEmotionRole(name) {
            if (primaryEmotions.indexOf(name) >= 0) return 'primary';
            if (secondaryEmotions.indexOf(name) >= 0) return 'secondary';
            return 'none';
        }

        // ===== Универсальный рендер эмоциональной геометрии =====
        function renderGeoEmotion(ctx, geo, emoName, x, y, size, color, opacity, glowIntensity, instanceSeed) {
            // Индивидуальный seed для каждого экземпляра — не даёт выглядеть механическими копиями
            var baseSeed = EMOTION_SEEDS[emoName] + (instanceSeed || 0);
            var genNoise = makeNoise(baseSeed);
            ctx.save();
            geo.draw(ctx, x, y, size, genNoise);

            if (geo.renderMode === 'fill') {
                var grad = ctx.createRadialGradient(x, y, 0, x, y, size);
                var o = Math.min(1, Math.max(0, opacity));
                grad.addColorStop(0, 'rgba(' + Math.min(color.r + 60, 255) + ', ' + Math.min(color.g + 60, 255) + ', ' + Math.min(color.b + 60, 255) + ', ' + o + ')');
                grad.addColorStop(1, 'rgba(' + color.r + ', ' + color.g + ', ' + color.b + ', ' + (o * 0.3) + ')');
                ctx.fillStyle = grad;
                ctx.fill();
                var edgeC = { r: Math.min(color.r + 80, 255), g: Math.min(color.g + 80, 255), b: Math.min(color.b + 80, 255) };
                ctx.strokeStyle = 'rgba(' + edgeC.r + ', ' + edgeC.g + ', ' + edgeC.b + ', ' + Math.min(1, o * 1.5) + ')';
                ctx.lineWidth = 2;
                ctx.stroke();
            } else {
                ctx.strokeStyle = 'rgba(' + color.r + ', ' + color.g + ', ' + color.b + ', ' + Math.min(1, opacity) + ')';
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.shadowColor = 'rgba(' + color.r + ', ' + color.g + ', ' + color.b + ', ' + (0.5 * glowIntensity) + ')';
                ctx.shadowBlur = 8;
                ctx.stroke();
                ctx.shadowBlur = 0;
            }
            ctx.restore();
        }

        // ===== PRNG для детерминированного шума =====
        function mulberry32(a) {
            return function() {
                a |= 0; a = a + 0x6D2B79F5 | 0;
                var t = Math.imul(a ^ a >>> 15, 1 | a);
                t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
                return ((t ^ t >>> 14) >>> 0) / 4294967296;
            };
        }

        var EMOTION_SEEDS = {
            calm: 1001, anxiety: 1002, inspiration: 1003, joy: 1004,
            ecstasy: 1005, curiosity: 1006, sadness: 1007, anger: 1008,
            hope: 1009, doubt: 1010, fatigue: 1011, longing: 1012
        };

        function makeNoise(seed) {
            var rng = mulberry32(seed);
            var cache = [];
            var callIndex = 0;
            return function(amount) {
                if (callIndex >= cache.length) {
                    cache.push(rng() * 2 - 1);
                }
                var val = cache[callIndex++] * amount;
                return val;
            };
        }

        // ===== Профили эмоциональной геометрии =====
        // Каждая эмоция: draw(ctx, cx, cy, size, noise) — рисует ТОЛЬКО контур
        var EMOTION_GEOMETRY = {};

        // 1. Спокойствие — скруглённый квадрат
        EMOTION_GEOMETRY.calm = {
            density: 0.8,
            renderMode: 'fill',
            draw: function(ctx, cx, cy, size, noise) {
                var half = size * 0.5;
                var r = half * 0.3; // радиус скругления = 30% от половины стороны
                ctx.beginPath();
                // Верхняя горизонтальная сторона
                ctx.moveTo(cx - half + r, cy - half);
                ctx.lineTo(cx + half - r, cy - half);
                // Правый верхний угол
                ctx.quadraticCurveTo(cx + half, cy - half, cx + half, cy - half + r);
                // Правая вертикальная сторона
                ctx.lineTo(cx + half, cy + half - r);
                // Правый нижний угол
                ctx.quadraticCurveTo(cx + half, cy + half, cx + half - r, cy + half);
                // Нижняя горизонтальная сторона
                ctx.lineTo(cx - half + r, cy + half);
                // Левый нижний угол
                ctx.quadraticCurveTo(cx - half, cy + half, cx - half, cy + half - r);
                // Левая вертикальная сторона
                ctx.lineTo(cx - half, cy - half + r);
                // Левый верхний угол
                ctx.quadraticCurveTo(cx - half, cy - half, cx - half + r, cy - half);
                ctx.closePath();
            }
        };

        // 2. Тревога — резкая многовершинная звезда (теперь здесь реализация гнева)
        EMOTION_GEOMETRY.anxiety = (function() {
            var vertexCount = 10;
            var angles = [];
            var radii = [];
            for (var i = 0; i < vertexCount; i++) {
                angles.push((i / vertexCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.6);
                radii.push(0.3 + Math.random() * 0.7);
            }
            return {
                density: 1.2,
                renderMode: 'fill',
                draw: function(ctx, cx, cy, size, noise) {
                    ctx.beginPath();
                    for (var i = 0; i <= vertexCount; i++) {
                        var idx = i % vertexCount;
                        var angle = angles[idx];
                        var r = size * radii[idx] * (1 + noise(0.2));
                        var x = cx + Math.cos(angle) * r;
                        var y = cy + Math.sin(angle) * r;
                        if (i === 0) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    }
                    ctx.closePath();
                }
            };
        })();

        // 3. Вдохновение — выразительная органическая клякса
        EMOTION_GEOMETRY.inspiration = (function() {
            var points = 36;
            var phase = Math.random() * Math.PI * 2;
            var baseRadii = [];
            for (var i = 0; i < points; i++) {
                // Крупные плавные волны — 5 выступов с разной глубиной
                var wave = Math.sin(i * 1.7 + phase) * 0.18
                         + Math.sin(i * 2.8 + phase * 1.4) * 0.12
                         + Math.sin(i * 4.1 + phase * 0.6) * 0.06;
                baseRadii.push(0.85 + wave);
            }
            return {
                density: 1.0,
                renderMode: 'fill',
                draw: function(ctx, cx, cy, size, noise) {
                    ctx.beginPath();
                    for (var i = 0; i <= points; i++) {
                        var angle = (i / points) * Math.PI * 2;
                        var idx = i % points;
                        var organicNoise = noise(0.08);
                        var r = size * baseRadii[idx] * (1 + organicNoise * 0.15);
                        var x = cx + Math.cos(angle) * r;
                        var y = cy + Math.sin(angle) * r;
                        if (i === 0) ctx.moveTo(x, y);
                        else {
                            // quadraticCurveTo для плавных кривых вместо lineTo
                            var prevIdx = (i - 1) % points;
                            var prevAngle = (prevIdx / points) * Math.PI * 2;
                            var prevR = size * baseRadii[prevIdx] * (1 + organicNoise * 0.15);
                            var prevX = cx + Math.cos(prevAngle) * prevR;
                            var prevY = cy + Math.sin(prevAngle) * prevR;
                            var midX = (prevX + x) / 2;
                            var midY = (prevY + y) / 2;
                            ctx.quadraticCurveTo(prevX, prevY, midX, midY);
                        }
                    }
                    ctx.closePath();
                }
            };
        })();

        // 4. Радость — правильный круг
        EMOTION_GEOMETRY.joy = {
            density: 0.9,
            renderMode: 'fill',
            draw: function(ctx, cx, cy, size, noise) {
                var r = size * (1 + noise(0.1));
                ctx.beginPath();
                ctx.arc(cx, cy, r, 0, Math.PI * 2);
            }
        };

        // 5. Восторг — спираль с лучами
        EMOTION_GEOMETRY.ecstasy = {
            density: 1.1,
            renderMode: 'stroke',
            draw: function(ctx, cx, cy, size, noise) {
                // Спираль
                ctx.beginPath();
                var turns = 1.5;
                var steps = 40;
                for (var i = 0; i <= steps; i++) {
                    var t = i / steps;
                    var angle = t * turns * Math.PI * 2;
                    var r = size * 0.1 + t * size * 0.9;
                    var x = cx + Math.cos(angle) * r;
                    var y = cy + Math.sin(angle) * r;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                // Радиальная вспышка — 5 лучей равномерно по 360°
                var endAngle = turns * Math.PI * 2;
                var endR = size;
                for (var b = 0; b < 5; b++) {
                    var bAngle = endAngle + (b * Math.PI * 2) / 5;
                    var bx = cx + Math.cos(endAngle) * endR;
                    var by = cy + Math.sin(endAngle) * endR;
                    ctx.moveTo(bx, by);
                    ctx.lineTo(bx + Math.cos(bAngle) * size * 0.18, by + Math.sin(bAngle) * size * 0.18);
                }
            }
        };

        // 6. Любопытство — разомкнутое кольцо с точкой
        EMOTION_GEOMETRY.curiosity = {
            density: 0.8,
            renderMode: 'stroke',
            draw: function(ctx, cx, cy, size, noise) {
                // Разомкнутое кольцо (разрыв 30°)
                ctx.beginPath();
                ctx.arc(cx, cy, size, Math.PI * 0.083, Math.PI * 1.917);
                // Точка у разрыва — рядом с концом дуги
                var gapAngle = Math.PI * 0.083;
                var dotX = cx + Math.cos(gapAngle) * size * 0.55;
                var dotY = cy + Math.sin(gapAngle) * size * 0.55;
                ctx.moveTo(dotX + size * 0.08, dotY);
                ctx.arc(dotX, dotY, size * 0.08, 0, Math.PI * 2);
            }
        };

        // 7. Грусть — капля
        EMOTION_GEOMETRY.sadness = {
            density: 0.85,
            renderMode: 'fill',
            draw: function(ctx, cx, cy, size, noise) {
                ctx.beginPath();
                // Верхняя часть — плавная выпуклость (округлая)
                ctx.moveTo(cx, cy - size);
                ctx.bezierCurveTo(
                    cx + size * 0.8, cy - size * 0.8,
                    cx + size * 0.6, cy + size * 0.2,
                    cx, cy + size * 1.0
                );
                ctx.bezierCurveTo(
                    cx - size * 0.6, cy + size * 0.2,
                    cx - size * 0.8, cy - size * 0.8,
                    cx, cy - size
                );
                ctx.closePath();
            }
        };

        // 8. Гнев — многолучевая острая звезда с треугольными лучами
        EMOTION_GEOMETRY.anger = (function() {
            var rayCount = 12;
            var longRadii = [];
            var shortRadii = [];
            for (var i = 0; i < rayCount; i++) {
                longRadii.push(0.85 + Math.random() * 0.15);
                shortRadii.push(0.25 + Math.random() * 0.1);
            }
            return {
                density: 1.3,
                renderMode: 'fill',
                draw: function(ctx, cx, cy, size, noise) {
                    ctx.beginPath();
                    for (var r = 0; r < rayCount; r++) {
                        var baseAngle = (r / rayCount) * Math.PI * 2 - Math.PI / 2;
                        var spread = (Math.PI / rayCount) * 0.6;
                        // Левая сторона луча (широкое основание)
                        var a1 = baseAngle - spread;
                        var r1 = size * shortRadii[r] * (1 + noise(0.1));
                        var x1 = cx + Math.cos(a1) * r1;
                        var y1 = cy + Math.sin(a1) * r1;
                        if (r === 0) ctx.moveTo(x1, y1);
                        else ctx.lineTo(x1, y1);
                        // Вершина луча (острый конец)
                        var a2 = baseAngle;
                        var r2 = size * longRadii[r] * (1 + noise(0.1));
                        var x2 = cx + Math.cos(a2) * r2;
                        var y2 = cy + Math.sin(a2) * r2;
                        ctx.lineTo(x2, y2);
                        // Правая сторона луча (широкое основание)
                        var a3 = baseAngle + spread;
                        var r3 = size * shortRadii[r] * (1 + noise(0.1));
                        var x3 = cx + Math.cos(a3) * r3;
                        var y3 = cy + Math.sin(a3) * r3;
                        ctx.lineTo(x3, y3);
                    }
                    ctx.closePath();
                }
            };
        })();

        // 9. Надежда — три вложенные полукруглые дуги (общий центр, разные радиусы)
        EMOTION_GEOMETRY.hope = {
            density: 0.7,
            renderMode: 'stroke',
            draw: function(ctx, cx, cy, size, noise) {
                // Три дуги — каждая начинается с moveTo, чтобы не было соединительных линий
                var radii = [size * 0.3, size * 0.55, size * 0.8];
                ctx.beginPath();
                for (var i = 0; i < 3; i++) {
                    // Начальная точка дуги: угол Math.PI = левая сторона окружности
                    ctx.moveTo(cx - radii[i], cy);
                    ctx.arc(cx, cy, radii[i], Math.PI, 0);
                }
            }
        };

        // 10. Сомнение — ломаная линия (незамкнутая)
        EMOTION_GEOMETRY.doubt = {
            density: 0.75,
            renderMode: 'stroke',
            draw: function(ctx, cx, cy, size, noise) {
                var segments = 7;
                var x = cx - size * 0.6;
                var y = cy;
                ctx.beginPath();
                ctx.moveTo(x, y);
                for (var i = 0; i < segments; i++) {
                    // Резкие изменения направления, асимметричные сегменты
                    var dx = noise(0.3) * size * 0.4;
                    var dy = noise(0.4) * size * 0.5;
                    // Иногда разрыв — сегмент смещается
                    if (i === 3) {
                        dx += noise(0.5) * size * 0.3;
                        dy += noise(0.6) * size * 0.3;
                    }
                    x += dx;
                    y += dy;
                    ctx.lineTo(x, y);
                }
                // Не closePath!
            }
        };

        // 11. Усталость — приплюснутый скруглённый прямоугольник
        EMOTION_GEOMETRY.fatigue = {
            density: 0.7,
            renderMode: 'fill',
            draw: function(ctx, cx, cy, size, noise) {
                // Очень широкий и низкий прямоугольник
                var w = size * 2.5;
                var h = size * 0.35;
                var r = size * 0.12;
                ctx.beginPath();
                // Верхняя граница с лёгким провисанием
                ctx.moveTo(cx - w / 2 + r, cy - h / 2);
                ctx.lineTo(cx + w / 2 - r, cy - h / 2);
                // Правый верхний угол
                ctx.quadraticCurveTo(cx + w / 2, cy - h / 2, cx + w / 2, cy - h / 2 + r);
                // Правая граница
                ctx.lineTo(cx + w / 2, cy + h / 2 - r);
                // Правый нижний угол
                ctx.quadraticCurveTo(cx + w / 2, cy + h / 2, cx + w / 2 - r, cy + h / 2);
                // Нижняя граница
                ctx.lineTo(cx - w / 2 + r, cy + h / 2);
                // Левый нижний угол
                ctx.quadraticCurveTo(cx - w / 2, cy + h / 2, cx - w / 2, cy + h / 2 - r);
                // Левая граница
                ctx.lineTo(cx - w / 2, cy - h / 2 + r);
                // Левый верхний угол
                ctx.quadraticCurveTo(cx - w / 2, cy - h / 2, cx - w / 2 + r, cy - h / 2);
                ctx.closePath();
            }
        };

        // 12. Тоска — тонкое кольцо (два близко расположенных концентрических круга)
        EMOTION_GEOMETRY.longing = {
            density: 0.75,
            renderMode: 'stroke',
            draw: function(ctx, cx, cy, size, noise) {
                // Внешний круг
                ctx.beginPath();
                ctx.arc(cx, cy, size, 0, Math.PI * 2);
                // Внутренний круг — близко к внешнему (расстояние ~5%)
                ctx.moveTo(cx + size * 0.95, cy);
                ctx.arc(cx, cy, size * 0.95, 0, Math.PI * 2);
            }
        };

        // === ЗАДНИЙ ПЛАН: крупные формы ===
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        if (shapeType === 'organic') {
            // Органика: 5 крупных blob-форм с эмоциональной геометрией
            for (var i = 0; i < 5; i++) {
                var c = boostColor(colors[i % colors.length]);
                var px = [cx1, cx2, cx3, w * 0.15, w * 0.85][i];
                var py = [cy1, cy2, cy3, h * 0.2, h * 0.8][i];
                var br = 80 + Math.random() * 120;

                // Определяем, будет ли элемент эмоциональным
                var isEmotional = i >= 3 && emotionCount > 0;
                var emoName = isEmotional ? pickEmotion() : null;
                var role = isEmotional ? getEmotionRole(emoName) : 'normal';
                var sizeMult = role === 'secondary' ? 0.6 : 1.0;

                if (isEmotional && emoName && EMOTION_GEOMETRY[emoName]) {
                    var geo = EMOTION_GEOMETRY[emoName];
                    var emoSize = br * 2 * sizeMult;
                    var genNoise = makeNoise(EMOTION_SEEDS[emoName]);

                    if (geo.renderMode === 'fill') {
                        // clip() + radialGradient для замкнутых фигур
                        ctx.save();
                        geo.draw(ctx, px, py, emoSize, genNoise);
                        ctx.clip();
                        var grad = ctx.createRadialGradient(px, py, 0, px, py, emoSize);
                        grad.addColorStop(0, 'rgba(' + Math.min(c.r + 60, 255) + ', ' + Math.min(c.g + 60, 255) + ', ' + Math.min(c.b + 60, 255) + ', ' + emotionOpacity(0.35) + ')');
                        grad.addColorStop(0.4, 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + emotionOpacity(0.18) + ')');
                        grad.addColorStop(0.7, 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + emotionOpacity(0.06) + ')');
                        grad.addColorStop(1, 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', 0)');
                        ctx.fillStyle = grad;
                        ctx.fillRect(px - emoSize, py - emoSize, emoSize * 2, emoSize * 2);
                        ctx.restore();
                    } else if (emoName === 'curiosity') {
                        // Разомкнутое кольцо — stroke + точка — fill
                        ctx.save();
                        geo.draw(ctx, px, py, emoSize, genNoise);
                        ctx.strokeStyle = 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + emotionOpacity(0.3) + ')';
                        ctx.lineWidth = 1.5;
                        ctx.lineCap = 'round';
                        ctx.stroke();
                        // Точка у разрыва — рядом с концом дуги
                        var gapAngle = Math.PI * 0.083;
                        var dotX = px + Math.cos(gapAngle) * emoSize * 0.55;
                        var dotY = py + Math.sin(gapAngle) * emoSize * 0.55;
                        var dotGrad = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, emoSize * 0.08);
                        dotGrad.addColorStop(0, 'rgba(' + Math.min(c.r + 80, 255) + ', ' + Math.min(c.g + 80, 255) + ', ' + Math.min(c.b + 80, 255) + ', ' + emotionOpacity(0.5) + ')');
                        dotGrad.addColorStop(1, 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', 0)');
                        ctx.fillStyle = dotGrad;
                        ctx.beginPath();
                        ctx.arc(dotX, dotY, emoSize * 0.08, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.restore();
                    } else if (emoName === 'longing' || emoName === 'hope' || emoName === 'doubt' || emoName === 'ecstasy') {
                        // Только stroke — без заливки
                        ctx.save();
                        geo.draw(ctx, px, py, emoSize, genNoise);
                        ctx.strokeStyle = 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + emotionOpacity(0.3) + ')';
                        ctx.lineWidth = 2;
                        ctx.lineCap = 'round';
                        ctx.shadowColor = 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + (0.5 * glowIntensity) + ')';
                        ctx.shadowBlur = 8;
                        ctx.stroke();
                        ctx.shadowBlur = 0;
                        ctx.restore();
                    }
                } else {
                    // Обычная круглая blob-форма
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
            }
        } else if (shapeType === 'geometry') {
            // Геометрия: крупные фигуры с эмоциональной геометрией
            for (var i = 0; i < 8; i++) {
                var c = boostColor(colors[i % colors.length]);
                var px = [cx1, cx2, cx3, w * 0.2, w * 0.8, w * 0.5, w * 0.15, w * 0.85][i];
                var py = [cy1, cy2, cy3, h * 0.3, h * 0.7, h * 0.5, h * 0.2, h * 0.8][i];
                var br = 50 + Math.random() * 100;

                // Первые 4 — обычные многоугольники, последние 4 — эмоциональные
                var isEmotional = i >= 4 && emotionCount > 0;
                var emoName = isEmotional ? pickEmotion() : null;
                var role = isEmotional ? getEmotionRole(emoName) : 'normal';
                var sizeMult = role === 'secondary' ? 0.6 : 1.0;

                if (isEmotional && emoName && EMOTION_GEOMETRY[emoName]) {
                    var geo = EMOTION_GEOMETRY[emoName];
                    var emoSize = br * sizeMult;
                    renderGeoEmotion(ctx, geo, emoName, px, py, emoSize, c, emotionOpacity(0.25), glowIntensity, i);
                } else {
                    // Обычный многоугольник
                    var sides = 3 + Math.floor(Math.random() * 5);
                    var hasCalm = selectedEmotions.has('calm');
                    var hasDoubt = selectedEmotions.has('doubt');
                    var hasLonging = selectedEmotions.has('longing');
                    var effectiveDoubt = hasDoubt && !hasLonging;

                    // Сбор вершин (сохраняем состояние Math.random() как в оригинале)
                    var verts = [];
                    var angles = [];
                    for (var j = 0; j <= sides; j++) {
                        angles.push((j / sides) * Math.PI * 2 - Math.PI / 2 + Math.random() * 0.2);
                    }
                    for (var j = 0; j < sides; j++) {
                        var angle = angles[j];
                        verts.push({ x: px + Math.cos(angle) * br, y: py + Math.sin(angle) * br });
                    }

                    ctx.beginPath();
                    if (hasCalm && effectiveDoubt) {
                        // Скруглённый контур с одним разрывом
                        var skipEdge = Math.floor(Math.random() * sides);

                        // Предварительный расчёт entries/exits
                        var entries = [], exits = [];
                        for (var j = 0; j < sides; j++) {
                            var prev = verts[(j - 1 + sides) % sides];
                            var curr = verts[j];
                            var next = verts[(j + 1) % sides];
                            var lenPrev = Math.sqrt((curr.x - prev.x) ** 2 + (curr.y - prev.y) ** 2);
                            var lenNext = Math.sqrt((next.x - curr.x) ** 2 + (next.y - curr.y) ** 2);
                            var r = Math.min(lenPrev, lenNext) * 0.25;
                            entries[j] = {
                                x: curr.x - (curr.x - prev.x) / lenPrev * r,
                                y: curr.y - (curr.y - prev.y) / lenPrev * r
                            };
                            exits[j] = {
                                x: curr.x + (next.x - curr.x) / lenNext * r,
                                y: curr.y + (next.y - curr.y) / lenNext * r
                            };
                        }

                        // Рисуем от skipEdge+1 до skipEdge+sides (пропуская skipEdge)
                        for (var j = 0; j < sides; j++) {
                            var idx = (skipEdge + 1 + j) % sides;
                            if (j === 0) {
                                ctx.moveTo(entries[idx].x, entries[idx].y);
                            } else {
                                ctx.lineTo(entries[idx].x, entries[idx].y);
                            }
                            ctx.quadraticCurveTo(verts[idx].x, verts[idx].y, exits[idx].x, exits[idx].y);
                        }
                    } else if (hasCalm) {
                        // Скруглённый контур
                        for (var j = 0; j < sides; j++) {
                            var prev = verts[(j - 1 + sides) % sides];
                            var curr = verts[j];
                            var next = verts[(j + 1) % sides];

                            var dxPrev = curr.x - prev.x, dyPrev = curr.y - prev.y;
                            var lenPrev = Math.sqrt(dxPrev * dxPrev + dyPrev * dyPrev);
                            var dxNext = next.x - curr.x, dyNext = next.y - curr.y;
                            var lenNext = Math.sqrt(dxNext * dxNext + dyNext * dyNext);

                            var r = Math.min(lenPrev, lenNext) * 0.25;

                            // Точка входа на предыдущей стороне
                            var entryX = curr.x - (dxPrev / lenPrev) * r;
                            var entryY = curr.y - (dyPrev / lenPrev) * r;
                            // Точка выхода на следующей стороне
                            var exitX = curr.x + (dxNext / lenNext) * r;
                            var exitY = curr.y + (dyNext / lenNext) * r;

                            if (j === 0) {
                                ctx.moveTo(entryX, entryY);
                            } else {
                                ctx.lineTo(entryX, entryY);
                            }
                            // Скругление вершины: контрольная точка = сама вершина
                            ctx.quadraticCurveTo(curr.x, curr.y, exitX, exitY);
                        }
                    } else if (effectiveDoubt) {
                        // Обычный контур с одним разрывом
                        var skipEdge = Math.floor(Math.random() * sides);
                        for (var j = 0; j < sides; j++) {
                            var idx = (skipEdge + 1 + j) % sides;
                            var x = verts[idx].x, y = verts[idx].y;
                            if (j === 0) ctx.moveTo(x, y);
                            else ctx.lineTo(x, y);
                        }
                    } else {
                        // Обычный контур
                        for (var j = 0; j <= sides; j++) {
                            var angle = angles[j];
                            var x = px + Math.cos(angle) * br;
                            var y = py + Math.sin(angle) * br;
                            if (j === 0) ctx.moveTo(x, y);
                            else ctx.lineTo(x, y);
                        }
                        ctx.closePath();
                    }
                    if (hasLonging) ctx.closePath();

                    // Вложенный внутренний контур (LONGING)
                    if (hasLonging) {
                        var cxc = 0, cyc = 0;
                        for (var j = 0; j < sides; j++) { cxc += verts[j].x; cyc += verts[j].y; }
                        cxc /= sides; cyc /= sides;
                        var iv = [];
                        for (var j = 0; j < sides; j++) {
                            iv.push({ x: cxc + (verts[j].x - cxc) * 0.9, y: cyc + (verts[j].y - cyc) * 0.9 });
                        }

                        if (hasCalm && effectiveDoubt) {
                            var ie = [], oe = [];
                            for (var j = 0; j < sides; j++) {
                                var prev = iv[(j - 1 + sides) % sides];
                                var curr = iv[j];
                                var next = iv[(j + 1) % sides];
                                var lenPrev = Math.sqrt((curr.x - prev.x) ** 2 + (curr.y - prev.y) ** 2);
                                var lenNext = Math.sqrt((next.x - curr.x) ** 2 + (next.y - curr.y) ** 2);
                                var r = Math.min(lenPrev, lenNext) * 0.25;
                                ie[j] = { x: curr.x - (curr.x - prev.x) / lenPrev * r, y: curr.y - (curr.y - prev.y) / lenPrev * r };
                                oe[j] = { x: curr.x + (next.x - curr.x) / lenNext * r, y: curr.y + (next.y - curr.y) / lenNext * r };
                            }
                            for (var j = 0; j < sides; j++) {
                                var idx = (skipEdge + 1 + j) % sides;
                                if (j === 0) ctx.moveTo(ie[idx].x, ie[idx].y);
                                else ctx.lineTo(ie[idx].x, ie[idx].y);
                                ctx.quadraticCurveTo(iv[idx].x, iv[idx].y, oe[idx].x, oe[idx].y);
                            }
                        } else if (hasCalm) {
                            for (var j = 0; j < sides; j++) {
                                var prev = iv[(j - 1 + sides) % sides];
                                var curr = iv[j];
                                var next = iv[(j + 1) % sides];
                                var dxPrev = curr.x - prev.x, dyPrev = curr.y - prev.y;
                                var lenPrev = Math.sqrt(dxPrev * dxPrev + dyPrev * dyPrev);
                                var dxNext = next.x - curr.x, dyNext = next.y - curr.y;
                                var lenNext = Math.sqrt(dxNext * dxNext + dyNext * dyNext);
                                var r = Math.min(lenPrev, lenNext) * 0.25;
                                var entryX = curr.x - (dxPrev / lenPrev) * r;
                                var entryY = curr.y - (dyPrev / lenPrev) * r;
                                var exitX = curr.x + (dxNext / lenNext) * r;
                                var exitY = curr.y + (dyNext / lenNext) * r;
                                if (j === 0) ctx.moveTo(entryX, entryY);
                                else ctx.lineTo(entryX, entryY);
                                ctx.quadraticCurveTo(curr.x, curr.y, exitX, exitY);
                            }
                        } else if (effectiveDoubt) {
                            for (var j = 0; j < sides; j++) {
                                var idx = (skipEdge + 1 + j) % sides;
                                if (j === 0) ctx.moveTo(iv[idx].x, iv[idx].y);
                                else ctx.lineTo(iv[idx].x, iv[idx].y);
                            }
                        } else {
                            for (var j = 0; j < sides; j++) {
                                var angle = angles[j];
                                var x = cxc + (px + Math.cos(angle) * br - cxc) * 0.9;
                                var y = cyc + (py + Math.sin(angle) * br - cyc) * 0.9;
                                if (j === 0) ctx.moveTo(x, y);
                                else ctx.lineTo(x, y);
                            }
                        }
                        ctx.closePath();
                    }

                    if (!hasDoubt && !hasLonging) {
                        ctx.fillStyle = 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + emotionOpacity(0.25) + ')';
                        ctx.fill();
                    }
                    var edgeC = { r: Math.min(c.r + 80, 255), g: Math.min(c.g + 80, 255), b: Math.min(c.b + 80, 255) };
                    ctx.strokeStyle = 'rgba(' + edgeC.r + ', ' + edgeC.g + ', ' + edgeC.b + ', ' + emotionOpacity(0.5) + ')';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            }
        } else if (shapeType === 'flow') {
            // Поток: 10 плавных волновых линий
            var hasCalm = selectedEmotions.has('calm');
            var hasAnxiety = selectedEmotions.has('anxiety');
            var hasInspiration = selectedEmotions.has('inspiration');
            var hasJoy = selectedEmotions.has('joy');
            var hasCuriosity = selectedEmotions.has('curiosity');
            var hasEcstasy = selectedEmotions.has('ecstasy');
            var hasSadness = selectedEmotions.has('sadness');
            var hasAnger = selectedEmotions.has('anger');
            var hasHope = selectedEmotions.has('hope');
            var hasDoubt = selectedEmotions.has('doubt');
            var hasFatigue = selectedEmotions.has('fatigue');
            var hasLonging = selectedEmotions.has('longing');
            var yBase = h * 0.5;
            
            // Усталость: 14 прямых линий, пропускаем стандартный цикл
            if (hasFatigue && !hasCalm && !hasJoy && !hasCuriosity && !hasAnger && !hasHope && !hasDoubt && !hasSadness && !hasEcstasy) {
                for (var fL = 0; fL < 14; fL++) {
                    var angle = (Math.random() - 0.5) * 0.28;
                    var yStart = yBase - 180 + fL * 27;
                    var c = boostColor(colors[fL % colors.length]);
                    ctx.beginPath();
                    ctx.strokeStyle = 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', 0.35)';
                    ctx.lineWidth = 1.5;
                    ctx.lineCap = 'butt';
                    ctx.moveTo(-100, yStart);
                    ctx.lineTo(w + 100, yStart + Math.tan(angle) * (w + 200));
                    ctx.stroke();
                }
            } else if (hasLonging && !hasCalm && !hasJoy && !hasCuriosity && !hasAnger && !hasSadness && !hasFatigue) {
                // Тоска: 3 прямые линии
                for (var fL = 0; fL < 3; fL++) {
                    var angleL = (Math.random() - 0.5) * 0.12;
                    var yStartL = yBase - 120 + fL * 120;
                    var cL = boostColor(colors[fL % colors.length]);
                    ctx.beginPath();
                    ctx.strokeStyle = 'rgba(' + cL.r + ', ' + cL.g + ', ' + cL.b + ', 0.3)';
                    ctx.lineWidth = 1;
                    ctx.lineCap = 'butt';
                    ctx.moveTo(-100, yStartL);
                    ctx.lineTo(w + 100, yStartL + Math.tan(angleL) * (w + 200));
                    ctx.stroke();
                }
            } else {
            for (var i = 0; i < 10; i++) {
                var c = boostColor(colors[i % colors.length]);
                var yBase = h * (0.1 + i * 0.09);

                // Параметры для каждой линии уникальны
                var amp, freq;
                if (hasCalm) {
                    amp = 5 + Math.random() * 10;
                    freq = 1 + Math.floor(Math.random() * 2);
                } else if (hasInspiration) {
                    amp = 15 + Math.random() * 20;
                    freq = 3 + Math.floor(Math.random() * 3);
                } else {
                    amp = 20 + Math.random() * 40 * intensityFactor;
                    freq = 2 + Math.floor(Math.random() * 3);
                }

                // Вдохновение: модулируемая амплитуда для разнообразия
                var inspAmp2, inspFreq2, inspPhase2, inspEnvFreq, inspEnvPhase;
                if (hasInspiration && !hasCalm && !hasJoy) {
                    inspAmp2 = amp * (0.4 + Math.random() * 0.4);
                    inspFreq2 = freq + Math.floor(Math.random() * 4) + 1;
                    inspPhase2 = Math.random() * Math.PI * 2;
                    inspEnvFreq = 0.5 + Math.random() * 1.5;
                    inspEnvPhase = Math.random() * Math.PI * 2;
                }

                // Радость: кубические кривые Безье для округлых холмиков
                var joyPoints = [];
                if (hasJoy && !hasCalm) {
                    var hillCount = 3 + Math.floor(Math.random() * 4); // 3–6 холмов
                    var lineW = w + 20;
                    var step = lineW / hillCount;
                    for (var hp = 0; hp <= hillCount; hp++) {
                        var isPeak = hp % 2 === 1;
                        var hillHeight = amp * (0.7 + Math.random() * 0.6);
                        var hillX = -10 + hp * step;
                        var hillY = isPeak ? yBase - hillHeight : yBase + hillHeight * 0.4;
                        joyPoints.push({ x: hillX, y: hillY, peak: isPeak });
                    }
                }

                // Радость: подготовка для cubic Bezier с округлыми вершинами
                var joyBezier = null;
                if (hasJoy && !hasCalm && joyPoints.length >= 3) {
                    var cpList = []; // [cp1, cp2] pairs for each segment
                    for (var seg = 0; seg < joyPoints.length - 1; seg++) {
                        var pPrev = seg > 0 ? joyPoints[seg - 1] : null;
                        var pCurr = joyPoints[seg];
                        var pNext = seg < joyPoints.length - 2 ? joyPoints[seg + 1] : null;
                        var pNext2 = seg < joyPoints.length - 1 ? joyPoints[seg + 1] : null;
                        
                        // Catmull-Rom → Bezier conversion для C1-непрерывности
                        var tension = 0.3;
                        var x0 = pPrev ? pPrev.x : pCurr.x - (pNext2.x - pCurr.x);
                        var y0 = pPrev ? pPrev.y : pCurr.y + (pNext2.y - pCurr.y) * 0.4;
                        var x1 = pCurr.x;
                        var y1 = pCurr.y;
                        var x2 = pNext2.x;
                        var y2 = pNext2.y;
                        var x3 = pNext ? pNext.x : pNext2.x + (pNext2.x - pCurr.x);
                        var y3 = pNext ? pNext.y : pNext2.y + (pNext2.y - pCurr.y) * 0.4;
                        
                        // Контрольные точки через Catmull-Rom
                        var cp1x = x1 + (x2 - x0) / 6;
                        var cp1y = y1 + (y2 - y0) / 6;
                        var cp2x = x2 - (x3 - x1) / 6;
                        var cp2y = y2 - (y3 - y1) / 6;
                        
                        // Для пиков: поднимаем контрольные точки выше для округлости
                        if (pCurr.peak) {
                            cp1y = y1 - Math.abs(y1 - y0) * 0.15;
                            cp2y = y2 - Math.abs(y2 - y3) * 0.15;
                        } else {
                            // Для впадин: опускаем ниже
                            cp1y = y1 + Math.abs(y1 - y0) * 0.15;
                            cp2y = y2 + Math.abs(y2 - y3) * 0.15;
                        }
                        
                        cpList.push({ cp1x: cp1x, cp1y: cp1y, cp2x: cp2x, cp2y: cp2y, endX: x3, endY: y3 });
                    }
                    joyBezier = cpList;
                }

                // Восторг: кубические кривые Безье для округлых волн (амплитуда +30% от joy)
                var ecstasyPoints = [];
                if (hasEcstasy && !hasCalm && !hasJoy) {
                    var hillCountE = 3 + Math.floor(Math.random() * 4); // 3–6 холмов
                    var lineWE = w + 20;
                    var stepE = lineWE / hillCountE;
                    for (var hpE = 0; hpE <= hillCountE; hpE++) {
                        var isPeakE = hpE % 2 === 1;
                        // Амплитуда на 30% больше, чем у joy
                        var hillHeightE = amp * (0.7 + Math.random() * 0.6) * 1.6;
                        var hillXE = -10 + hpE * stepE;
                        var hillYE = isPeakE ? yBase - hillHeightE : yBase + hillHeightE * 0.4;
                        ecstasyPoints.push({ x: hillXE, y: hillYE, peak: isPeakE });
                    }
                }

                // Восторг: подготовка для cubic Bezier с округлыми вершинами
                var ecstasyBezier = null;
                if (hasEcstasy && !hasCalm && !hasJoy && ecstasyPoints.length >= 3) {
                    var cpListE = [];
                    for (var segE = 0; segE < ecstasyPoints.length - 1; segE++) {
                        var pPrevE = segE > 0 ? ecstasyPoints[segE - 1] : null;
                        var pCurrE = ecstasyPoints[segE];
                        var pNextE = segE < ecstasyPoints.length - 2 ? ecstasyPoints[segE + 1] : null;
                        var pNext2E = segE < ecstasyPoints.length - 1 ? ecstasyPoints[segE + 1] : null;
                        
                        // Catmull-Rom → Bezier conversion для C1-непрерывности
                        var tensionE = 0.3;
                        var x0E = pPrevE ? pPrevE.x : pCurrE.x - (pNext2E.x - pCurrE.x);
                        var y0E = pPrevE ? pPrevE.y : pCurrE.y + (pNext2E.y - pCurrE.y) * 0.4;
                        var x1E = pCurrE.x;
                        var y1E = pCurrE.y;
                        var x2E = pNext2E.x;
                        var y2E = pNext2E.y;
                        var x3E = pNextE ? pNextE.x : pNext2E.x + (pNext2E.x - pCurrE.x);
                        var y3E = pNextE ? pNextE.y : pNext2E.y + (pNext2E.y - pCurrE.y) * 0.4;
                        
                        // Контрольные точки через Catmull-Rom
                        var cp1xE = x1E + (x2E - x0E) / 6;
                        var cp1yE = y1E + (y2E - y0E) / 6;
                        var cp2xE = x2E - (x3E - x1E) / 6;
                        var cp2yE = y2E - (y3E - y1E) / 6;
                        
                        // Для пиков: поднимаем контрольные точки выше для округлости
                        if (pCurrE.peak) {
                            cp1yE = y1E - Math.abs(y1E - y0E) * 0.15;
                            cp2yE = y2E - Math.abs(y2E - y3E) * 0.15;
                        } else {
                            // Для впадин: опускаем ниже
                            cp1yE = y1E + Math.abs(y1E - y0E) * 0.15;
                            cp2yE = y2E + Math.abs(y2E - y3E) * 0.15;
                        }
                        
                        cpListE.push({ cp1x: cp1xE, cp1y: cp1yE, cp2x: cp2xE, cp2y: cp2yE, endX: x3E, endY: y3E });
                    }
                    ecstasyBezier = cpListE;
                }

                // Любопытство: генерация петель для каждой линии
                var curiosityLoops = [];
                if (hasCuriosity && !hasCalm && !hasJoy) {
                    var loopCount = 1 + Math.floor(Math.random() * 3); // 1-3 петли
                    for (var l = 0; l < loopCount; l++) {
                        var loopT = 0.15 + Math.random() * 0.7; // позиция на линии
                        var loopSize = amp * (0.8 + Math.random() * 0.6); // размер петли
                        var loopDirection = Math.random() > 0.5 ? 1 : -1; // направление
                        var loopWidth = loopSize * (0.5 + Math.random() * 0.5); // ширина
                        curiosityLoops.push({ t: loopT, size: loopSize, dir: loopDirection, width: loopWidth });
                    }
                }

                // Грусть: очень слабые, спокойные и медленные волны
                var sadnessAmp = 0;
                var sadnessFreq = 0;
                if (hasSadness && !hasCalm && !hasJoy && !hasEcstasy && !hasCuriosity) {
                    // Амплитуда 20–30% от обычной FLOW (обычная 20–60 → грусть 4–18)
                    sadnessAmp = 4 + Math.random() * 14;
                    // 1–2 плавных колебания на всю ширину
                    sadnessFreq = 1 + Math.floor(Math.random() * 2);
                }

                // Предварительный расчёт позиций изломов для этой линии
                var breaks = [];
                if (hasAnxiety && !hasCalm) {
                    var breakCount = 2 + Math.floor(Math.random() * 2);
                    for (var b = 0; b < breakCount; b++) {
                        breaks.push({
                            t: 0.1 + Math.random() * 0.8,
                            dir: Math.random() > 0.5 ? 1 : -1,
                            strength: amp * (0.35 + Math.random() * 0.25)
                        });
                    }
                }

                ctx.strokeStyle = 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + emotionOpacity(0.4) + ')';
                ctx.lineWidth = 3 + Math.random() * 5;
                ctx.lineCap = 'round';
                ctx.beginPath();

                if (hasJoy && !hasCalm && joyBezier) {
                    // Рисуем через кубические Безье с округлыми вершинами
                    ctx.moveTo(joyPoints[0].x, joyPoints[0].y);
                    for (var seg = 0; seg < joyBezier.length; seg++) {
                        var cp = joyBezier[seg];
                        ctx.bezierCurveTo(cp.cp1x, cp.cp1y, cp.cp2x, cp.cp2y, cp.endX, cp.endY);
                    }
                } else if (hasEcstasy && !hasCalm && !hasJoy && ecstasyBezier) {
                    // Восторг: рисуем через кубические Безье с округлыми вершинами (амплитуда +30%)
                    ctx.moveTo(ecstasyPoints[0].x, ecstasyPoints[0].y);
                    for (var segE = 0; segE < ecstasyBezier.length; segE++) {
                        var cpE = ecstasyBezier[segE];
                        ctx.bezierCurveTo(cpE.cp1x, cpE.cp1y, cpE.cp2x, cpE.cp2y, cpE.endX, cpE.endY);
                    }
                } else if (hasCuriosity && !hasCalm && !hasJoy && curiosityLoops.length > 0) {
                    // Любопытство: волна с петлями
                    var loopIdx = 0;
                    var prevPt = null;
                    
                    for (var t = 0; t <= 1; t += 0.005) {
                        var x = t * (w + 20) - 10;
                        var baseAngle = t * Math.PI * 2 * freq + i;
                        var sinVal = Math.sin(baseAngle);
                        var y = yBase + sinVal * amp;
                        
                        // Проверяем, находится ли t в зоне петли
                        if (loopIdx < curiosityLoops.length) {
                            var loop = curiosityLoops[loopIdx];
                            var loopHalfWidth = 0.04; // ширина зоны петли по t
                            
                            if (Math.abs(t - loop.t) < loopHalfWidth) {
                                // Внутри петли: смещаем точку по параметрической кривой
                                var localT = (t - loop.t) / loopHalfWidth; // от -1 до 1
                                var loopAngle = localT * Math.PI; // 0 to PI
                                
                                // Параметрическая петля (лемниската-подобная форма)
                                var loopOffsetX = loop.width * Math.sin(loopAngle) * Math.cos(loopAngle) * 0.5;
                                var loopOffsetY = loop.size * loop.dir * Math.sin(loopAngle) * Math.sin(loopAngle);
                                
                                x += loopOffsetX;
                                y += loopOffsetY;
                                
                                // Плавный вход/выход через envelope
                                var envelope = Math.sin(loopAngle);
                                x += loopOffsetX * envelope;
                                y += loopOffsetY * envelope;
                            } else if (loopIdx < curiosityLoops.length - 1) {
                                // Проверяем, не пора ли перейти к следующей петле
                                var nextLoop = curiosityLoops[loopIdx + 1];
                                if (t > loop.t + loopHalfWidth + 0.02) {
                                    loopIdx++;
                                }
                            } else {
                                // Последняя петля
                                loopIdx++;
                            }
                        }
                        
                        // Добавляем вдохновение/тревогу если они выбраны
                        if (hasInspiration && !hasCalm && !hasJoy && !hasCuriosity) {
                            var env = Math.sin(t * Math.PI * 2 * inspEnvFreq + inspEnvPhase) * 0.5 + 0.5;
                            y += Math.sin(t * Math.PI * 2 * inspFreq2 + inspPhase2) * inspAmp2 * env;
                        }
                        if (hasAnxiety && !hasCalm) {
                            for (var b = 0; b < breaks.length; b++) {
                                var dist = t - breaks[b].t;
                                if (Math.abs(dist) < 0.025) {
                                    var factor = 1 - Math.abs(dist) / 0.025;
                                    y += breaks[b].dir * breaks[b].strength * factor;
                                }
                            }
                        }
                        
                        if (prevPt) {
                            var midX = (prevPt.x + x) / 2;
                            var midY = (prevPt.y + y) / 2;
                            ctx.quadraticCurveTo(prevPt.x, prevPt.y, midX, midY);
                        } else {
                            ctx.moveTo(x, y);
                        }
                        prevPt = { x: x, y: y };
                    }
                } else if (hasAnger && !hasCalm && !hasJoy && !hasCuriosity) {
                    // Гнев: резкая ломаная зигзагообразная траектория
                    var angerAmp = (20 + Math.random() * 60 * intensityFactor) * 1.7;
                    var breakCountA = 8 + Math.floor(Math.random() * 7); // 8–14 изломов
                    ctx.lineJoin = 'miter';
                    ctx.lineCap = 'butt';
                    ctx.beginPath();
                    ctx.moveTo(-10, yBase);
                    for (var bA = 0; bA < breakCountA; bA++) {
                        var tA = 0.05 + (bA / breakCountA) * 0.9;
                        var xA = tA * (w + 20) - 10;
                        var dirA = (bA % 2 === 0) ? 1 : -1;
                        var yA = yBase + dirA * angerAmp * (0.5 + Math.random() * 0.5);
                        ctx.lineTo(xA, yA);
                    }
                    ctx.lineTo(w + 10, yBase);
                } else if (hasHope && !hasCalm && !hasJoy && !hasCuriosity && !hasAnger) {
                    // Надежда: вертикальный поток из соединённых округлых дуг
                    var arcCount = 3 + Math.floor(Math.random() * 3); // 3–5 дуг
                    var arcRadius = 30 + Math.random() * 50;
                    var centerX = w * 0.25 + Math.random() * w * 0.5;
                    var lineH = h * 0.75;
                    
                    ctx.beginPath();
                    ctx.moveTo(centerX, yBase);
                    
                    for (var a = 0; a < arcCount; a++) {
                        var startY = yBase + (a / arcCount) * lineH;
                        var midY = yBase + ((a + 0.5) / arcCount) * lineH;
                        var endY = yBase + ((a + 1) / arcCount) * lineH;
                        
                        var dir = (a % 2 === 0) ? 1 : -1;
                        var bulgeX = centerX + dir * arcRadius;
                        
                        ctx.quadraticCurveTo(bulgeX, midY, centerX, endY);
                    }
                } else if (hasDoubt && !hasCalm && !hasJoy && !hasCuriosity && !hasAnger && !hasHope) {
                    // Сомнение: прерывистая волнистая линия с разрывами
                    var gapCount = 4 + Math.floor(Math.random() * 4); // 4–7 разрывов
                    var gaps = [];
                    var usedPositions = [];
                    
                    for (var g = 0; g < gapCount; g++) {
                        var gapPos = 0.08 + Math.random() * 0.84;
                        var gapLength = 0.02 + Math.random() * 0.06;
                        var valid = true;
                        for (var u = 0; u < usedPositions.length; u++) {
                            if (Math.abs(gapPos - usedPositions[u]) < gapLength + 0.03) {
                                valid = false;
                                break;
                            }
                        }
                        if (valid) {
                            gaps.push({ t: gapPos, length: gapLength });
                            usedPositions.push(gapPos);
                        }
                    }
                    gaps.sort(function(a, b) { return a.t - b.t; });
                    
                    ctx.lineCap = 'butt';
                    ctx.beginPath();
                    
                    var segStart = 0;
                    for (var g = 0; g < gaps.length; g++) {
                        var gapStart = gaps[g].t - gaps[g].length / 2;
                        var gapEnd = gaps[g].t + gaps[g].length / 2;
                        
                        if (gapStart > segStart) {
                            var endT = Math.min(gapStart, 1);
                            if (endT > segStart) {
                                var startX = segStart * (w + 20) - 10;
                                var startAngle = segStart * Math.PI * 2 * freq + i;
                                var startY = yBase + Math.sin(startAngle) * amp;
                                ctx.moveTo(startX, startY);
                                for (var t = segStart + 0.001; t <= endT; t += 0.01) {
                                    var x = t * (w + 20) - 10;
                                    var baseAngle = t * Math.PI * 2 * freq + i;
                                    var sinVal = Math.sin(baseAngle);
                                    var y = yBase + sinVal * amp;
                                    ctx.lineTo(x, y);
                                }
                            }
                        }
                        segStart = Math.min(gapEnd, 1);
                    }
                    
                    if (segStart < 1) {
                        var startX2 = segStart * (w + 20) - 10;
                        var startAngle2 = segStart * Math.PI * 2 * freq + i;
                        var startY2 = yBase + Math.sin(startAngle2) * amp;
                        ctx.moveTo(startX2, startY2);
                        for (var t = segStart + 0.001; t <= 1; t += 0.01) {
                            var x = t * (w + 20) - 10;
                            var baseAngle = t * Math.PI * 2 * freq + i;
                            var sinVal = Math.sin(baseAngle);
                            var y = yBase + sinVal * amp;
                            ctx.lineTo(x, y);
                        }
                    }
                } else if (hasSadness && !hasCalm && !hasJoy && !hasEcstasy && !hasCuriosity && sadnessAmp > 0) {
                    // Грусть: плавная асимметричная волна (основная + вторая гармоника)
                    var prevPtS = null;
                    for (var t = 0; t <= 1; t += 0.005) {
                        var x = t * (w + 20) - 10;
                        var baseAngle = t * Math.PI * 2 * sadnessFreq + i;
                        var sinVal = Math.sin(baseAngle);
                        var y = yBase + sadnessAmp * (sinVal - 0.2 * Math.cos(2 * baseAngle));
                        
                        if (prevPtS) {
                            var midXS = (prevPtS.x + x) / 2;
                            var midYS = (prevPtS.y + y) / 2;
                            ctx.quadraticCurveTo(prevPtS.x, prevPtS.y, midXS, midYS);
                        } else {
                            ctx.moveTo(x, y);
                        }
                        prevPtS = { x: x, y: y };
                    }
                } else {
                    // Обычная синусоида (или вдохновение/тревога)
                    ctx.moveTo(-10, yBase);
                    for (var t = 0; t <= 1; t += 0.01) {
                        var x = t * (w + 20) - 10;
                        var baseAngle = t * Math.PI * 2 * freq + i;
                        var sinVal = Math.sin(baseAngle);
                        var y = yBase + sinVal * amp;
                        if (hasInspiration && !hasCalm && !hasJoy) {
                            var env = Math.sin(t * Math.PI * 2 * inspEnvFreq + inspEnvPhase) * 0.5 + 0.5;
                            y += Math.sin(t * Math.PI * 2 * inspFreq2 + inspPhase2) * inspAmp2 * env;
                        }
                        if (hasAnxiety && !hasCalm) {
                            for (var b = 0; b < breaks.length; b++) {
                                var dist = t - breaks[b].t;
                                if (Math.abs(dist) < 0.025) {
                                    var factor = 1 - Math.abs(dist) / 0.025;
                                    y += breaks[b].dir * breaks[b].strength * factor;
                                }
                            }
                        }
                        if (t > 0) {
                            var prevT = t - 0.01;
                            var prevX = prevT * (w + 20) - 10;
                            var prevAngle = prevT * Math.PI * 2 * freq + i;
                            var prevSinVal = Math.sin(prevAngle);
                            var prevY = yBase + prevSinVal * amp;
                            if (hasInspiration && !hasCalm && !hasJoy) {
                                var prevEnv = Math.sin(prevT * Math.PI * 2 * inspEnvFreq + inspEnvPhase) * 0.5 + 0.5;
                                prevY += Math.sin(prevT * Math.PI * 2 * inspFreq2 + inspPhase2) * inspAmp2 * prevEnv;
                            }
                            if (hasAnxiety && !hasCalm) {
                                for (var b = 0; b < breaks.length; b++) {
                                    var distPrev = prevT - breaks[b].t;
                                    if (Math.abs(distPrev) < 0.025) {
                                        var factorPrev = 1 - Math.abs(distPrev) / 0.025;
                                        prevY += breaks[b].dir * breaks[b].strength * factorPrev;
                                    }
                                }
                            }
                            var midX = (prevX + x) / 2;
                            var midY = (prevY + y) / 2;
                            ctx.quadraticCurveTo(prevX, prevY, midX, midY);
                        } else {
                            ctx.lineTo(x, y);
                        }
                    }
                }
                ctx.stroke();
            }
            }
        } else if (shapeType === 'particles') {
            // Частицы: фоновые — обычные точки + эмоциональные фигуры с индивидуальными настройками
            var regularCount = 50;

            // === Индивидуальные настройки каждой эмоции ===
            var emoParticleConfigs = {
                calm:       { count: 2, sizeMult: 1.0, opacityMult: 1.0 },
                joy:        { count: 2, sizeMult: 1.0, opacityMult: 1.0 },
                sadness:    { count: 2, sizeMult: 1.0, opacityMult: 1.0 },
                fatigue:    { count: 2, sizeMult: 1.0, opacityMult: 1.0 },
                anxiety:    { count: 5, sizeMult: 1.4, opacityMult: 2.0 },
                inspiration:{ count: 4, sizeMult: 1.3, opacityMult: 2.0 },
                ecstasy:    { count: 1, sizeMult: 0.6, opacityMult: 1.0 },
                curiosity:  { count: 1, sizeMult: 1.0, opacityMult: 1.0 },
                anger:      { count: 2, sizeMult: 1.0, opacityMult: 1.0 },
                hope:       { count: 1, sizeMult: 0.7, opacityMult: 0.6 },
                doubt:      { count: 2, sizeMult: 1.0, opacityMult: 1.3 },
                longing:    { count: 1, sizeMult: 0.7, opacityMult: 0.5 }
            };

            // Обычные частицы — мягкие точки с ореолом
            var hasCalm = selectedEmotions.has('calm');
            var calmReplaceCount = Math.floor(regularCount * 0.2);
            for (var i = 0; i < regularCount; i++) {
                var c = boostColor(colors[Math.floor(Math.random() * colors.length)]);
                var px = Math.random() * w;
                var py = Math.random() * h;
                var pr = 3 + Math.random() * 8;
                var isCalm = hasCalm && i < calmReplaceCount;

                if (isCalm) {
                    // Скруглённый квадрат calm — тот же position/size/color/opacity
                    var half = pr * 4 * 0.5;
                    var r = half * 0.3;
                    ctx.beginPath();
                    ctx.moveTo(px - half + r, py - half);
                    ctx.lineTo(px + half - r, py - half);
                    ctx.quadraticCurveTo(px + half, py - half, px + half, py - half + r);
                    ctx.lineTo(px + half, py + half - r);
                    ctx.quadraticCurveTo(px + half, py + half, px + half - r, py + half);
                    ctx.lineTo(px - half + r, py + half);
                    ctx.quadraticCurveTo(px - half, py + half, px - half, py + half - r);
                    ctx.lineTo(px - half, py - half + r);
                    ctx.quadraticCurveTo(px - half, py - half, px - half + r, py - half);
                    ctx.closePath();
                    ctx.fillStyle = 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + emotionOpacity(0.08) + ')';
                    ctx.fill();
                } else {
                    ctx.beginPath();
                    ctx.arc(px, py, pr * 4, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + emotionOpacity(0.08) + ')';
                    ctx.fill();
                }
            }

            // Эмоциональные фигуры — индивидуальное количество для каждой эмоции
            for (var ei = 0; ei < emotionCount; ei++) {
                var emoName = emotionList[ei];
                var geo = EMOTION_GEOMETRY[emoName];
                if (!geo) continue;
                var cfg = emoParticleConfigs[emoName];
                if (!cfg) continue;

                var role = getEmotionRole(emoName);
                var roleMult = role === 'secondary' ? 0.6 : 1.0;

                for (var fi = 0; fi < cfg.count; fi++) {
                    var c = boostColor(colors[Math.floor(Math.random() * colors.length)]);
                    var px = Math.random() * w;
                    var py = Math.random() * h;
                    var pr = 3 + Math.random() * 8;
                    var emoSize = pr * 3.5 * cfg.sizeMult * roleMult;
                    var genNoise = makeNoise(EMOTION_SEEDS[emoName]);

                    if (geo.renderMode === 'fill') {
                        ctx.save();
                        geo.draw(ctx, px, py, emoSize, genNoise);
                        ctx.clip();
                        var brightC = { r: Math.min(c.r + 40, 255), g: Math.min(c.g + 40, 255), b: Math.min(c.b + 40, 255) };
                        var partGrad = ctx.createRadialGradient(px, py, 0, px, py, emoSize);
                        partGrad.addColorStop(0, 'rgba(' + brightC.r + ', ' + brightC.g + ', ' + brightC.b + ', ' + emotionOpacity(0.12 * cfg.opacityMult) + ')');
                        partGrad.addColorStop(1, 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', 0)');
                        ctx.fillStyle = partGrad;
                        ctx.fillRect(px - emoSize, py - emoSize, emoSize * 2, emoSize * 2);
                        ctx.restore();
                    } else if (emoName === 'curiosity') {
                        ctx.save();
                        geo.draw(ctx, px, py, emoSize, genNoise);
                        ctx.strokeStyle = 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + emotionOpacity(0.3 * cfg.opacityMult) + ')';
                        ctx.lineWidth = 1.5;
                        ctx.lineCap = 'round';
                        ctx.stroke();
                        var gapAngle = Math.PI * 0.083;
                        var dotX = px + Math.cos(gapAngle) * emoSize * 0.55;
                        var dotY = py + Math.sin(gapAngle) * emoSize * 0.55;
                        var dotGrad = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, emoSize * 0.08);
                        dotGrad.addColorStop(0, 'rgba(' + Math.min(c.r + 80, 255) + ', ' + Math.min(c.g + 80, 255) + ', ' + Math.min(c.b + 80, 255) + ', ' + emotionOpacity(0.5 * cfg.opacityMult) + ')');
                        dotGrad.addColorStop(1, 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', 0)');
                        ctx.fillStyle = dotGrad;
                        ctx.beginPath();
                        ctx.arc(dotX, dotY, emoSize * 0.08, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.restore();
                    } else if (emoName === 'hope') {
                        ctx.save();
                        geo.draw(ctx, px, py, emoSize, genNoise);
                        ctx.strokeStyle = 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + emotionOpacity(0.3 * cfg.opacityMult) + ')';
                        ctx.lineWidth = 1;
                        ctx.lineCap = 'round';
                        ctx.shadowColor = 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + (0.3 * glowIntensity * cfg.opacityMult) + ')';
                        ctx.shadowBlur = 4;
                        ctx.stroke();
                        ctx.shadowBlur = 0;
                        ctx.restore();
                    } else if (emoName === 'doubt') {
                        ctx.save();
                        geo.draw(ctx, px, py, emoSize, genNoise);
                        ctx.strokeStyle = 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + emotionOpacity(0.4 * cfg.opacityMult) + ')';
                        ctx.lineWidth = 2.5;
                        ctx.lineCap = 'butt';
                        ctx.lineJoin = 'miter';
                        ctx.stroke();
                        ctx.restore();
                    } else if (emoName === 'longing') {
                        ctx.save();
                        geo.draw(ctx, px, py, emoSize, genNoise);
                        ctx.strokeStyle = 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + emotionOpacity(0.25 * cfg.opacityMult) + ')';
                        ctx.lineWidth = 1;
                        ctx.lineCap = 'round';
                        ctx.stroke();
                        ctx.restore();
                    } else if (emoName === 'ecstasy') {
                        ctx.save();
                        geo.draw(ctx, px, py, emoSize, genNoise);
                        ctx.strokeStyle = 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + emotionOpacity(0.3 * cfg.opacityMult) + ')';
                        ctx.lineWidth = 2;
                        ctx.lineCap = 'round';
                        ctx.shadowColor = 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + (0.5 * glowIntensity * cfg.opacityMult) + ')';
                        ctx.shadowBlur = 8;
                        ctx.stroke();
                        ctx.shadowBlur = 0;
                        ctx.restore();
                    } else {
                        ctx.save();
                        geo.draw(ctx, px, py, emoSize, genNoise);
                        ctx.strokeStyle = 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + emotionOpacity(0.3 * cfg.opacityMult) + ')';
                        ctx.lineWidth = 2;
                        ctx.lineCap = 'round';
                        ctx.shadowColor = 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + (0.5 * glowIntensity * cfg.opacityMult) + ')';
                        ctx.shadowBlur = 8;
                        ctx.stroke();
                        ctx.shadowBlur = 0;
                        ctx.restore();
                    }
                }
            }

            // ANGER: одна дополнительная крупная фигура на всю композицию
            if (emotionCount > 0 && emotionList.indexOf('anger') >= 0) {
                var angerC = boostColor(colors[Math.floor(Math.random() * colors.length)]);
                var angerX = w * 0.2 + Math.random() * w * 0.6;
                var angerY = h * 0.2 + Math.random() * h * 0.6;
                var angerSize = 60 + Math.random() * 40;
                var angerNoise = makeNoise(EMOTION_SEEDS.anger);
                var angerGeo = EMOTION_GEOMETRY.anger;
                ctx.save();
                angerGeo.draw(ctx, angerX, angerY, angerSize, angerNoise);
                ctx.clip();
                var brightAnger = { r: Math.min(angerC.r + 80, 255), g: Math.min(angerC.g + 80, 255), b: Math.min(angerC.b + 80, 255) };
                var angerGrad = ctx.createRadialGradient(angerX, angerY, 0, angerX, angerY, angerSize);
                angerGrad.addColorStop(0, 'rgba(' + brightAnger.r + ', ' + brightAnger.g + ', ' + brightAnger.b + ', ' + emotionOpacity(0.2) + ')');
                angerGrad.addColorStop(1, 'rgba(' + angerC.r + ', ' + angerC.g + ', ' + angerC.b + ', 0)');
                ctx.fillStyle = angerGrad;
                ctx.fillRect(angerX - angerSize, angerY - angerSize, angerSize * 2, angerSize * 2);
                ctx.restore();
            }
        } else if (shapeType === 'neural') {
            // Нейронные связи: узлы с эмоциональной геометрией
            var nodes = [];
            for (var i = 0; i < 15; i++) {
                var c = boostColor(colors[i % colors.length]);
                var px = [cx1, cx2, cx3, w * 0.2, w * 0.8, w * 0.5, w * 0.3, w * 0.7, w * 0.15, w * 0.85, w * 0.5, w * 0.4, w * 0.6, w * 0.25, w * 0.75][i];
                var py = [cy1, cy2, cy3, h * 0.3, h * 0.7, h * 0.5, h * 0.2, h * 0.8, h * 0.25, h * 0.75, h * 0.4, h * 0.6, h * 0.35, h * 0.65, h * 0.5][i];
                var nr = 8 + Math.random() * 15;

                // Первые 7 узлов — обычные круглые, остальные — эмоциональные
                var isEmotional = i >= 7 && emotionCount > 0;
                var emoName = isEmotional ? pickEmotion() : null;
                var role = isEmotional ? getEmotionRole(emoName) : 'normal';
                var sizeMult = role === 'secondary' ? 0.6 : 1.0;

                nodes.push({ x: px, y: py, r: nr, c: c, emotional: isEmotional, emoName: emoName, role: role });

                if (isEmotional && emoName && EMOTION_GEOMETRY[emoName]) {
                    var emoSize = nr * sizeMult;
                    var genNoise = function(amount) { return (Math.random() - 0.5) * amount; };
                    EMOTION_GEOMETRY[emoName].draw(ctx, px, py, emoSize, genNoise);
                    var ng = ctx.createRadialGradient(px, py, 0, px, py, emoSize);
                    ng.addColorStop(0, 'rgba(' + Math.min(c.r + 100, 255) + ', ' + Math.min(c.g + 100, 255) + ', ' + Math.min(c.b + 100, 255) + ', ' + emotionOpacity(0.8) + ')');
                    ng.addColorStop(1, 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + emotionOpacity(0.3) + ')');
                    ctx.fillStyle = ng;
                    ctx.fill();
                } else {
                    ctx.beginPath();
                    ctx.arc(px, py, nr, 0, Math.PI * 2);
                    var ng = ctx.createRadialGradient(px, py, 0, px, py, nr);
                    ng.addColorStop(0, 'rgba(' + Math.min(c.r + 100, 255) + ', ' + Math.min(c.g + 100, 255) + ', ' + Math.min(c.b + 100, 255) + ', ' + emotionOpacity(0.8) + ')');
                    ng.addColorStop(1, 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + emotionOpacity(0.3) + ')');
                    ctx.fillStyle = ng;
                    ctx.fill();
                }
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
        } else if (shapeType === 'symmetry') {
            // Симметрия: радиальный орнамент из эмоциональной геометрии
            var symRadius = h * (0.18 + Math.random() * 0.28);
            var symSize = 35 + Math.random() * 55;
            var symColor = boostColor(colors[0]);
            var symRotOffset = Math.random() * symmetryAngleStep * 0.3;

            for (var sa = 0; sa < symmetryAxes; sa++) {
                ctx.save();
                ctx.translate(symmetryCX, symmetryCY);
                ctx.rotate(sa * symmetryAngleStep + symRotOffset);

                if (emotionCount > 0) {
                    // Используем фигуры из EMOTION_GEOMETRY
                    var emoName = pickEmotion();
                    var geo = EMOTION_GEOMETRY[emoName];
                    var emoSize = symSize * 1.5;
                    var genNoise = makeNoise(EMOTION_SEEDS[emoName]);
                    var role = getEmotionRole(emoName);
                    var sizeMult = role === 'secondary' ? 0.6 : 1.0;
                    emoSize *= sizeMult;

                    if (geo && geo.draw) {
                        if (geo.renderMode === 'fill') {
                            geo.draw(ctx, 0, -symRadius, emoSize, genNoise);
                            ctx.clip();
                            var symGrad = ctx.createRadialGradient(0, -symRadius, 0, 0, -symRadius, emoSize);
                            symGrad.addColorStop(0, 'rgba(' + Math.min(symColor.r + 60, 255) + ', ' + Math.min(symColor.g + 60, 255) + ', ' + Math.min(symColor.b + 60, 255) + ', ' + emotionOpacity(0.3) + ')');
                            symGrad.addColorStop(0.5, 'rgba(' + symColor.r + ', ' + symColor.g + ', ' + symColor.b + ', ' + emotionOpacity(0.15) + ')');
                            symGrad.addColorStop(1, 'rgba(' + symColor.r + ', ' + symColor.g + ', ' + symColor.b + ', 0)');
                            ctx.fillStyle = symGrad;
                            ctx.fillRect(-emoSize, -symRadius - emoSize, emoSize * 2, emoSize * 2);
                            ctx.restore();
                        } else if (emoName === 'curiosity') {
                            geo.draw(ctx, 0, -symRadius, emoSize, genNoise);
                            ctx.strokeStyle = 'rgba(' + symColor.r + ', ' + symColor.g + ', ' + symColor.b + ', ' + emotionOpacity(0.25) + ')';
                            ctx.lineWidth = 1.5;
                            ctx.lineCap = 'round';
                            ctx.stroke();
                            var gapAngle = Math.PI * 0.083;
                            var dotX = Math.cos(gapAngle) * emoSize * 0.55;
                            var dotY = -symRadius + Math.sin(gapAngle) * emoSize * 0.55;
                            var dotGrad = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, emoSize * 0.08);
                            dotGrad.addColorStop(0, 'rgba(' + Math.min(symColor.r + 80, 255) + ', ' + Math.min(symColor.g + 80, 255) + ', ' + Math.min(symColor.b + 80, 255) + ', ' + emotionOpacity(0.5) + ')');
                            dotGrad.addColorStop(1, 'rgba(' + symColor.r + ', ' + symColor.g + ', ' + symColor.b + ', 0)');
                            ctx.fillStyle = dotGrad;
                            ctx.beginPath();
                            ctx.arc(dotX, dotY, emoSize * 0.08, 0, Math.PI * 2);
                            ctx.fill();
                            ctx.restore();
                        } else if (emoName === 'longing' || emoName === 'hope' || emoName === 'doubt' || emoName === 'ecstasy') {
                            geo.draw(ctx, 0, -symRadius, emoSize, genNoise);
                            ctx.strokeStyle = 'rgba(' + symColor.r + ', ' + symColor.g + ', ' + symColor.b + ', ' + emotionOpacity(0.25) + ')';
                            ctx.lineWidth = 2;
                            ctx.lineCap = 'round';
                            ctx.shadowColor = 'rgba(' + symColor.r + ', ' + symColor.g + ', ' + symColor.b + ', ' + (0.4 * glowIntensity) + ')';
                            ctx.shadowBlur = 8;
                            ctx.stroke();
                            ctx.shadowBlur = 0;
                            ctx.restore();
                        }
                    }
                }

                ctx.restore();
            }

            // Центральное ядро
            var coreC = boostColor(colors[0]);
            var coreGrad = ctx.createRadialGradient(symmetryCX, symmetryCY, 0, symmetryCX, symmetryCY, h * 0.07);
            coreGrad.addColorStop(0, 'rgba(' + Math.min(coreC.r + 80, 255) + ', ' + Math.min(coreC.g + 80, 255) + ', ' + Math.min(coreC.b + 80, 255) + ', ' + emotionOpacity(0.35) + ')');
            coreGrad.addColorStop(0.5, 'rgba(' + coreC.r + ', ' + coreC.g + ', ' + coreC.b + ', ' + emotionOpacity(0.12) + ')');
            coreGrad.addColorStop(1, 'rgba(' + coreC.r + ', ' + coreC.g + ', ' + coreC.b + ', 0)');
            ctx.fillStyle = coreGrad;
            ctx.beginPath();
            ctx.arc(symmetryCX, symmetryCY, h * 0.07, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        // === СРЕДНИЙ ПЛАН: основные элементы ===
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        if (shapeType === 'organic') {
            // Органика: средние blob-формы с эмоциональной геометрией
            for (var i = 0; i < 6; i++) {
                var c = boostColor(colors[i % colors.length]);
                var px = [cx1, cx2, cx3, w * 0.3, w * 0.7, w * 0.5][i];
                var py = [cy1, cy2, cy3, h * 0.35, h * 0.65, h * 0.5][i];
                var br = 40 + Math.random() * 60;

                // Первые 3 — обычные, последние 3 — эмоциональные
                var isEmotional = i >= 3 && emotionCount > 0;
                var emoName = isEmotional ? pickEmotion() : null;
                var role = isEmotional ? getEmotionRole(emoName) : 'normal';
                var sizeMult = role === 'secondary' ? 0.6 : 1.0;

                if (isEmotional && emoName && EMOTION_GEOMETRY[emoName]) {
                    var geo = EMOTION_GEOMETRY[emoName];
                    var emoSize = br * 1.3 * sizeMult;
                    var genNoise = makeNoise(EMOTION_SEEDS[emoName]);

                    if (geo.renderMode === 'fill') {
                        // Градиентная заливка без clip
                        geo.draw(ctx, px, py, emoSize, genNoise);
                        var grad = ctx.createRadialGradient(px - emoSize * 0.2, py - emoSize * 0.2, 0, px, py, emoSize);
                        grad.addColorStop(0, 'rgba(' + Math.min(c.r + 60, 255) + ', ' + Math.min(c.g + 60, 255) + ', ' + Math.min(c.b + 60, 255) + ', ' + emotionOpacity(0.45) + ')');
                        grad.addColorStop(0.5, 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + emotionOpacity(0.2) + ')');
                        grad.addColorStop(1, 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', 0)');
                        ctx.fillStyle = grad;
                        ctx.fill();
                    } else if (emoName === 'curiosity') {
                        // Кольцо stroke + точка fill
                        geo.draw(ctx, px, py, emoSize, genNoise);
                        ctx.strokeStyle = 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + emotionOpacity(0.35) + ')';
                        ctx.lineWidth = 1.5;
                        ctx.lineCap = 'round';
                        ctx.stroke();
                        // Точка у разрыва — рядом с концом дуги
                        var gapAngle = Math.PI * 0.083;
                        var dotX = px + Math.cos(gapAngle) * emoSize * 0.55;
                        var dotY = py + Math.sin(gapAngle) * emoSize * 0.55;
                        var dotGrad = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, emoSize * 0.08);
                        dotGrad.addColorStop(0, 'rgba(' + Math.min(c.r + 80, 255) + ', ' + Math.min(c.g + 80, 255) + ', ' + Math.min(c.b + 80, 255) + ', ' + emotionOpacity(0.5) + ')');
                        dotGrad.addColorStop(1, 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', 0)');
                        ctx.fillStyle = dotGrad;
                        ctx.beginPath();
                        ctx.arc(dotX, dotY, emoSize * 0.08, 0, Math.PI * 2);
                        ctx.fill();
                    } else {
                        // Только stroke
                        geo.draw(ctx, px, py, emoSize, genNoise);
                        ctx.strokeStyle = 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + emotionOpacity(0.35) + ')';
                        ctx.lineWidth = 2;
                        ctx.lineCap = 'round';
                        ctx.shadowColor = 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + (0.5 * glowIntensity) + ')';
                        ctx.shadowBlur = 8;
                        ctx.stroke();
                        ctx.shadowBlur = 0;
                    }
                } else {
                    // Обычная круглая blob-форма
                    var grad = ctx.createRadialGradient(px - br * 0.2, py - br * 0.2, 0, px, py, br * 1.3);
                    grad.addColorStop(0, 'rgba(' + Math.min(c.r + 60, 255) + ', ' + Math.min(c.g + 60, 255) + ', ' + Math.min(c.b + 60, 255) + ', ' + emotionOpacity(0.45) + ')');
                    grad.addColorStop(0.5, 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + emotionOpacity(0.2) + ')');
                    grad.addColorStop(1, 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', 0)');
                    ctx.fillStyle = grad;
                    ctx.beginPath();
                    ctx.arc(px, py, br * 1.3, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        } else if (shapeType === 'geometry') {
            // Геометрия: средние фигуры с эмоциональной геометрией
            for (var i = 0; i < 10; i++) {
                var c = boostColor(colors[i % colors.length]);
                var px = [cx1, cx2, cx3, w * 0.25, w * 0.75, w * 0.5, w * 0.35, w * 0.65, w * 0.15, w * 0.85][i];
                var py = [cy1, cy2, cy3, h * 0.35, h * 0.65, h * 0.5, h * 0.25, h * 0.75, h * 0.3, h * 0.7][i];
                var br = 25 + Math.random() * 50;

                // Первые 5 — обычные, последние 5 — эмоциональные
                var isEmotional = i >= 5 && emotionCount > 0;
                var emoName = isEmotional ? pickEmotion() : null;
                var role = isEmotional ? getEmotionRole(emoName) : 'normal';
                var sizeMult = role === 'secondary' ? 0.6 : 1.0;

                if (isEmotional && emoName && EMOTION_GEOMETRY[emoName]) {
                    var geo = EMOTION_GEOMETRY[emoName];
                    var emoSize = br * sizeMult;
                    renderGeoEmotion(ctx, geo, emoName, px, py, emoSize, c, emotionOpacity(0.3), glowIntensity, i + 100);
                } else {
                    // Обычный многоугольник
                    var sides = 3 + Math.floor(Math.random() * 5);
                    var hasCalm = selectedEmotions.has('calm');
                    var hasDoubt = selectedEmotions.has('doubt');
                    var hasLonging = selectedEmotions.has('longing');
                    var effectiveDoubt = hasDoubt && !hasLonging;

                    // Сбор вершин (сохраняем состояние Math.random() как в оригинале)
                    var verts = [];
                    var angles = [];
                    for (var j = 0; j <= sides; j++) {
                        angles.push((j / sides) * Math.PI * 2 - Math.PI / 2 + Math.random() * 0.15);
                    }
                    for (var j = 0; j < sides; j++) {
                        var angle = angles[j];
                        verts.push({ x: px + Math.cos(angle) * br, y: py + Math.sin(angle) * br });
                    }

                    ctx.beginPath();
                    if (hasCalm && effectiveDoubt) {
                        // Скруглённый контур с одним разрывом
                        var skipEdge = Math.floor(Math.random() * sides);

                        // Предварительный расчёт entries/exits
                        var entries = [], exits = [];
                        for (var j = 0; j < sides; j++) {
                            var prev = verts[(j - 1 + sides) % sides];
                            var curr = verts[j];
                            var next = verts[(j + 1) % sides];
                            var lenPrev = Math.sqrt((curr.x - prev.x) ** 2 + (curr.y - prev.y) ** 2);
                            var lenNext = Math.sqrt((next.x - curr.x) ** 2 + (next.y - curr.y) ** 2);
                            var r = Math.min(lenPrev, lenNext) * 0.25;
                            entries[j] = {
                                x: curr.x - (curr.x - prev.x) / lenPrev * r,
                                y: curr.y - (curr.y - prev.y) / lenPrev * r
                            };
                            exits[j] = {
                                x: curr.x + (next.x - curr.x) / lenNext * r,
                                y: curr.y + (next.y - curr.y) / lenNext * r
                            };
                        }

                        // Рисуем от skipEdge+1 до skipEdge+sides (пропуская skipEdge)
                        for (var j = 0; j < sides; j++) {
                            var idx = (skipEdge + 1 + j) % sides;
                            if (j === 0) {
                                ctx.moveTo(entries[idx].x, entries[idx].y);
                            } else {
                                ctx.lineTo(entries[idx].x, entries[idx].y);
                            }
                            ctx.quadraticCurveTo(verts[idx].x, verts[idx].y, exits[idx].x, exits[idx].y);
                        }
                    } else if (hasCalm) {
                        // Скруглённый контур
                        for (var j = 0; j < sides; j++) {
                            var prev = verts[(j - 1 + sides) % sides];
                            var curr = verts[j];
                            var next = verts[(j + 1) % sides];

                            var dxPrev = curr.x - prev.x, dyPrev = curr.y - prev.y;
                            var lenPrev = Math.sqrt(dxPrev * dxPrev + dyPrev * dyPrev);
                            var dxNext = next.x - curr.x, dyNext = next.y - curr.y;
                            var lenNext = Math.sqrt(dxNext * dxNext + dyNext * dyNext);

                            var r = Math.min(lenPrev, lenNext) * 0.25;

                            var entryX = curr.x - (dxPrev / lenPrev) * r;
                            var entryY = curr.y - (dyPrev / lenPrev) * r;
                            var exitX = curr.x + (dxNext / lenNext) * r;
                            var exitY = curr.y + (dyNext / lenNext) * r;

                            if (j === 0) {
                                ctx.moveTo(entryX, entryY);
                            } else {
                                ctx.lineTo(entryX, entryY);
                            }
                            ctx.quadraticCurveTo(curr.x, curr.y, exitX, exitY);
                        }
                    } else if (effectiveDoubt) {
                        // Обычный контур с одним разрывом
                        var skipEdge = Math.floor(Math.random() * sides);
                        for (var j = 0; j < sides; j++) {
                            var idx = (skipEdge + 1 + j) % sides;
                            var x = verts[idx].x, y = verts[idx].y;
                            if (j === 0) ctx.moveTo(x, y);
                            else ctx.lineTo(x, y);
                        }
                    } else {
                        // Обычный контур
                        for (var j = 0; j <= sides; j++) {
                            var angle = angles[j];
                            var x = px + Math.cos(angle) * br;
                            var y = py + Math.sin(angle) * br;
                            if (j === 0) ctx.moveTo(x, y);
                            else ctx.lineTo(x, y);
                        }
                        ctx.closePath();
                    }
                    if (hasLonging) ctx.closePath();

                    // Вложенный внутренний контур (LONGING)
                    if (hasLonging) {
                        var cxc = 0, cyc = 0;
                        for (var j = 0; j < sides; j++) { cxc += verts[j].x; cyc += verts[j].y; }
                        cxc /= sides; cyc /= sides;
                        var iv = [];
                        for (var j = 0; j < sides; j++) {
                            iv.push({ x: cxc + (verts[j].x - cxc) * 0.9, y: cyc + (verts[j].y - cyc) * 0.9 });
                        }

                        if (hasCalm && effectiveDoubt) {
                            var ie = [], oe = [];
                            for (var j = 0; j < sides; j++) {
                                var prev = iv[(j - 1 + sides) % sides];
                                var curr = iv[j];
                                var next = iv[(j + 1) % sides];
                                var lenPrev = Math.sqrt((curr.x - prev.x) ** 2 + (curr.y - prev.y) ** 2);
                                var lenNext = Math.sqrt((next.x - curr.x) ** 2 + (next.y - curr.y) ** 2);
                                var r = Math.min(lenPrev, lenNext) * 0.25;
                                ie[j] = { x: curr.x - (curr.x - prev.x) / lenPrev * r, y: curr.y - (curr.y - prev.y) / lenPrev * r };
                                oe[j] = { x: curr.x + (next.x - curr.x) / lenNext * r, y: curr.y + (next.y - curr.y) / lenNext * r };
                            }
                            for (var j = 0; j < sides; j++) {
                                var idx = (skipEdge + 1 + j) % sides;
                                if (j === 0) ctx.moveTo(ie[idx].x, ie[idx].y);
                                else ctx.lineTo(ie[idx].x, ie[idx].y);
                                ctx.quadraticCurveTo(iv[idx].x, iv[idx].y, oe[idx].x, oe[idx].y);
                            }
                        } else if (hasCalm) {
                            for (var j = 0; j < sides; j++) {
                                var prev = iv[(j - 1 + sides) % sides];
                                var curr = iv[j];
                                var next = iv[(j + 1) % sides];
                                var dxPrev = curr.x - prev.x, dyPrev = curr.y - prev.y;
                                var lenPrev = Math.sqrt(dxPrev * dxPrev + dyPrev * dyPrev);
                                var dxNext = next.x - curr.x, dyNext = next.y - curr.y;
                                var lenNext = Math.sqrt(dxNext * dxNext + dyNext * dyNext);
                                var r = Math.min(lenPrev, lenNext) * 0.25;
                                var entryX = curr.x - (dxPrev / lenPrev) * r;
                                var entryY = curr.y - (dyPrev / lenPrev) * r;
                                var exitX = curr.x + (dxNext / lenNext) * r;
                                var exitY = curr.y + (dyNext / lenNext) * r;
                                if (j === 0) ctx.moveTo(entryX, entryY);
                                else ctx.lineTo(entryX, entryY);
                                ctx.quadraticCurveTo(curr.x, curr.y, exitX, exitY);
                            }
                        } else if (effectiveDoubt) {
                            for (var j = 0; j < sides; j++) {
                                var idx = (skipEdge + 1 + j) % sides;
                                if (j === 0) ctx.moveTo(iv[idx].x, iv[idx].y);
                                else ctx.lineTo(iv[idx].x, iv[idx].y);
                            }
                        } else {
                            for (var j = 0; j < sides; j++) {
                                var angle = angles[j];
                                var x = cxc + (px + Math.cos(angle) * br - cxc) * 0.9;
                                var y = cyc + (py + Math.sin(angle) * br - cyc) * 0.9;
                                if (j === 0) ctx.moveTo(x, y);
                                else ctx.lineTo(x, y);
                            }
                        }
                        ctx.closePath();
                    }

                    if (!hasDoubt && !hasLonging) {
                        ctx.fillStyle = 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + emotionOpacity(0.3) + ')';
                        ctx.fill();
                    }
                    var edgeC = { r: Math.min(c.r + 80, 255), g: Math.min(c.g + 80, 255), b: Math.min(c.b + 80, 255) };
                    ctx.strokeStyle = 'rgba(' + edgeC.r + ', ' + edgeC.g + ', ' + edgeC.b + ', ' + emotionOpacity(0.7) + ')';
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                }
            }
        } else if (shapeType === 'flow') {
            // Поток: яркие линии поверх волн
            var hasCalm = selectedEmotions.has('calm');
            var hasAnxiety = selectedEmotions.has('anxiety');
            var hasInspiration = selectedEmotions.has('inspiration');
            var hasJoy = selectedEmotions.has('joy');
            var hasCuriosity = selectedEmotions.has('curiosity');
            var hasEcstasy = selectedEmotions.has('ecstasy');
            var hasSadness = selectedEmotions.has('sadness');
            var hasAnger = selectedEmotions.has('anger');
            var hasHope = selectedEmotions.has('hope');
            var hasDoubt = selectedEmotions.has('doubt');
            var hasFatigue = selectedEmotions.has('fatigue');
            var hasLonging = selectedEmotions.has('longing');
            var yBase = h * 0.5;
            
            // Усталость: 8 прямых линий (итого 22 с Background)
            if (hasFatigue && !hasCalm && !hasJoy && !hasCuriosity && !hasAnger && !hasHope && !hasDoubt && !hasSadness && !hasEcstasy) {
                for (var fL2 = 0; fL2 < 8; fL2++) {
                    var angle2 = (Math.random() - 0.5) * 0.28;
                    var yStart2 = yBase - 120 + fL2 * 32;
                    var c2 = boostColor(colors[fL2 % colors.length]);
                    ctx.beginPath();
                    ctx.strokeStyle = 'rgba(' + c2.r + ', ' + c2.g + ', ' + c2.b + ', 0.5)';
                    ctx.lineWidth = 2;
                    ctx.lineCap = 'butt';
                    ctx.moveTo(-100, yStart2);
                    ctx.lineTo(w + 100, yStart2 + Math.tan(angle2) * (w + 200));
                    ctx.stroke();
                }
            } else if (hasLonging && !hasCalm && !hasJoy && !hasCuriosity && !hasAnger && !hasSadness && !hasFatigue) {
                // Тоска: 2 прямые линии
                for (var fL2 = 0; fL2 < 2; fL2++) {
                    var angleL2 = (Math.random() - 0.5) * 0.12;
                    var yStartL2 = yBase - 80 + fL2 * 160;
                    var cL2 = boostColor(colors[fL2 % colors.length]);
                    ctx.beginPath();
                    ctx.strokeStyle = 'rgba(' + cL2.r + ', ' + cL2.g + ', ' + cL2.b + ', 0.45)';
                    ctx.lineWidth = 1.5;
                    ctx.lineCap = 'butt';
                    ctx.moveTo(-100, yStartL2);
                    ctx.lineTo(w + 100, yStartL2 + Math.tan(angleL2) * (w + 200));
                    ctx.stroke();
                }
            } else {
            for (var i = 0; i < 6; i++) {
                var c = boostColor(colors[i % colors.length]);
                var yBase = h * (0.15 + i * 0.13);
                var brightC = { r: Math.min(c.r + 40, 255), g: Math.min(c.g + 40, 255), b: Math.min(c.b + 40, 255) };

                // Параметры для каждой линии уникальны
                var amp2, freq2;
                if (hasCalm) {
                    amp2 = 5 + Math.random() * 10;
                    freq2 = 1 + Math.floor(Math.random() * 2);
                } else if (hasInspiration) {
                    amp2 = 15 + Math.random() * 20;
                    freq2 = 3 + Math.floor(Math.random() * 3);
                } else {
                    amp2 = 15 + Math.random() * 30 * intensityFactor;
                    freq2 = 3 + Math.floor(Math.random() * 2);
                }

                // Вдохновение: модулируемая амплитуда для разнообразия
                var inspAmp2b, inspFreq2b, inspPhase2b, inspEnvFreqb, inspEnvPhaseb;
                if (hasInspiration && !hasCalm && !hasJoy) {
                    inspAmp2b = amp2 * (0.4 + Math.random() * 0.4);
                    inspFreq2b = freq2 + Math.floor(Math.random() * 4) + 1;
                    inspPhase2b = Math.random() * Math.PI * 2;
                    inspEnvFreqb = 0.5 + Math.random() * 1.5;
                    inspEnvPhaseb = Math.random() * Math.PI * 2;
                }

                // Радость: кубические кривые Безье для округлых холмиков
                var joyPoints2 = [];
                if (hasJoy && !hasCalm) {
                    var hillCount2 = 3 + Math.floor(Math.random() * 4);
                    var lineW2 = w + 20;
                    var step2 = lineW2 / hillCount2;
                    for (var hp2 = 0; hp2 <= hillCount2; hp2++) {
                        var isPeak2 = hp2 % 2 === 1;
                        var hillHeight2 = amp2 * (0.7 + Math.random() * 0.6);
                        var hillX2 = -10 + hp2 * step2;
                        var hillY2 = isPeak2 ? yBase - hillHeight2 : yBase + hillHeight2 * 0.4;
                        joyPoints2.push({ x: hillX2, y: hillY2, peak: isPeak2 });
                    }
                }

                // Радость: подготовка для cubic Bezier с округлыми вершинами
                var joyBezier2 = null;
                if (hasJoy && !hasCalm && joyPoints2.length >= 3) {
                    var cpList2 = [];
                    for (var seg2 = 0; seg2 < joyPoints2.length - 1; seg2++) {
                        var pPrev2 = seg2 > 0 ? joyPoints2[seg2 - 1] : null;
                        var pCurr2 = joyPoints2[seg2];
                        var pNext2 = seg2 < joyPoints2.length - 2 ? joyPoints2[seg2 + 1] : null;
                        var pNext22 = seg2 < joyPoints2.length - 1 ? joyPoints2[seg2 + 1] : null;
                        
                        var tension = 0.3;
                        var x02 = pPrev2 ? pPrev2.x : pCurr2.x - (pNext22.x - pCurr2.x);
                        var y02 = pPrev2 ? pPrev2.y : pCurr2.y + (pNext22.y - pCurr2.y) * 0.4;
                        var x12 = pCurr2.x;
                        var y12 = pCurr2.y;
                        var x22 = pNext22.x;
                        var y22 = pNext22.y;
                        var x32 = pNext2 ? pNext2.x : pNext22.x + (pNext22.x - pCurr2.x);
                        var y32 = pNext2 ? pNext2.y : pNext22.y + (pNext22.y - pCurr2.y) * 0.4;
                        
                        var cp1x2 = x12 + (x22 - x02) / 6;
                        var cp1y2 = y12 + (y22 - y02) / 6;
                        var cp2x2 = x22 - (x32 - x12) / 6;
                        var cp2y2 = y22 - (y32 - y12) / 6;
                        
                        if (pCurr2.peak) {
                            cp1y2 = y12 - Math.abs(y12 - y02) * 0.15;
                            cp2y2 = y22 - Math.abs(y22 - y32) * 0.15;
                        } else {
                            cp1y2 = y12 + Math.abs(y12 - y02) * 0.15;
                            cp2y2 = y22 + Math.abs(y22 - y32) * 0.15;
                        }
                        
                        cpList2.push({ cp1x: cp1x2, cp1y: cp1y2, cp2x: cp2x2, cp2y: cp2y2, endX: x32, endY: y32 });
                    }
                    joyBezier2 = cpList2;
                }

                // Восторг: кубические кривые Безье для округлых волн (амплитуда +30% от joy)
                var ecstasyPoints2 = [];
                if (hasEcstasy && !hasCalm && !hasJoy) {
                    var hillCountE2 = 3 + Math.floor(Math.random() * 4);
                    var lineWE2 = w + 20;
                    var stepE2 = lineWE2 / hillCountE2;
                    for (var hpE2 = 0; hpE2 <= hillCountE2; hpE2++) {
                        var isPeakE2 = hpE2 % 2 === 1;
                        // Амплитуда на 30% больше, чем у joy
                        var hillHeightE2 = amp2 * (0.7 + Math.random() * 0.6) * 1.6;
                        var hillXE2 = -10 + hpE2 * stepE2;
                        var hillYE2 = isPeakE2 ? yBase - hillHeightE2 : yBase + hillHeightE2 * 0.4;
                        ecstasyPoints2.push({ x: hillXE2, y: hillYE2, peak: isPeakE2 });
                    }
                }

                // Восторг: подготовка для cubic Bezier с округлыми вершинами
                var ecstasyBezier2 = null;
                if (hasEcstasy && !hasCalm && !hasJoy && ecstasyPoints2.length >= 3) {
                    var cpListE2 = [];
                    for (var segE2 = 0; segE2 < ecstasyPoints2.length - 1; segE2++) {
                        var pPrevE2 = segE2 > 0 ? ecstasyPoints2[segE2 - 1] : null;
                        var pCurrE2 = ecstasyPoints2[segE2];
                        var pNextE2 = segE2 < ecstasyPoints2.length - 2 ? ecstasyPoints2[segE2 + 1] : null;
                        var pNext2E2 = segE2 < ecstasyPoints2.length - 1 ? ecstasyPoints2[segE2 + 1] : null;
                        
                        var tensionE2 = 0.3;
                        var x0E2 = pPrevE2 ? pPrevE2.x : pCurrE2.x - (pNext2E2.x - pCurrE2.x);
                        var y0E2 = pPrevE2 ? pPrevE2.y : pCurrE2.y + (pNext2E2.y - pCurrE2.y) * 0.4;
                        var x1E2 = pCurrE2.x;
                        var y1E2 = pCurrE2.y;
                        var x2E2 = pNext2E2.x;
                        var y2E2 = pNext2E2.y;
                        var x3E2 = pNextE2 ? pNextE2.x : pNext2E2.x + (pNext2E2.x - pCurrE2.x);
                        var y3E2 = pNextE2 ? pNextE2.y : pNext2E2.y + (pNext2E2.y - pCurrE2.y) * 0.4;
                        
                        var cp1xE2 = x1E2 + (x2E2 - x0E2) / 6;
                        var cp1yE2 = y1E2 + (y2E2 - y0E2) / 6;
                        var cp2xE2 = x2E2 - (x3E2 - x1E2) / 6;
                        var cp2yE2 = y2E2 - (y3E2 - y1E2) / 6;
                        
                        if (pCurrE2.peak) {
                            cp1yE2 = y1E2 - Math.abs(y1E2 - y0E2) * 0.15;
                            cp2yE2 = y2E2 - Math.abs(y2E2 - y3E2) * 0.15;
                        } else {
                            cp1yE2 = y1E2 + Math.abs(y1E2 - y0E2) * 0.15;
                            cp2yE2 = y2E2 + Math.abs(y2E2 - y3E2) * 0.15;
                        }
                        
                        cpListE2.push({ cp1x: cp1xE2, cp1y: cp1yE2, cp2x: cp2xE2, cp2y: cp2yE2, endX: x3E2, endY: y3E2 });
                    }
                    ecstasyBezier2 = cpListE2;
                }

                // Любопытство: генерация петель для каждой линии
                var curiosityLoops2 = [];
                if (hasCuriosity && !hasCalm && !hasJoy) {
                    var loopCount2 = 1 + Math.floor(Math.random() * 3); // 1-3 петли
                    for (var l2 = 0; l2 < loopCount2; l2++) {
                        var loopT2 = 0.15 + Math.random() * 0.7; // позиция на линии
                        var loopSize2 = amp2 * (0.8 + Math.random() * 0.6); // размер петли
                        var loopDirection2 = Math.random() > 0.5 ? 1 : -1; // направление
                        var loopWidth2 = loopSize2 * (0.5 + Math.random() * 0.5); // ширина
                        curiosityLoops2.push({ t: loopT2, size: loopSize2, dir: loopDirection2, width: loopWidth2 });
                    }
                }

                // Грусть: очень слабые, спокойные и медленные волны
                var sadnessAmp2 = 0;
                var sadnessFreq2 = 0;
                if (hasSadness && !hasCalm && !hasJoy && !hasEcstasy && !hasCuriosity) {
                    // Амплитуда 20–30% от обычной FLOW (обычная 15–45 → грусть 3–13)
                    sadnessAmp2 = 3 + Math.random() * 10;
                    // 1–2 плавных колебания на всю ширину
                    sadnessFreq2 = 1 + Math.floor(Math.random() * 2);
                }

                // Предварительный расчёт позиций изломов для этой линии
                var breaks2 = [];
                if (hasAnxiety && !hasCalm) {
                    var breakCount2 = 2 + Math.floor(Math.random() * 2);
                    for (var b2 = 0; b2 < breakCount2; b2++) {
                        breaks2.push({
                            t: 0.1 + Math.random() * 0.8,
                            dir: Math.random() > 0.5 ? 1 : -1,
                            strength: amp2 * (0.35 + Math.random() * 0.25)
                        });
                    }
                }

                ctx.strokeStyle = 'rgba(' + brightC.r + ', ' + brightC.g + ', ' + brightC.b + ', ' + emotionOpacity(0.6) + ')';
                ctx.lineWidth = 2 + Math.random() * 3;
                ctx.lineCap = 'round';
                ctx.shadowColor = 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + (0.5 * glowIntensity) + ')';
                ctx.shadowBlur = 12;
                ctx.beginPath();

                if (hasJoy && !hasCalm && joyBezier2) {
                    ctx.moveTo(joyPoints2[0].x, joyPoints2[0].y);
                    for (var seg2 = 0; seg2 < joyBezier2.length; seg2++) {
                        var cp2 = joyBezier2[seg2];
                        ctx.bezierCurveTo(cp2.cp1x, cp2.cp1y, cp2.cp2x, cp2.cp2y, cp2.endX, cp2.endY);
                    }
                } else if (hasEcstasy && !hasCalm && !hasJoy && ecstasyBezier2) {
                    // Восторг: рисуем через кубические Безье с округлыми вершинами (амплитуда +30%)
                    ctx.moveTo(ecstasyPoints2[0].x, ecstasyPoints2[0].y);
                    for (var segE2 = 0; segE2 < ecstasyBezier2.length; segE2++) {
                        var cpE2 = ecstasyBezier2[segE2];
                        ctx.bezierCurveTo(cpE2.cp1x, cpE2.cp1y, cpE2.cp2x, cpE2.cp2y, cpE2.endX, cpE2.endY);
                    }
                } else if (hasCuriosity && !hasCalm && !hasJoy && curiosityLoops2.length > 0) {
                    // Любопытство: волна с петлями (яркие линии)
                    var loopIdx2 = 0;
                    var prevPt2 = null;
                    
                    for (var t = 0; t <= 1; t += 0.005) {
                        var x = t * (w + 20) - 10;
                        var baseAngle2 = t * Math.PI * 2 * freq2 + i * 0.7;
                        var sinVal2 = Math.sin(baseAngle2);
                        var y = yBase + sinVal2 * amp2;
                        
                        // Проверяем, находится ли t в зоне петли
                        if (loopIdx2 < curiosityLoops2.length) {
                            var loop = curiosityLoops2[loopIdx2];
                            var loopHalfWidth = 0.04; // ширина зоны петли по t
                            
                            if (Math.abs(t - loop.t) < loopHalfWidth) {
                                // Внутри петли: смещаем точку по параметрической кривой
                                var localT = (t - loop.t) / loopHalfWidth; // от -1 до 1
                                var loopAngle = localT * Math.PI; // 0 to PI
                                
                                // Параметрическая петля (лемниската-подобная форма)
                                var loopOffsetX = loop.width * Math.sin(loopAngle) * Math.cos(loopAngle) * 0.5;
                                var loopOffsetY = loop.size * loop.dir * Math.sin(loopAngle) * Math.sin(loopAngle);
                                
                                x += loopOffsetX;
                                y += loopOffsetY;
                                
                                // Плавный вход/выход через envelope
                                var envelope = Math.sin(loopAngle);
                                x += loopOffsetX * envelope;
                                y += loopOffsetY * envelope;
                            } else if (loopIdx2 < curiosityLoops2.length - 1) {
                                // Проверяем, не пора ли перейти к следующей петле
                                var nextLoop = curiosityLoops2[loopIdx2 + 1];
                                if (t > loop.t + loopHalfWidth + 0.02) {
                                    loopIdx2++;
                                }
                            } else {
                                // Последняя петля
                                loopIdx2++;
                            }
                        }
                        
                        // Добавляем вдохновение/тревогу если они выбраны
                        if (hasInspiration && !hasCalm && !hasJoy && !hasCuriosity) {
                            var env2 = Math.sin(t * Math.PI * 2 * inspEnvFreqb + inspEnvPhaseb) * 0.5 + 0.5;
                            y += Math.sin(t * Math.PI * 2 * inspFreq2b + inspPhase2b) * inspAmp2b * env2;
                        }
                        if (hasAnxiety && !hasCalm) {
                            for (var b2 = 0; b2 < breaks2.length; b2++) {
                                var dist2 = t - breaks2[b2].t;
                                if (Math.abs(dist2) < 0.025) {
                                    var factor2 = 1 - Math.abs(dist2) / 0.025;
                                    y += breaks2[b2].dir * breaks2[b2].strength * factor2;
                                }
                            }
                        }
                        
                        if (prevPt2) {
                            var midX2 = (prevPt2.x + x) / 2;
                            var midY2 = (prevPt2.y + y) / 2;
                            ctx.quadraticCurveTo(prevPt2.x, prevPt2.y, midX2, midY2);
                        } else {
                            ctx.moveTo(x, y);
                        }
                        prevPt2 = { x: x, y: y };
                    }
                } else if (hasAnger && !hasCalm && !hasJoy && !hasCuriosity) {
                    // Гнев: резкая ломаная зигзагообразная траектория
                    var angerAmp2 = (15 + Math.random() * 45 * intensityFactor) * 1.7;
                    var breakCountA2 = 8 + Math.floor(Math.random() * 7); // 8–14 изломов
                    ctx.lineJoin = 'miter';
                    ctx.lineCap = 'butt';
                    ctx.beginPath();
                    ctx.moveTo(-10, yBase);
                    for (var bA2 = 0; bA2 < breakCountA2; bA2++) {
                        var tA2 = 0.05 + (bA2 / breakCountA2) * 0.9;
                        var xA2 = tA2 * (w + 20) - 10;
                        var dirA2 = (bA2 % 2 === 0) ? 1 : -1;
                        var yA2 = yBase + dirA2 * angerAmp2 * (0.5 + Math.random() * 0.5);
                        ctx.lineTo(xA2, yA2);
                    }
                    ctx.lineTo(w + 10, yBase);
                } else if (hasHope && !hasCalm && !hasJoy && !hasCuriosity && !hasAnger) {
                    // Надежда: вертикальный поток из соединённых округлых дуг
                    var arcCount2 = 3 + Math.floor(Math.random() * 3); // 3–5 дуг
                    var arcRadius2 = 30 + Math.random() * 50;
                    var centerX2 = w * 0.25 + Math.random() * w * 0.5;
                    var lineH2 = h * 0.75;
                    
                    ctx.beginPath();
                    ctx.moveTo(centerX2, yBase);
                    
                    for (var a2 = 0; a2 < arcCount2; a2++) {
                        var startY2 = yBase + (a2 / arcCount2) * lineH2;
                        var midY2 = yBase + ((a2 + 0.5) / arcCount2) * lineH2;
                        var endY2 = yBase + ((a2 + 1) / arcCount2) * lineH2;
                        
                        var dir2 = (a2 % 2 === 0) ? 1 : -1;
                        var bulgeX2 = centerX2 + dir2 * arcRadius2;
                        
                        ctx.quadraticCurveTo(bulgeX2, midY2, centerX2, endY2);
                    }
                } else if (hasDoubt && !hasCalm && !hasJoy && !hasCuriosity && !hasAnger && !hasHope) {
                    // Сомнение: прерывистая волнистая линия с разрывами
                    var gapCount2 = 4 + Math.floor(Math.random() * 4); // 4–7 разрывов
                    var gaps2 = [];
                    var usedPositions2 = [];
                    
                    for (var g2 = 0; g2 < gapCount2; g2++) {
                        var gapPos2 = 0.08 + Math.random() * 0.84;
                        var gapLength2 = 0.02 + Math.random() * 0.06;
                        var valid2 = true;
                        for (var u2 = 0; u2 < usedPositions2.length; u2++) {
                            if (Math.abs(gapPos2 - usedPositions2[u2]) < gapLength2 + 0.03) {
                                valid2 = false;
                                break;
                            }
                        }
                        if (valid2) {
                            gaps2.push({ t: gapPos2, length: gapLength2 });
                            usedPositions2.push(gapPos2);
                        }
                    }
                    gaps2.sort(function(a, b) { return a.t - b.t; });
                    
                    ctx.lineCap = 'butt';
                    ctx.beginPath();
                    
                    var segStart2 = 0;
                    for (var g2 = 0; g2 < gaps2.length; g2++) {
                        var gapStart2 = gaps2[g2].t - gaps2[g2].length / 2;
                        var gapEnd2 = gaps2[g2].t + gaps2[g2].length / 2;
                        
                        if (gapStart2 > segStart2) {
                            var endT2 = Math.min(gapStart2, 1);
                            if (endT2 > segStart2) {
                                var startX2 = segStart2 * (w + 20) - 10;
                                var startAngle2 = segStart2 * Math.PI * 2 * freq2 + i * 0.7;
                                var startY2 = yBase + Math.sin(startAngle2) * amp2;
                                ctx.moveTo(startX2, startY2);
                                for (var t2 = segStart2 + 0.001; t2 <= endT2; t2 += 0.01) {
                                    var x2 = t2 * (w + 20) - 10;
                                    var baseAngle2 = t2 * Math.PI * 2 * freq2 + i * 0.7;
                                    var sinVal2 = Math.sin(baseAngle2);
                                    var y2 = yBase + sinVal2 * amp2;
                                    ctx.lineTo(x2, y2);
                                }
                            }
                        }
                        segStart2 = Math.min(gapEnd2, 1);
                    }
                    
                    if (segStart2 < 1) {
                        var startX3 = segStart2 * (w + 20) - 10;
                        var startAngle3 = segStart2 * Math.PI * 2 * freq2 + i * 0.7;
                        var startY3 = yBase + Math.sin(startAngle3) * amp2;
                        ctx.moveTo(startX3, startY3);
                        for (var t2 = segStart2 + 0.001; t2 <= 1; t2 += 0.01) {
                            var x2 = t2 * (w + 20) - 10;
                            var baseAngle2 = t2 * Math.PI * 2 * freq2 + i * 0.7;
                            var sinVal2 = Math.sin(baseAngle2);
                            var y2 = yBase + sinVal2 * amp2;
                            ctx.lineTo(x2, y2);
                        }
                    }
                } else if (hasSadness && !hasCalm && !hasJoy && !hasEcstasy && !hasCuriosity && sadnessAmp2 > 0) {
                    // Грусть: плавная асимметричная волна (основная + вторая гармоника)
                    var prevPtS2 = null;
                    for (var t = 0; t <= 1; t += 0.005) {
                        var x = t * (w + 20) - 10;
                        var baseAngle2 = t * Math.PI * 2 * sadnessFreq2 + i * 0.7;
                        var sinVal2 = Math.sin(baseAngle2);
                        var y = yBase + sadnessAmp2 * (sinVal2 - 0.2 * Math.cos(2 * baseAngle2));
                        
                        if (prevPtS2) {
                            var midXS2 = (prevPtS2.x + x) / 2;
                            var midYS2 = (prevPtS2.y + y) / 2;
                            ctx.quadraticCurveTo(prevPtS2.x, prevPtS2.y, midXS2, midYS2);
                        } else {
                            ctx.moveTo(x, y);
                        }
                        prevPtS2 = { x: x, y: y };
                    }
                } else {
                    ctx.moveTo(-10, yBase);
                    for (var t = 0; t <= 1; t += 0.01) {
                        var x = t * (w + 20) - 10;
                        var baseAngle2 = t * Math.PI * 2 * freq2 + i * 0.7;
                        var sinVal2 = Math.sin(baseAngle2);
                        var y = yBase + sinVal2 * amp2;
                        if (hasInspiration && !hasCalm && !hasJoy) {
                            var env2 = Math.sin(t * Math.PI * 2 * inspEnvFreqb + inspEnvPhaseb) * 0.5 + 0.5;
                            y += Math.sin(t * Math.PI * 2 * inspFreq2b + inspPhase2b) * inspAmp2b * env2;
                        }
                        if (hasAnxiety && !hasCalm) {
                            for (var b2 = 0; b2 < breaks2.length; b2++) {
                                var dist2 = t - breaks2[b2].t;
                                if (Math.abs(dist2) < 0.025) {
                                    var factor2 = 1 - Math.abs(dist2) / 0.025;
                                    y += breaks2[b2].dir * breaks2[b2].strength * factor2;
                                }
                            }
                        }
                        if (t > 0) {
                            var prevT = t - 0.01;
                            var prevX = prevT * (w + 20) - 10;
                            var prevAngle2 = prevT * Math.PI * 2 * freq2 + i * 0.7;
                            var prevSinVal2 = Math.sin(prevAngle2);
                            var prevY = yBase + prevSinVal2 * amp2;
                            if (hasInspiration && !hasCalm && !hasJoy) {
                                var prevEnv2 = Math.sin(prevT * Math.PI * 2 * inspEnvFreqb + inspEnvPhaseb) * 0.5 + 0.5;
                                prevY += Math.sin(prevT * Math.PI * 2 * inspFreq2b + inspPhase2b) * inspAmp2b * prevEnv2;
                            }
                            if (hasAnxiety && !hasCalm) {
                                for (var b2 = 0; b2 < breaks2.length; b2++) {
                                    var distPrev = prevT - breaks2[b2].t;
                                    if (Math.abs(distPrev) < 0.025) {
                                        var factorPrev = 1 - Math.abs(distPrev) / 0.025;
                                        prevY += breaks2[b2].dir * breaks2[b2].strength * factorPrev;
                                    }
                                }
                            }
                            var midX2 = (prevX + x) / 2;
                            var midY2 = (prevY + y) / 2;
                            ctx.quadraticCurveTo(prevX, prevY, midX2, midY2);
                        } else {
                            ctx.lineTo(x, y);
                        }
                    }
                }
                ctx.stroke();
                ctx.shadowBlur = 0;
            }
            }
        } else if (shapeType === 'particles') {
            // Частицы: средние яркие — обычные точки + маленькие эмоциональные фигуры
            var medRegular = 75;

            // === Индивидуальные настройки для среднего плана ===
            var medEmoConfigs = {
                calm:       { count: 3, sizeMult: 1.0, opacityMult: 1.0 },
                joy:        { count: 3, sizeMult: 1.0, opacityMult: 1.0 },
                sadness:    { count: 3, sizeMult: 1.0, opacityMult: 1.0 },
                fatigue:    { count: 3, sizeMult: 1.0, opacityMult: 1.0 },
                anxiety:    { count: 6, sizeMult: 1.3, opacityMult: 2.0 },
                inspiration:{ count: 4, sizeMult: 1.2, opacityMult: 2.0 },
                ecstasy:    { count: 1, sizeMult: 0.6, opacityMult: 1.0 },
                curiosity:  { count: 1, sizeMult: 1.0, opacityMult: 1.0 },
                anger:      { count: 3, sizeMult: 1.0, opacityMult: 1.0 },
                hope:       { count: 1, sizeMult: 0.7, opacityMult: 0.6 },
                doubt:      { count: 3, sizeMult: 1.0, opacityMult: 1.2 },
                longing:    { count: 1, sizeMult: 0.7, opacityMult: 0.5 }
            };

            // Обычные яркие частицы
            var hasCalmM = selectedEmotions.has('calm');
            var calmReplaceCountM = Math.floor(medRegular * 0.15);
            for (var i = 0; i < medRegular; i++) {
                var c = boostColor(colors[Math.floor(Math.random() * colors.length)]);
                var px = Math.random() * w;
                var py = Math.random() * h;
                var pr = 1 + Math.random() * 3;
                var isCalm = hasCalmM && i < calmReplaceCountM;

                if (isCalm) {
                    // Скруглённый квадрат calm — тот же position/size/color
                    var half = pr * 3 * 0.5;
                    var r = half * 0.3;
                    ctx.beginPath();
                    ctx.moveTo(px - half + r, py - half);
                    ctx.lineTo(px + half - r, py - half);
                    ctx.quadraticCurveTo(px + half, py - half, px + half, py - half + r);
                    ctx.lineTo(px + half, py + half - r);
                    ctx.quadraticCurveTo(px + half, py + half, px + half - r, py + half);
                    ctx.lineTo(px - half + r, py + half);
                    ctx.quadraticCurveTo(px - half, py + half, px - half, py + half - r);
                    ctx.lineTo(px - half, py - half + r);
                    ctx.quadraticCurveTo(px - half, py - half, px - half + r, py - half);
                    ctx.closePath();
                    ctx.fillStyle = 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + emotionOpacity(0.15) + ')';
                    ctx.fill();
                    // Bright inner circle — unchanged
                    var brightC = { r: Math.min(c.r + 100, 255), g: Math.min(c.g + 100, 255), b: Math.min(c.b + 100, 255) };
                    ctx.beginPath();
                    ctx.arc(px, py, pr, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(' + brightC.r + ', ' + brightC.g + ', ' + brightC.b + ', ' + emotionOpacity(0.7) + ')';
                    ctx.fill();
                } else {
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
            }

            // Маленькие эмоциональные фигуры среднего плана
            for (var ei = 0; ei < emotionCount; ei++) {
                var emoName = emotionList[ei];
                var geo = EMOTION_GEOMETRY[emoName];
                if (!geo) continue;
                var cfg = medEmoConfigs[emoName];
                if (!cfg) continue;

                var role = getEmotionRole(emoName);
                var roleMult = role === 'secondary' ? 0.6 : 1.0;

                for (var fi = 0; fi < cfg.count; fi++) {
                    var c = boostColor(colors[Math.floor(Math.random() * colors.length)]);
                    var px = Math.random() * w;
                    var py = Math.random() * h;
                    var pr = 1 + Math.random() * 2.5;
                    var emoSize = pr * 3 * cfg.sizeMult * roleMult;
                    var genNoise = makeNoise(EMOTION_SEEDS[emoName]);

                    if (geo.renderMode === 'fill') {
                        ctx.save();
                        geo.draw(ctx, px, py, emoSize, genNoise);
                        ctx.clip();
                        var brightC = { r: Math.min(c.r + 60, 255), g: Math.min(c.g + 60, 255), b: Math.min(c.b + 60, 255) };
                        var mGrad = ctx.createRadialGradient(px, py, 0, px, py, emoSize);
                        mGrad.addColorStop(0, 'rgba(' + brightC.r + ', ' + brightC.g + ', ' + brightC.b + ', ' + emotionOpacity(0.3 * cfg.opacityMult) + ')');
                        mGrad.addColorStop(1, 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', 0)');
                        ctx.fillStyle = mGrad;
                        ctx.fillRect(px - emoSize, py - emoSize, emoSize * 2, emoSize * 2);
                        ctx.restore();
                    } else if (emoName === 'curiosity') {
                        ctx.save();
                        geo.draw(ctx, px, py, emoSize, genNoise);
                        ctx.strokeStyle = 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + emotionOpacity(0.4 * cfg.opacityMult) + ')';
                        ctx.lineWidth = 1.5;
                        ctx.lineCap = 'round';
                        ctx.stroke();
                        var gapAngle = Math.PI * 0.083;
                        var dotX = px + Math.cos(gapAngle) * emoSize * 0.55;
                        var dotY = py + Math.sin(gapAngle) * emoSize * 0.55;
                        var dotGrad = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, emoSize * 0.08);
                        dotGrad.addColorStop(0, 'rgba(' + Math.min(c.r + 80, 255) + ', ' + Math.min(c.g + 80, 255) + ', ' + Math.min(c.b + 80, 255) + ', ' + emotionOpacity(0.5 * cfg.opacityMult) + ')');
                        dotGrad.addColorStop(1, 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', 0)');
                        ctx.fillStyle = dotGrad;
                        ctx.beginPath();
                        ctx.arc(dotX, dotY, emoSize * 0.08, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.restore();
                    } else if (emoName === 'hope') {
                        ctx.save();
                        geo.draw(ctx, px, py, emoSize, genNoise);
                        ctx.strokeStyle = 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + emotionOpacity(0.4 * cfg.opacityMult) + ')';
                        ctx.lineWidth = 1;
                        ctx.lineCap = 'round';
                        ctx.shadowColor = 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + (0.5 * glowIntensity * cfg.opacityMult) + ')';
                        ctx.shadowBlur = 4;
                        ctx.stroke();
                        ctx.shadowBlur = 0;
                        ctx.restore();
                    } else if (emoName === 'doubt') {
                        ctx.save();
                        geo.draw(ctx, px, py, emoSize, genNoise);
                        ctx.strokeStyle = 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + emotionOpacity(0.45 * cfg.opacityMult) + ')';
                        ctx.lineWidth = 2.5;
                        ctx.lineCap = 'butt';
                        ctx.lineJoin = 'miter';
                        ctx.stroke();
                        ctx.restore();
                    } else if (emoName === 'longing') {
                        ctx.save();
                        geo.draw(ctx, px, py, emoSize, genNoise);
                        ctx.strokeStyle = 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + emotionOpacity(0.3 * cfg.opacityMult) + ')';
                        ctx.lineWidth = 1;
                        ctx.lineCap = 'round';
                        ctx.stroke();
                        ctx.restore();
                    } else if (emoName === 'ecstasy') {
                        ctx.save();
                        geo.draw(ctx, px, py, emoSize, genNoise);
                        ctx.strokeStyle = 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + emotionOpacity(0.4 * cfg.opacityMult) + ')';
                        ctx.lineWidth = 1.5;
                        ctx.lineCap = 'round';
                        ctx.shadowColor = 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + (0.5 * glowIntensity * cfg.opacityMult) + ')';
                        ctx.shadowBlur = 8;
                        ctx.stroke();
                        ctx.shadowBlur = 0;
                        ctx.restore();
                    } else {
                        ctx.save();
                        geo.draw(ctx, px, py, emoSize, genNoise);
                        ctx.strokeStyle = 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + emotionOpacity(0.4 * cfg.opacityMult) + ')';
                        ctx.lineWidth = 1.5;
                        ctx.lineCap = 'round';
                        ctx.shadowColor = 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + (0.5 * glowIntensity * cfg.opacityMult) + ')';
                        ctx.shadowBlur = 8;
                        ctx.stroke();
                        ctx.shadowBlur = 0;
                        ctx.restore();
                    }
                }
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
        } else if (shapeType === 'symmetry') {
            // Симметрия: мелкие детали среднего плана — внутренние дуги, точки, блики
            // Те же оси, но другие радиусы и более яркие элементы
            var detailTypes = [1, 2, 3, 4]; // дуга, геометрия, волна, кольцо — без лепестков (они в заднем плане)
            var detailCount = 1 + Math.floor(Math.random() * 2); // 1-2 типа деталей
            var chosenDetails = [];
            for (var di = 0; di < detailCount && detailTypes.length > 0; di++) {
                var dp = Math.floor(Math.random() * detailTypes.length);
                chosenDetails.push(detailTypes.splice(dp, 1)[0]);
            }

            for (var dt = 0; dt < chosenDetails.length; dt++) {
                var dType = chosenDetails[dt];
                var dRadius = h * (0.1 + Math.random() * 0.12); // ближе к центру
                var dSize = 20 + Math.random() * 30; // меньше
                var dColor = boostColor(colors[(dt * 2 + 1) % colors.length]);
                var brightD = { r: Math.min(dColor.r + 70, 255), g: Math.min(dColor.g + 70, 255), b: Math.min(dColor.b + 70, 255) };

                for (var dsa = 0; dsa < symmetryAxes; dsa++) {
                    ctx.save();
                    ctx.translate(symmetryCX, symmetryCY);
                    ctx.rotate(dsa * symmetryAngleStep);

                    if (dType === 1) {
                        // Внутренняя дуга — яркая, тонкая
                        ctx.strokeStyle = 'rgba(' + brightD.r + ', ' + brightD.g + ', ' + brightD.b + ', ' + emotionOpacity(0.45) + ')';
                        ctx.lineWidth = 1.5 + Math.random();
                        ctx.lineCap = 'round';
                        ctx.shadowColor = 'rgba(' + dColor.r + ', ' + dColor.g + ', ' + dColor.b + ', ' + (0.6 * glowIntensity) + ')';
                        ctx.shadowBlur = 12;
                        ctx.beginPath();
                        ctx.moveTo(0, -dRadius - dSize * 0.3);
                        ctx.quadraticCurveTo(dSize * 0.4, -dRadius - dSize * 0.35, dSize * 0.15, -dRadius);
                        ctx.quadraticCurveTo(-dSize * 0.2, -dRadius + dSize * 0.2, 0, -dRadius + dSize * 0.25);
                        ctx.stroke();
                        ctx.shadowBlur = 0;
                    } else if (dType === 2) {
                        // Маленький геометрический акцент — треугольник/ромб
                        var dGeoC = brightD;
                        var dGeoGrad = ctx.createRadialGradient(0, -dRadius, 0, 0, -dRadius, dSize * 0.5);
                        dGeoGrad.addColorStop(0, 'rgba(' + brightD.r + ', ' + brightD.g + ', ' + brightD.b + ', ' + emotionOpacity(0.4) + ')');
                        dGeoGrad.addColorStop(1, 'rgba(' + dColor.r + ', ' + dColor.g + ', ' + dColor.b + ', 0)');
                        ctx.fillStyle = dGeoGrad;
                        ctx.beginPath();
                        ctx.moveTo(0, -dRadius - dSize * 0.4);
                        ctx.lineTo(dSize * 0.25, -dRadius);
                        ctx.lineTo(0, -dRadius + dSize * 0.25);
                        ctx.lineTo(-dSize * 0.25, -dRadius);
                        ctx.closePath();
                        ctx.fill();
                        ctx.strokeStyle = 'rgba(' + brightD.r + ', ' + brightD.g + ', ' + brightD.b + ', ' + emotionOpacity(0.6) + ')';
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    } else if (dType === 3) {
                        // Волнистый контур — яркий, тонкий
                        var dWaveC = brightD;
                        ctx.strokeStyle = 'rgba(' + dWaveC.r + ', ' + dWaveC.g + ', ' + dWaveC.b + ', ' + emotionOpacity(0.35) + ')';
                        ctx.lineWidth = 1 + Math.random();
                        ctx.lineCap = 'round';
                        ctx.shadowColor = 'rgba(' + dColor.r + ', ' + dColor.g + ', ' + dColor.b + ', ' + (0.4 * glowIntensity) + ')';
                        ctx.shadowBlur = 8;
                        ctx.beginPath();
                        for (var dwi = 0; dwi <= 3; dwi++) {
                            var dwx = (dwi - 1.5) * dSize * 0.3;
                            var dwy = -dRadius + Math.sin(dwi * Math.PI * 0.66) * dSize * 0.2;
                            if (dwi === 0) ctx.moveTo(dwx, dwy);
                            else ctx.lineTo(dwx, dwy);
                        }
                        ctx.stroke();
                        ctx.shadowBlur = 0;
                    } else {
                        // Точки на дуге — яркие блики
                        var dRingC = brightD;
                        var dArcR = dSize * 0.4;
                        var dArcC = boostColor(colors[(dt + 2) % colors.length]);
                        ctx.strokeStyle = 'rgba(' + dArcC.r + ', ' + dArcC.g + ', ' + dArcC.b + ', ' + emotionOpacity(0.3) + ')';
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.arc(0, -dRadius, dArcR, -Math.PI * 0.4, Math.PI * 0.4);
                        ctx.stroke();
                        for (var ddt = 0; ddt < 2; ddt++) {
                            var dda = -Math.PI * 0.25 + ddt * Math.PI * 0.5;
                            var ddx = Math.sin(dda) * dArcR;
                            var ddy = -dRadius - Math.cos(dda) * dArcR;
                            var dDotGrad = ctx.createRadialGradient(ddx, ddy, 0, ddx, ddy, 4);
                            dDotGrad.addColorStop(0, 'rgba(255, 255, 255, ' + emotionOpacity(0.5) + ')');
                            dDotGrad.addColorStop(1, 'rgba(' + dRingC.r + ', ' + dRingC.g + ', ' + dRingC.b + ', 0)');
                            ctx.fillStyle = dDotGrad;
                            ctx.beginPath();
                            ctx.arc(ddx, ddy, 3, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    }

                    ctx.restore();
                }
            }

            // Дополнительные бликовые точки по осям
            for (var bta = 0; bta < symmetryAxes; bta++) {
                ctx.save();
                ctx.translate(symmetryCX, symmetryCY);
                ctx.rotate(bta * symmetryAngleStep);
                var btGrad = ctx.createRadialGradient(0, -h * 0.35, 0, 0, -h * 0.35, 8);
                var btColor = boostColor(colors[Math.floor(Math.random() * colors.length)]);
                btGrad.addColorStop(0, 'rgba(255, 255, 255, ' + (0.25 * intensityFactor * glowIntensity) + ')');
                btGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
                ctx.fillStyle = btGrad;
                ctx.beginPath();
                ctx.arc(0, -h * 0.35, 8, 0, Math.PI * 2);
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