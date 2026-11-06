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

                // === Параметры деформации контура ===
                // Каждая фигура получает уникальный набор волн
                this.deformWaves = [];
                const waveCount = 4 + Math.floor(Math.random() * 3); // 4–6 волн
                for (let i = 0; i < waveCount; i++) {
                    this.deformWaves.push({
                        freq: 2 + Math.floor(Math.random() * 6),     // частота: 2–7
                        amp: Math.random() * 25 + 8,                  // амплитуда: 8–33
                        speed: (Math.random() - 0.5) * 0.015,         // скорость деформации
                        phase: Math.random() * Math.PI * 2            // начальная фаза
                    });
                }
                this.deformPhase = Math.random() * Math.PI * 2;   // общий сдвиг фазы
                this.deformSpeed = Math.random() * 0.5 + 0.3;     // общая скорость
                this.deformAxisX = Math.random() * Math.PI * 2;    // ось вытяжения
                this.deformAxisY = Math.random() * Math.PI * 2;    // ось вытяжения
            }

            update() {
                this.phase += this.phaseSpeed;
                this.deformPhase += this.deformSpeed * 0.01;

                this.cx += this.vx;
                this.cy += this.vy;

                // Отталкивание от краёв
                if (this.cx < this.baseR) this.vx += 0.02;
                if (this.cx > w - this.baseR) this.vx -= 0.02;
                if (this.cy < this.baseR) this.vy += 0.02;
                if (this.cy > h - this.baseR) this.vy -= 0.02;
            }

            // Получить радиус фигуры в заданном угле с учётом всех волн деформации
            getRadius(angle, time) {
                let r = this.baseR;

                // Основная деформация: сумма синусоидальных волн
                for (let i = 0; i < this.deformWaves.length; i++) {
                    const w = this.deformWaves[i];
                    r += Math.sin(angle * w.freq + this.deformPhase + w.phase + time * w.speed) * w.amp;
                }

                // Асимметричное вытяжение по осям
                r += Math.sin(angle + this.deformAxisX) * this.baseR * 0.15;
                r += Math.cos(angle * 2 + this.deformAxisY) * this.baseR * 0.1;

                // Медленное пульсирование общего размера
                r += Math.sin(time * 0.003 + this.index) * this.baseR * 0.06;

                return r;
            }

            draw() {
                const c = this.color;
                const t = performance.now() * 0.001; // время в секундах для синхронизации

                // === Слой 1: мягкое внутреннее свечение (additive) ===
                ctx.save();
                ctx.globalCompositeOperation = 'lighter';
                ctx.globalAlpha = 0.35;
                ctx.beginPath();

                const pts = this.points;
                for (let i = 0; i <= pts; i++) {
                    const angle = (i / pts) * Math.PI * 2;
                    const r = this.getRadius(angle, t);
                    const x = this.cx + Math.cos(angle) * r;
                    const y = this.cy + Math.sin(angle) * r;

                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        const prevAngle = ((i - 0.5) / pts) * Math.PI * 2;
                        const prevR = this.getRadius(prevAngle, t);
                        const cpx = this.cx + Math.cos(prevAngle) * prevR;
                        const cpy = this.cy + Math.sin(prevAngle) * prevR;
                        ctx.quadraticCurveTo(cpx, cpy, x, y);
                    }
                }

                ctx.closePath();

                const glowGrad = ctx.createRadialGradient(
                    this.cx, this.cy, 0,
                    this.cx, this.cy, this.baseR * 1.6
                );
                glowGrad.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a * 1.8})`);
                glowGrad.addColorStop(1, `rgba(${c.r}, ${c.g}, ${c.b}, 0)`);
                ctx.fillStyle = glowGrad;
                ctx.fill();

                ctx.restore();

                // === Слой 2: неоновый контур ===
                ctx.save();
                ctx.globalAlpha = 0.55;
                ctx.strokeStyle = `rgba(${c.r}, ${c.g}, ${c.b}, 0.7)`;
                ctx.lineWidth = 1.2;
                ctx.shadowColor = `rgba(${c.r}, ${c.g}, ${c.b}, 0.9)`;
                ctx.shadowBlur = 18;
                ctx.beginPath();

                for (let i = 0; i <= pts; i++) {
                    const angle = (i / pts) * Math.PI * 2;
                    const r = this.getRadius(angle, t);
                    const x = this.cx + Math.cos(angle) * r;
                    const y = this.cy + Math.sin(angle) * r;

                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        const prevAngle = ((i - 0.5) / pts) * Math.PI * 2;
                        const prevR = this.getRadius(prevAngle, t);
                        const cpx = this.cx + Math.cos(prevAngle) * prevR;
                        const cpy = this.cy + Math.sin(prevAngle) * prevR;
                        ctx.quadraticCurveTo(cpx, cpy, x, y);
                    }
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
