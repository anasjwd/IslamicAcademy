import React, { useEffect } from "react";
import { useState } from "react";
import Navbar from "./Components/Navbar/Navbar";
import Hero from "./Components/Hero/Hero"
import Stats from "./Components/Stats/Stats"
import Programs from "./Components/Programs/Programs"
import backgroundVideo from "./assets/background.mp4"
import './App.css'

const App = () => {
  const current_theme = localStorage.getItem("current_theme");
  const [theme, setTheme] = useState(current_theme ? current_theme : 'light');
  useEffect(() => {
    localStorage.setItem("current_theme", theme);
  }, [theme]);

  return (
    <div>
      <div className={`container ${theme}`}>
        <video className="video-background" autoPlay loop muted playsInline>
          <source src={backgroundVideo} type="video/mp4" />
        </video>
        <div className="video-overlay"></div>
        <Navbar theme={theme} setTheme={setTheme} />
        <Hero/>
      </div>
      <Programs/>
    </div>
  );
};

export default App;
