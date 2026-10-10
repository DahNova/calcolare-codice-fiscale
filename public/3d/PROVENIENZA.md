# Modelli 3D — provenienza

Generati il 2026-10-10 con Meshy API: reference `nano-banana-2` (text-to-image, sfondo rimosso) → `image-to-3d` modello `latest` (Meshy 7.1), texture 2K PBR, remesh triangoli ~40k.
Ottimizzati per il web con `@gltf-transform/cli@4.5.1 optimize --texture-compress webp --texture-size 1024 --compress meshopt` (serve il decoder meshopt: `<model-viewer>` e three.js `GLTFLoader` + `MeshoptDecoder` lo supportano).
Ogni `<id>.webp` è il poster trasparente 512 px (vista frontale). Sorgenti a piena risoluzione (GLB 2K, USDZ per AR iOS, 4 viste, reference) in `C:/Progetti_WSL/_tools/meshy-spend/out/calcolare-codice-fiscale/`.

| id | prompt | task image-to-3d |
|---|---|---|
| `tessera-sanitaria` | A thick plastic ID health card standing upright on a small stand, with a gold contact chip, a blank photo square and abstract colored stripes, no text. Single isolated object, centered, full object visible, three-quarter view, plain neutral background. Clean premium 3D product render, soft studio lighting. Materials: satin plastic and matte ceramic in navy #0F172A, royal blue #1D4ED8 and a fresh green #16A34A accent, white parts. Minimal, rounded, solid shapes, no text, no letters, no logos. | `01a12538-ed98-77d2-a03e-28adf946638d` |
| `pin-italia` | A map location pin whose round head contains a raised relief silhouette of the Italian peninsula, standing on a round base. Single isolated object, centered, full object visible, three-quarter view, plain neutral background. Clean premium 3D product render, soft studio lighting. Materials: satin plastic and matte ceramic in navy #0F172A, royal blue #1D4ED8 and a fresh green #16A34A accent, white parts. Minimal, rounded, solid shapes, no text, no letters, no logos. | `01a12539-1177-708e-92cd-35f4b9e52665` |
