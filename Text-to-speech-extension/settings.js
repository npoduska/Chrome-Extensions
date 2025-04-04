document.addEventListener("DOMContentLoaded", () => {
  const rateInput = document.getElementById("rate");
  const rateValue = document.getElementById("rateValue");
  const voicesDropdown = document.getElementById("voices");
  const saveButton = document.getElementById("save");
  const pauseButton = document.getElementById("pause");
  const stopButton = document.getElementById("stop");

  // Load saved settings
  chrome.storage.sync.get(["speechRate", "voice"], (settings) => {
    rateInput.value = settings.speechRate || 1.0;
    rateValue.textContent = settings.speechRate || 1.0;
  });

  // Load available voices
  function loadVoices() {
    const voices = speechSynthesis.getVoices();
    voicesDropdown.innerHTML = ""; // Clear previous voices

    voices.forEach((voice) => {
      const option = document.createElement("option");
      option.value = voice.name;
      option.textContent = voice.name;
      voicesDropdown.appendChild(option);
    });

    // Set the selected voice if previously saved
    chrome.storage.sync.get("voice", (settings) => {
      voicesDropdown.value = settings.voice || "";
    });
  }

  speechSynthesis.onvoiceschanged = loadVoices;
  loadVoices();

  // Update speech rate display
  rateInput.addEventListener("input", () => {
    rateValue.textContent = rateInput.value;
  });

  // Save settings
  saveButton.addEventListener("click", () => {
    chrome.storage.sync.set({
      speechRate: parseFloat(rateInput.value),
      voice: voicesDropdown.value
    }, () => {
      alert("Settings saved!");
    });
  });

  // Pause/Resume button
  pauseButton.addEventListener("click", () => {
    chrome.scripting.executeScript({
      target: { allFrames: true },
      func: togglePauseSpeech
    });
  });

  // Stop button
  stopButton.addEventListener("click", () => {
    chrome.scripting.executeScript({
      target: { allFrames: true },
      func: stopSpeech
    });
  });

  // Function to pause/resume speech
  function togglePauseSpeech() {
    if (window.speechSynthesis.speaking) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      } else {
        window.speechSynthesis.pause();
      }
    }
  }

  // Function to stop speech
  function stopSpeech() {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
  }
});
