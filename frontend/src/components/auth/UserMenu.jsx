import { useNavigate } from "react-router-dom";

export default function UserMenu() {

  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  function logout() {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    navigate("/login");

  }

  return (

    <div className="flex items-center gap-4">

      <div className="text-right">

        <p className="font-semibold text-white">

          {user.name || "User"}

        </p>

        <p className="text-xs text-slate-400">

          {user.email || ""}

        </p>

      </div>

      <button
        onClick={logout}
        className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
      >

        Logout

      </button>

    </div>

  );

}