import type { Messages } from "./ko";

const en: Messages = {
  common: { appName: "Piyo", appTagline: "Your AI Beauty Concierge", send: "Send", cancel: "Cancel", next: "Next", back: "Back", skip: "Skip", complete: "Done", close: "Close", login: "Log in", logout: "Log out", settings: "Settings", newChat: "New chat" },
  welcome: { greeting: "Hi! I'm Piyo 🐥", description: "Ask me anything about skincare, treatments, or beauty.\nI'll give you personalized K-beauty recommendations." },
  chat: { placeholder: "Ask Piyo anything...", disclaimer: "Piyo is an AI beauty concierge. It does not replace medical diagnosis.", recommendedProducts: "Recommended Products", recommendedProcedures: "Recommended Treatments" },
  consent: { title: "Before we start", subtitle: "We need your agreement for the service" },
  survey: { basicInfo: "Tell us about yourself", skinType: "Select your skin type", concerns: "Select your skin concerns", sensitivity: "How sensitive is your skin?" },
  sidebar: { saveHistoryTitle: "Save your chat history", saveHistoryDesc: "Log in to keep your conversations", noChatsYet: "No chats yet" },
};

export default en;
