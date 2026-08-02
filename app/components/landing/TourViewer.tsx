"use client";

import { SphericalPanoramaViewer } from "./SphericalPanoramaViewer";

const panorama = {
  label: "Doca e acesso",
  image: "/lancha panorama 1.webp",
};

export function TourViewer() {
  return (
    <div>
      <SphericalPanoramaViewer src={panorama.image} alt={panorama.label} />

      <div className="mt-6 inline-flex rounded-full border border-neon bg-neon px-4 py-2 text-xs font-bold uppercase tracking-widest text-abyss">
        {panorama.label}
      </div>

      <p className="mt-8 max-w-2xl text-sm leading-relaxed text-white/50">
        Panorama 360 real da Lancha Beju. Arraste com o mouse ou com o dedo para olhar ao redor.
      </p>
    </div>
  );
}
