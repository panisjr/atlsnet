import React, { createContext, useState, useContext } from "react";

// Create a context
const StreamContext = createContext();

export const StreamProvider = ({ children }) => {
  const [streaming, setStreaming] = useState(false);
  const [counting, setCounting] = useState(false);

  return (
    <StreamContext.Provider value={{ streaming, setStreaming, counting, setCounting }}>
      {children}
    </StreamContext.Provider>
  );
};

// Custom hook to use the context
export const useStream = () => useContext(StreamContext);
