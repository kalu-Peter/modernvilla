import React from "react";

const WhatsAppFloat: React.FC = () => (
  <>
    <style>{`
      .whatsapp-float {
        position: fixed;
        bottom: 30px;
        right: 30px;
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 10px;
        text-decoration: none;
        animation: wa-fadein 1s ease 1s forwards;
        opacity: 0;
      }
      @keyframes wa-fadein { to { opacity: 1; } }

      .whatsapp-label {
        background: #fff;
        color: #128c7e;
        font-family: 'Josefin Sans', sans-serif;
        font-size: 0.7rem;
        font-weight: 600;
        letter-spacing: 0.08em;
        padding: 8px 14px;
        border-radius: 4px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.18);
        white-space: nowrap;
        opacity: 0;
        transform: translateX(10px);
        transition: opacity 0.3s, transform 0.3s;
        pointer-events: none;
      }
      .whatsapp-float:hover .whatsapp-label {
        opacity: 1;
        transform: translateX(0);
      }
      .whatsapp-btn {
        width: 58px;
        height: 58px;
        border-radius: 50%;
        background: #25d366;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 20px rgba(37,211,102,0.45);
        transition: transform 0.3s, box-shadow 0.3s;
        flex-shrink: 0;
      }
      .whatsapp-float:hover .whatsapp-btn {
        transform: scale(1.1);
        box-shadow: 0 6px 28px rgba(37,211,102,0.65);
      }
      .whatsapp-btn svg { width: 30px; height: 30px; fill: #fff; }
    `}</style>

    <a
      className="whatsapp-float"
      href="https://wa.me/254715510119"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
    >
      <span className="whatsapp-label">Chat with us</span>
      <span className="whatsapp-btn">
        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C7.163 0 0 7.163 0 16c0 2.822.737 5.469 2.027 7.773L0 32l8.473-2.007A15.938 15.938 0 0 0 16 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.27 13.27 0 0 1-6.77-1.853l-.485-.29-5.027 1.19 1.213-4.903-.317-.503A13.267 13.267 0 0 1 2.667 16C2.667 8.636 8.636 2.667 16 2.667S29.333 8.636 29.333 16 23.364 29.333 16 29.333zm7.27-9.87c-.397-.2-2.352-1.16-2.717-1.293-.364-.133-.63-.2-.896.2-.265.397-1.03 1.293-1.262 1.56-.232.265-.464.298-.86.1-.397-.2-1.676-.617-3.192-1.97-1.18-1.052-1.977-2.352-2.208-2.748-.232-.397-.025-.612.174-.81.179-.178.397-.464.596-.696.2-.232.265-.397.397-.663.133-.265.067-.497-.033-.696-.1-.2-.896-2.16-1.228-2.958-.323-.775-.65-.67-.896-.683l-.763-.013c-.265 0-.696.1-1.06.497-.364.397-1.393 1.36-1.393 3.317s1.427 3.847 1.626 4.113c.2.265 2.807 4.287 6.803 6.013.95.41 1.692.655 2.27.838.953.303 1.82.26 2.506.158.764-.114 2.352-.962 2.683-1.89.33-.928.33-1.724.232-1.89-.1-.165-.364-.265-.762-.464z" />
        </svg>
      </span>
    </a>
  </>
);

export default WhatsAppFloat;
