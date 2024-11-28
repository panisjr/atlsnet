// src/config.js

const config = {
    API_URL: import.meta.env.VITE_API_URL || "http://localhost:5000", // Default to localhost if not defined
  };
  
  export default config;
  