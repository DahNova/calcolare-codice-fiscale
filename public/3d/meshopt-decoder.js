// Vuoto di proposito. <model-viewer> attiva il decoder meshopt (già incluso
// nel suo bundle come WASM inline) solo dopo aver caricato lo script indicato
// in meshoptDecoderLocation: questo file same-origin evita la fetch da CDN.
// Vedi src/components/Modello3D.astro.
