import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

import { login } from "@/services/authService";
import LoadingScreen from "@/components/loading/LoadingScreen";

export default function LoginCard() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [showLoader, setShowLoader] = useState(false);

  const [error, setError] = useState("");

  async function handleLogin(e) {

    e.preventDefault();

    setError("");

    setLoading(true);

    try {

      const response = await login(email, password);

      localStorage.setItem(
        "token",
        response.access_token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(response.user)
      );

      setLoading(false);

      setShowLoader(true);

      setTimeout(() => {

        navigate("/dashboard");

      }, 2500);

    } catch (err) {

      setLoading(false);

      setError(

        err.response?.data?.detail ||

        "Invalid email or password."

      );

    }

  }

  if (showLoader) {

    return <LoadingScreen />;

  }

  return (

    <div className="w-full max-w-xl">

      <div className="rounded-3xl border border-slate-700 bg-slate-900/70 backdrop-blur-xl shadow-2xl">

        {/* Header */}

        <div className="px-12 pt-12">

          <h1 className="text-5xl font-bold text-white">

            Welcome Back 👋

          </h1>

          <p className="mt-4 text-lg text-slate-400">

            Sign in to continue using VisionDesk AI

          </p>

        </div>

        {/* Form */}

        <form
          onSubmit={handleLogin}
          className="space-y-8 px-12 py-12"
        >

          {/* Email */}

          <div>

            <label className="mb-3 block text-base font-medium text-slate-300">

              Email Address

            </label>

            <div className="relative">

              <Mail
                size={22}
                className="absolute left-5 top-5 text-slate-400"
              />

              <input

                type="email"

                required

                value={email}

                onChange={(e)=>setEmail(e.target.value)}

                placeholder="Enter your email"

                className="w-full rounded-2xl border border-slate-700 bg-slate-800 py-5 pl-14 pr-5 text-lg text-white outline-none transition focus:border-blue-500"

              />

            </div>

          </div>

          {/* Password */}

          <div>

            <label className="mb-3 block text-base font-medium text-slate-300">

              Password

            </label>

            <div className="relative">

              <Lock
                size={22}
                className="absolute left-5 top-5 text-slate-400"
              />

              <input

                type={

                  showPassword

                    ? "text"

                    : "password"

                }

                required

                value={password}

                onChange={(e)=>setPassword(e.target.value)}

                placeholder="Enter your password"

                className="w-full rounded-2xl border border-slate-700 bg-slate-800 py-5 pl-14 pr-14 text-lg text-white outline-none transition focus:border-blue-500"

              />

              <button

                type="button"

                onClick={()=>

                  setShowPassword(!showPassword)

                }

                className="absolute right-5 top-5 text-slate-400 hover:text-white"

              >

                {

                  showPassword

                    ?

                    <EyeOff size={22}/>

                    :

                    <Eye size={22}/>

                }

              </button>

            </div>

          </div>

          {/* Remember */}

          <div className="flex items-center justify-between">

            <label className="flex items-center gap-3 text-slate-300">

              <input type="checkbox" />

              Remember Me

            </label>

            <Link

              to="/forgot-password"

              className="text-blue-400 hover:text-blue-300"

            >

              Forgot Password?

            </Link>

          </div>

          {/* Error */}

          {

            error &&

            <div className="rounded-xl bg-red-900/40 p-4 text-red-300">

              {error}

            </div>

          }

          {/* Login */}

          <button

            disabled={loading}

            className="w-full rounded-2xl bg-blue-600 py-5 text-lg font-semibold text-white transition hover:bg-blue-700"

          >

            {

              loading

                ?

                "Signing In..."

                :

                "Login"

            }

          </button>

          <div className="pt-4 text-center text-slate-400">

            Don't have an account?

            <Link

              to="/register"

              className="ml-2 font-semibold text-blue-400 hover:text-blue-300"

            >

              Register

            </Link>

          </div>

        </form>

      </div>

    </div>

  );

}