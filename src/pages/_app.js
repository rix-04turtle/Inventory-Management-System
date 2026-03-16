import "@/styles/globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import ChatBot from "@/components/ChatBot/ChatBot";

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
      <Toaster />
      <ChatBot />
    </AuthProvider>
  );
}
