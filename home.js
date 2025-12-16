let chatInput, sendChatBtn, chatMessages, apiKeyInput, saveApiKeyBtn;
let API_KEY = localStorage.getItem("openai_api_key") || "";

document.addEventListener("DOMContentLoaded", () => {
  // Sidebar toggle
  const sidebar = document.getElementById("sidebar");
  const sidebarToggleDesktop = document.getElementById(
    "sidebar-toggle-desktop"
  );
  const sidebarToggleMobile = document.getElementById("sidebar-toggle-mobile");

  function toggleSidebar() {
    sidebar.classList.toggle("open");
  }

  function closeSidebar() {
    sidebar.classList.remove("open");
  }

  if (sidebarToggleDesktop)
    sidebarToggleDesktop.addEventListener("click", toggleSidebar);
  if (sidebarToggleMobile)
    sidebarToggleMobile.addEventListener("click", toggleSidebar);

  // Escape key to close sidebar
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sidebar.classList.contains("open")) {
      closeSidebar();
    }
  });

  // Click outside sidebar to close it
  document.addEventListener("click", (e) => {
    if (
      sidebar.classList.contains("open") &&
      !sidebar.contains(e.target) &&
      !sidebarToggleDesktop?.contains(e.target) &&
      !sidebarToggleMobile?.contains(e.target)
    ) {
      closeSidebar();
    }
  });

  // Mood selector
  const moodBtns = document.querySelectorAll(".mood-btn");
  moodBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      moodBtns.forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      const mood = btn.dataset.mood;
      changeMood(mood);
      updateAccentColor(mood);
    });
  });

  // Load initial mood
  const savedMood = localStorage.getItem("mood") || "neutral";
  const initialBtn = document.querySelector(`[data-mood="${savedMood}"]`);
  if (initialBtn) {
    initialBtn.classList.add("selected");
    changeMood(savedMood);
    updateAccentColor(savedMood);
  }

  // API Key Section Toggle
  const apiToggleBtn = document.getElementById("api-toggle-btn");
  const apiKeySection = document.getElementById("api-key-section");
  const apiCloseBtn = document.querySelector(".api-close-btn");
  const apiKeyHeader = document.querySelector(".api-key-header");

  function toggleApiSection() {
    apiKeySection.classList.toggle("collapsed");
  }

  if (apiToggleBtn) apiToggleBtn.addEventListener("click", toggleApiSection);
  if (apiCloseBtn) apiCloseBtn.addEventListener("click", toggleApiSection);
  if (apiKeyHeader) apiKeyHeader.addEventListener("click", toggleApiSection);

  // API Key
  apiKeyInput = document.getElementById("api-key-input");
  saveApiKeyBtn = document.getElementById("save-api-key");
  saveApiKeyBtn.addEventListener("click", saveApiKey);

  // Load saved API key
  if (API_KEY) {
    apiKeyInput.value = API_KEY;
  }

  // Chatbot
  chatInput = document.getElementById("chat-input");
  sendChatBtn = document.getElementById("send-chat");
  chatMessages = document.getElementById("chat-messages");

  sendChatBtn.addEventListener("click", sendMessage);
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  updateChatbot();
});

function saveApiKey() {
  API_KEY = apiKeyInput.value.trim();
  if (API_KEY) {
    localStorage.setItem("openai_api_key", API_KEY);
    alert("API Key saved! The chatbot will now use advanced AI responses.");
  } else {
    alert("Please enter a valid API key.");
  }
}

function updateChatbot() {
  const mood = localStorage.getItem("mood") || "neutral";
  const initialPrompt = `The user has selected ${mood} as their current mood. Provide a brief, welcoming greeting that acknowledges their mood and invites them to share.`;

  getBotResponse(initialPrompt)
    .then((response) => {
      document.getElementById(
        "chat-messages"
      ).innerHTML = `<div class="message bot">${response}</div>`;
    })
    .catch((error) => {
      // Fallback
      const messages = {
        happy:
          "I'm glad you're feeling happy! What's bringing you joy today? Let's explore that feeling together.",
        sad: "I hear that you're feeling sad. It's okay to feel this way. Can you tell me more about what's making you feel this way? I'm here to listen.",
        angry:
          "Anger is a valid emotion. What happened that made you feel angry? Let's work through this together.",
        anxious:
          "Anxiety can be overwhelming. What's causing you to feel anxious right now? Take a deep breath, and let's talk about it.",
        neutral:
          "How are you feeling today? I'm here to support you no matter what.",
      };
      document.getElementById(
        "chat-messages"
      ).innerHTML = `<div class="message bot">${messages[mood]}</div>`;
    });
}

