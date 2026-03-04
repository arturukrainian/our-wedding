const countdownEl = document.getElementById("countdown");
const daysEl = document.getElementById("days");
const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");
const daysLabelEl = document.getElementById("daysLabel");
const hoursLabelEl = document.getElementById("hoursLabel");
const minutesLabelEl = document.getElementById("minutesLabel");
const secondsLabelEl = document.getElementById("secondsLabel");

function setScreenHeight() {
  if (document.body.classList.contains("is-form-active")) return;
  const viewportHeight = window.visualViewport?.height || window.innerHeight;
  document.documentElement.style.setProperty("--screen-height", `${Math.round(viewportHeight)}px`);
}

function getPluralForm(value, one, few, many) {
  const n = Math.abs(value);
  const mod10 = n % 10;
  const mod100 = n % 100;

  if (mod100 >= 11 && mod100 <= 14) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}

function updateTimerLabels(days, hours, minutes, seconds) {
  if (daysLabelEl) {
    daysLabelEl.textContent = getPluralForm(days, "день", "дні", "днів");
  }
  if (hoursLabelEl) {
    hoursLabelEl.textContent = getPluralForm(hours, "година", "години", "годин");
  }
  if (minutesLabelEl) {
    minutesLabelEl.textContent = getPluralForm(minutes, "хвилина", "хвилини", "хвилин");
  }
  if (secondsLabelEl) {
    secondsLabelEl.textContent = getPluralForm(seconds, "секунда", "секунди", "секунд");
  }
}

setScreenHeight();
window.addEventListener("resize", setScreenHeight);
window.addEventListener("orientationchange", setScreenHeight);
window.visualViewport?.addEventListener("resize", setScreenHeight);
window.visualViewport?.addEventListener("scroll", setScreenHeight);

