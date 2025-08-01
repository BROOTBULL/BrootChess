import { useNavigate } from "react-router-dom";
import { Trasition } from "../transition";
import axios from "axios";
import { useState } from "react";
import { useUserContext } from "../hooks/contextHook";

const SignUpPage = () => {
  const navigate = useNavigate();
  const { setUser } = useUserContext();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [strength, setStrength] = useState(0);
  const [error, setError] = useState<string | null>(null);

  function calculateStrength(password: string): number {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === "password") {
      setStrength(calculateStrength(value));
    }
  };

  async function handleSubmit(e: React.MouseEvent<HTMLElement>) {
    e.preventDefault();
    const emailError = validateEmail(formData.email);
    if (emailError) {
      setError(emailError);

      // Auto-clear error after 3 seconds (3000 ms)
      setTimeout(() => {
        setError(null);
      }, 3000);

      return;
    }

    const UserInput = await axios.post("/auth/signUp", formData);
    setUser(UserInput.data);
    console.log("SignUp response:", UserInput);
  }

  async function handleGuest(e: React.MouseEvent<HTMLElement>) {
    e.preventDefault();
    const guestInput = await axios.post("/auth/signUpGuest", {
      name: "Guest123",
    });
    setUser(guestInput.data);
    console.log("response:", guestInput);
  }

  async function handleGoogle(e: React.MouseEvent<HTMLElement>) {
    e.preventDefault();
    const response = window.open(`https://broot-chess-backend.onrender.com/auth/google`, "_self");
    console.log("response", response);
  }

  function validateEmail(email: string): string | null {
    if (!email.trim()) return "Email is required";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";

    return null; // No error
  }

  return (
    <>
      <img
        onClick={() => navigate("/")}
        className="absolute h-6 w-6 md:h-8 md:w-8 lg:h-12 lg:w-12 m-5 drop-shadow-lg "
        src="../../public/media/back.png"
        alt="back button"
      />

      <div className="absolute flex flex-row h-full w-full -z-12  ">
        <div className="flex flex-col justify-center items-center bg-gradient-to-r from-zinc-300 to-zinc-100 backdrop-blur-md h-full w-full md:w-[56%] -z-10 ">
          {error && (
            <div className="bg-red-400 h-10 w-[60%] rounded-lg absolute top-0 mt-5 text-center p-2 text-white ">
              {error}
            </div>
          )}

          <img
            className="h-10 w-6 md:h-14 md:w-9 lg:h-18 lg:w-10 drop-shadow-lg/40 "
            src="../../public/media/Broot.png"
            alt="Broot"
          />
          <span className="text-[40px] flex md:text-[55px] items-end lg:text-[60px] font-serif text-zinc-950 font-[600]  drop-shadow-lg/40">
            SignUp
          </span>
          <div className="w-[80%] h-fit flex m-3 text-center justify-center items-center">
            <form className="flex flex-col " action="">
              <span className="text-[20px] mb-15 md:text-[22px] items-end lg:text-[26px] font-serif text-zinc-800 font-[600] drop-shadow-lg">
                Enter your email and a password
              </span>
              <div className="bg-white pl-2 rounded-t-lg">
                <input
                  className="emailInput w-full h-12 lg:h-14 lg:text-[18px] p-2 focus:outline-none"
                  placeholder="Email"
                  type="text"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="off"
                />
              </div>
              <div className="bg-white pl-2">
                <input
                  className="UserInput w-full h-12 lg:h-14 lg:text-[18px] p-2 focus:outline-none"
                  placeholder="Username"
                  type="text"
                  name="username"
                  id="username"
                  value={formData.username}
                  onChange={handleChange}
                  autoComplete="off"
                />
              </div>
              <div className="bg-white pl-2 rounded-b-lg">
                <input
                  className="passInput w-full h-12 lg:h-14 lg:text-[18px] p-2 focus:outline-none"
                  placeholder="Password"
                  type="password"
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="off"
                />
              </div>
              <div className="h-2 mt-1 w-full rounded px-1">
                <div
                  className={`h-full rounded transition-all duration-300 ${
                    strength === 1
                      ? "bg-red-500 w-1/4"
                      : strength === 2
                      ? "bg-yellow-500 w-1/2"
                      : strength === 3
                      ? "bg-blue-500 w-3/4"
                      : strength === 4
                      ? "bg-green-500 w-full"
                      : "w-0"
                  }`}
                ></div>
              </div>
              <span className="text-xs text-zinc-700">
                {strength === 0 && ""}
                {strength === 1 && "Weak"}
                {strength === 2 && "Medium"}
                {strength === 3 && "Strong"}
                {strength === 4 && "Very Strong"}
              </span>

              <button
                onClick={(e) => handleSubmit(e)}
                className="playButton text-center text-[20px] md:text-[25px] lg:text-[30px] md:px-15 lg:px-20 h-fit items-center  bg-zinc-800 px-10 py-2 my-2 rounded-lg shadow-lg/30 text-zinc-100 font-serif cursor-pointer hover:shadow-white "
              >
                Submit
              </button>
            </form>
          </div>
          <div className=" items-end text-sm font-serif text-zinc-800 font-[600] drop-shadow-lg">
            Play as guest OR signup with Google
          </div>
          <div className="flex flex-row w-[80%]">
            <button
              onClick={(e) => handleGuest(e)}
              className="flex text-[15px] md:text-[18px] w-full lg:text-[22px] md:px-5 lg:px-10 h-fit justify-center items-center  bg-zinc-500 px-10 py-2 m-3 shadow-lg/30 text-zinc-100 font-serif cursor-pointer hover:shadow-white "
            >
              <span> Guest</span>
            </button>
            <button
              onClick={(e) => handleGoogle(e)}
              className="flex text-[15px] md:text-[18px] w-full lg:text-[22px] md:px-5 lg:px-10 h-fit justify-center items-center  bg-zinc-500 px-10 py-2 m-3 shadow-lg/30 text-zinc-100 font-serif cursor-pointer hover:shadow-white "
            >
              <img
                className="h-4 w-4 mr-3 drop-shadow-sm"
                src="../public/media/google.png"
                alt="google"
              />
              <span> Google</span>
            </button>
          </div>
          <span className="text-[12px] font-serif text-zinc-600">
            If already signed In ....Try{" "}
            <span
              className="text-blue-950 cursor-pointer"
              onClick={() => navigate("/login")}
            >
              LogIn
            </span>
          </span>
        </div>
      </div>
    </>
  );
};

export default Trasition(SignUpPage);
