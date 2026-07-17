import { useState } from "react";
import {
  Image,
  ScanSearch,
  Download,
  Maximize2,
  X,
} from "lucide-react";

const API = "http://127.0.0.1:8000";

export default function ImageComparison({

  original,

  annotated,

}) {

  const [fullscreen, setFullscreen] = useState(false);

  const [selectedImage, setSelectedImage] = useState("");

  function openImage(src) {

    setSelectedImage(src);

    setFullscreen(true);

  }

  function downloadImage() {

    const link = document.createElement("a");

    link.href = `${API}/${annotated}`;

    link.download = "VisionDesk_Result.jpg";

    link.click();

  }

  return (

    <>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">

        {/* Original */}

        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 shadow-xl">

          <div className="flex items-center justify-between border-b border-slate-800 p-5">

            <div className="flex items-center gap-3">

              <Image
                className="text-blue-400"
                size={28}
              />

              <h2 className="text-2xl font-bold text-white">

                Original Image

              </h2>

            </div>

            <button

              onClick={() => openImage(original)}

              className="rounded-lg bg-slate-800 p-2 hover:bg-slate-700"

            >

              <Maximize2 className="text-white" />

            </button>

          </div>

          <div className="overflow-hidden">

            <img

              src={original}

              alt="Original"

              className="h-[450px] w-full cursor-pointer object-contain transition duration-500 hover:scale-105"

              onClick={() => openImage(original)}

            />

          </div>

          <div className="border-t border-slate-800 bg-slate-900 p-4">

            <p className="text-sm text-slate-400">

              Uploaded Image

            </p>

          </div>

        </div>

        {/* Detection */}

        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 shadow-xl">

          <div className="flex items-center justify-between border-b border-slate-800 p-5">

            <div className="flex items-center gap-3">

              <ScanSearch
                className="text-green-400"
                size={28}
              />

              <h2 className="text-2xl font-bold text-white">

                AI Detection

              </h2>

            </div>

            <div className="flex gap-3">

              <button

                onClick={downloadImage}

                className="rounded-lg bg-green-600 p-2 hover:bg-green-700"

              >

                <Download
                  className="text-white"
                />

              </button>

              <button

                onClick={() => openImage(`${API}/${annotated}`)}

                className="rounded-lg bg-slate-800 p-2 hover:bg-slate-700"

              >

                <Maximize2 className="text-white" />

              </button>

            </div>

          </div>

          <div className="overflow-hidden">

            <img

              src={`${API}/${annotated}`}

              alt="Detection"

              className="h-[450px] w-full cursor-pointer object-contain transition duration-500 hover:scale-105"

              onClick={() =>

                openImage(`${API}/${annotated}`)

              }

            />

          </div>

          <div className="border-t border-slate-800 bg-slate-900 p-4">

            <p className="text-sm text-green-400">

              YOLOv11 PPE Detection Result

            </p>

          </div>

        </div>

      </div>

      {fullscreen && (

        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 p-10">

          <button

            onClick={() => setFullscreen(false)}

            className="absolute right-8 top-8 rounded-full bg-red-600 p-3 hover:bg-red-700"

          >

            <X className="text-white" />

          </button>

          <img

            src={selectedImage}

            alt="Fullscreen"

            className="max-h-full max-w-full rounded-2xl border border-slate-700 shadow-2xl"

          />

        </div>

      )}

    </>

  );

}