function updateCountdown() {
  if (!countdownEl) return;
  const target = new Date(countdownEl.dataset.date);
  const now = new Date();
  const diff = target - now;

  if (diff <= 0) {
    daysEl.textContent = "0";
    hoursEl.textContent = "0";
    minutesEl.textContent = "0";
    secondsEl.textContent = "0";
    updateTimerLabels(0, 0, 0, 0);
    return;
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  daysEl.textContent = String(days);
  hoursEl.textContent = String(hours).padStart(2, "0");
  minutesEl.textContent = String(minutes).padStart(2, "0");
  secondsEl.textContent = String(seconds).padStart(2, "0");
  updateTimerLabels(days, hours, minutes, seconds);
}

setInterval(updateCountdown, 1000);
updateCountdown();

const rsvpForm = document.getElementById("rsvpForm");
const rsvpNote = document.getElementById("rsvpNote");
const nameErrorEl = document.getElementById("nameError");
const rsvpModal = document.getElementById("rsvpModal");
const openRsvpModalBtn = document.getElementById("openRsvpModal");
const closeRsvpModalBtn = document.getElementById("closeRsvpModal");

if (rsvpForm) {
  const steps = Array.from(rsvpForm.querySelectorAll(".rsvp-step"));
  const guestCounters = Array.from(rsvpForm.querySelectorAll(".guest-counter"));
  let currentStep = 0;

  const openRsvpModal = () => {
    if (!rsvpModal) return;
    rsvpModal.classList.add("is-open");
    rsvpModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-rsvp-open");
    document.body.classList.add("is-form-active");
    const firstInput = rsvpForm.querySelector('input[name="name"]');
    window.setTimeout(() => {
      firstInput?.focus({ preventScroll: true });
    }, 60);
  };

  const closeRsvpModal = () => {
    if (!rsvpModal) return;
    rsvpModal.classList.remove("is-open");
    rsvpModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-rsvp-open");
    document.body.classList.remove("is-form-active");
    setScreenHeight();
  };

  const setStep = (index) => {
    currentStep = Math.max(0, Math.min(index, steps.length - 1));
    steps.forEach((step, stepIndex) => {
      step.classList.toggle("is-active", stepIndex === currentStep);
    });
  };

  const validateStep = (stepIndex) => {
    if (stepIndex === 0) {
      const nameInput = rsvpForm.elements.name;
      if (!nameInput || nameInput.checkValidity()) {
        nameInput?.classList.remove("is-invalid");
        if (nameErrorEl) nameErrorEl.textContent = "";
        return true;
      }
      nameInput.classList.add("is-invalid");
      if (nameErrorEl) {
        nameErrorEl.textContent = "Вкажіть, будь ласка, ім’я та прізвище.";
      }
      nameInput.reportValidity();
      return false;
    }

    if (stepIndex === 1) {
      const adultsCount = Number(rsvpForm.elements.adults?.value || 0);
      const kidsCount = Number(rsvpForm.elements.kids?.value || 0);
      if (adultsCount + kidsCount >= 1) return true;
      if (rsvpNote) {
        rsvpNote.textContent = "Вкажіть, будь ласка, кількість гостей.";
      }
      return false;
    }

    return true;
  };

  rsvpForm.addEventListener("click", (event) => {
    const counterButton = event.target.closest("[data-counter-action]");
    const nextButton = event.target.closest("[data-next-step]");
    const prevButton = event.target.closest("[data-prev-step]");

    if (counterButton) {
      const action = counterButton.dataset.counterAction;
      const counter = counterButton.closest(".guest-counter");
      const input = counter?.querySelector(".guest-counter__value");
      if (!input) return;

      const min = Number(input.min || 0);
      const max = Number(input.max || 10);
      const current = Number(input.value || 0);
      const nextValue =
        action === "increase"
          ? Math.min(max, current + 1)
          : Math.max(min, current - 1);

      input.value = String(nextValue);
      return;
    }

    if (nextButton) {
      if (!validateStep(currentStep)) return;
      if (rsvpNote) rsvpNote.textContent = "";
      const targetStep = Number(nextButton.dataset.nextStep) - 1;
      setStep(targetStep);
      return;
    }

    if (prevButton) {
      if (rsvpNote) rsvpNote.textContent = "";
      const targetStep = Number(prevButton.dataset.prevStep) - 1;
      setStep(targetStep);
    }
  });

  rsvpForm.elements.name?.addEventListener("input", () => {
    const nameInput = rsvpForm.elements.name;
    if (!nameInput) return;
    if (nameInput.checkValidity()) {
      nameInput.classList.remove("is-invalid");
      if (nameErrorEl) nameErrorEl.textContent = "";
    }
  });

  rsvpForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validateStep(currentStep)) return;
    if (rsvpNote) {
      rsvpNote.textContent = "Дякуємо! Ми отримали вашу відповідь.";
    }
    window.setTimeout(() => {
      rsvpForm.reset();
      setStep(0);
      if (rsvpNote) {
        rsvpNote.textContent = "";
      }
      closeRsvpModal();
    }, 900);
  });

  rsvpForm.addEventListener("focusin", () => {
    document.body.classList.add("is-form-active");
  });

  rsvpForm.addEventListener("focusout", () => {
    window.setTimeout(() => {
      const activeInsideForm = document.activeElement && rsvpForm.contains(document.activeElement);
      if (!activeInsideForm) {
        document.body.classList.remove("is-form-active");
        setScreenHeight();
      }
    }, 0);
  });

  guestCounters.forEach((counter) => {
    const input = counter.querySelector(".guest-counter__value");
    if (!input) return;
    input.setAttribute("aria-live", "polite");
  });

  openRsvpModalBtn?.addEventListener("click", () => {
    if (rsvpNote) rsvpNote.textContent = "";
    if (nameErrorEl) nameErrorEl.textContent = "";
    rsvpForm.elements.name?.classList.remove("is-invalid");
    setStep(0);
    openRsvpModal();
  });

  closeRsvpModalBtn?.addEventListener("click", closeRsvpModal);

  rsvpModal?.addEventListener("click", (event) => {
    const closeTarget = event.target.closest("[data-close-rsvp-modal]");
    if (closeTarget) {
      closeRsvpModal();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && rsvpModal?.classList.contains("is-open")) {
      closeRsvpModal();
    }
  });
}

const slideNextBtn = document.getElementById("slideNext");
const bgMusic = document.getElementById("bgMusic");
const musicToggle = document.getElementById("musicToggle");
const heroVideo = document.getElementById("heroVideo");
const preloader = document.getElementById("preloader");
const preloaderMusicBtn = document.getElementById("preloaderMusicBtn");
const rings = document.getElementById("rings");
const inviteSection = document.getElementById("invite");
const wishesSection = document.getElementById("wishes");
const calendarSection = document.getElementById("calendar");
const dressCodeImg = document.querySelector(".dress-code-img");
let shouldPlayMusic = true;
let musicUnlockBound = false;
let updateMusicButton = () => {};
let preloaderOpenStarted = false;

