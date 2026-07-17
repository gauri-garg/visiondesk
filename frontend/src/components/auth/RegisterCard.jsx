import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

import { register } from "@/services/authService";

export default function RegisterCard() {

  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  async function handleRegister(e) {

    e.preventDefault();

    setError("");

    if (password !== confirmPassword) {

      setError("Passwords do not match.");

      return;

    }

    setLoading(true);

    try {

      await register(

        fullName,

        email,

        password

      );

      navigate("/login");

    } catch (err) {

      setError(

        err.response?.data?.detail ||

        "Registration failed."

      );

    }

    setLoading(false);

  }

  return (

    <div className="w-full max-w-xl">

      <div className="rounded-3xl border border-slate-700 bg-slate-900/70 backdrop-blur-xl shadow-2xl">

        {/* Header */}

        <div className="px-12 pt-12">

          <h1 className="text-5xl font-bold text-white">

            Create Account 🚀

          </h1>

          <p className="mt-4 text-lg text-slate-400">

            Create your VisionDesk AI account

          </p>

        </div>

        {/* Form */}

        <form

          onSubmit={handleRegister}

          className="space-y-8 px-12 py-12"

        >

          {/* Full Name */}

          <div>

            <label className="mb-3 block text-base font-medium text-slate-300">

              Full Name

            </label>

            <div className="relative">

              <User

                size={22}

                className="absolute left-5 top-5 text-slate-400"

              />

              <input

                required

                value={fullName}

                onChange={(e)=>setFullName(e.target.value)}

                placeholder="Enter your full name"

                className="w-full rounded-2xl border border-slate-700 bg-slate-800 py-5 pl-14 pr-5 text-lg text-white outline-none transition focus:border-blue-500"

              />

            </div>

          </div>

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

                required

                type="email"

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

                required

                type={showPassword ? "text":"password"}

                value={password}

                onChange={(e)=>setPassword(e.target.value)}

                placeholder="Create a password"

                className="w-full rounded-2xl border border-slate-700 bg-slate-800 py-5 pl-14 pr-14 text-lg text-white outline-none transition focus:border-blue-500"

              />

              <button

                type="button"

                onClick={()=>setShowPassword(!showPassword)}

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

          {/* Confirm Password */}

          <div>

            <label className="mb-3 block text-base font-medium text-slate-300">

              Confirm Password

            </label>

            <div className="relative">

              <Lock

                size={22}

                className="absolute left-5 top-5 text-slate-400"

              />

              <input

                required

                type={showConfirm ? "text":"password"}

                value={confirmPassword}

                onChange={(e)=>setConfirmPassword(e.target.value)}

                placeholder="Confirm your password"

                className="w-full rounded-2xl border border-slate-700 bg-slate-800 py-5 pl-14 pr-14 text-lg text-white outline-none transition focus:border-blue-500"

              />

              <button

                type="button"

                onClick={()=>setShowConfirm(!showConfirm)}

                className="absolute right-5 top-5 text-slate-400 hover:text-white"

              >

                {

                  showConfirm

                  ?

                  <EyeOff size={22}/>

                  :

                  <Eye size={22}/>

                }

              </button>

            </div>

          </div>

          {error && (

            <div className="rounded-xl bg-red-900/40 p-4 text-red-300">

              {error}

            </div>

          )}

          <button

            disabled={loading}

            className="w-full rounded-2xl bg-blue-600 py-5 text-lg font-semibold text-white transition hover:bg-blue-700"

          >

            {

              loading

                ?

                "Creating Account..."

                :

                "Create Account"

            }

          </button>

          <div className="pt-4 text-center text-slate-400">

            Already have an account?

            <Link

              to="/login"

              className="ml-2 font-semibold text-blue-400 hover:text-blue-300"

            >

              Login

            </Link>

          </div>

        </form>

      </div>

    </div>

  );

}