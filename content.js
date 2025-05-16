console.log("Content script injected and running");

let currentBoost = 1.0;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Content script received message:", request);
  if (request.type === "BOOST_VOLUME") {
    boostVolume(request.boost);
    currentBoost = request.boost;
  } else if (request.type === "TOGGLE_MUTE") {
    toggleMute(request.mute);
  } else if (request.type === "GET_VOLUME") {
    sendResponse({ boost: currentBoost });
  }
});

function boostVolume(boost) {
  document.querySelectorAll("audio, video").forEach((media) => {
    if (!media._context) {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const source = context.createMediaElementSource(media);
      const gain = context.createGain();
      source.connect(gain);
      gain.connect(context.destination);
      media._context = context;
      media._gain = gain;
    }
    media._gain.gain.value = boost;
    media.muted = false;
  });
}

function toggleMute() {
  document.querySelectorAll("audio, video").forEach((media) => {
    media.muted = !media.muted;
  });
}
