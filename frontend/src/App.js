import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="d-flex flex-column min-vh-100 bg-light text-dark">
      <Header />
      <main className="container flex-grow-1">
        <Outlet /> {/* This will render the correct page based on routing */}
      </main>
      <Footer />
    </div>
  );
}

export default App;
