import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import SEO from "./components/SEO";

const Gallery: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>("shelterA");
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
    shelterA: [
      { src: "/images/Shelter A/204ef77b-b7e7-4cce-a4c7-2e735b3a30bf.avif", alt: "Shelter A" },
      { src: "/images/Shelter A/3991dd29-5bc4-4cbd-b5eb-68fbd0971d54.avif", alt: "Shelter A" },
      { src: "/images/Shelter A/46aded4b-c5cc-484f-8bd9-3fd39b9bf323.avif", alt: "Shelter A" },
      { src: "/images/Shelter A/513a5ca6-5b0e-4207-9404-8e59ec630a2d.avif", alt: "Shelter A" },
      { src: "/images/Shelter A/51c578fd-74fe-4cf5-b7d5-fc0fb03ca0b9.avif", alt: "Shelter A" },
      { src: "/images/Shelter A/54a9f03d-91c4-44de-9efe-54827fa4fd5e.avif", alt: "Shelter A" },
      { src: "/images/Shelter A/57803688-8f49-4a77-8766-4f4eff730087.avif", alt: "Shelter A" },
      { src: "/images/Shelter A/751e4e4e-1c75-4e84-91be-30034a5b5829.avif", alt: "Shelter A" },
      { src: "/images/Shelter A/83872ac0-113d-4958-bfee-4c688631559d.avif", alt: "Shelter A" },
      { src: "/images/Shelter A/88ea92a6-5434-4097-ad24-955e34e5f03b.avif", alt: "Shelter A" },
      { src: "/images/Shelter A/8939bf51-84e3-4ad9-9b7b-583893a7b056.avif", alt: "Shelter A" },
      { src: "/images/Shelter A/9410b608-cbd8-46ce-8b18-eeea7e1bdf6c.avif", alt: "Shelter A" },
      { src: "/images/Shelter A/9cf7b400-9139-451e-a142-3fe7df65b03e.avif", alt: "Shelter A" },
      { src: "/images/Shelter A/b4b36cf0-1b8d-4b03-97f7-082a4b2ccda0.avif", alt: "Shelter A" },
      { src: "/images/Shelter A/d2cb42da-197b-45a1-a90e-b23705208303.avif", alt: "Shelter A" },
      { src: "/images/Shelter A/d3f26120-824d-4cb9-b5b0-960f62bff434.avif", alt: "Shelter A" },
    ],
    shelterB: [
      { src: "/images/Shelter B/076d893a-eb66-4d47-a942-e771f585ad9c.avif", alt: "Shelter B" },
      { src: "/images/Shelter B/1b4eb0a9-8512-49e6-94a2-351868347766.avif", alt: "Shelter B" },
      { src: "/images/Shelter B/31ead890-02a6-4b96-ad51-343d87c1df92.avif", alt: "Shelter B" },
      { src: "/images/Shelter B/3d1424c3-9662-4f06-a4d9-739283119142.avif", alt: "Shelter B" },
      { src: "/images/Shelter B/4000cb42-596e-402b-b832-771f5264bf4c.avif", alt: "Shelter B" },
      { src: "/images/Shelter B/4421a38c-0911-4e74-9868-1b6b3e0b3560.avif", alt: "Shelter B" },
      { src: "/images/Shelter B/4c9d753b-b563-44ff-b5b4-f919d1cb22b5.avif", alt: "Shelter B" },
      { src: "/images/Shelter B/640244fc-f2da-430f-9272-2d834a3de6f2.avif", alt: "Shelter B" },
      { src: "/images/Shelter B/66f85b80-e5de-4c02-9753-1ae1944cef49.avif", alt: "Shelter B" },
      { src: "/images/Shelter B/6882f7b8-9f64-4959-a940-e68cd56c19d8.avif", alt: "Shelter B" },
      { src: "/images/Shelter B/68957628-27ae-4445-b633-c26b0aebc2a8.avif", alt: "Shelter B" },
      { src: "/images/Shelter B/68a17503-0cca-4643-8fa2-5fdfb4b84920.avif", alt: "Shelter B" },
      { src: "/images/Shelter B/6a43ebcf-a2cc-4558-a020-20635c096234.avif", alt: "Shelter B" },
      { src: "/images/Shelter B/6bd8b157-c7c9-440d-87c6-03dd68271093.avif", alt: "Shelter B" },
      { src: "/images/Shelter B/6d8d0152-8f93-4699-b4f5-2f48583aa4c2.avif", alt: "Shelter B" },
      { src: "/images/Shelter B/6e205d72-a96e-46c8-89c3-66e80c7b34f0.avif", alt: "Shelter B" },
      { src: "/images/Shelter B/71367ecf-11bf-4832-96b0-bf780c926c98.jpeg", alt: "Shelter B" },
      { src: "/images/Shelter B/9314cf53-9d12-4054-81f6-9ff09b0118e2.avif", alt: "Shelter B" },
      { src: "/images/Shelter B/9ab58200-a6d3-466f-adc0-438701898486.avif", alt: "Shelter B" },
      { src: "/images/Shelter B/ab2b08bc-3755-490a-8758-8550ec2fbb41.jpeg", alt: "Shelter B" },
      { src: "/images/Shelter B/c2edb7e8-4cad-4173-851d-854faa8a13cd.avif", alt: "Shelter B" },
      { src: "/images/Shelter B/ccd0e770-eef4-4bba-a3e3-3bef21914192.avif", alt: "Shelter B" },
      { src: "/images/Shelter B/d208790f-bae0-4862-99c3-d7889ecf92c4.avif", alt: "Shelter B" },
      { src: "/images/Shelter B/d8513b0a-5c60-4d98-9ac8-d5dd23da358c.avif", alt: "Shelter B" },
      { src: "/images/Shelter B/daebc782-3055-41ed-86eb-d427ee67c95d.avif", alt: "Shelter B" },
      { src: "/images/Shelter B/dec32cd1-f0a0-46ad-ac96-b18e4d1f0a12.avif", alt: "Shelter B" },
      { src: "/images/Shelter B/df8e4ce0-f8a4-47c4-ab7c-7d709b355848.avif", alt: "Shelter B" },
      { src: "/images/Shelter B/e0865593-07c9-4daf-b4bd-ce880acc24a8.avif", alt: "Shelter B" },
      { src: "/images/Shelter B/e6ff9fcb-f59f-45f7-9440-1085e24df24c.jpeg", alt: "Shelter B" },
      { src: "/images/Shelter B/f93a6104-879e-4d31-ad54-23d3c3f84dbd.avif", alt: "Shelter B" },
    ],
    maisonModern: [
      { src: "/images/LA MAISON MODERN/040b83f5-da2a-4eaf-a9f3-b06ff18eb617.avif", alt: "La Maison Modern" },
      { src: "/images/LA MAISON MODERN/0adaa473-2ac7-4b09-abb8-df390cc81fb8.avif", alt: "La Maison Modern" },
      { src: "/images/LA MAISON MODERN/10e20d1f-fa99-4bd1-920e-025f056ec4e6.avif", alt: "La Maison Modern" },
      { src: "/images/LA MAISON MODERN/14cc472f-22a4-44a4-8941-7590360a1adf.avif", alt: "La Maison Modern" },
      { src: "/images/LA MAISON MODERN/17bceb61-9840-4971-9cfd-8c78a683f1f8.avif", alt: "La Maison Modern" },
      { src: "/images/LA MAISON MODERN/17f9e68c-9528-4948-9143-358e189c010e.avif", alt: "La Maison Modern" },
      { src: "/images/LA MAISON MODERN/1953dd42-294c-436e-9e77-e175e41c6e2e.avif", alt: "La Maison Modern" },
      { src: "/images/LA MAISON MODERN/1ace6552-c2ee-4a61-be59-43f322cf8339.avif", alt: "La Maison Modern" },
      { src: "/images/LA MAISON MODERN/22d9e99d-6fa0-495f-b0cd-441a9caafed7.avif", alt: "La Maison Modern" },
      { src: "/images/LA MAISON MODERN/2921c4f4-ec4b-4cd9-ad66-d9bda78de6f7.avif", alt: "La Maison Modern" },
      { src: "/images/LA MAISON MODERN/2de597fb-ea4c-44c8-8269-fdde268dd670.avif", alt: "La Maison Modern" },
      { src: "/images/LA MAISON MODERN/305cbaf4-237a-4efb-bfef-dbcab3b3af4f.avif", alt: "La Maison Modern" },
      { src: "/images/LA MAISON MODERN/36d58e14-e633-4e56-a680-85e37e969125.avif", alt: "La Maison Modern" },
      { src: "/images/LA MAISON MODERN/39bb11b5-568e-40f0-97a9-6498b5d9af1f.avif", alt: "La Maison Modern" },
      { src: "/images/LA MAISON MODERN/3a082a41-b958-45bc-b457-0f0c6b499118.avif", alt: "La Maison Modern" },
      { src: "/images/LA MAISON MODERN/4ecd6667-c48e-45a0-b1fa-bc8e37c4eca8.avif", alt: "La Maison Modern" },
      { src: "/images/LA MAISON MODERN/4f25e4cc-070c-4160-a300-170273ce08e0.avif", alt: "La Maison Modern" },
      { src: "/images/LA MAISON MODERN/50b20991-4eb2-4c55-8444-981fd3a494c9.avif", alt: "La Maison Modern" },
      { src: "/images/LA MAISON MODERN/5180124e-a20d-4a54-a972-4acf56b52fa3.avif", alt: "La Maison Modern" },
      { src: "/images/LA MAISON MODERN/5c726889-0b9f-4aad-a382-c9185984de0c.avif", alt: "La Maison Modern" },
      { src: "/images/LA MAISON MODERN/63793a37-b52c-454c-be6e-31f0b2ceaedd.avif", alt: "La Maison Modern" },
      { src: "/images/LA MAISON MODERN/646c6d22-5df4-47a9-8a0d-5487e61add9b.avif", alt: "La Maison Modern" },
      { src: "/images/LA MAISON MODERN/6c555480-95d6-4765-a4ed-0dbc01cfafaa.avif", alt: "La Maison Modern" },
      { src: "/images/LA MAISON MODERN/6c85c09f-20e5-4815-b648-2f496875f818.avif", alt: "La Maison Modern" },
      { src: "/images/LA MAISON MODERN/6e58d3d7-1f6c-4b0d-b4bd-c811f6a37161.avif", alt: "La Maison Modern" },
      { src: "/images/LA MAISON MODERN/7612fcba-0a89-4bd9-b275-de95d86cb620.avif", alt: "La Maison Modern" },
      { src: "/images/LA MAISON MODERN/78006b73-c841-48bf-baaf-7128959ca41e.avif", alt: "La Maison Modern" },
      { src: "/images/LA MAISON MODERN/7c1cf32f-0008-42d0-a4fe-75496b94a900.avif", alt: "La Maison Modern" },
      { src: "/images/LA MAISON MODERN/839f3c5a-9db2-4787-8025-76ceee9a0900.avif", alt: "La Maison Modern" },
      { src: "/images/LA MAISON MODERN/8756b5e1-3731-43c3-8ee2-e7f3b289c43e.avif", alt: "La Maison Modern" },
      { src: "/images/LA MAISON MODERN/9090add1-836c-46f2-8fc7-4ff22f582b2c.avif", alt: "La Maison Modern" },
      { src: "/images/LA MAISON MODERN/a07811c7-6ba1-4242-b4ed-66b252a4b4da.avif", alt: "La Maison Modern" },
      { src: "/images/LA MAISON MODERN/a541d5ab-ffd2-4c8b-a0ee-3b97bad686c8.avif", alt: "La Maison Modern" },
      { src: "/images/LA MAISON MODERN/a859bde8-98db-42cf-9f3d-0a7e01b31572.avif", alt: "La Maison Modern" },
      { src: "/images/LA MAISON MODERN/bbd5fccc-0537-47fd-a5c3-e2ba52327e07.avif", alt: "La Maison Modern" },
      { src: "/images/LA MAISON MODERN/d1b9d3a4-daac-410b-83ea-9f580e064c37.avif", alt: "La Maison Modern" },
      { src: "/images/LA MAISON MODERN/e75245ff-ef04-491c-9892-3cd2ec2d1b99.avif", alt: "La Maison Modern" },
      { src: "/images/LA MAISON MODERN/e9a27937-ae28-4a9e-88be-70283ade1463.avif", alt: "La Maison Modern" },
      { src: "/images/LA MAISON MODERN/f3ecd408-3d23-45e3-b82e-85663ad877b6.avif", alt: "La Maison Modern" },
      { src: "/images/LA MAISON MODERN/f89c5b3f-edf4-4111-8e4c-1d887a4fc50c.avif", alt: "La Maison Modern" },
    ],
    martyrRefuge: [
      { src: "/images/REFUGE DE LA MARtRE/015c3131-ead9-4952-baae-c32c96465618.avif", alt: "Refuge de la Martre" },
      { src: "/images/REFUGE DE LA MARtRE/04e7fb89-afd7-41bd-80bd-5ce4c79c4769.avif", alt: "Refuge de la Martre" },
      { src: "/images/REFUGE DE LA MARtRE/06af1c7a-dd6a-4f07-9231-c7ce235c0311.avif", alt: "Refuge de la Martre" },
      { src: "/images/REFUGE DE LA MARtRE/0ced509b-2c18-4664-a5cc-62617d2bff79.avif", alt: "Refuge de la Martre" },
      { src: "/images/REFUGE DE LA MARtRE/0ebc2fba-0d36-4b0c-ad28-0093396ad8ec.avif", alt: "Refuge de la Martre" },
      { src: "/images/REFUGE DE LA MARtRE/151000f2-3268-4483-bece-f284f02963a3.avif", alt: "Refuge de la Martre" },
      { src: "/images/REFUGE DE LA MARtRE/1e51a16e-b837-4268-940a-6a232a9221b7.avif", alt: "Refuge de la Martre" },
      { src: "/images/REFUGE DE LA MARtRE/233cdd0b-58ab-4be7-90ec-3ae8fa7312be.avif", alt: "Refuge de la Martre" },
      { src: "/images/REFUGE DE LA MARtRE/374fca0b-db80-4276-b89b-95fcaf00a4dc.avif", alt: "Refuge de la Martre" },
      { src: "/images/REFUGE DE LA MARtRE/3e0880e0-0305-4d26-91f6-007317715bcb.avif", alt: "Refuge de la Martre" },
      { src: "/images/REFUGE DE LA MARtRE/41d4132e-74fd-441c-a1be-cfe974444e3e.avif", alt: "Refuge de la Martre" },
      { src: "/images/REFUGE DE LA MARtRE/46893453-303b-43fa-99e4-2f2a7d989e9d.avif", alt: "Refuge de la Martre" },
      { src: "/images/REFUGE DE LA MARtRE/4b281acc-6906-43e5-b770-b32cd81a0bb8.avif", alt: "Refuge de la Martre" },
      { src: "/images/REFUGE DE LA MARtRE/4b4cc263-1321-4b0d-bea7-3f680ed2c01a.avif", alt: "Refuge de la Martre" },
      { src: "/images/REFUGE DE LA MARtRE/4ff00f74-2f2d-4a4c-9b9c-8e0c1f4ebf0a.avif", alt: "Refuge de la Martre" },
      { src: "/images/REFUGE DE LA MARtRE/5a98b69b-59bc-4286-834b-2709ea7346de.avif", alt: "Refuge de la Martre" },
      { src: "/images/REFUGE DE LA MARtRE/6718b2f9-260f-417a-bbde-5798e5e1d85f.avif", alt: "Refuge de la Martre" },
      { src: "/images/REFUGE DE LA MARtRE/70685259-d269-4c51-84e6-0ebc3a3f670e.avif", alt: "Refuge de la Martre" },
      { src: "/images/REFUGE DE LA MARtRE/70a4ed72-9800-4ab1-90e8-77bb0cea5296.avif", alt: "Refuge de la Martre" },
      { src: "/images/REFUGE DE LA MARtRE/72b01297-f27a-47b4-b8dd-0a786d11ecf6.avif", alt: "Refuge de la Martre" },
      { src: "/images/REFUGE DE LA MARtRE/83b065e3-b673-4ddd-a05b-8ee512274eaa.avif", alt: "Refuge de la Martre" },
      { src: "/images/REFUGE DE LA MARtRE/950a7460-10fa-4428-8cee-b9d35f8e0305.avif", alt: "Refuge de la Martre" },
      { src: "/images/REFUGE DE LA MARtRE/9a0ad13f-a7f2-41c5-b692-b4547d82c039.avif", alt: "Refuge de la Martre" },
      { src: "/images/REFUGE DE LA MARtRE/9bb69b5d-1f09-41a4-97e2-7261f9b32bc5.avif", alt: "Refuge de la Martre" },
      { src: "/images/REFUGE DE LA MARtRE/a2d5ccd2-f8d2-4aba-96fa-e5feef3c2399.avif", alt: "Refuge de la Martre" },
      { src: "/images/REFUGE DE LA MARtRE/a3372a8b-df12-46ee-b561-b738dc6dc393.avif", alt: "Refuge de la Martre" },
      { src: "/images/REFUGE DE LA MARtRE/a6a5a722-3a9a-47eb-8cb7-89bfade6c9bd.avif", alt: "Refuge de la Martre" },
      { src: "/images/REFUGE DE LA MARtRE/a888279d-de8a-4fce-aaab-7a033df418bf.avif", alt: "Refuge de la Martre" },
      { src: "/images/REFUGE DE LA MARtRE/a95dae3f-9879-4d4a-97ba-0b01cac238a2.avif", alt: "Refuge de la Martre" },
      { src: "/images/REFUGE DE LA MARtRE/ad7b3bee-67b9-4add-a5ff-56e481db87b6.avif", alt: "Refuge de la Martre" },
      { src: "/images/REFUGE DE LA MARtRE/ad7bfcbd-23ad-4a3b-832c-32ace4335fc1.avif", alt: "Refuge de la Martre" },
      { src: "/images/REFUGE DE LA MARtRE/b1cd3d6e-4386-40e5-a044-b263f2f57da7.avif", alt: "Refuge de la Martre" },
      { src: "/images/REFUGE DE LA MARtRE/bc9f2e46-3cf6-4d63-bbaf-0cd2021185d3.avif", alt: "Refuge de la Martre" },
      { src: "/images/REFUGE DE LA MARtRE/c3f99f4b-3a49-46e2-a414-6c816f58633a.avif", alt: "Refuge de la Martre" },
      { src: "/images/REFUGE DE LA MARtRE/c73b1a96-b6e7-41cf-b36e-c8259b59f715.avif", alt: "Refuge de la Martre" },
      { src: "/images/REFUGE DE LA MARtRE/cbee101a-bfd2-4d17-9628-88780de74d5c.avif", alt: "Refuge de la Martre" },
      { src: "/images/REFUGE DE LA MARtRE/cc09ca88-4b9c-4235-ae7e-87fdcf3025f0.avif", alt: "Refuge de la Martre" },
      { src: "/images/REFUGE DE LA MARtRE/cf0537f5-ed0e-463b-bd4e-6fa3589ea7a9.avif", alt: "Refuge de la Martre" },
      { src: "/images/REFUGE DE LA MARtRE/d4f7fc31-2d48-4fbc-b2dc-ffd30eea9027.avif", alt: "Refuge de la Martre" },
      { src: "/images/REFUGE DE LA MARtRE/db5e63a5-0437-4c1d-8927-3b3515232f03.avif", alt: "Refuge de la Martre" },
      { src: "/images/REFUGE DE LA MARtRE/dd052e15-3f78-4e12-9bb2-ad64a3328a0c.avif", alt: "Refuge de la Martre" },
      { src: "/images/REFUGE DE LA MARtRE/e0aa4b29-271a-4254-a7ab-03db4ed688c8.avif", alt: "Refuge de la Martre" },
      { src: "/images/REFUGE DE LA MARtRE/e3f6e4c6-d415-433d-aeb1-471f7831f957.avif", alt: "Refuge de la Martre" },
      { src: "/images/REFUGE DE LA MARtRE/e75688cc-91e7-4b92-a90b-b45f75ece9d3.avif", alt: "Refuge de la Martre" },
      { src: "/images/REFUGE DE LA MARtRE/e76c3c15-3e90-4bad-baa8-cd8a7b56596d.avif", alt: "Refuge de la Martre" },
      { src: "/images/REFUGE DE LA MARtRE/eb64701d-f257-433f-992a-85453f98faf0.avif", alt: "Refuge de la Martre" },
      { src: "/images/REFUGE DE LA MARtRE/f29f20e5-ba5d-4831-8bbf-763da0577a33.avif", alt: "Refuge de la Martre" },
      { src: "/images/REFUGE DE LA MARtRE/fb990f12-19f0-4bc3-9445-5da94163d263.avif", alt: "Refuge de la Martre" },
      { src: "/images/REFUGE DE LA MARtRE/fc4b157b-b34c-4c50-a4a2-9c3083bd0470.avif", alt: "Refuge de la Martre" },
    ],
  };

  const currentImages =
    galleryData[activeSection as keyof typeof galleryData] ?? [];

  const sections = [
    { id: "shelterA", label: "Shelter A", color: "#3b82f6" },
    { id: "shelterB", label: "Shelter B", color: "#eab308" },
    { id: "maisonModern", label: "La Maison Modern", color: "#10b981" },
    { id: "martyrRefuge", label: "Refuge de la Martre", color: "#f59e0b" },
  ];

  return (
    <>
      <SEO
        title="Photo Gallery"
        description="Browse photos of The Modern Shelter — Shelter A, Shelter B, La Maison Modern, and Refuge de la Martre."
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
          The Modern <span>Shelter</span>
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
