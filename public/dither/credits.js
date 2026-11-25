// Source artworks for the dither studies. All public domain or CC0, via Wikimedia Commons.
// Generated from img/art/sources.json.
window.CREDITS = {
  "venus": {
    "artwork": "Venus de Milo",
    "artist": "Alexandros of Antioch (attrib.)",
    "license": "Public domain",
    "url": "https://commons.wikimedia.org/wiki/File:Venus_de_Milo_Louvre_Ma399_n4.jpg"
  },
  "venus-dark": {
    "artwork": "Venus de Milo (19th-c. photograph, Rijksmuseum)",
    "artist": "Alexandros of Antioch (attrib.)",
    "license": "CC0",
    "url": "https://commons.wikimedia.org/wiki/File:Sculptuur_van_de_Venus_van_Milo_(Louvre,_Parijs),_RP-F-00-1507.jpg"
  },
  "nike": {
    "artwork": "Winged Victory of Samothrace",
    "artist": "Unknown Hellenistic sculptor",
    "license": "Public domain",
    "url": "https://commons.wikimedia.org/wiki/File:Nike_of_Samothrake_Louvre_Ma2369_n4.jpg"
  },
  "laocoon": {
    "artwork": "Laocoön and His Sons",
    "artist": "Hagesandros, Athenedoros and Polydoros",
    "license": "Public domain",
    "url": "https://commons.wikimedia.org/wiki/File:Laocoon_Pio-Clementino_Inv1059-1064-1067.jpg"
  },
  "apollo": {
    "artwork": "Apollo Belvedere",
    "artist": "Roman copy after Leochares",
    "license": "Public domain",
    "url": "https://commons.wikimedia.org/wiki/File:Belvedere_Apollo_Pio-Clementino_Inv1015.jpg"
  },
  "discobolus": {
    "artwork": "Discobolus (Palombara/Lancellotti)",
    "artist": "Roman copy after Myron",
    "license": "Public domain",
    "url": "https://commons.wikimedia.org/wiki/File:Discobolus_Lancelotti_Massimo.jpg"
  },
  "desolation": {
    "artwork": "The Course of Empire. Desolation",
    "artist": "Thomas Cole",
    "license": "Public domain",
    "url": "https://commons.wikimedia.org/wiki/File:Cole_Thomas_The_Course_of_Empire_Desolation_1836.jpg"
  },
  "parthenon": {
    "artwork": "The Parthenon",
    "artist": "Frederic Edwin Church",
    "license": "CC0",
    "url": "https://commons.wikimedia.org/wiki/File:The_Parthenon_MET_DT1540.jpg"
  },
  "paestum": {
    "artwork": "Différentes vues de Pesto: interior of the Basilica, Paestum",
    "artist": "Giovanni Battista Piranesi",
    "license": "CC0",
    "url": "https://commons.wikimedia.org/wiki/File:Basilica_di_Paestum_te_Paestum_Autre_vue_interieure_des_restes_du_Coll%C3%A8ge_suppos%C3%A9_des_Anfictions_(titel_op_object)_Verschillende_weergaven_van_de_resten_van_drie_grote_gebouwen_die_nog_steeds_staan_te_Paestum_(serietit,_RP-P-1966-396.jpg"
  },
  "socrates": {
    "artwork": "The Death of Socrates",
    "artist": "Jacques-Louis David",
    "license": "CC0",
    "url": "https://commons.wikimedia.org/wiki/File:The_Death_of_Socrates_MET_DT40.jpg"
  },
  "athens": {
    "artwork": "The School of Athens",
    "artist": "Raphael Sanzio",
    "license": "Public domain",
    "url": "https://commons.wikimedia.org/wiki/File:The_School_of_Athens_by_Raffaello_Sanzio_da_Urbino.jpg"
  },
  "sunrise": {
    "artwork": "Impression, Sunrise",
    "artist": "Claude Monet",
    "license": "Public domain",
    "url": "https://commons.wikimedia.org/wiki/File:Claude_Monet,_Impression,_soleil_levant.jpg"
  },
  "parasol": {
    "artwork": "Woman with a Parasol – Madame Monet and Her Son",
    "artist": "Claude Monet",
    "license": "Public domain",
    "url": "https://commons.wikimedia.org/wiki/File:Claude_Monet_-_Woman_with_a_Parasol_-_Madame_Monet_and_Her_Son_-_Google_Art_Project.jpg"
  },
  "lilypond": {
    "artwork": "The Water-Lily Pond (Japanese Bridge)",
    "artist": "Claude Monet",
    "license": "Public domain",
    "url": "https://commons.wikimedia.org/wiki/File:The_Water-Lily_Pond_1899_Claude_Monet_Metropolitan.jpg"
  },
  "swing": {
    "artwork": "The Happy Accidents of the Swing",
    "artist": "Jean-Honoré Fragonard",
    "license": "Public domain",
    "url": "https://commons.wikimedia.org/wiki/File:Fragonard,_The_Swing.jpg"
  },
  "cythera": {
    "artwork": "Pilgrimage to Cythera, so-called The Embarkation for Cythera",
    "artist": "Jean-Antoine Watteau",
    "license": "Public domain",
    "url": "https://commons.wikimedia.org/wiki/File:L%27Embarquement_pour_Cyth%C3%A8re,_by_Antoine_Watteau,_from_C2RMF_retouched.jpg"
  }
};
window.renderCredits = function (el, slugs) {
  if (!el) return;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const parts = slugs.map((s) => window.CREDITS[s]).filter(Boolean).map((c) => `<a href="${esc(c.url)}" target="_blank" rel="noopener"><i>${esc(c.artwork)}</i></a>, ${esc(c.artist)} (${esc(c.license)})`);
  const label = document.createElement('span'); label.className = 'mono'; label.textContent = 'Image credits';
  el.append(label, document.createElement('br'));
  const p = document.createElement('span'); p.innerHTML = 'Source images from Wikimedia Commons: ' + parts.join('; ') + '.'; el.append(p);
};
