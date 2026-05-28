/* ─── SCROLL REVEAL ────────────────────────────────────── */
function revealOnScroll() {
	const revealElements = document.querySelectorAll("[data-reveal]");

	const observer = new IntersectionObserver(
		(entries, obs) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add("animate__animated", "animate__fadeInUp");
					obs.unobserve(entry.target);
				}
			});
		},
		{ threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
	);

	revealElements.forEach((el) => {
		observer.observe(el);
	});
}

/* ─── NAV SCROLL EFFECT ────────────────────────────────── */
function navScrollEffect() {
	const nav = document.querySelector("nav");
	if (!nav) return;

	const onScroll = () => {
		if (window.scrollY > 40) {
			nav.classList.add("scrolled");
		} else {
			nav.classList.remove("scrolled");
		}
	};

	window.addEventListener("scroll", onScroll, { passive: true });
	onScroll();
}

/* ─── MOBILE NAV TOGGLE ────────────────────────────────── */
function mobileNav() {
	const toggle = document.querySelector(".nav-toggle");
	const menu = document.querySelector("nav ul");
	if (!toggle || !menu) return;

	toggle.addEventListener("click", () => {
		menu.classList.toggle("open");
	});

	// close menu on link click
	menu.querySelectorAll("a").forEach((link) => {
		link.addEventListener("click", () => {
			menu.classList.remove("open");
		});
	});
}

/* ─── CONTACT FORM ─────────────────────────────────────── */
const form = document.getElementById("contact-form");
const status = document.getElementById("form-status");

if (form) {
	form.addEventListener("submit", async (e) => {
		e.preventDefault();
		const btn = form.querySelector('button[type="submit"]');
		btn.disabled = true;
		btn.textContent = "Sending\u2026";

		try {
			const res = await fetch("https://api.web3forms.com/submit", {
				method: "POST",
				body: new FormData(form),
			});
			const data = await res.json();

			status.style.display = "block";

			if (data.success) {
				status.style.color = "var(--teal, #0bd8b4)";
				status.textContent =
					"Message sent successfully. We will reply within 48 hours.";
				form.reset();
			} else {
				status.style.color = "#ff6b6b";
				status.textContent =
					"Failed to send. Please email directly to ops@deepfrontier.co.";
			}
		} catch (err) {
			status.style.display = "block";
			status.style.color = "#ff6b6b";
			status.textContent =
				"Failed to send. Please email directly to ops@deepfrontier.co.";
		} finally {
			btn.disabled = false;
			btn.textContent = "Send Message";
		}
	});
}

/* ─── BUTTON PULSE ON HOVER ────────────────────────────── */
function pulseButtons() {
	const buttons = document.querySelectorAll(".btn");
	buttons.forEach((btn) => {
		btn.addEventListener("mouseenter", () => {
			btn.classList.add("animate__animated", "animate__pulse");
		});
		btn.addEventListener("mouseleave", () => {
			btn.classList.remove("animate__animated", "animate__pulse");
		});
		btn.addEventListener("animationend", () => {
			btn.classList.remove("animate__animated", "animate__pulse");
		});
	});
}

/* ─── INIT ─────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
	revealOnScroll();
	navScrollEffect();
	mobileNav();
	pulseButtons();
});
