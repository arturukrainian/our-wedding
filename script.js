const countdownEl = document.getElementById("countdown");
const daysEl = document.getElementById("days");
const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");

function setScreenHeight() {
  const viewportHeight = window.visualViewport?.height || window.innerHeight;
  document.documentElement.style.setProperty("--screen-height", `${Math.round(viewportHeight)}px`);
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
}

setInterval(updateCountdown, 1000);
updateCountdown();

const rsvpForm = document.getElementById("rsvpForm");
const rsvpNote = document.getElementById("rsvpNote");

if (rsvpForm) {
  rsvpForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (rsvpNote) {
      rsvpNote.textContent = "Дякуємо! Ми отримали вашу відповідь.";
    }
    rsvpForm.reset();
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
    if (!slides.length) return -1;
    const marker = window.scrollY + 2;
    let currentIndex = 0;

    for (let i = 0; i < slides.length; i += 1) {
      if (marker >= slides[i].offsetTop) {
        currentIndex = i;
      } else {
        break;
      }
    }

    return currentIndex;
  };

  const updateSlideButton = () => {
    const currentIndex = getCurrentSlideIndex();
    const isLastSlide = currentIndex >= slides.length - 1;
    slideNextBtn.classList.toggle("is-hidden", isLastSlide);
  };

  slideNextBtn.addEventListener("click", () => {
    const currentIndex = getCurrentSlideIndex();
    const targetIndex = currentIndex < 0 ? 0 : Math.min(currentIndex + 1, slides.length - 1);
    const targetSlide = slides[targetIndex];
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

const VIDEO_PRELOADER_TIMEOUT_MS = 10000;

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
    if (videoState === "timeout" || videoState === "error") {
      console.warn(`Hero video fallback: ${videoState}`);
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
