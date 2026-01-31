const termsModal = document.getElementById("termsModal");
const termsScroll = document.getElementById("termsScroll");
const termsActions = document.getElementById("termsActions");
const agreeButton = document.getElementById("agreeButton");
const ageButton = document.getElementById("ageButton");
const signupButton = document.getElementById("signupButton");
const signupModal = document.getElementById("signupModal");
const contactButton = document.getElementById("contactButton");
const contactModal = document.getElementById("contactModal");
const contactForm = document.getElementById("contactForm");
const descriptionField = document.getElementById("description");
const wordCount = document.getElementById("wordCount");
const adminCodeInput = document.getElementById("adminCode");
const unlockUploads = document.getElementById("unlockUploads");
const imageUpload = document.getElementById("imageUpload");
const videoUpload = document.getElementById("videoUpload");
const adminStatus = document.getElementById("adminStatus");
const adminSessionKey = "adminUnlocked";

const pageIsLanding = document.body.classList.contains("page-landing");
const pageIsHome = document.body.classList.contains("page-home");

const acceptedTerms = localStorage.getItem("termsAccepted") === "true";

if (!acceptedTerms && !pageIsLanding) {
  window.location.href = "index.html";
}

if (pageIsLanding && !acceptedTerms && termsModal) {
  termsModal.classList.add("active");
  document.body.style.overflow = "hidden";

  if (termsScroll) {
    termsScroll.addEventListener("scroll", () => {
      const nearBottom =
        termsScroll.scrollTop + termsScroll.clientHeight >=
        termsScroll.scrollHeight - 10;
      if (nearBottom) {
        termsActions?.classList.add("visible");
      }
    });
  }

  let agreeClicked = false;
  let ageClicked = false;

  const updateTermsAcceptance = () => {
    if (agreeClicked && ageClicked) {
      localStorage.setItem("termsAccepted", "true");
      termsModal.classList.remove("active");
      document.body.style.overflow = "auto";
      window.location.href = "index.html";
    }
  };

  agreeButton?.addEventListener("click", () => {
    agreeClicked = true;
    agreeButton.classList.add("active");
    updateTermsAcceptance();
  });

  ageButton?.addEventListener("click", () => {
    ageClicked = true;
    ageButton.classList.add("active");
    updateTermsAcceptance();
  });
}

if (signupButton && signupModal) {
  signupButton.addEventListener("click", () => {
    signupModal.classList.add("active");
    setTimeout(() => {
      signupModal.classList.remove("active");
    }, 2000);
  });
}

const setUploadState = (unlocked) => {
  if (!imageUpload || !videoUpload || !adminStatus) {
    return;
  }
  imageUpload.disabled = !unlocked;
  videoUpload.disabled = !unlocked;
  adminStatus.textContent = unlocked
    ? "Uploads unlocked for admin."
    : "Uploads locked. Enter the admin code.";
};

if (imageUpload || videoUpload) {
  const alreadyUnlocked = sessionStorage.getItem(adminSessionKey) === "true";
  setUploadState(alreadyUnlocked);
}

if (unlockUploads) {
  unlockUploads.addEventListener("click", () => {
    const isAdmin = adminCodeInput?.value.trim() === "0000";
    if (isAdmin) {
      sessionStorage.setItem(adminSessionKey, "true");
      setUploadState(true);
    } else {
      setUploadState(false);
      adminStatus.textContent = "Invalid code. Admin access denied.";
    }
  });
}

const handleUpload = async (file) => {
  if (!file) {
    return;
  }
  if (sessionStorage.getItem(adminSessionKey) !== "true") {
    adminStatus.textContent = "Enter the admin code before uploading.";
    return;
  }
  const formData = new FormData();
  formData.append("adminCode", adminCodeInput?.value.trim() ?? "");
  formData.append("file", file);
  adminStatus.textContent = "Uploading...";
  try {
    const response = await fetch("/upload", {
      method: "POST",
      body: formData,
    });
    const result = await response.json();
    if (!response.ok) {
      adminStatus.textContent = result.message || "Upload failed.";
      return;
    }
    adminStatus.textContent = "Upload successful.";
  } catch (error) {
    adminStatus.textContent = "Upload failed. Please try again.";
  }
};

imageUpload?.addEventListener("change", (event) => {
  handleUpload(event.target.files[0]);
});

videoUpload?.addEventListener("change", (event) => {
  handleUpload(event.target.files[0]);
});

if (contactButton && contactModal) {
  contactButton.addEventListener("click", () => {
    contactModal.classList.add("active");
  });
}

if (descriptionField && wordCount) {
  descriptionField.addEventListener("input", () => {
    const words = descriptionField.value
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (words.length > 200) {
      descriptionField.value = words.slice(0, 200).join(" ");
    }
    const currentCount = descriptionField.value
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
    wordCount.textContent = `${currentCount} / 200 words`;
  });
}

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = document.getElementById("contactEmail").value;
    const issue = document.getElementById("issueType").value;
    const description = document.getElementById("description").value;
    const subject = encodeURIComponent(`Support Request: ${issue}`);
    const body = encodeURIComponent(
      `Email: ${email}\nIssue: ${issue}\nDescription: ${description}`
    );
    window.location.href = `mailto:insanitbjones@gmail.com?subject=${subject}&body=${body}`;
    contactModal.classList.remove("active");
    contactForm.reset();
    if (wordCount) {
      wordCount.textContent = "0 / 200 words";
    }
  });
}

if (pageIsHome && !acceptedTerms) {
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
    });
  });
}
