// src/config.js

const config = {
    API_URL: import.meta.env.VITE_API_URL || "https://atlsnetserver.site", // Default to localhost if not defined
  };
  
  export default config;