const setPreloaderMusicButtonVisible = (visible) => {
  if (!preloaderMusicBtn) return;
  preloaderMusicBtn.classList.toggle("is-hidden", !visible);
};

const hidePreloader = () => {
  if (!preloader) return;
  preloader.classList.add("is-hidden");
  document.body.classList.remove("is-loading");
};

const setRingsProgress = (t) => {
  if (!rings) return;
  const value = Math.max(0, Math.min(1, Number.isFinite(t) ? t : 0));
  rings.style.setProperty("--t", value.toFixed(3));
  rings.classList.toggle("is-interlock", value >= 0.72 && value <= 0.92);
  rings.classList.toggle("is-locked", value >= 0.98);
};

const finishRingsAndOpen = (onDone) => {
  if (preloaderOpenStarted) return;
  preloaderOpenStarted = true;

  const done = () => {
    if (typeof onDone === "function") {
      onDone();
    }
  };

  const prefersReducedMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion || !rings) {
    setRingsProgress(1);
    window.setTimeout(done, 20);
    return;
  }

  setRingsProgress(0.55);
  window.setTimeout(() => {
    setRingsProgress(1);
  }, 200);
  window.setTimeout(done, 560);
};

if (preloader) {
  document.body.classList.add("is-loading");
  setPreloaderMusicButtonVisible(false);
  setRingsProgress(0);
}

if (slideNextBtn) {
  const slides = Array.from(document.querySelectorAll("main > section, main > footer"));

  const getCurrentSlideIndex = () => {
    if (!slides.length) return 0;
    const marker = window.scrollY + 1;
    let currentIndex = 0;

    for (let i = 0; i < slides.length; i += 1) {
      if (slides[i].offsetTop <= marker) {
        currentIndex = i;
      } else {
        break;
      }
    }
    return currentIndex;
  };

  const getNextSlide = () => {
    const currentIndex = getCurrentSlideIndex();
    const nextIndex = currentIndex + 1;
    if (nextIndex < 0 || nextIndex >= slides.length) return null;
    return slides[nextIndex];
  };

  const updateSlideButton = () => {
    slideNextBtn.classList.toggle("is-hidden", !getNextSlide());
  };

  slideNextBtn.addEventListener("click", () => {
    const targetSlide = getNextSlide();
    if (targetSlide) {
      const targetTop =
        targetSlide.offsetTop + targetSlide.offsetHeight / 2 - window.innerHeight / 2;
      window.scrollTo({
        top: Math.max(0, Math.round(targetTop)),
        behavior: "smooth",
      });
    }
  });

  window.addEventListener("scroll", updateSlideButton, { passive: true });
  window.addEventListener("resize", updateSlideButton);
  updateSlideButton();
}

if (inviteSection) {
  const reducedMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reducedMotion || !("IntersectionObserver" in window)) {
    inviteSection.classList.add("is-visible");
  } else {
    const inviteObserver = new IntersectionObserver(
      (entries, observer) => {
        const [entry] = entries;
        if (!entry?.isIntersecting) return;
        inviteSection.classList.add("is-visible");
        observer.disconnect();
      },
      {
        threshold: 0.45,
      }
    );

    inviteObserver.observe(inviteSection);
  }
}

if (wishesSection) {
  const reducedMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reducedMotion || !("IntersectionObserver" in window)) {
    wishesSection.classList.add("is-visible");
  } else {
    const wishesObserver = new IntersectionObserver(
      (entries, observer) => {
        const [entry] = entries;
        if (!entry?.isIntersecting) return;
        wishesSection.classList.add("is-visible");
        observer.disconnect();
      },
      {
        threshold: 0.45,
      }
    );

    wishesObserver.observe(wishesSection);
  }
}

