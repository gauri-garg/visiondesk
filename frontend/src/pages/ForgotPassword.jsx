import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ForgotPassword() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  async function handleReset(e) {

    e.preventDefault();

    setMessage("");

    setError("");

    try {

      const res = await axios.post(

        "http://127.0.0.1:8000/api/auth/reset-password",

        {

          email,

          password,

        }

      );

      setMessage(res.data.message);

      setTimeout(() => {

        navigate("/login");

      }, 2000);

    } catch (err) {

      setError(

        err.response?.data?.detail ||

        "Reset failed."

      );

    }

  }

  return (

    <div className="min-h-screen bg-slate-950 flex items-center justify-center">

      <div className="w-full max-w-md rounded-2xl bg-slate-900 p-10">

        <h1 className="text-3xl font-bold text-white">

          Forgot Password

        </h1>

        <p className="mt-2 text-slate-400">

          Reset your account password

        </p>

        <form
          onSubmit={handleReset}
          className="mt-8 space-y-5"
        >

          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            className="w-full rounded-lg bg-slate-800 p-3 text-white"
          />

          <input
            type="password"
            required
            placeholder="New Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            className="w-full rounded-lg bg-slate-800 p-3 text-white"
          />

          {message && (

            <div className="rounded-lg bg-green-800 p-3 text-white">

              {message}

            </div>

          )}

          {error && (

            <div className="rounded-lg bg-red-800 p-3 text-white">

              {error}

            </div>

          )}

          <button
            className="w-full rounded-lg bg-blue-600 py-3 hover:bg-blue-700"
          >

            Reset Password

          </button>

        </form>

        <div className="mt-6">

          <Link
            to="/login"
            className="text-blue-400"
          >

            Back to Login

          </Link>

        </div>

      </div>

    </div>

  );

}