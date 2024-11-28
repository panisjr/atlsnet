// src/config.js

const config = {
    API_URL: import.meta.env.VITE_API_URL || "http://3.107.195.194:5000", // Default to localhost if not defined
  };
  
  export default config;