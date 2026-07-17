import { useState } from "react";
import axios from "axios";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function Chatbot() {
  const [question, setQuestion] = useState("");

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I'm VisionDesk AI Assistant. Ask me anything about your latest inspection, PPE compliance, safety score, reports, or workplace hazards.",
    },
  ]);

  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!question.trim()) return;

    const userQuestion = question;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userQuestion,
      },
    ]);

    setQuestion("");

    setLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/chat",
        {
          question: userQuestion,
        }
      );

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.data.answer,
          sources: response.data.sources ?? [],
        },
      ]);
    } catch (error) {
      console.error(error);

      let message = "VisionDesk AI is unavailable.";

      if (error.response) {
        message =
          error.response.data.detail ||
          JSON.stringify(error.response.data);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: message,
        },
      ]);
    }

    setLoading(false);
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl">

        <div className="rounded-2xl border border-slate-800 bg-slate-900">

          <div className="border-b border-slate-800 p-6">

            <h1 className="text-3xl font-bold">
              VisionDesk AI Assistant
            </h1>

            <p className="mt-2 text-slate-400">
              Ask anything about the latest inspection.
            </p>

          </div>

          <div className="h-[520px] overflow-y-auto p-6 space-y-4">

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
                  className={`max-w-xl rounded-xl px-5 py-4 ${
                    msg.role === "user"
                      ? "bg-blue-600"
                      : "bg-slate-800"
                  }`}
                >
                  <div>{msg.content}</div>
                  {msg.role === "assistant" &&
                    msg.sources &&
                    msg.sources.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-700 pt-3">
                        {msg.sources.map((src, si) => (
                          <span
                            key={si}
                            className="inline-flex items-center gap-1 rounded-full bg-slate-700 px-2.5 py-1 text-xs text-slate-300"
                          >
                            📄{" "}
                            {src.filename ?? src.source ?? "Document"}
                            {(src.page_number ?? src.page) && (
                              <span className="text-slate-400">
                                (page {src.page_number ?? src.page})
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    )}
                </div>

              </div>

            ))}

            {loading && (
              <div className="bg-slate-800 rounded-xl p-4 w-fit">
                VisionDesk AI is thinking...
              </div>
            )}

          </div>

          <div className="border-t border-slate-800 p-6 flex gap-4">

            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
              placeholder="Ask something..."
              className="flex-1 rounded-lg bg-slate-800 p-4 outline-none"
            />

            <button
              onClick={sendMessage}
              className="rounded-lg bg-blue-600 px-8 hover:bg-blue-700"
            >
              Send
            </button>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}