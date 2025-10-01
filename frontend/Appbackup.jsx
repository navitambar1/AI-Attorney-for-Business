import React, { useState, useRef, useEffect } from "react";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

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
      const res = await fetch("http://localhost:8000/ask", {
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

  // return (
  //   <div style={{
  //     fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  //     backgroundImage: "url('/eggbred_bg.jpg')",
  //     backgroundSize: "cover",
  //     backgroundPosition: "center",
  //     backgroundRepeat: "no-repeat",
  //     minHeight: "100vh",
  //     padding: "20px",
  //     display: "flex",
  //     alignItems: "center",
  //     justifyContent: "center"
  //   }}>
  //     <div style={{
  //       maxWidth: "900px",
  //       width: "100%",
  //       background: "#ffffff",
  //       borderRadius: "24px",
  //       boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  //       overflow: "hidden",
  //       display: "flex",
  //       flexDirection: "column",
  //       height: "calc(100vh - 32px)",
  //       position: "relative"
  //     }}>
  //       {/* Header */}
  //       <div style={{
  //         background: "#FFD502 0%",
  //         padding: "24px",
  //         color: "black",
  //         display: "flex",
  //         alignItems: "center",
  //         justifyContent: "space-between",
  //         boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
  //       }}>
  //         <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
  //           <div
  //             style={{
  //               width: "48px",
  //               height: "48px",
  //               background: "rgba(255, 255, 255, 0.2)",
  //               borderRadius: "12px",
  //               display: "flex",
  //               alignItems: "center",
  //               justifyContent: "center",
  //               overflow: "hidden" 
  //             }}
  //           >
  //             <img 
  //               src="favicon-32x32.png" 
  //               alt="Bot Icon" 
  //               style={{ width: "24px", height: "24px", objectFit: "contain" }}
  //             />
  //           </div>

  //           <div>
  //             <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "700" }}>
  //               AI Support Assistant
  //             </h1>
  //             <p style={{ margin: 0, fontSize: "14px", opacity: 0.9 }}>
  //               Get instant help with your questions
  //             </p>
  //           </div>
  //         </div>
          
  //         {messages.length > 0 && (
  //           <button
  //             onClick={clearChat}
  //             style={{
  //               background: "rgba(255, 255, 255, 0.2)",
  //               border: "none",
  //               borderRadius: "8px",
  //               padding: "8px 16px",
  //               color: "white",
  //               fontSize: "14px",
  //               fontWeight: "500",
  //               cursor: "pointer",
  //               transition: "all 0.2s ease"
  //             }}
  //             onMouseOver={(e) => e.target.style.background = "rgba(255, 255, 255, 0.3)"}
  //             onMouseOut={(e) => e.target.style.background = "rgba(255, 255, 255, 0.2)"}
  //           >
  //             Clear Chat
  //           </button>
  //         )}
  //       </div>

  //       {/* Debug info */}
  //       {debugInfo && (
  //         <div style={{ 
  //           background: "linear-gradient(90deg, #fef3c7, #fde68a)", 
  //           border: "none", 
  //           padding: "12px 24px", 
  //           fontSize: "13px",
  //           fontWeight: "500",
  //           color: "#92400e",
  //           borderBottom: "1px solid #f3f4f6"
  //         }}>
  //           <span style={{ fontWeight: "600" }}>Debug:</span> {debugInfo}
  //         </div>
  //       )}

  //       {/* Chat Messages */}
  //       <div style={{
  //         flex: 1,
  //         padding: "24px",
  //         overflowY: "auto",
  //         background: "#f8fafc",
  //         display: "flex",
  //         flexDirection: "column",
  //         gap: "16px"
  //       }}>
  //         {messages.length === 0 && (
  //           <div style={{
  //             display: "flex",
  //             flexDirection: "column",
  //             alignItems: "center",
  //             justifyContent: "center",
  //             height: "100%",
  //             textAlign: "center",
  //             color: "#64748b"
  //           }}>
  //             <div style={{
  //               width: "80px",
  //               height: "80px",
  //               background: "linear-gradient(135deg, #e0e7ff, #c7d2fe)",
  //               borderRadius: "50%",
  //               display: "flex",
  //               alignItems: "center",
  //               justifyContent: "center",
  //               fontSize: "32px",
  //               marginBottom: "20px"
  //             }}>
  //               💬
  //             </div>
  //             <h3 style={{ margin: "0 0 8px 0", fontSize: "20px", fontWeight: "600" }}>
  //               Welcome to AI Support
  //             </h3>
  //             <p style={{ margin: 0, fontSize: "16px", lineHeight: "1.6" }}>
  //               Ask me anything about your franchise, business, or any questions you have.<br />
  //               I'm here to help you 24/7!
  //             </p>
  //           </div>
  //         )}
          
  //         {messages.map((msg, i) => (
  //           <div
  //             key={i}
  //             style={{
  //               display: "flex",
  //               justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
  //               marginBottom: "8px"
  //             }}
  //           >
  //             <div style={{
  //               maxWidth: "75%",
  //               display: "flex",
  //               alignItems: "flex-start",
  //               gap: "12px",
  //               flexDirection: msg.role === "user" ? "row-reverse" : "row"
  //             }}>
  //               {/* Avatar */}
  //               <div style={{
  //                 width: "40px",
  //                 height: "40px",
  //                 borderRadius: "50%",
  //                 background: msg.role === "user" 
  //                   ? "linear-gradient(135deg, #3b82f6, #1d4ed8)" 
  //                   : "linear-gradient(135deg, #10b981, #047857)",
  //                 display: "flex",
  //                 alignItems: "center",
  //                 justifyContent: "center",
  //                 fontSize: "18px",
  //                 flexShrink: 0,
  //                 boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
  //               }}>
  //                 {msg.role === "user" ? "👤" : "🤖"}
  //               </div>

  //               <div style={{
  //                 padding: "16px 20px",
  //                 borderRadius: msg.role === "user" ? "20px 20px 8px 20px" : "20px 20px 20px 8px",
  //                 background: msg.role === "user" 
  //                   ? "linear-gradient(135deg, #3b82f6, #1d4ed8)" 
  //                   : "#ffffff",
  //                 color: msg.role === "user" ? "#ffffff" : "#1f2937",
  //                 fontSize: "15px",
  //                 lineHeight: "1.6",
  //                 fontWeight: "500",
  //                 boxShadow: msg.role === "user" 
  //                   ? "0 4px 12px rgba(59, 130, 246, 0.3)"
  //                   : "0 4px 12px rgba(0, 0, 0, 0.1)",
  //                 border: msg.role === "assistant" ? "1px solid #e5e7eb" : "none",
  //                 position: "relative"
  //               }}>
  //                 {formatMessage(msg.content)}
                  
  //                 {/* Timestamp */}
  //                 <div style={{
  //                   fontSize: "11px",
  //                   marginTop: "8px",
  //                   opacity: 0.7,
  //                   color: msg.role === "user" ? "#e0e7ff" : "#6b7280"
  //                 }}>
  //                   {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
  //                 </div>
  //               </div>
  //             </div>
  //           </div>
  //         ))}

  //         {loading && (
  //           <div style={{ display: "flex", justifyContent: "flex-start" }}>
  //             <div style={{
  //               display: "flex",
  //               alignItems: "flex-start",
  //               gap: "12px"
  //             }}>
  //               <div style={{
  //                 width: "40px",
  //                 height: "40px",
  //                 borderRadius: "50%",
  //                 background: "linear-gradient(135deg, #10b981, #047857)",
  //                 display: "flex",
  //                 alignItems: "center",
  //                 justifyContent: "center",
  //                 fontSize: "18px",
  //                 boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
  //               }}>
  //                 🤖
  //               </div>
                
  //               <div style={{
  //                 padding: "16px 20px",
  //                 borderRadius: "20px 20px 20px 8px",
  //                 background: "#ffffff",
  //                 border: "1px solid #e5e7eb",
  //                 display: "flex",
  //                 alignItems: "center",
  //                 gap: "8px",
  //                 boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
  //               }}>
  //                 <div style={{
  //                   display: "flex",
  //                   gap: "4px"
  //                 }}>
  //                   {[0, 1, 2].map((i) => (
  //                     <div
  //                       key={i}
  //                       style={{
  //                         width: "8px",
  //                         height: "8px",
  //                         borderRadius: "50%",
  //                         background: "#9ca3af",
  //                         animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`
  //                       }}
  //                     />
  //                   ))}
  //                 </div>
  //                 <span style={{ color: "#6b7280", fontSize: "14px", fontStyle: "italic" }}>
  //                   AI is thinking...
  //                 </span>
  //               </div>
  //             </div>
  //           </div>
  //         )}
          
  //         <div ref={messagesEndRef} />
  //       </div>

  //       {/* Input Area */}
  //       <div style={{
  //         padding: "20px 24px",
  //         background: "#ffffff",
  //         borderTop: "1px solid #e5e7eb"
  //       }}>
  //         <div style={{
  //           display: "flex",
  //           gap: "12px",
  //           alignItems: "flex-end"
  //         }}>
  //           <div style={{ flex: 1, position: "relative" }}>
  //             <textarea
  //               ref={inputRef}
  //               style={{
  //                 width: "100%",
  //                 minHeight: "52px",
  //                 maxHeight: "120px",
  //                 padding: "16px 20px",
  //                 border: "2px solid #e5e7eb",
  //                 borderRadius: "16px",
  //                 fontSize: "15px",
  //                 fontFamily: "inherit",
  //                 resize: "none",
  //                 outline: "none",
  //                 transition: "all 0.2s ease",
  //                 lineHeight: "1.5",
  //                 background: "#f8fafc"
  //               }}
  //               value={input}
  //               onChange={(e) => setInput(e.target.value)}
  //               onKeyPress={handleKeyPress}
  //               placeholder="Type your message here..."
  //               disabled={loading}
  //               onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
  //               onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
  //               rows={1}
  //             />
  //           </div>
            
  //           <button 
  //             onClick={sendMessage} 
  //             disabled={loading || !input.trim()}
  //             style={{
  //               width: "52px",
  //               height: "52px",
  //               borderRadius: "16px",
  //               border: "none",
  //               background: "white", 
  //               cursor: loading || !input.trim() ? "not-allowed" : "pointer",
  //               display: "flex",
  //               alignItems: "center",
  //               justifyContent: "center",
  //               transition: "all 0.2s ease",
  //               boxShadow: !loading && input.trim() ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
  //               flexShrink: 0
  //             }}
  //             onMouseOver={(e) => {
  //               if (!loading && input.trim()) {
  //                 e.currentTarget.style.transform = "scale(1.05)";
  //                 e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.2)";
  //               }
  //             }}
  //             onMouseOut={(e) => {
  //               e.currentTarget.style.transform = "scale(1)";
  //               e.currentTarget.style.boxShadow = !loading && input.trim() 
  //                 ? "0 4px 12px rgba(0,0,0,0.15)" 
  //                 : "none";
  //             }}
  //           >
  //             {loading ? (
  //               "⏳"
  //             ) : (
  //               <img 
  //                 src="/send_icon.png" 
  //                 alt="Send" 
  //                 style={{ width: "24px", height: "24px" }}
  //               />
  //             )}
  //           </button>

  //         </div>
          
  //         <div style={{
  //           marginTop: "12px",
  //           fontSize: "13px",
  //           color: "#6b7280",
  //           textAlign: "center"
  //         }}>
  //           Press Enter to send • Shift+Enter for new line
  //         </div>
  //       </div>
  //     </div>

  //     <style>{`
  //       @keyframes pulse {
  //         0%, 70%, 100% {
  //           transform: scale(1);
  //           opacity: 0.5;
  //         }
  //         35% {
  //           transform: scale(1.2);
  //           opacity: 1;
  //         }
  //       }
        
  //       /* Scrollbar styling */
  //       * {
  //         scrollbar-width: thin;
  //         scrollbar-color: #cbd5e1 #f1f5f9;
  //       }
        
  //       *::-webkit-scrollbar {
  //         width: 6px;
  //       }
        
  //       *::-webkit-scrollbar-track {
  //         background: #f1f5f9;
  //         border-radius: 3px;
  //       }
        
  //       *::-webkit-scrollbar-thumb {
  //         background: #cbd5e1;
  //         border-radius: 3px;
  //       }
        
  //       *::-webkit-scrollbar-thumb:hover {
  //         background: #94a3b8;
  //       }
  //     `}</style>
  //   </div>
  // );
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
              fontSize: "15px",
              fontWeight: "500",
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
        <textarea
          ref={inputRef}
          style={{
            flex: 1,
            padding: "14px 18px",
            border: "2px solid black",
            borderRadius: "12px",
            fontSize: "15px",
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
            width: "52px",
            height: "52px",
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
    </div>
  </div>
);

}

export default App;