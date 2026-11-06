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

});
