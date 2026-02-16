const countdownEl = document.getElementById("countdown");
const daysEl = document.getElementById("days");
const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");

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

if (slideNextBtn) {
  const slides = Array.from(document.querySelectorAll("main > section, main > footer"));

  const getCurrentSlideIndex = () => {
    if (!slides.length) return -1;
    const marker = window.scrollY + window.innerHeight / 2;
    for (let i = 0; i < slides.length; i += 1) {
      const top = slides[i].offsetTop;
      const nextTop = i < slides.length - 1 ? slides[i + 1].offsetTop : Number.POSITIVE_INFINITY;
      if (marker >= top && marker < nextTop) {
        return i;
      }
    }
    return slides.length - 1;
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
      targetSlide.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  window.addEventListener("scroll", updateSlideButton, { passive: true });
  window.addEventListener("resize", updateSlideButton);
  updateSlideButton();
}
