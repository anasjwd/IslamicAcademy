import React, { useEffect } from "react";
import { useState } from "react";
import Navbar from "./Components/Navbar/Navbar";
import Hero from "./Components/Hero/Hero"
import Stats from "./Components/Stats/Stats"
import Programs from "./Components/Programs/Programs"
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
        <Navbar theme={theme} setTheme={setTheme} />
        <Hero/>
      <Stats/>
      </div>
      <Programs/>
    </div>
  );
};

export default App;
