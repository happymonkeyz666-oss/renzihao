const header = document.querySelector(".site-header");
const glowPanels = document.querySelectorAll(".project-card, .feature-panel, .timeline, .contact-card");
const portfolioLink = document.querySelector("[data-portfolio-link]");
const backToTopLink = document.querySelector('.brand[href="#top"]');
const themeToggle = document.querySelector("[data-theme-toggle]");
const themeToggleText = document.querySelector(".theme-toggle-text");
const skillOrbit = document.querySelector(".skill-orbit");
const skillDomains = document.querySelectorAll(".skill-domain");
const toolMarquee = document.querySelector(".tool-marquee");
const marqueeRail = document.querySelector(".marquee-rail");
const clickInteractionQuery = window.matchMedia("(hover: none), (pointer: coarse), (max-width: 980px)");

const closeInteractivePanels = () => {
  skillDomains.forEach((item) => item.classList.remove("is-expanded"));
  skillOrbit?.classList.remove("has-expanded");
  toolMarquee?.classList.remove("is-expanded");
};

const clearSkillHoverState = () => {
  skillDomains.forEach((item) => item.classList.remove("is-hovered"));
  skillOrbit?.classList.remove("has-hovered");
};

const revealTargets = [
  ...document.querySelectorAll(
    [
      ".hero-copy > *",
      ".hero-visual",
      ".feature-panel",
      ".tool-marquee",
      ".section-heading",
      ".skill-domain",
      ".timeline",
      ".timeline-item",
      ".project-card",
      ".contact-section > *",
      ".site-footer",
    ].join(",")
  ),
];

const setTheme = (theme) => {
  document.documentElement.dataset.theme = theme;
  document.body.dataset.theme = theme;
  localStorage.setItem("resume-theme", theme);
  if (themeToggleText) {
    themeToggleText.textContent = theme === "light" ? "Dark" : "Light";
  }
  if (themeToggle) {
    themeToggle.setAttribute("aria-label", theme === "light" ? "切换深色模式" : "切换浅色模式");
  }
  window.dispatchEvent(new Event("scroll"));
};

setTheme(localStorage.getItem("resume-theme") || "dark");

