let isMuted = false;

const volumeSlider = document.getElementById("volumeRange");
const display = document.getElementById("valueDisplay");
const muteBtn = document.getElementById("muteToggle");

volumeSlider.addEventListener("input", function () {
  const value = parseFloat(this.value);
  display.innerText = (value * 100).toFixed(0) + "%";
  isMuted = false;
  muteBtn.innerText = "Mute";

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
  muteBtn.innerText = isMuted ? "Unmute" : "Mute";

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      {
        type: "TOGGLE_MUTE",
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
