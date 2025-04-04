// Create context menu items
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "readText",
    title: "Read Aloud",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "pauseSpeech",
    title: "Pause/Resume Speech",
    contexts: ["all"]
  });

  chrome.contextMenus.create({
    id: "stopSpeech",
    title: "Stop Speech",
    contexts: ["all"]
  });

  // Default settings
  chrome.storage.sync.set({ speechRate: 1.0, voice: "" });
});

// Handle menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "readText" && info.selectionText) {
    chrome.storage.sync.get(["speechRate", "voice"], (settings) => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: readTextAloud,
        args: [info.selectionText, settings.speechRate, settings.voice]
      });
    });
  } else if (info.menuItemId === "pauseSpeech") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: togglePauseSpeech
    });
  } else if (info.menuItemId === "stopSpeech") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: stopSpeech
    });
  }
});

// Function to read text aloud
function readTextAloud(text, rate, voiceName) {
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel(); // Stop any ongoing speech
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;

  const voices = speechSynthesis.getVoices();
  const selectedVoice = voices.find(v => v.name === voiceName);
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  window.speechSynthesis.speak(utterance);
}

// Pause/Resume function
function togglePauseSpeech() {
  if (window.speechSynthesis.speaking) {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    } else {
      window.speechSynthesis.pause();
    }
  }
}

// Stop function
function stopSpeech() {
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }
}
