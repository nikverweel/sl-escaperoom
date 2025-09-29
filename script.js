// login + viewer wiring
document.addEventListener("DOMContentLoaded", () => {
const loginScreen = document.querySelector(".login");
const usernameInput = document.getElementById("user");
const passwordInput = document.getElementById("pass");
const invalidMessage = document.getElementById("invalid");
const viewerContainer = document.getElementById("viewer");

// Map users to panoramas
const validLogins = [
    { user: "machina_humana", pass: "password1", pano: "/images/360/scene1.jpg" },
    { user: "patria_locus", pass: "8517", pano: "/images/360/scene2.jpg" },
    { user: "proiectura", pass: "38295", pano: "/images/360/scene3.jpg" },
    { user: "dominus_mens", pass: "41845", pano: "/images/360/scene4.jpg" }
];

let viewer = null;
let wakeLock = null;

async function requestWakeLock() {
  try {
    wakeLock = await navigator.wakeLock.request("screen");
    console.log("Wake Lock is active");

    // If lock gets released (tab hidden, minimized, etc.)
    wakeLock.addEventListener("release", () => {
      console.log("Wake Lock released, trying again...");
    });
  } catch (err) {
    console.error(`${err.name}, ${err.message}`);
  }
}

// Reacquire when the page comes back into view
document.addEventListener("visibilitychange", () => {
  if (wakeLock !== null && document.visibilityState === "visible") {
    requestWakeLock();
  }
});

// Start wake lock after any user interaction (safer than auto on load)
document.addEventListener("click", () => {
  if (wakeLock === null) {
    requestWakeLock();
  }
}, { once: true }); // only need to request once

function showErrorAndReset() {
    invalidMessage.classList.remove("hidden");
    usernameInput.value = "";
    passwordInput.value = "";
    usernameInput.focus();
}

function initOrSetPanorama(panoUrl) {
    // hide login overlay
    loginScreen.style.display = "none";
    invalidMessage.classList.add("hidden");

    if (!viewer) {
    // PhotoSphereViewer v4 exposes PhotoSphereViewer global (UMD)
    viewer = new PhotoSphereViewer.Viewer({
        container: viewerContainer,
        panorama: panoUrl,
        navbar: false,               // minimal UI
        mousewheel: true,
        touchmoveTwoFingers: true
    });
    } else {
    // reuse existing viewer instance to change panorama
    viewer.setPanorama(panoUrl).catch(err => {
        console.error("Failed to set panorama:", err);
    });
    }
}

function checkLogin() {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    const match = validLogins.find(c => c.user === username && c.pass === password);

    if (match) {
    initOrSetPanorama(match.pano);
    } else {
    showErrorAndReset();
    }
}

// Enter key on either input triggers check
[usernameInput, passwordInput].forEach(input => {
    input.addEventListener("keypress", e => {
    if (e.key === "Enter") checkLogin();
    });
});

// hide the error once user starts typing again
[usernameInput, passwordInput].forEach(i => i.addEventListener("input", () => {
    invalidMessage.classList.add("hidden");
}));
});