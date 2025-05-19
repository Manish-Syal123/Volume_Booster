console.log("Content script injected and running");

let currentBoost = 1.0;
let currentMute = false;

const observedMedia = new WeakSet();

function applyBoostToMedia(media, boost) {
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
  media.muted = currentMute;
  observedMedia.add(media);
}

function boostVolume(boost) {
  currentBoost = boost;
  document.querySelectorAll("audio, video").forEach((media) => {
    applyBoostToMedia(media, boost);
  });
}

function toggleMute(mute) {
  currentMute = mute;
  document.querySelectorAll("audio, video").forEach((media) => {
    media.muted = mute;
  });
}

// Observe dynamically added media elements and apply boost/mute
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (
        node.nodeType === 1 &&
        (node.tagName === "AUDIO" || node.tagName === "VIDEO") &&
        !observedMedia.has(node)
      ) {
        applyBoostToMedia(node, currentBoost);
      }
      // Also check descendants
      if (node.nodeType === 1) {
        node.querySelectorAll("audio, video").forEach((media) => {
          if (!observedMedia.has(media)) {
            applyBoostToMedia(media, currentBoost);
          }
        });
      }
    });
  });
});

observer.observe(document.body, { childList: true, subtree: true });

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Content script received message:", request);
  if (request.type === "BOOST_VOLUME") {
    boostVolume(request.boost);
  } else if (request.type === "TOGGLE_MUTE") {
    toggleMute(request.mute);
  } else if (request.type === "GET_VOLUME") {
    sendResponse({ boost: currentBoost });
  } else if (request.type === "GET_MUTE") {
    sendResponse({ mute: currentMute });
  }
});
