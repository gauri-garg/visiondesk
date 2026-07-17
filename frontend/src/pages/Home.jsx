import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "@/components/common/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Stats from "@/components/landing/Stats";
import Footer from "@/components/common/Footer";

export default function Home() {

  const navigate = useNavigate();

  useEffect(() => {

    const token = localStorage.getItem("token");

    const user = localStorage.getItem("user");

    if (token && user) {

      navigate("/dashboard", {
        replace: true,
      });

    }

  }, [navigate]);

  return (

    <div className="min-h-screen bg-slate-950 text-white">

      <Navbar />

      <Hero />

      <Stats />

      <Features />

      <Footer />

    </div>

  );

}