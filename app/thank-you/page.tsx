"use client";

import { useEffect } from "react";

export default function ThankYou() {
  useEffect(() => {
    const colors = ["#f94144", "#f3722c", "#f8961e", "#f9c74f", "#90be6d", "#43aa8b", "#577590"];
    const count = 150;
    const created: HTMLElement[] = [];

    for (let i = 0; i < count; i++) {
      const el = document.createElement("div");
      const size = Math.random() * 10 + 5;
      el.style.cssText = `
        position:fixed;width:${size}px;height:${size}px;
        background-color:${colors[Math.floor(Math.random() * colors.length)]};
        left:${Math.random() * 100}vw;top:-20px;opacity:1;
        border-radius:${Math.random() > 0.5 ? "50%" : "2px"};
        pointer-events:none;z-index:9999;
      `;
      document.body.appendChild(el);
      created.push(el);

      const duration = Math.random() * 3 + 2;
      const delay = Math.random() * 0.5;
      const xDrift = Math.random() * 100 - 50;

      el.animate(
        [
          { top: "-20px", opacity: 1, transform: `translateX(0) rotate(0deg)` },
          { top: "110vh", opacity: 0, transform: `translateX(${xDrift}px) rotate(${Math.random() * 360}deg)` },
        ],
        { duration: duration * 1000, delay: delay * 1000, fill: "forwards", easing: "ease-in" }
      );

      setTimeout(() => el.remove(), (duration + delay + 0.5) * 1000);
    }

    return () => created.forEach((el) => el.remove());
  }, []);

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        body { background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); min-height: 100vh; display: flex; justify-content: center; align-items: center; padding: 20px; }
        .thank-you-container { background-color: white; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); width: 100%; max-width: 500px; padding: 40px; text-align: center; opacity: 0; transform: translateY(20px); animation: fadeIn 0.8s ease-out forwards; }
        @keyframes fadeIn { to { opacity: 1; transform: translateY(0); } }
        .success-icon { width: 100px; height: 100px; margin: 0 auto 30px; border-radius: 50%; background-color: #f0f9f4; display: flex; justify-content: center; align-items: center; }
        .checkmark { width: 50px; height: 50px; position: relative; }
        .checkmark-circle { stroke-dasharray: 166; stroke-dashoffset: 166; stroke-width: 2; stroke-miterlimit: 10; stroke: #4caf50; fill: none; animation: stroke 0.6s cubic-bezier(0.65,0,0.45,1) forwards; }
        .checkmark-check { transform-origin: 50% 50%; stroke-dasharray: 48; stroke-dashoffset: 48; animation: stroke 0.3s cubic-bezier(0.65,0,0.45,1) 0.8s forwards; }
        @keyframes stroke { 100% { stroke-dashoffset: 0; } }
        h1 { color: #333; font-size: 2.2rem; margin-bottom: 16px; }
        p { color: #666; font-size: 1.1rem; line-height: 1.6; margin-bottom: 30px; }
        .btn { background-color: #4caf50; color: white; border: none; padding: 12px 28px; border-radius: 50px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; display: inline-block; text-decoration: none; }
        .btn:hover { background-color: #3d9140; transform: translateY(-2px); box-shadow: 0 5px 15px rgba(76,175,80,0.3); }
        @media (max-width: 600px) {
          .thank-you-container { padding: 30px 20px; }
          h1 { font-size: 1.8rem; }
          p { font-size: 1rem; }
          .success-icon { width: 80px; height: 80px; margin-bottom: 20px; }
          .checkmark { width: 40px; height: 40px; }
        }
      `}</style>

      <div className="thank-you-container">
        <div className="success-icon">
          <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
            <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" stroke="#4caf50" strokeWidth="3" />
          </svg>
        </div>
        <h1>Thank You!</h1>
        <p>
          Your form has been successfully submitted. We appreciate your interest
          and will get back to you shortly.
        </p>
        <a href="/" className="btn">Return to Home</a>
      </div>
    </>
  );
}
