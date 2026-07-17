import { useEffect, useRef, useState } from "react";
import {
  Bot,
  X,
  Send,
  Minimize2,
  Trash2,
} from "lucide-react";

const API = "http://127.0.0.1:8000";

export default function FloatingChat() {

  const [open, setOpen] = useState(false);

  const [question, setQuestion] = useState("");

  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "👋 Hello! I'm VisionDesk AI.\n\nAsk me anything about your latest inspection.\n\nExamples:\n• How many workers?\n• Safety score\n• Risk level\n• Missing PPE\n• Violations",
    },
  ]);

  useEffect(() => {

    function openAssistant() {

      setOpen(true);

    }

    window.addEventListener(
      "openVisionDeskAI",
      openAssistant
    );

    return () =>
      window.removeEventListener(
        "openVisionDeskAI",
        openAssistant
      );

  }, []);

  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({

      behavior: "smooth",

    });

  }, [messages]);

  async function sendMessage() {

    if (!question.trim() || loading) return;

    const text = question;

    setQuestion("");

    setMessages((prev) => [

      ...prev,

      {

        role: "user",

        content: text,

      },

    ]);

    setLoading(true);

    try {

      const response = await fetch(
        `${API}/api/chat`,
        {

          method: "POST",

          headers: {

            "Content-Type": "application/json",

          },

          body: JSON.stringify({

            question: text,

          }),

        }
      );

      if (!response.ok) {

        throw new Error("Request failed");

      }

      const data = await response.json();

      setMessages((prev) => [

        ...prev,

        {

          role: "assistant",

          content: data.answer,

        },

      ]);

    } catch (err) {

      console.error(err);

      setMessages((prev) => [

        ...prev,

        {

          role: "assistant",

          content:
            "❌ Unable to connect to VisionDesk AI.",

        },

      ]);

    }

    setLoading(false);

  }

  function clearChat() {

    setMessages([

      {

        role: "assistant",

        content:
          "Conversation cleared.\n\nAsk me anything about the latest inspection.",

      },

    ]);

  }

  return (

    <>

      {!open && (

        <button

          onClick={() => setOpen(true)}

          className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 shadow-2xl transition hover:scale-110 hover:bg-blue-700"

        >

          <Bot

            size={30}

            color="white"

          />

        </button>

      )}

      {open && (

        <div className="fixed bottom-6 right-6 z-50 flex h-[650px] w-[420px] flex-col overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl">

          <div className="flex items-center justify-between bg-blue-600 px-5 py-4">

            <div className="flex items-center gap-3">

              <Bot

                size={24}

                color="white"

              />

              <div>

                <h2 className="font-bold text-white">

                  VisionDesk AI

                </h2>

                <p className="text-xs text-blue-100">

                  Safety Assistant

                </p>

              </div>

            </div>

            <div className="flex items-center gap-3">

              <button

                onClick={clearChat}

              >

                <Trash2

                  size={18}

                  color="white"

                />

              </button>

              <button

                onClick={() => setOpen(false)}

              >

                <Minimize2

                  size={18}

                  color="white"

                />

              </button>

              <button

                onClick={() => setOpen(false)}

              >

                <X

                  size={18}

                  color="white"

                />

              </button>

            </div>

          </div>

          <div className="flex-1 overflow-y-auto bg-slate-950 p-4">

            <div className="space-y-4">

              {messages.map((msg, index) => (

                <div

                  key={index}

                  className={`flex ${

                    msg.role === "user"

                      ? "justify-end"

                      : "justify-start"

                  }`}

                >

                  <div

                    className={`max-w-[85%] rounded-2xl px-4 py-3 whitespace-pre-wrap ${

                      msg.role === "user"

                        ? "bg-blue-600 text-white"

                        : "bg-slate-800 text-slate-200"

                    }`}

                  >

                    {msg.content}

                  </div>

                </div>

              ))}

              {loading && (

                <div className="rounded-xl bg-slate-800 px-4 py-3 text-white">

                  🤖 Thinking...

                </div>

              )}

              <div ref={messagesEndRef} />

            </div>

          </div>

          <div className="border-t border-slate-700 bg-slate-900 p-4">

            <div className="flex gap-3">

              <input

                value={question}

                onChange={(e) =>

                  setQuestion(e.target.value)

                }

                onKeyDown={(e) => {

                  if (e.key === "Enter") {

                    sendMessage();

                  }

                }}

                placeholder="Ask VisionDesk AI..."

                className="flex-1 rounded-xl bg-slate-800 px-4 py-3 text-white outline-none ring-1 ring-slate-700 focus:ring-blue-500"

              />

              <button

                onClick={sendMessage}

                disabled={loading}

                className="rounded-xl bg-blue-600 px-5 transition hover:bg-blue-700 disabled:opacity-60"

              >

                <Send

                  size={20}

                  color="white"

                />

              </button>

            </div>

          </div>

        </div>

      )}

    </>

  );

}