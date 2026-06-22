        (function () {
            "use strict";
            var nav = document.getElementById('nav'), prog = document.getElementById('progress');
            var navLinks = Array.prototype.slice.call(document.querySelectorAll('nav .links a'));
            var sections = navLinks.map(function (a) { return document.querySelector(a.getAttribute('href')); });
            var bp = document.getElementById('bp');
            var pxSec = document.getElementById('parallax'), pxBg = document.getElementById('pxbg');
            var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

            var maxScroll = 0;
            function measure() { maxScroll = document.documentElement.scrollHeight - window.innerHeight; }
            measure();

            // Single rAF-batched scroll handler: read all layout first, then write
            // all styles, to avoid per-event layout thrashing.
            var ticking = false;
            function update() {
                ticking = false;
                var vh = window.innerHeight;
                // --- reads ---
                var y = window.pageYOffset;
                var cur = -1;
                for (var i = 0; i < sections.length; i++) {
                    if (sections[i] && sections[i].getBoundingClientRect().top <= 120) cur = i;
                }
                var pxR = (pxSec && pxBg && !reduce) ? pxSec.getBoundingClientRect() : null;
                // --- writes ---
                prog.style.width = (maxScroll > 0 ? (y / maxScroll * 100) : 0) + '%';
                nav.classList.toggle('scrolled', y > 40);
                navLinks.forEach(function (a, i) { a.classList.toggle('active', i === cur); });
                if (pxR && pxR.bottom >= 0 && pxR.top <= vh) {
                    var p = (pxR.top + pxR.height / 2 - vh / 2) / vh; // -1..1 around center
                    pxBg.style.transform = 'translate3d(0,' + (p * -58) + 'px,0)';
                }
            }
            function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
            window.addEventListener('scroll', onScroll, { passive: true });
            window.addEventListener('resize', function () { measure(); onScroll(); }, { passive: true });
            update();
            window.addEventListener('mousemove', function (e) {
                if (window.innerWidth < 880) return;
                var x = (e.clientX / window.innerWidth - 0.5), y = (e.clientY / window.innerHeight - 0.5);
                bp.style.transform = 'translate(' + (x * 16) + 'px,' + (y * 16) + 'px) scale(1.04)';
            });

            // Mobile nav: full-screen overlay toggled by the hamburger.
            var navToggle = document.getElementById('navtoggle');
            function setMenu(open) {
                nav.classList.toggle('open', open);
                document.body.classList.toggle('nav-lock', open);
                if (navToggle) navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            }
            if (navToggle) {
                navToggle.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
            }
            navLinks.forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
            document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
            }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
            document.querySelectorAll('.rv').forEach(function (el, i) { el.style.transitionDelay = (Math.min(i, 4) * 0.05) + 's'; io.observe(el); });

            document.querySelectorAll('[data-pillar]').forEach(function (p) { p.addEventListener('click', function () { p.classList.toggle('open'); }); });

            function countUp(el, target, dur) {
                var start = null;
                function step(ts) { if (!start) start = ts; var t = Math.min((ts - start) / dur, 1); var e = 1 - Math.pow(1 - t, 3); el.textContent = Math.round(e * target); if (t < 1) requestAnimationFrame(step); else el.textContent = target; }
                requestAnimationFrame(step);
            }
            var dataIO = new IntersectionObserver(function (entries) {
                entries.forEach(function (en) {
                    if (!en.isIntersecting) return;
                    en.target.querySelectorAll('[data-count]').forEach(function (c) { countUp(c, +c.getAttribute('data-count'), 1300); });
                    en.target.querySelectorAll('.barfill').forEach(function (b) { b.style.width = b.getAttribute('data-w') + '%'; });
                    dataIO.unobserve(en.target);
                });
            }, { threshold: 0.4 });
            dataIO.observe(document.getElementById('bars'));
            document.querySelectorAll('#data .statgrid').forEach(function (g) { dataIO.observe(g); });

            var values = [
                { n: 'Empathy', h: 'On Empathy', phil: "I'm committed to helping people and making a difference in their lives. I use empathy as a tool to see things from the perspective of others — and to make our interactions more human.", q: "It's about figuring out the problems people experience not by doing academic research, but by actually observing people.", src: "Comstock's Magazine, 2016", url: "https://www.comstocksmag.com/web-only/touchscreen-table" },
                { n: 'Co-creation', h: 'On Co-creation', phil: "I believe in building things with people, not just for people. When the users of a product or service are involved in the development process, it's far more likely to make a real difference.", q: "All great products and services start with the needs of end users — and it's hard for startups to recognize the pain points inside government.", src: "#InnovateSac, 2018", url: "https://medium.com/innovatesac/sacramento-urban-technology-lab-sutl-tests-new-approach-to-streamline-procurement-for-startups-2bb3c2ef9083" },
                { n: 'Transparency', h: 'On Transparency', phil: "Openness takes the friction out of collaboration and helps us balance diverse interests. Together we maximize mutual benefit by being our authentic selves.", q: "We should be releasing everything by default, and not releasing only those data sets we have good reason not to release.", src: "Government Technology, 2014", url: "https://www.govtech.com/data/National-Day-of-Civic-Hacking-Opportunities-in-Civic-Engagement.html" },
                { n: 'Trust', h: 'On Trust', phil: "Trust within organizations is critical to creative solutions. When we don't trust each other, we impose rules that inhibit new approaches and fear the audacity of hope.", q: "We want to connect people in government on a level playing field, in a safe space where people can understand everyone's perspective.", src: "Government Technology, 2015", url: "https://www.govtech.com/dc/articles/4-Cities-Jumpstart-Civic-Tech-Solutions-with-CityCamp.html" },
                { n: 'Innovation', h: 'On Innovation', phil: "We can always do better. Continuous innovation helps organizations adapt to an accelerating velocity of change. To innovate, we must constantly work to connect the dots.", q: "Data is being published all over the place, but we're not using it strategically to drive decisions.", src: "StateScoop, 2016", url: "" },
                { n: 'Experimentation', h: 'On Experimentation', phil: "I'm not afraid to fail. I've learned strategies to experiment without bearing significant risk — collecting insights to guide future actions by always being in beta.", q: "We're testing a new approach that we hope will break down the barriers to entry for local startups to do business with government agencies.", src: "#InnovateSac, 2018", url: "https://medium.com/innovatesac/sacramento-urban-technology-lab-sutl-tests-new-approach-to-streamline-procurement-for-startups-2bb3c2ef9083" },
                { n: 'Community', h: 'On Community', phil: "Organizations are communities, and an organization's strength depends on how tightly woven that community is. When we build teams around a shared vision, we nurture them.", q: "It's exciting to see people come out and roll up their sleeves and really think about what we can accomplish.", src: "Government Technology, 2015", url: "https://www.govtech.com/dc/articles/4-Cities-Jumpstart-Civic-Tech-Solutions-with-CityCamp.html" },
                { n: 'Resilience', h: 'On Resilience', phil: "When things don't go to plan, we can and should bounce back quickly. Sometimes we need a change in strategy without a change in vision — other times no plan was appropriate in the first place.", q: "We couldn't sustain a civic incubator, so we pivoted to a product model — same vision, new strategy.", src: "Public Innovation → Sac2050", url: "" }
            ];
            var vbtns = document.getElementById('vbtns'), vinner = document.getElementById('vinner');
            function srcMarkup(v) { return v.url ? '<a href="' + v.url + '" target="_blank" rel="noopener">' + v.src + ' ↗</a>' : v.src; }
            function renderValue(i) {
                var v = values[i];
                vinner.classList.remove('show');
                setTimeout(function () {
                    vinner.innerHTML = '<div class="vphil"><span class="vh">' + v.h + '</span>' + v.phil + '</div>' +
                        '<div class="vquote"><q>' + v.q + '</q><span class="vsrc">— ' + srcMarkup(v) + '</span></div>';
                    vinner.classList.add('vfade', 'show');
                }, 120);
                Array.prototype.forEach.call(vbtns.children, function (b, j) { b.classList.toggle('active', j === i); });
            }
            values.forEach(function (v, i) {
                var b = document.createElement('button');
                b.className = 'vbtn'; b.innerHTML = v.n + '<span class="vi">0' + (i + 1) + '</span>';
                b.addEventListener('click', function () { renderValue(i); });
                vbtns.appendChild(b);
            });
            vinner.classList.add('vfade'); renderValue(0); setTimeout(function () { vinner.classList.add('show'); }, 200);
        })();
