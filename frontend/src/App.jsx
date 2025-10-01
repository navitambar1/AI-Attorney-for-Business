import React, { useState, useRef, useEffect } from "react";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [uploadStatus, setUploadStatus] = useState("");

  const handleFileUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  setUploadStatus("📤 Uploading...");
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch("http://127.0.0.1:8000/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      setUploadStatus(`❌ Upload failed: ${res.status} ${errorText}`);
      return;
    }

    // ✅ FIX: parse JSON safely
    let data;
    try {
      data = await res.json();
    } catch (jsonErr) {
      setUploadStatus("⚠️ Upload succeeded, but invalid JSON response");
      return;
    }

    setUploadStatus(data.status || "✅ Uploaded!");

  } catch (err) {
    setUploadStatus(`❌ Upload failed: ${err.message}`);
  }
};


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages([...messages, { role: "user", content: input }]);
    const question = input;
    setInput("");
    setLoading(true);
    setDebugInfo("Sending request...");

    try {
      const res = await fetch("http://127.0.0.1:8000/ask", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }), 
      });

      setDebugInfo(`Response status: ${res.status} ${res.statusText}`);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error response:", errorText);
        setDebugInfo(`Error: ${res.status} - ${errorText}`);
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();
      console.log("Response from FastAPI:", data);

      const botReply = data.answer || "No reply found";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: botReply },
      ]);

      setDebugInfo("✅ Success!");

    } catch (err) {
      console.error("Fetch error:", err);
      setDebugInfo(`❌ Error: ${err.message}`);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ Error: ${err.message}` },
      ]);
    }

    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setDebugInfo("");
  };

  const formatMessage = (content) => {
    return content.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </span>
    ));
  };
  return (
  <div style={{
    fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundImage: "url('/eggbred_bg.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    minHeight: "100vh",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }}>
    <div style={{
      maxWidth: "900px",
      width: "100%",
      background: "#fff",
      borderRadius: "20px",
      boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      height: "calc(100vh - 32px)"
    }}>
      {/* Header */}
      <div style={{
        background: "#FFD502",
        padding: "20px",
        color: "black",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "3px solid black"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            background: "black",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFD502",
            fontSize: "22px"
          }}>
            ⚖️
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "700" }}>
              EggBred Franchise Agent
            </h1>
            <p style={{ margin: 0, fontSize: "14px", opacity: 0.8 }}>
              Your Legal & Franchise Assistant
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={clearChat}
            style={{
              background: "black",
              border: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              color: "#FFD502",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer"
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Chat Area */}
      <div style={{
        flex: 1,
        padding: "20px",
        overflowY: "auto",
        background: "#f9fafb",
        display: "flex",
        flexDirection: "column",
        gap: "16px"
      }}>
        {messages.length === 0 && (
          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            color: "#374151"
          }}>
            <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "8px" }}>
              Welcome to EggBred Franchise Agent
            </h3>
            <p style={{ fontSize: "16px", lineHeight: "1.5" }}>
              Ask me about EggBred franchising, legal details, and business opportunities.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{
            display: "flex",
            justifyContent: msg.role === "user" ? "flex-end" : "flex-start"
          }}>
            <div style={{
              maxWidth: "75%",
              padding: "14px 18px",
              borderRadius: msg.role === "user"
                ? "18px 18px 4px 18px"
                : "18px 18px 18px 4px",
              background: msg.role === "user" ? "black" : "#FFD502",
              color: msg.role === "user" ? "white" : "black",
              fontSize: "20px",
              fontWeight: msg.role === "user" ? "600" : "500",
              lineHeight: "1.6",
              boxShadow: "0 4px 10px rgba(0,0,0,0.15)"
            }}>
              {formatMessage(msg.content)}
              <div style={{
                fontSize: "11px",
                marginTop: "6px",
                opacity: 0.7,
                textAlign: "right"
              }}>
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{
              padding: "14px 18px",
              borderRadius: "18px 18px 18px 4px",
              background: "#FFD502",
              color: "black",
              fontSize: "14px",
              fontStyle: "italic"
            }}>
              Typing...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{
        padding: "16px",
        background: "#fff",
        borderTop: "1px solid #e5e7eb",
        display: "flex",
        gap: "10px",
        alignItems: "flex-end"
      }}>
        {/* Upload Button */}
      <input
        type="file"
        accept=".doc,.docx,.pdf"
        onChange={handleFileUpload}
        style={{ display: "none" }}
        id="fileUpload"
      />
      <label
        htmlFor="fileUpload"
        style={{
          width: "60px",
          height: "62px",
          borderRadius: "12px",
          border: "2px solid black",
          background: "#fff",
          color: "black",
          fontSize: "20px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        📎
      </label>
        <textarea
          ref={inputRef}
          style={{
            flex: 1,
            padding: "14px 18px",
            border: "2px solid black",
            borderRadius: "12px",
            fontSize: "25px",
            fontFamily: "inherit",
            resize: "none",
            outline: "none",
            background: "white"
          }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your question..."
          disabled={loading}
          rows={1}
        />
        <button 
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{
            width: "60px",
            height: "62px",
            borderRadius: "12px",
            border: "none",
            background: "#FFD502",
            color: "black",
            fontSize: "20px",
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold"
          }}
        >
          ➤
        </button>
      </div>
      {/* Upload Status */}
      {uploadStatus && (
        <p style={{ fontSize: "12px", padding: "4px 16px", color: "gray" }}>
          {uploadStatus}
        </p>
      )}
    </div>
  </div>
);

}

export default App; 