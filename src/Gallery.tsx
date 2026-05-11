import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import SEO from "./components/SEO";

const Gallery: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>("aloe");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0)
        setViewerIndex((i) => Math.min(i + 1, currentImages.length - 1));
      else setViewerIndex((i) => Math.max(i - 1, 0));
    }
    touchStartX.current = null;
  };

  const galleryData = {
    aloe: [
      { src: "/images/The Aloe Refuge/IMG_20201002_161720.jpg", alt: "The Aloe Refuge" },
      { src: "/images/The Aloe Refuge/IMG_20201002_161747.jpg", alt: "The Aloe Refuge" },
      { src: "/images/The Aloe Refuge/IMG_20201002_161757.jpg", alt: "The Aloe Refuge" },
      { src: "/images/The Aloe Refuge/IMG_20201002_161900.jpg", alt: "The Aloe Refuge" },
      { src: "/images/The Aloe Refuge/IMG_20201002_163012.jpg", alt: "The Aloe Refuge" },
      { src: "/images/The Aloe Refuge/IMG_20201002_163024.jpg", alt: "The Aloe Refuge" },
      { src: "/images/The Aloe Refuge/IMG_20201002_163508.jpg", alt: "The Aloe Refuge" },
      { src: "/images/The Aloe Refuge/IMG_20201002_163539.jpg", alt: "The Aloe Refuge" },
      { src: "/images/The Aloe Refuge/IMG_20201002_163623.jpg", alt: "The Aloe Refuge" },
      { src: "/images/The Aloe Refuge/IMG_20201002_163644.jpg", alt: "The Aloe Refuge" },
      { src: "/images/The Aloe Refuge/IMG_20201002_163722.jpg", alt: "The Aloe Refuge" },
      { src: "/images/The Aloe Refuge/IMG_20201002_165212.jpg", alt: "The Aloe Refuge" },
      { src: "/images/The Aloe Refuge/IMG_20201002_165253.jpg", alt: "The Aloe Refuge" },
      { src: "/images/The Aloe Refuge/IMG_20201002_165335.jpg", alt: "The Aloe Refuge" },
      { src: "/images/The Aloe Refuge/IMG_20201002_165339.jpg", alt: "The Aloe Refuge" },
      { src: "/images/The Aloe Refuge/IMG_20201002_165353.jpg", alt: "The Aloe Refuge" },
      { src: "/images/The Aloe Refuge/IMG_20201002_165514.jpg", alt: "The Aloe Refuge" },
      { src: "/images/The Aloe Refuge/IMG-20241104-WA0003.jpg", alt: "The Aloe Refuge" },
      { src: "/images/The Aloe Refuge/IMG-20241104-WA0004.jpg", alt: "The Aloe Refuge" },
      { src: "/images/The Aloe Refuge/IMG-20241104-WA0005.jpg", alt: "The Aloe Refuge" },
      { src: "/images/The Aloe Refuge/IMG-20241104-WA0006.jpg", alt: "The Aloe Refuge" },
      { src: "/images/The Aloe Refuge/IMG-20241104-WA0008.jpg", alt: "The Aloe Refuge" },
      { src: "/images/The Aloe Refuge/IMG-20241104-WA0009.jpg", alt: "The Aloe Refuge" },
      { src: "/images/The Aloe Refuge/IMG-20241104-WA0010.jpg", alt: "The Aloe Refuge" },
      { src: "/images/The Aloe Refuge/IMG-20241104-WA0011.jpg", alt: "The Aloe Refuge" },
      { src: "/images/The Aloe Refuge/IMG-20241104-WA0012.jpg", alt: "The Aloe Refuge" },
      { src: "/images/The Aloe Refuge/IMG-20241104-WA0013.jpg", alt: "The Aloe Refuge" },
      { src: "/images/The Aloe Refuge/IMG-20241104-WA0014.jpg", alt: "The Aloe Refuge" },
      { src: "/images/The Aloe Refuge/IMG-20241104-WA0015.jpg", alt: "The Aloe Refuge" },
      { src: "/images/The Aloe Refuge/IMG-20241104-WA0016.jpg", alt: "The Aloe Refuge" },
      { src: "/images/The Aloe Refuge/IMG-20241104-WA0017.jpg", alt: "The Aloe Refuge" },
      { src: "/images/The Aloe Refuge/IMG-20241105-WA0045.jpg", alt: "The Aloe Refuge" },
      { src: "/images/The Aloe Refuge/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (135).jpg", alt: "The Aloe Refuge" },
      { src: "/images/The Aloe Refuge/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (136).jpg", alt: "The Aloe Refuge" },
      { src: "/images/The Aloe Refuge/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (137).jpg", alt: "The Aloe Refuge" },
      { src: "/images/The Aloe Refuge/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (138).jpg", alt: "The Aloe Refuge" },
      { src: "/images/The Aloe Refuge/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (139).jpg", alt: "The Aloe Refuge" },
      { src: "/images/The Aloe Refuge/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (140).jpg", alt: "The Aloe Refuge" },
      { src: "/images/The Aloe Refuge/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (141).jpg", alt: "The Aloe Refuge" },
    ],
    modernhouse: [
      { src: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (7).jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (50).jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (51).jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (52).jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (53).jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (54).jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (55).jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (56).jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (57).jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (58).jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (59).jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (60).jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (61).jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (62).jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (63).jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (64).jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (65).jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (67).jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (70).jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (71).jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (73).jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (74).jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (75).jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (76).jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (77).jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (78).jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (79).jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (80).jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (81).jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (82).jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (83).jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (84).jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (85).jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (86).jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (87).jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (88).jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (89).jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (90).jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (91).jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (92).jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (93).jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (94).jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (95).jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (96).jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (97).jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (99).jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (101).jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (103).jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (105).jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (107).jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (109).jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (110).jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (112).jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (114).jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-47.jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-50.jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-52.jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-54.jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-56.jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-58.jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-61.jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-63.jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-65.jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-67.jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-69.jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-70.jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-74.jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-76.jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-78.jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-81.jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-83.jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-85.jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-87.jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-89.jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-90.jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-92.jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-94.jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-96.jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-98.jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-101.jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-103.jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-105.jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-107.jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-109.jpg", alt: "The Modern House" },
      { src: "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-110.jpg", alt: "The Modern House" },
    ],
    pinemarten: [
      { src: "/images/The Pine Marten Refuge/IMG_20210618_102853.jpg", alt: "The Pine Marten Refuge" },
      { src: "/images/The Pine Marten Refuge/IMG_20211113_091044.jpg", alt: "The Pine Marten Refuge" },
      { src: "/images/The Pine Marten Refuge/IMG_20211114_163234.jpg", alt: "The Pine Marten Refuge" },
      { src: "/images/The Pine Marten Refuge/IMG_20211114_163258.jpg", alt: "The Pine Marten Refuge" },
      { src: "/images/The Pine Marten Refuge/IMG-20191224-WA0002.jpg", alt: "The Pine Marten Refuge" },
      { src: "/images/The Pine Marten Refuge/PANO_20210618_102952.jpg", alt: "The Pine Marten Refuge" },
      { src: "/images/The Pine Marten Refuge/PANO_20210618_103026.jpg", alt: "The Pine Marten Refuge" },
      { src: "/images/The Pine Marten Refuge/PANO_20210618_225432.jpg", alt: "The Pine Marten Refuge" },
      { src: "/images/The Pine Marten Refuge/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  bd-0005.jpg", alt: "The Pine Marten Refuge" },
      { src: "/images/The Pine Marten Refuge/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  bd-0007.jpg", alt: "The Pine Marten Refuge" },
      { src: "/images/The Pine Marten Refuge/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  bd-0014.jpg", alt: "The Pine Marten Refuge" },
      { src: "/images/The Pine Marten Refuge/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  bd-0019.jpg", alt: "The Pine Marten Refuge" },
      { src: "/images/The Pine Marten Refuge/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  bd-0054.jpg", alt: "The Pine Marten Refuge" },
      { src: "/images/The Pine Marten Refuge/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  bd-0080.jpg", alt: "The Pine Marten Refuge" },
      { src: "/images/The Pine Marten Refuge/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  bd-0083.jpg", alt: "The Pine Marten Refuge" },
      { src: "/images/The Pine Marten Refuge/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  bd-9979.jpg", alt: "The Pine Marten Refuge" },
      { src: "/images/The Pine Marten Refuge/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  bd-9990.jpg", alt: "The Pine Marten Refuge" },
      { src: "/images/The Pine Marten Refuge/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-21.jpg", alt: "The Pine Marten Refuge" },
      { src: "/images/The Pine Marten Refuge/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-24.jpg", alt: "The Pine Marten Refuge" },
      { src: "/images/The Pine Marten Refuge/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-25.jpg", alt: "The Pine Marten Refuge" },
      { src: "/images/The Pine Marten Refuge/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-26.jpg", alt: "The Pine Marten Refuge" },
      { src: "/images/The Pine Marten Refuge/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-27.jpg", alt: "The Pine Marten Refuge" },
      { src: "/images/The Pine Marten Refuge/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-28.jpg", alt: "The Pine Marten Refuge" },
      { src: "/images/The Pine Marten Refuge/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-29.jpg", alt: "The Pine Marten Refuge" },
      { src: "/images/The Pine Marten Refuge/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-30.jpg", alt: "The Pine Marten Refuge" },
      { src: "/images/The Pine Marten Refuge/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-31.jpg", alt: "The Pine Marten Refuge" },
      { src: "/images/The Pine Marten Refuge/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-32.jpg", alt: "The Pine Marten Refuge" },
      { src: "/images/The Pine Marten Refuge/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-33.jpg", alt: "The Pine Marten Refuge" },
      { src: "/images/The Pine Marten Refuge/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-34.jpg", alt: "The Pine Marten Refuge" },
      { src: "/images/The Pine Marten Refuge/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-35.jpg", alt: "The Pine Marten Refuge" },
      { src: "/images/The Pine Marten Refuge/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-37.jpg", alt: "The Pine Marten Refuge" },
      { src: "/images/The Pine Marten Refuge/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-38.jpg", alt: "The Pine Marten Refuge" },
      { src: "/images/The Pine Marten Refuge/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-39.jpg", alt: "The Pine Marten Refuge" },
      { src: "/images/The Pine Marten Refuge/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-40.jpg", alt: "The Pine Marten Refuge" },
    ],
  };

  const currentImages =
    galleryData[activeSection as keyof typeof galleryData] ?? [];

  const sections = [
    { id: "aloe", label: "The Aloe Refuge", color: "#3b82f6" },
    { id: "modernhouse", label: "The Modern House", color: "#10b981" },
    { id: "pinemarten", label: "The Pine Marten Refuge", color: "#eab308" },
  ];

  return (
    <>
      <SEO
        title="Photo Gallery"
        description="Browse photos of The Modern Refuge — The Aloe Refuge, The Modern House, and The Pine Marten Refuge."
        url="/gallery"
      />
      <style>{`


        :root {
         --croc-deep: #0a0a0a;
          --croc-forest: #141414;
          --croc-moss: #282828;
          --croc-sage: #505050;
          --croc-sand: #d4d4d4;
          --croc-cream: #f0f0f0;
          --croc-gold: #909090;
          --croc-amber: #e0e0e0;
          --croc-water: #686868;
          --croc-sky: #c0c0c0;
          --text-dark: #0a0a0a;
          --text-light: #f0f0f0;
        }

        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }

        html { scroll-behavior: smooth; }

        body {
          font-family: 'Cormorant Garamond', serif;
          background: #f5f6fa;
          color: #1a1a2e;
          overflow-x: hidden;
        }

        /* NAV */
        nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          padding: 22px 60px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(201,168,76,0.95);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255,255,255,0.18);
          box-shadow: 0 2px 16px rgba(0,0,0,0.08);
        }

        .nav-logo {
          font-family: 'Playfair Display', serif;
          font-size: 1.4rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: #fff;
          text-decoration: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .nav-logo-img {
          height: 40px;
          width: 40px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(255,255,255,0.3);
          flex-shrink: 0;
        }
        .nav-logo span { color: rgba(255,255,255,0.65); }

        .nav-links {
          display: flex;
          gap: 40px;
          list-style: none;
        }
        .nav-links a, .nav-links button {
          font-family: 'Inter', sans-serif;
          font-size: 0.72rem;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #fff;
          text-decoration: none;
          opacity: 0.75;
          transition: opacity 0.2s;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
        }
        .nav-links a:hover, .nav-links button:hover { opacity: 1; }

        .nav-book {
          font-family: 'Inter', sans-serif;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #1a1a2e;
          background: #fff;
          padding: 10px 22px;
          border-radius: 8px;
          text-decoration: none;
          transition: background 0.2s, transform 0.15s;
        }
        .nav-book:hover { background: #f0f0f0; transform: translateY(-1px); }

        /* HAMBURGER MENU */
        .hamburger {
          display: none;
          flex-direction: column;
          gap: 6px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          z-index: 101;
        }

        .hamburger span {
          width: 24px;
          height: 2px;
          background: var(--croc-cream);
          transition: all 0.3s ease;
          display: block;
        }

        .hamburger.active span:nth-child(1) {
          transform: rotate(45deg) translate(8px, 8px);
        }

        .hamburger.active span:nth-child(2) {
          opacity: 0;
        }

        .hamburger.active span:nth-child(3) {
          transform: rotate(-45deg) translate(7px, -7px);
        }

        .mobile-menu {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(10, 10, 10, 0.98);
          z-index: 50;
          padding-top: 100px;
          flex-direction: column;
          align-items: center;
          gap: 30px;
          backdrop-filter: blur(4px);
        }

        .mobile-menu.active {
          display: flex;
        }

        .mobile-menu a, .mobile-menu button {
          font-family: 'Inter', sans-serif;
          font-size: 0.95rem;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #fff;
          text-decoration: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          transition: color 0.2s;
        }

        .mobile-menu a:hover, .mobile-menu button:hover {
          color: #c9a84c;
        }

        .mobile-menu .nav-book {
          display: inline-block;
          margin-top: 20px;
          font-size: 0.75rem;
        }

        /* GALLERY */
        .gallery-container {
          min-height: 100vh;
          background: #f5f6fa;
          padding-top: 110px;
          padding-bottom: 80px;
        }

        .gallery-header {
          text-align: center;
          margin-bottom: 52px;
          padding: 0 60px;
        }

        .gallery-eyebrow {
          font-family: 'Inter', sans-serif;
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #c9a84c;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
        }
        .gallery-eyebrow::before {
          content: '';
          display: block;
          width: 50px;
          height: 1px;
          background: rgba(10,10,10,0.2);
        }
        .gallery-eyebrow::after {
          content: '';
          display: block;
          width: 50px;
          height: 1px;
          background: rgba(10,10,10,0.2);
        }

        .gallery-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 900;
          color: #1a1a2e;
          margin-bottom: 36px;
        }

        /* SECTION TABS */
        .section-tabs {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-bottom: 60px;
          flex-wrap: wrap;
          padding: 0 60px;
        }

        .section-tab {
          font-family: 'Inter', sans-serif;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 10px 24px;
          border: 1.5px solid #e5e7eb;
          border-radius: 24px;
          background: #fff;
          color: #9098a9;
          cursor: pointer;
          transition: all 0.18s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }

        .section-tab.active {
          background: #1a1a2e;
          color: #fff;
          border-color: #1a1a2e;
          box-shadow: 0 4px 12px rgba(26,26,46,0.2);
        }

        .section-tab:hover:not(.active) {
          border-color: #c9a84c;
          color: #c9a84c;
          background: #fff;
        }

        /* GALLERY ITEMS */
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 30px;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 60px;
        }

        .gallery-item {
          position: relative;
          overflow: hidden;
          aspect-ratio: 1;
          cursor: zoom-in;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.07);
          transition: box-shadow 0.22s, transform 0.22s;
        }
        .gallery-item:hover { box-shadow: 0 10px 32px rgba(0,0,0,0.14); transform: translateY(-2px); }

        .gallery-item-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
          display: block;
        }

        .gallery-item:hover .gallery-item-img {
          transform: scale(1.06);
        }

        .gallery-item-overlay {
          position: absolute;
          inset: 0;
          background: rgba(26,26,46,0.5);
          opacity: 0;
          transition: opacity 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
        }

        .gallery-item:hover .gallery-item-overlay {
          opacity: 1;
        }

        /* Image viewer — compact panel, not full-screen */
        .img-viewer-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.72);
          backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
          z-index: 9999; display: flex; align-items: center; justify-content: center;
          padding: 80px 20px 20px;
        }
        .img-viewer {
          width: 100%; max-width: 860px;
          display: flex; flex-direction: column; gap: 8px;
        }
        .img-viewer-topbar {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 4px;
        }
        .img-viewer-back {
          display: inline-flex; align-items: center; gap: 8px;
          background: none; border: none; color: rgba(255,255,255,0.75);
          font-family: 'Inter', sans-serif; font-size: 0.72rem; font-weight: 500;
          letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer;
          transition: color 0.2s; padding: 0;
        }
        .img-viewer-back:hover { color: #c9a84c; }
        .img-viewer-counter {
          font-family: 'Inter', sans-serif; font-size: 0.72rem; font-weight: 500;
          letter-spacing: 0.06em; color: rgba(255,255,255,0.45);
        }
        .img-viewer-stage {
          width: 100%; height: 380px; position: relative; overflow: hidden;
          background: #111;
        }
        .img-viewer-img {
          width: 100%; height: 100%;
          object-fit: cover; display: block; user-select: none;
        }
        .img-viewer-arrow {
          position: absolute; top: 50%; transform: translateY(-50%);
          background: rgba(0,0,0,0.45); border: none; color: #fff;
          font-size: 2rem; width: 44px; height: 44px; border-radius: 50%;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: background 0.2s;
        }
        .img-viewer-arrow:hover { background: rgba(0,0,0,0.72); }
        .img-viewer-arrow--prev { left: 10px; }
        .img-viewer-arrow--next { right: 10px; }
        .img-viewer-thumbs {
          display: flex; gap: 6px; overflow-x: auto;
          scrollbar-width: thin; scrollbar-color: #555 transparent;
          padding-bottom: 2px;
        }
        .img-viewer-thumb {
          flex-shrink: 0; width: 68px; height: 50px; border: 2px solid transparent;
          border-radius: 3px; overflow: hidden; cursor: pointer; padding: 0;
          background: none; opacity: 0.5; transition: opacity 0.2s, border-color 0.2s;
        }
        .img-viewer-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .img-viewer-thumb:hover, .img-viewer-thumb.active { opacity: 1; border-color: #c9a84c; }
        @media (max-width: 600px) {
          .img-viewer-overlay { padding: 70px 0 0; align-items: flex-start; }
          .img-viewer-stage { height: 260px; }
          .img-viewer-thumb { width: 54px; height: 40px; }
        }

        .gallery-item-text {
          font-family: 'Playfair Display', serif;
          font-size: 1.4rem;
          color: var(--croc-cream);
          text-align: center;
          font-weight: 700;
        }

        /* VIDEO GRID */
        .video-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 60px;
        }
        .video-card {
          background: #1a1a2e;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
        }
        .video-card video {
          width: 100%; display: block;
          max-height: 280px; object-fit: cover;
        }
        .video-card-label {
          font-family: 'Inter', sans-serif;
          font-size: 0.65rem; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase;
          color: rgba(255,255,255,0.45); padding: 12px 16px;
        }

        @media (max-width: 900px) {
          .gallery-grid { grid-template-columns: repeat(2, 1fr); padding: 0 30px; }
          .video-grid { grid-template-columns: 1fr 1fr; padding: 0 30px; }
          .gallery-header { padding: 0 30px; }
          .section-tabs { padding: 0 30px; }
          nav { padding: 24px 30px; }
        }

        @media (max-width: 600px) {
          .gallery-grid { grid-template-columns: 1fr; }
          .video-grid { grid-template-columns: 1fr; padding: 0 20px; }
          .gallery-title { font-size: 2rem; }
          .section-tabs { gap: 10px; }
          .section-tab { padding: 10px 16px; font-size: 0.65rem; }
          .gallery-container { padding-top: 100px; }
          .hamburger { display: flex; }
          .nav-links { display: none; }
          .nav-book { display: none; }
          nav { padding: 20px 24px; }
        }
      `}</style>

      {/* NAV */}
      <nav>
        <Link to="/" className="nav-logo">
          The Modern <span>Refuge</span>
        </Link>
        <ul className="nav-links">
          <li>
            <a href="/">Villas</a>
          </li>
          <li>
            <Link to="/gallery">Gallery</Link>
          </li>
          <li>
            <a href="/">Contact</a>
          </li>
        </ul>
        <button
          className={`hamburger ${mobileMenuOpen ? "active" : ""}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>

      {/* MOBILE MENU */}
      <div className={`mobile-menu ${mobileMenuOpen ? "active" : ""}`}>
        <Link to="/" onClick={() => setMobileMenuOpen(false)}>
          Home
        </Link>
        <a href="/" onClick={() => setMobileMenuOpen(false)}>
          Villas
        </a>
        <Link to="/gallery" onClick={() => setMobileMenuOpen(false)}>
          Gallery
        </Link>
        <a href="/" onClick={() => setMobileMenuOpen(false)}>
          About
        </a>
        <a href="/" onClick={() => setMobileMenuOpen(false)}>
          Contact
        </a>
        <a
          href="/"
          className="nav-book"
          onClick={() => setMobileMenuOpen(false)}
        >
          Book Direct — Best Rate
        </a>
      </div>

      {/* GALLERY */}
      <section className="gallery-container">
        <div className="gallery-header">
          <div className="gallery-eyebrow">Our Collections</div>
          <h1 className="gallery-title">Photo Gallery</h1>
        </div>

        {/* Section Tabs */}
        <div className="section-tabs">
          {sections.map((section) => (
            <button
              key={section.id}
              className={`section-tab ${activeSection === section.id ? "active" : ""}`}
              onClick={() => setActiveSection(section.id)}
              style={
                activeSection === section.id
                  ? { borderColor: section.color }
                  : {}
              }
            >
              {section.label}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="gallery-grid">
          {currentImages.map((image, index) => (
            <div
              key={index}
              className="gallery-item"
              onClick={() => {
                setViewerIndex(index);
                setViewerOpen(true);
              }}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="gallery-item-img"
                loading="lazy"
                decoding="async"
              />
              <div className="gallery-item-overlay">
                <div className="gallery-item-text">{image.alt}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Image viewer */}
      {viewerOpen && (
        <div
          className="img-viewer-overlay"
          onClick={() => setViewerOpen(false)}
        >
          <div className="img-viewer" onClick={(e) => e.stopPropagation()}>
            <div className="img-viewer-topbar">
              <button
                className="img-viewer-back"
                onClick={() => setViewerOpen(false)}
              >
                ← Back to gallery
              </button>
              <span className="img-viewer-counter">
                {viewerIndex + 1} / {currentImages.length}
              </span>
            </div>
            <div
              className="img-viewer-stage"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {viewerIndex > 0 && (
                <button
                  className="img-viewer-arrow img-viewer-arrow--prev"
                  onClick={() => setViewerIndex((i) => i - 1)}
                >
                  &#8249;
                </button>
              )}
              <img
                className="img-viewer-img"
                src={currentImages[viewerIndex]?.src}
                alt={currentImages[viewerIndex]?.alt}
                decoding="async"
              />
              {viewerIndex < currentImages.length - 1 && (
                <button
                  className="img-viewer-arrow img-viewer-arrow--next"
                  onClick={() => setViewerIndex((i) => i + 1)}
                >
                  &#8250;
                </button>
              )}
            </div>
            <div className="img-viewer-thumbs">
              {currentImages.map((img, i) => (
                <button
                  key={i}
                  className={`img-viewer-thumb${i === viewerIndex ? " active" : ""}`}
                  onClick={() => setViewerIndex(i)}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    loading="lazy"
                    decoding="async"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Gallery;
