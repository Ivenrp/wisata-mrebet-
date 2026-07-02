 (function() {
    'use strict';

    // ---- Sticky nav ----
    const nav = document.getElementById('siteNav');
    let lastScroll = 0;
    window.addEventListener('scroll', function() {
        const current = window.scrollY;
        nav.classList.toggle('scrolled', current > 60);
        // When user scrolls past a small threshold, reduce / hide large hero
        try {
            document.body.classList.toggle('hero-scrolled', current > 80);
        } catch (e) {}
        lastScroll = current;
    }, { passive: true });

    // ---- Mobile menu ----
    const burger = document.getElementById('burgerBtn');
    const navLinks = document.getElementById('navLinks');

    function toggleMenu(open) {
        const isOpen = typeof open === 'boolean' ? open : navLinks.classList.contains('open');
        navLinks.classList.toggle('open', !isOpen);
        burger.classList.toggle('open', !isOpen);
        burger.setAttribute('aria-expanded', String(!isOpen));
    }

    burger.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleMenu();
    });

    document.querySelectorAll('[data-close]').forEach(function(el) {
        el.addEventListener('click', function() {
            if (navLinks.classList.contains('open')) toggleMenu(true);
        });
    });

    // Close menu on outside click (desktop fallback)
    document.addEventListener('click', function(e) {
        if (window.innerWidth < 768) return;
        const target = e.target;
        if (!nav.contains(target) && navLinks.classList.contains('open')) {
            toggleMenu(true);
        }
    });

    // ---- River divider animation ----
    const riverPath = document.getElementById('riverPath');
    if (riverPath) {
        const riverObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(e) {
                if (e.isIntersecting) riverPath.classList.add('in');
            });
        }, { threshold: 0.3 });
        riverObserver.observe(riverPath);
    }

    // ---- Reveal on scroll ----
    const revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -20px 0px' });
        revealEls.forEach(function(el) { revealObserver.observe(el); });
    } else {
        revealEls.forEach(function(el) { el.classList.add('in'); });
    }

    // ---- Testimonial carousel ----
    const slides = document.querySelectorAll('.testi-slide');
    const dotsWrap = document.getElementById('testiDots');
    let activeSlide = 0;
    let autoTimer = null;

    if (slides.length && dotsWrap) {
        slides.forEach(function(_, i) {
            const dot = document.createElement('span');
            dot.className = 'testi-dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('role', 'tab');
            dot.setAttribute('tabindex', '0');
            dot.setAttribute('aria-label', 'Testimoni ' + (i + 1));
            dot.addEventListener('click', function() { showSlide(i); });
            dot.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault();
                    showSlide(i); }
            });
            dotsWrap.appendChild(dot);
        });

        const dots = document.querySelectorAll('.testi-dot');

        function showSlide(i) {
            if (i === activeSlide) return;
            slides[activeSlide].classList.remove('active');
            dots[activeSlide].classList.remove('active');
            activeSlide = i;
            slides[activeSlide].classList.add('active');
            dots[activeSlide].classList.add('active');
            resetAutoTimer();
        }

        function resetAutoTimer() {
            if (autoTimer) { clearInterval(autoTimer);
                autoTimer = null; }
            autoTimer = setInterval(function() {
                showSlide((activeSlide + 1) % slides.length);
            }, 5500);
        }
        resetAutoTimer();

        const track = document.querySelector('.testi-track');
        if (track) {
            track.addEventListener('mouseenter', function() {
                if (autoTimer) { clearInterval(autoTimer);
                    autoTimer = null; }
            });
            track.addEventListener('mouseleave', resetAutoTimer);
            track.addEventListener('touchstart', function() {
                if (autoTimer) { clearInterval(autoTimer);
                    autoTimer = null; }
            });
            track.addEventListener('touchend', resetAutoTimer);
        }
    }

    // ---- QR download ----
    const qrBtn = document.getElementById('qrDownloadBtn');
    const qrLabel = document.getElementById('qrDownloadLabel');

    if (qrBtn) {
        qrBtn.addEventListener('click', function() {
            const src = qrBtn.dataset.qrSrc;
            if (!src) return;
            const originalLabel = qrLabel.textContent;
            qrBtn.classList.add('is-loading');
            qrLabel.textContent = 'Menyiapkan…';

            fetch(src)
                .then(function(res) {
                    if (!res.ok) throw new Error('Gagal unduh');
                    return res.blob();
                })
                .then(function(blob) {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'QR-Wisata-Mrebet.png';
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    URL.revokeObjectURL(url);
                    qrLabel.textContent = 'Tersimpan ✓';
                })
                .catch(function() {
                    window.open(src, '_blank');
                    qrLabel.textContent = 'Dibuka tab baru';
                })
                .finally(function() {
                    setTimeout(function() {
                        qrLabel.textContent = originalLabel;
                        qrBtn.classList.remove('is-loading');
                    }, 2000);
                });
        });
    }

    // ---- Watch video CTA -> scroll ke galeri ----
    const watchBtn = document.getElementById('watchVideoBtn');
    if (watchBtn) {
        watchBtn.addEventListener('click', function() {
            const galeri = document.getElementById('galeri');
            if (galeri) galeri.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // ---- Mobile Bottom Nav Behavior ----
    var bottomNav = document.getElementById('mobileBottomNav');
    if (bottomNav) {
        var lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        window.addEventListener('scroll', function() {
            var st = window.pageYOffset || document.documentElement.scrollTop;
            if (st > lastScrollTop && st > 100) {
                // downscroll code: show bottom nav
                bottomNav.classList.add('visible');
            } else if (st < lastScrollTop) {
                // upscroll code: hide bottom nav
                bottomNav.classList.remove('visible');
            }
            lastScrollTop = st <= 0 ? 0 : st;
        }, { passive: true });
    }

    // ---- Keyboard: ESC closes menu ----
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navLinks.classList.contains('open')) {
            toggleMenu(true);
            burger.focus();
        }
    });

})();