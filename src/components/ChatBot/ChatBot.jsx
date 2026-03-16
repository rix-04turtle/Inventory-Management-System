import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "BOT", text: "Hi! How can I help you today?" }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage = { sender: "USER", text: inputText };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setLoading(true);

    try {
      const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/chatbot/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ text: userMessage.text })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const botMessage = { sender: "BOT", text: data.message };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const botMessage = { sender: "BOT", text: "Sorry, I am having trouble connecting to the server right now." };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-80 sm:w-96 max-h-[500px] h-[calc(100vh-120px)] z-50 flex flex-col shadow-xl animate-in slide-in-from-bottom-5">
          <CardHeader className="p-4 border-b flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg font-semibold">Help & Support</CardTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 p-4 overflow-y-auto flex flex-col space-y-4">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`px-4 py-2 rounded-lg max-w-[80%] text-sm ${
                  msg.sender === "USER" ? "bg-primary text-primary-foreground self-end" : "bg-muted self-start prose prose-sm dark:prose-invert"
                }`}
              >
                {msg.sender === "USER" ? msg.text : <ReactMarkdown>{msg.text}</ReactMarkdown>}
              </div>
            ))}
            {loading && (
              <div className="bg-muted px-4 py-2 rounded-lg max-w-[80%] self-start text-sm animate-pulse">
                Thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>
          <CardFooter className="p-3 border-t">
            <form className="flex w-full items-center space-x-2" onSubmit={sendMessage}>
              <Input
                type="text"
                placeholder="Type your message..."
                className="flex-1"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={loading}
              />
              <Button type="submit" size="icon" className="shrink-0" disabled={loading || !inputText.trim()}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}

      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg transition-transform hover:scale-105"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>
    </>
  );
}
