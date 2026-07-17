import { useState } from "react";
import { uploadImage } from "@/services/uploadService";
import { detectLatest } from "@/services/detectionService";

export default function Upload() {

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  function handleSelect(event) {

    const selected = event.target.files[0];

    if (!selected) return;

    setFile(selected);

    setPreview(URL.createObjectURL(selected));
  }

  async function handleUpload() {

    if (!file) {

      alert("Please choose an image.");

      return;
    }

    setLoading(true);

    try {

      await uploadImage(file);

      const detection = await detectLatest();

      setResult(detection);

    } catch (error) {

      console.error(error);

      alert("Upload failed.");

    }

    setLoading(false);
  }

  return (

    <div className="min-h-screen bg-slate-950 text-white p-10">

      <h1 className="text-4xl font-bold mb-8">

        Upload Image

      </h1>

      <input
        type="file"
        accept="image/*"
        onChange={handleSelect}
      />

      {preview && (

        <div className="mt-8">

          <img
            src={preview}
            alt="Preview"
            className="rounded-xl w-96"
          />

        </div>

      )}

      <button
        onClick={handleUpload}
        className="mt-8 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg"
      >

        Upload & Detect

      </button>

      {loading && (

        <p className="mt-6">

          AI is analyzing the image...

        </p>

      )}

      {result && (

        <div className="mt-8 bg-slate-900 p-6 rounded-xl">

          <h2 className="text-2xl font-bold mb-4">

            Detection Result

          </h2>

          <p>

            File: {result.filename}

          </p>

          <p>

            Objects: {result.count}

          </p>

        </div>

      )}

    </div>

  );

}