if (calendarSection) {
  const calendarTitle = calendarSection.querySelector(".calendar__title");
  const calendarWeekdays = Array.from(calendarSection.querySelectorAll(".calendar__weekday"));
  const calendarDays = Array.from(calendarSection.querySelectorAll(".calendar__day"));
  const calendarNote = calendarSection.querySelector(".calendar__note");
  const reducedMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const applyCalendarDelays = () => {
    if (calendarTitle) {
      calendarTitle.style.setProperty("--reveal-delay", "0ms");
      calendarTitle.style.setProperty("transition-duration", "950ms");
    }

    calendarWeekdays.forEach((item, index) => {
      item.style.setProperty("--reveal-delay", `${300 + index * 85}ms`);
      item.style.setProperty("transition-duration", "900ms");
    });

    calendarDays.forEach((item, index) => {
      item.style.setProperty("--reveal-delay", `${620 + index * 40}ms`);
      item.style.setProperty("transition-duration", "850ms");
    });

    if (calendarNote) {
      calendarNote.style.setProperty("--reveal-delay", "2280ms");
      calendarNote.style.setProperty("transition-duration", "850ms");
    }
  };

  calendarSection.classList.add("is-animatable");
  applyCalendarDelays();

  if (reducedMotion || !("IntersectionObserver" in window)) {
    calendarSection.classList.add("is-inview", "is-ring-animate");
  } else {
    const calendarObserver = new IntersectionObserver(
      (entries, observer) => {
        const [entry] = entries;
        if (!entry?.isIntersecting) return;

        calendarSection.classList.add("is-inview");
        window.setTimeout(() => {
          calendarSection.classList.add("is-ring-animate");
        }, 2550);

        observer.disconnect();
      },
      {
        threshold: 0.35,
      }
    );

    calendarObserver.observe(calendarSection);
  }
}

const VIDEO_PRELOADER_TIMEOUT_MS = 10000;
const DRESS_IMAGE_PRELOAD_TIMEOUT_MS = 4500;

const waitForVideoReady = (timeoutMs = VIDEO_PRELOADER_TIMEOUT_MS) =>
  new Promise((resolve) => {
    if (!heroVideo) {
      resolve("no-video");
      return;
    }
    if (heroVideo.readyState >= 2) {
      resolve("ready-state");
      return;
    }

    let settled = false;
    let timeoutId;

    const cleanup = () => {
      heroVideo.removeEventListener("loadeddata", onReady);
      heroVideo.removeEventListener("canplay", onReady);
      heroVideo.removeEventListener("canplaythrough", onReady);
      heroVideo.removeEventListener("error", onError);
      clearTimeout(timeoutId);
    };

    const finish = (reason) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(reason);
    };

    const onReady = () => {
      if (heroVideo.readyState >= 2) {
        finish("ready");
        return;
      }
      finish("ready-event");
    };

    const onError = () => {
      finish("error");
    };

    heroVideo.addEventListener("loadeddata", onReady, { once: true });
    heroVideo.addEventListener("canplay", onReady, { once: true });
    heroVideo.addEventListener("canplaythrough", onReady, { once: true });
    heroVideo.addEventListener("error", onError, { once: true });
    timeoutId = window.setTimeout(() => {
      finish("timeout");
    }, timeoutMs);
  });

const waitForDressImageReady = (timeoutMs = DRESS_IMAGE_PRELOAD_TIMEOUT_MS) =>
  new Promise((resolve) => {
    if (!dressCodeImg) {
      resolve("no-image");
      return;
    }
    if (dressCodeImg.complete) {
      resolve(dressCodeImg.naturalWidth > 0 ? "loaded" : "error");
      return;
    }

    let settled = false;
    let timeoutId;

    const cleanup = () => {
      dressCodeImg.removeEventListener("load", onLoad);
      dressCodeImg.removeEventListener("error", onError);
      clearTimeout(timeoutId);
    };

    const finish = (state) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(state);
    };

    const onLoad = () => finish("loaded");
    const onError = () => finish("error");

    dressCodeImg.addEventListener("load", onLoad, { once: true });
    dressCodeImg.addEventListener("error", onError, { once: true });
    timeoutId = window.setTimeout(() => {
      finish("timeout");
    }, timeoutMs);
  });

