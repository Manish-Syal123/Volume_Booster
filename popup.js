let isMuted = false;

const volumeSlider = document.getElementById("volumeRange");
const display = document.getElementById("valueDisplay");
const muteBtn = document.getElementById("muteToggle");
const mutedisplay = document.getElementById("muteDisplay");

// On popup load, get current volume boost and mute state from content script and update UI
document.addEventListener("DOMContentLoaded", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { type: "GET_VOLUME" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error(
          "Failed to get volume:",
          chrome.runtime.lastError.message
        );
        return;
      }
      if (response && response.boost) {
        const boost = response.boost;
        volumeSlider.value = boost;
        display.innerText = (boost * 100).toFixed(0) + "%";
      }
    });
    chrome.tabs.sendMessage(tabs[0].id, { type: "GET_MUTE" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error(
          "Failed to get mute state:",
          chrome.runtime.lastError.message
        );
        return;
      }
      if (response && typeof response.mute === "boolean") {
        isMuted = response.mute;
        mutedisplay.innerText = isMuted ? "Unmute" : "Mute";
      }
    });
  });
});

volumeSlider.addEventListener("input", function () {
  const value = parseFloat(this.value);
  display.innerText = (value * 100).toFixed(0) + "%";
  // Do not reset mute state here to avoid UI inconsistency

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      {
        type: "BOOST_VOLUME",
        boost: value,
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error("Message failed:", chrome.runtime.lastError.message);
        } else {
          console.log("Message sent successfully");
        }
      }
    );
  });
});

muteBtn.addEventListener("click", () => {
  isMuted = !isMuted;
  mutedisplay.innerText = isMuted ? "Unmute" : "Mute";

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      {
        type: "TOGGLE_MUTE",
        mute: isMuted,
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error("Message failed:", chrome.runtime.lastError.message);
        } else {
          console.log("Message sent successfully");
        }
      }
    );
  });
});