function sendMessage() {
  const message = chatInput.value.trim();
  if (message) {
    chatMessages.innerHTML += `<div class="message user">${message}</div>`;
    chatInput.value = "";
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Show typing indicator
    const typingIndicator = document.createElement("div");
    typingIndicator.className = "message bot typing";
    typingIndicator.innerHTML = "Bot is typing...";
    chatMessages.appendChild(typingIndicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    getBotResponse(message)
      .then((response) => {
        chatMessages.removeChild(typingIndicator);
        chatMessages.innerHTML += `<div class="message bot">${response}</div>`;
        chatMessages.scrollTop = chatMessages.scrollHeight;
      })
      .catch((error) => {
        chatMessages.removeChild(typingIndicator);
        chatMessages.innerHTML += `<div class="message bot">Sorry, I'm having trouble connecting. Please try again later.</div>`;
        console.error("Error:", error);
      });
  }
}

async function getBotResponse(message) {
  const mood = localStorage.getItem("mood") || "neutral";

  // Enhanced system prompt with detailed mood-specific context
  const moodContexts = {
    happy:
      "The user is feeling happy and joyful. They're likely in a positive mindset and open to celebrating achievements or exploring sources of joy. Encourage them to share their happiness, explore what's working well, and help them maintain these positive feelings.",
    sad: "The user is feeling sad and may be going through a difficult time. Be deeply empathetic, validating, and compassionate. Acknowledge their pain without minimizing it. Help them process their emotions and gently explore what might help them feel better. Offer gentle encouragement while respecting their emotional state.",
    angry:
      "The user is feeling angry and frustrated. They may feel misunderstood or treated unfairly. Validate their anger as a legitimate emotion. Help them understand the root cause and work toward constructive solutions. Be calm and non-judgmental, helping them channel their anger productively.",
    anxious:
      "The user is feeling anxious or worried. They may feel overwhelmed or uncertain about things. Be reassuring and grounding. Help them identify what's causing the anxiety and offer calming techniques like breathing exercises or breaking problems into manageable steps. Provide perspective and gentle reassurance.",
    neutral:
      "The user is feeling neutral or balanced. They're likely open to reflection and growth. Help them explore their feelings deeper, identify what matters to them, and support their wellbeing in a balanced way. Be curious and supportive.",
  };

  const systemPrompt = `You are an empathetic, caring emotional support chatbot specializing in mental health and wellness support. 

Current User Context: ${moodContexts[mood]}

Your approach:
- Listen with genuine empathy and without judgment
- Validate the user's feelings and experiences
- Ask thoughtful follow-up questions to understand them better
- Provide practical, actionable suggestions when appropriate
- Use a warm, conversational tone that feels like talking to a caring friend
- Keep responses concise but meaningful (2-3 sentences typically)
- Never provide medical advice - encourage professional help for serious concerns
- Remember you're supporting their emotional wellness journey

Remember: You're here to listen, understand, and support - not to fix everything.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Using GPT-4o mini for cost-effectiveness
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    // Fallback to scripted responses if API fails
    return getFallbackResponse(message);
  }
}

function getFallbackResponse(message) {
  const mood = localStorage.getItem("mood") || "neutral";
  const responses = {
    happy: [
      "That's wonderful! Can you tell me more about what makes you happy?",
      "Happiness is contagious! What activities bring you the most joy?",
      "I'm so glad to hear that. Let's celebrate your positive feelings!",
      "What can we do to keep this happiness going?",
    ],
    sad: [
      "I'm sorry you're feeling this way. Would you like to talk about what's causing your sadness?",
      "Sadness is a natural emotion. How can I support you right now?",
      "It's brave of you to acknowledge your feelings. What would help you feel better?",
      "Remember, it's okay to not be okay. I'm here for you.",
    ],
    angry: [
      "Anger can be intense. What triggered these feelings?",
      "Let's try to understand what's making you angry. Can you describe the situation?",
      "It's important to express anger healthily. What coping strategies work for you?",
      "I'm listening. How can we work through this anger together?",
    ],
    anxious: [
      "Anxiety can be really challenging. What's worrying you most right now?",
      "Let's try some grounding techniques. Can you name 5 things you can see?",
      "Breathe with me: inhale for 4, hold for 4, exhale for 4. How does that feel?",
      "What usually helps you when you feel anxious?",
    ],
    neutral: [
      "Tell me more about how you're feeling.",
      "What would you like to talk about today?",
      "I'm here to listen. What's on your mind?",
      "How can I support you right now?",
    ],
  };
  return responses[mood][Math.floor(Math.random() * responses[mood].length)];
}

function updateAccentColor(mood) {
  const colors = {
    happy: "#FF6B6B", // Warm red
    sad: "#4A90E2", // Cool blue
    angry: "#FF4757", // Bright red
    anxious: "#FFB74D", // Warm orange
    neutral: "#4A90E2", // Professional blue
  };

  const accentColor = colors[mood] || colors.neutral;
  document.documentElement.style.setProperty("--accent-color", accentColor);
}

function changeMood(mood) {
  localStorage.setItem("mood", mood);
  document.body.className = mood;
}