if (bgMusic && musicToggle) {
  updateMusicButton = () => {
    musicToggle.classList.toggle("is-playing", shouldPlayMusic);
    musicToggle.setAttribute("aria-label", shouldPlayMusic ? "Вимкнути музику" : "Увімкнути музику");
  };

  const playMusic = async () => {
    if (!shouldPlayMusic) return false;
    try {
      await bgMusic.play();
      return true;
    } catch (_) {
      return false;
    }
  };

  const bindMusicUnlock = () => {
    if (musicUnlockBound) return;
    musicUnlockBound = true;

    const unlock = async () => {
      if (!shouldPlayMusic) return;
      const started = await playMusic();
      if (started) {
        window.removeEventListener("pointerdown", unlock);
        window.removeEventListener("keydown", unlock);
        window.removeEventListener("touchstart", unlock);
        musicUnlockBound = false;
      }
    };

    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("keydown", unlock);
    window.addEventListener("touchstart", unlock, { passive: true });
  };

  const pauseMusic = () => {
    bgMusic.pause();
    updateMusicButton();
  };

  const ensureMusicPlayback = async () => {
    const started = await playMusic();
    if (!started) {
      bindMusicUnlock();
    }
    return started;
  };

  musicToggle.addEventListener("click", async () => {
    shouldPlayMusic = !shouldPlayMusic;

    if (!shouldPlayMusic) {
      pauseMusic();
      updateMusicButton();
      return;
    }

    updateMusicButton();

    if (bgMusic.paused) {
      await ensureMusicPlayback();
    }
  });

  updateMusicButton();

  const getBufferedRatio = () => {
    if (!Number.isFinite(bgMusic.duration) || bgMusic.duration <= 0 || bgMusic.buffered.length === 0) {
      return 0;
    }
    const bufferedEnd = bgMusic.buffered.end(bgMusic.buffered.length - 1);
    return Math.max(0, Math.min(1, bufferedEnd / bgMusic.duration));
  };

  const waitForAudioBuffer = (targetRatio = 0.4, timeoutMs = 25000) =>
    new Promise((resolve) => {
      if (getBufferedRatio() >= targetRatio) {
        resolve();
        return;
      }

      let timeoutId;
      const check = () => {
        if (getBufferedRatio() >= targetRatio) {
          cleanup();
          resolve();
        }
      };

      const cleanup = () => {
        bgMusic.removeEventListener("progress", check);
        bgMusic.removeEventListener("loadedmetadata", check);
        bgMusic.removeEventListener("durationchange", check);
        bgMusic.removeEventListener("canplaythrough", check);
        clearTimeout(timeoutId);
      };

      bgMusic.addEventListener("progress", check);
      bgMusic.addEventListener("loadedmetadata", check);
      bgMusic.addEventListener("durationchange", check);
      bgMusic.addEventListener("canplaythrough", check);
      timeoutId = window.setTimeout(() => {
        cleanup();
        resolve();
      }, timeoutMs);
      check();
    });

  const bootstrapMedia = async () => {
    if (preloaderMusicBtn) {
      preloaderMusicBtn.addEventListener("click", async () => {
        const manualStart = await ensureMusicPlayback();
        if (manualStart) {
          setPreloaderMusicButtonVisible(false);
        }
      });
    }

    waitForAudioBuffer(0.4).then(async () => {
      const started = await ensureMusicPlayback();
      if (!started && preloaderMusicBtn) {
        setPreloaderMusicButtonVisible(true);
      }
    });

    const videoState = await waitForVideoReady();
    const dressImageState = await waitForDressImageReady();
    if (videoState === "timeout" || videoState === "error") {
      console.warn(`Hero video fallback: ${videoState}`);
    }
    if (dressImageState === "timeout" || dressImageState === "error") {
      console.warn(`Dress image preload state: ${dressImageState}`);
    }

    try {
      await heroVideo?.play();
    } catch (_) {
      // Ignore autoplay errors for video.
    }
    finishRingsAndOpen(hidePreloader);
  };

  bootstrapMedia();
} else {
  waitForVideoReady().then(async (videoState) => {
    if (videoState === "timeout" || videoState === "error") {
      console.warn(`Hero video fallback: ${videoState}`);
    }
    try {
      await heroVideo?.play();
    } catch (_) {
      // Ignore autoplay errors for video.
    }
    finishRingsAndOpen(hidePreloader);
  });
}

if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
  const watchedFiles = ["index.html", "styles.css", "script.js"];
  const seen = new Map();

  const checkForChanges = async () => {
    try {
      const checks = watchedFiles.map(async (file) => {
        const res = await fetch(`${file}?t=${Date.now()}`, { method: "HEAD", cache: "no-store" });
        const modified = res.headers.get("last-modified") || "";
        const etag = res.headers.get("etag") || "";
        const signature = `${modified}|${etag}`;
        const prev = seen.get(file);
        if (prev && prev !== signature) {
          location.reload();
          return;
        }
        seen.set(file, signature);
      });
      await Promise.all(checks);
    } catch (_) {
      // Ignore transient local server errors.
    }
  };

  checkForChanges();
  window.setInterval(checkForChanges, 1200);
}