revealTargets.forEach((target, index) => {
  if (!target.hasAttribute("data-reveal")) {
    const isPanel = target.matches(
      ".hero-visual, .feature-panel, .tool-marquee, .skill-domain, .timeline, .project-card, .contact-section > *, .site-footer"
    );
    target.setAttribute("data-reveal", isPanel ? "panel" : "text");
  }
  target.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 70}ms`);
});

if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  revealTargets.forEach((target) => revealObserver.observe(target));
} else {
  revealTargets.forEach((target) => target.classList.add("is-visible"));
}

const getScrollTop = () => document.body.scrollTop || document.documentElement.scrollTop || window.scrollY;

const syncHeaderState = () => {
  const scrolled = getScrollTop() > 24;
  const isLight = document.body.dataset.theme === "light";
  const compactHeader = window.matchMedia("(max-width: 680px)").matches;
  header.style.borderBottom = scrolled
    ? isLight
      ? "1px solid rgba(198, 95, 0, 0.16)"
      : "1px solid rgba(210, 198, 255, 0.12)"
    : "0";
  header.style.background = scrolled || compactHeader
    ? isLight
      ? compactHeader
        ? "rgba(255, 248, 238, 0.84)"
        : "rgba(255, 248, 238, 0.72)"
      : compactHeader
        ? "rgba(3, 3, 10, 0.86)"
        : "rgba(3, 3, 10, 0.72)"
    : "transparent";
};

let scrollIdleTimer;
const markPageScrolling = () => {
  document.body.classList.add("is-page-scrolling");
  window.clearTimeout(scrollIdleTimer);
  scrollIdleTimer = window.setTimeout(() => {
    document.body.classList.remove("is-page-scrolling");
  }, 180);
};

const handlePageScroll = () => {
  syncHeaderState();
  markPageScrolling();
};

window.addEventListener("scroll", handlePageScroll, { passive: true });
document.body.addEventListener("scroll", handlePageScroll, { passive: true });
document.body.addEventListener("wheel", markPageScrolling, { passive: true });
document.body.addEventListener("touchmove", markPageScrolling, { passive: true });

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    setTheme(document.body.dataset.theme === "light" ? "dark" : "light");
  });
}

if (backToTopLink) {
  backToTopLink.addEventListener("click", (event) => {
    event.preventDefault();
    const previousBodyScrollBehavior = document.body.style.scrollBehavior;
    const previousHtmlScrollBehavior = document.documentElement.style.scrollBehavior;
    document.body.style.scrollBehavior = "auto";
    document.documentElement.style.scrollBehavior = "auto";
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    window.scrollTo(0, 0);
    window.requestAnimationFrame(() => {
      document.body.style.scrollBehavior = previousBodyScrollBehavior;
      document.documentElement.style.scrollBehavior = previousHtmlScrollBehavior;
      syncHeaderState();
    });
  });
}

if (false && portfolioLink) {
  portfolioLink.addEventListener("click", (event) => {
    event.preventDefault();
    portfolioLink.textContent = "作品链接待接入";
    window.setTimeout(() => {
      portfolioLink.textContent = "查看作品";
    }, 1600);
  });
}

skillDomains.forEach((domain) => {
  domain.setAttribute("tabindex", "0");
  domain.addEventListener("pointerenter", () => {
    if (clickInteractionQuery.matches) return;
    skillDomains.forEach((item) => item.classList.remove("is-hovered"));
    domain.classList.add("is-hovered");
    skillOrbit?.classList.add("has-hovered");
  });

  domain.addEventListener("click", (event) => {
    if (!clickInteractionQuery.matches) return;
    event.stopPropagation();
    const shouldOpen = !domain.classList.contains("is-expanded");
    skillDomains.forEach((item) => item.classList.remove("is-expanded"));
    skillOrbit?.classList.remove("has-expanded");
    if (shouldOpen) {
      domain.classList.add("is-expanded");
      skillOrbit?.classList.add("has-expanded");
      toolMarquee?.classList.remove("is-expanded");
    }
  });

  domain.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      domain.click();
    }
  });
});

skillOrbit?.addEventListener("pointerleave", clearSkillHoverState);

if (marqueeRail && toolMarquee) {
  marqueeRail.setAttribute("tabindex", "0");
  marqueeRail.addEventListener("click", (event) => {
    if (!clickInteractionQuery.matches) return;
    event.stopPropagation();
    const shouldOpen = !toolMarquee.classList.contains("is-expanded");
    toolMarquee.classList.toggle("is-expanded", shouldOpen);
    if (shouldOpen) {
      skillDomains.forEach((item) => item.classList.remove("is-expanded"));
      skillOrbit?.classList.remove("has-expanded");
    }
  });
}

document.addEventListener("click", (event) => {
  if (!clickInteractionQuery.matches) return;
  const startedInsidePanel = event.target.closest?.(
    ".skill-domain, .tool-marquee, .theme-toggle, .nav-cta, .button"
  );
  if (!startedInsidePanel) {
    closeInteractivePanels();
  }
});

clickInteractionQuery.addEventListener?.("change", closeInteractivePanels);

document.querySelectorAll("img").forEach((image) => {
  const labelHost = image.closest(".collection-grid span, .marquee-set span, .tool-card");
  const label = labelHost?.textContent?.trim() || image.alt || "AI";
  const fallback = label
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (labelHost) {
    labelHost.dataset.logoFallback = fallback;
  }

  image.addEventListener("error", () => {
    image.hidden = true;
    labelHost?.classList.add("logo-missing");
  });
});

if (!clickInteractionQuery.matches) {
  glowPanels.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const isLight = document.body.dataset.theme === "light";
      card.style.background = isLight
        ? `
          radial-gradient(circle at ${x}px ${y}px, rgba(255, 138, 31, 0.18), transparent 13rem),
          rgba(255, 251, 244, 0.9)
        `
        : `
          radial-gradient(circle at ${x}px ${y}px, rgba(124, 61, 255, 0.22), transparent 13rem),
          rgba(10, 10, 29, 0.86)
        `;
    });

    card.addEventListener("pointerleave", () => {
      card.style.background = "";
    });
  });
}
