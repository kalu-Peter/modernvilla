import React from "react";
import { useTranslation } from "react-i18next";

const TopBar: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <style>{`
        .topbar {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 101;
          height: 42px;
          background: #fff;
          border-bottom: 1px solid rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 28px;
          padding: 0 40px;
        }
        .topbar-item {
          display: flex;
          align-items: center;
          gap: 7px;
          font-family: 'Inter', sans-serif;
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.03em;
          color: rgba(10,10,10,0.5);
          text-decoration: none;
          white-space: nowrap;
          transition: color 0.2s;
        }
        .topbar-item:hover { color: #1a1a2e; }
        .topbar-divider { width: 1px; height: 14px; background: rgba(0,0,0,0.15); }
        @media (max-width: 768px) {
          .topbar { gap: 4px; padding: 8px 16px; flex-direction: column; align-items: center; height: 64px; justify-content: center; }
          .topbar-item { font-size: 0.65rem; }
          .topbar-divider { display: none; }
        }
      `}</style>
      <div className="topbar">
        <span className="topbar-item topbar-addr">📍 {t("topbar.address")}</span>
        <span className="topbar-divider"></span>
        <a href="tel:+33601943348" className="topbar-item">
          ☎ +33 6 01 94 33 48
        </a>
      </div>
    </>
  );
};

export default TopBar;
