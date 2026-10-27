(() => {
  const body = document.body;
  body.classList.add('js-ready');

  // Mobile navigation: small, keyboard-accessible menu toggle.
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');

  if (menuButton && nav) {
    const closeMenu = () => {
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open navigation');
      nav.classList.remove('is-open');
    };

    menuButton.addEventListener('click', () => {
      const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!isOpen));
      menuButton.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
      nav.classList.toggle('is-open', !isOpen);
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });

    window.addEventListener('resize', () => {
      if (window.matchMedia('(min-width: 641px)').matches) closeMenu();
    });
  }

  // Subtle reveal-on-scroll. Content stays visible if IntersectionObserver is unavailable.
  const revealItems = document.querySelectorAll('.reveal');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -24px 0px' });

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  // Current year in the footer.
  document.querySelectorAll('[data-year]').forEach((node) => {
    node.textContent = new Date().getFullYear();
  });



  
})();


/* ========================================
   INFINITE FLYER CAROUSELS
======================================== */

(() => {
  function initFlyerCarousels() {
    const carousels = document.querySelectorAll(
      "[data-flyer-carousel]"
    );

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    carousels.forEach((carousel) => {
      // Prevent accidental double initialization.
      if (carousel.dataset.initialized === "true") return;

      const viewport = carousel.querySelector(
        ".flyer-viewport"
      );

      const track = carousel.querySelector(
        ".flyer-track"
      );

      const originalSet = track?.querySelector(
        ".flyer-set"
      );

      if (!viewport || !track || !originalSet) return;

      carousel.dataset.initialized = "true";

      // Duplicate the original flyers to create the infinite loop.
      const clone = originalSet.cloneNode(true);

      clone.setAttribute("aria-hidden", "true");
      clone.inert = true;

      // Hide duplicate image descriptions from screen readers.
      clone.querySelectorAll("img").forEach((image) => {
        image.alt = "";
      });

      track.appendChild(clone);

      let setWidth = 0;
      let previousTime = 0;

      let pointerInside = false;
      let focusInside = false;
      let dragging = false;

      let dragStartX = 0;
      let dragStartScroll = 0;

      const speed = 18; // Pixels per second.

      function measure() {
        setWidth = originalSet.getBoundingClientRect().width;
        normalizeScroll();
      }

      // Keep the position within the original set's width.
      // The duplicated set makes this jump visually seamless.
      function normalizeScroll() {
        if (!setWidth) return;

        const current = viewport.scrollLeft;
        const normalized =
          ((current % setWidth) + setWidth) % setWidth;

        if (Math.abs(normalized - current) > 0.5) {
          viewport.scrollLeft = normalized;
        }
      }

      function isPaused() {
        return (
          pointerInside ||
          focusInside ||
          dragging ||
          document.hidden ||
          reducedMotion.matches
        );
      }

      // Continuous, slow horizontal movement.
      function animate(time) {
        if (!previousTime) previousTime = time;

        const delta = Math.min(
          (time - previousTime) / 1000,
          0.05
        );

        previousTime = time;

        if (!isPaused() && setWidth > 0) {
          viewport.scrollLeft += speed * delta;
        }

        normalizeScroll();

        requestAnimationFrame(animate);
      }

      // Normalize manual swipes and horizontal scrolling too.
      viewport.addEventListener(
        "scroll",
        normalizeScroll,
        { passive: true }
      );

      // Pause the carousel when the mouse enters.
      carousel.addEventListener("pointerenter", (event) => {
        if (event.pointerType === "mouse") {
          pointerInside = true;
        }
      });

      carousel.addEventListener("pointerleave", (event) => {
        if (event.pointerType === "mouse") {
          pointerInside = false;
        }
      });

      // Pause while a visitor navigates using a keyboard.
      carousel.addEventListener("focusin", () => {
        focusInside = true;
      });

      carousel.addEventListener("focusout", (event) => {
        if (!carousel.contains(event.relatedTarget)) {
          focusInside = false;
        }
      });

      // Mouse drag support for desktop.
      viewport.addEventListener("pointerdown", (event) => {
        if (
          event.pointerType !== "mouse" ||
          event.button !== 0
        ) {
          return;
        }

        dragging = true;
        dragStartX = event.clientX;
        dragStartScroll = viewport.scrollLeft;

        viewport.classList.add("is-dragging");
        viewport.setPointerCapture(event.pointerId);
      });

      viewport.addEventListener("pointermove", (event) => {
        if (!dragging) return;

        const distance = event.clientX - dragStartX;

        viewport.scrollLeft = dragStartScroll - distance;
        normalizeScroll();
      });

      function stopDragging() {
        dragging = false;
        viewport.classList.remove("is-dragging");
      }

      viewport.addEventListener("pointerup", stopDragging);
      viewport.addEventListener("pointercancel", stopDragging);
      viewport.addEventListener("lostpointercapture", stopDragging);

      // Previous and next controls.
      function moveOneFlyer(direction) {
        const firstSlide = originalSet.querySelector(
          ".flyer-slide"
        );

        if (!firstSlide) return;

        const slideWidth =
          firstSlide.getBoundingClientRect().width;

        const gap = parseFloat(
          getComputedStyle(originalSet).columnGap
        ) || 0;

        viewport.scrollLeft +=
          direction * (slideWidth + gap);

        normalizeScroll();
      }

      carousel
        .querySelector("[data-flyer-prev]")
        ?.addEventListener("click", () => {
          moveOneFlyer(-1);
        });

      carousel
        .querySelector("[data-flyer-next]")
        ?.addEventListener("click", () => {
          moveOneFlyer(1);
        });

      // Recalculate the loop distance when the layout changes.
      window.addEventListener("resize", measure, {
        passive: true
      });

      measure();
      requestAnimationFrame(animate);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initFlyerCarousels
    );
  } else {
    initFlyerCarousels();
  }
})();


/* ===================================
   VERTICAL BRAND DOCUMENT SLIDESHOW
=================================== */

(() => {
  function initBrandCarousels() {
    const carousels = document.querySelectorAll(
      "[data-brand-carousel]"
    );

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    carousels.forEach((carousel) => {
      if (carousel.dataset.brandInitialized === "true") return;

      const viewport = carousel.querySelector(".brand-viewport");
      const track = carousel.querySelector(".brand-track");

      if (!viewport || !track) return;

      const originalSlides = Array.from(
        track.querySelectorAll(".brand-slide")
      );

      const total = originalSlides.length;

      if (total < 2) return;

      carousel.dataset.brandInitialized = "true";

      /*
       * Clone the first and last slides to make
       * the transition loop seamlessly.
       */
      const firstClone = originalSlides[0].cloneNode(true);
      const lastClone = originalSlides[total - 1].cloneNode(true);

      [firstClone, lastClone].forEach((slide) => {
        slide.setAttribute("aria-hidden", "true");
        slide.inert = true;

        slide.querySelectorAll("img").forEach((image) => {
          image.alt = "";
        });
      });

      track.appendChild(firstClone);
      track.insertBefore(lastClone, originalSlides[0]);

      let currentIndex = 1;
      let pointerInside = false;
      let focusInside = false;
      let touchStartY = null;

      const transitionDuration = 650;
      const autoplayDelay = 4000;

      function positionSlides(animate = true) {
        // Give every landscape slide the viewport's height.
        const height = viewport.clientHeight;

        track.querySelectorAll(".brand-slide").forEach((slide) => {
          slide.style.height = `${height}px`;
        });

        track.style.transition =
          animate && !reducedMotion.matches
            ? `transform ${transitionDuration}ms cubic-bezier(0.22, 0.61, 0.36, 1)`
            : "none";

        track.style.transform =
          `translate3d(0, -${currentIndex * height}px, 0)`;
      }

      function goTo(index) {
        // Reduced-motion users can still navigate manually.
        if (reducedMotion.matches) {
          if (index > total) index = 1;
          if (index < 1) index = total;

          currentIndex = index;
          positionSlides(false);
          return;
        }

        currentIndex = index;
        positionSlides(true);
      }

      function nextSlide() {
        goTo(currentIndex + 1);
      }

      function previousSlide() {
        goTo(currentIndex - 1);
      }

      // Reset the position after reaching either cloned slide.
      track.addEventListener("transitionend", (event) => {
        if (
          event.target !== track ||
          event.propertyName !== "transform"
        ) {
          return;
        }

        if (currentIndex === total + 1) {
          currentIndex = 1;
          positionSlides(false);
        } else if (currentIndex === 0) {
          currentIndex = total;
          positionSlides(false);
        }
      });

      carousel
        .querySelector("[data-brand-next]")
        ?.addEventListener("click", nextSlide);

      carousel
        .querySelector("[data-brand-prev]")
        ?.addEventListener("click", previousSlide);

      // Pause autoplay while the visitor is interacting.
      carousel.addEventListener("pointerenter", (event) => {
        if (event.pointerType === "mouse") {
          pointerInside = true;
        }
      });

      carousel.addEventListener("pointerleave", (event) => {
        if (event.pointerType === "mouse") {
          pointerInside = false;
        }
      });

      carousel.addEventListener("focusin", () => {
        focusInside = true;
      });

      carousel.addEventListener("focusout", (event) => {
        if (!carousel.contains(event.relatedTarget)) {
          focusInside = false;
        }
      });

      // Vertical touch gestures: swipe up for next, down for previous.
      viewport.addEventListener("touchstart", (event) => {
        touchStartY = event.touches[0]?.clientY ?? null;
      }, { passive: true });

      viewport.addEventListener("touchend", (event) => {
        if (touchStartY === null) return;

        const endY = event.changedTouches[0]?.clientY ?? touchStartY;
        const distance = endY - touchStartY;

        if (Math.abs(distance) > 45) {
          if (distance < 0) {
            nextSlide();
          } else {
            previousSlide();
          }
        }

        touchStartY = null;
      }, { passive: true });

      function isPaused() {
        return (
          pointerInside ||
          focusInside ||
          document.hidden ||
          reducedMotion.matches
        );
      }

      // Begin on the first real slide.
      positionSlides(false);

      // Recalculate slide heights when the card resizes.
      if ("ResizeObserver" in window) {
        const resizeObserver = new ResizeObserver(() => {
          positionSlides(false);
        });

        resizeObserver.observe(viewport);
      } else {
        window.addEventListener("resize", () => {
          positionSlides(false);
        }, { passive: true });
      }

      // Slow, restrained autoplay.
      window.setInterval(() => {
        if (!isPaused()) {
          nextSlide();
        }
      }, autoplayDelay);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initBrandCarousels);
  } else {
    initBrandCarousels();
  }
})();