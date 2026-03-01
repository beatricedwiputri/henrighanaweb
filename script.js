const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav a");

window.addEventListener("scroll", () => {
  // Only run scroll spy on pages with in-page sections (like index.html)
  const currentPage = window.location.pathname.split("/").pop();
  if (currentPage && currentPage !== "index.html" && currentPage !== "") return;
  let current = "";
  let scrollY = window.scrollY;
  let checkpoint = scrollY + window.innerHeight / 2; // midpoint of viewport

  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;

    if (checkpoint >= sectionTop && checkpoint < sectionTop + sectionHeight) {
      current = section.getAttribute("id");
    }
  });

  if (current === "collaboration-map") current = "about";
  if (current === "stats") current = "about";

  navLinks.forEach(link => {
    link.classList.remove("active");
    if (link.getAttribute("href") === "#" + current) {
      link.classList.add("active");
    }
  });
});


document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.createElement("button");
  navToggle.classList.add("nav-toggle");
  navToggle.textContent = "☰"; // hamburger symbol
  document.querySelector(".navbar .container").appendChild(navToggle);

  const navMenu = document.querySelector(".nav ul");

  navToggle.addEventListener("click", () => {
    navMenu.classList.toggle("active");
  });

  // ----- Keep Active Nav Based on Current Page -----
  const currentPage = window.location.pathname.split("/").pop(); // e.g., 'news.html'

  navLinks.forEach(link => {
    link.classList.remove("active");
    const href = link.getAttribute("href");

    // match full page links (news.html, blog.html, etc.)
    if (href === currentPage || (currentPage === "" && href === "index.html")) {
      link.classList.add("active");
    }

    if (currentPage.startsWith("team-godwin.html") && href.includes("team")) {
      link.classList.add("active");
    }

    if (currentPage.startsWith("service-NTDs.html") && href.includes("services")) {
      link.classList.add("active");
    }
     if (currentPage.startsWith("service-PA.html") && href.includes("services")) {
      link.classList.add("active");
    }
     if (currentPage.startsWith("service-PHR.html") && href.includes("services")) {
      link.classList.add("active");
    }
  });
});


// Close mobile nav when a link is clicked
document.querySelectorAll(".nav a").forEach(link => {
  link.addEventListener("click", () => {
    const navMenu = document.querySelector(".nav ul");
    navMenu.classList.remove("active"); // hide menu
  });
});



// =====================
// INTAKE FORM
// =====================
const intakeForm = document.querySelector(".intake-form");
if (intakeForm) {
  intakeForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = intakeForm.name.value;
    const email = intakeForm.email.value;
    const interests = Array.from(intakeForm.querySelectorAll('input[name="interest[]"]:checked')).map(i => i.value);
    const support = Array.from(intakeForm.querySelectorAll('input[name="support[]"]:checked')).map(i => i.value);
    const otherSupport = intakeForm.querySelector('input[name="other_support"]').value;
    if (otherSupport) support.push(otherSupport);
    const organization = intakeForm.organization.value;
    const hear = intakeForm.hear.value;
    const location = intakeForm.location.value;
    const message = intakeForm.message.value;

    try {
      await addDoc(collection(db, "contacts"), {
        type: "intake",
        name,
        email,
        interests,
        support,
        organization,
        hear,
        location,
        message,
        timestamp: serverTimestamp()
      });
      alert("Thank you! Your intake form has been submitted.");
      intakeForm.reset();
    } catch (err) {
      console.error(err);
      alert("Failed to submit. Try again.");
    }
  });
}

// =====================
// CONTACT FORM
// =====================
const contactForm = document.getElementById("contactForm");

if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = contactForm.name.value;
    const email = contactForm.email.value;
    const phone = contactForm.phone.value;
    const message = contactForm.message.value;

    try {
      await addDoc(collection(db, "contacts"), {
        type: "website-contact",
        name,
        email,
        phone,
        message,
        timestamp: serverTimestamp()
      });
      alert("Message sent!");
      contactForm.reset();
    } catch (err) {
      console.error(err);
      alert("Failed to send message. Try again.");
    }

  });
}

// =====================
// SCHEDULE FORM
// =====================
const scheduleForm = document.getElementById("scheduleForm");
if (scheduleForm) {
  scheduleForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = scheduleForm.name.value;
    const email = scheduleForm.email.value;
    const phone = scheduleForm.phone.value;
    const services = Array.from(scheduleForm.querySelectorAll('input[name="service[]"]:checked')).map(i => i.value);
    const date = scheduleForm.date.value;
    const time = scheduleForm.time.value;
    const message = scheduleForm.message.value;

    try {
      await addDoc(collection(db, "contacts"), {
        type: "schedule",
        name,
        email,
        phone,
        services,
        date,
        time,
        message,
        timestamp: serverTimestamp()
      });
      alert("Meeting request submitted!");
      scheduleForm.reset();
      scheduleForm.time.innerHTML = "<option value=''>Select a weekday first</option>";
      scheduleForm.time.disabled = true;
    } catch (err) {
      console.error(err);
      alert("Failed to submit schedule. Try again.");
    }
  });
}
