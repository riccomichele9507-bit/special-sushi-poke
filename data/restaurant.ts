export const restaurant = {
  name: "Special Sushi Poke",
  tagline: "Sushi & Poke d'asporto a Bari",
  address: {
    street: "Via G. Petroni 12/H-i",
    city: "Bari",
    postalCode: "70124",
    country: "IT",
    fullAddress: "Via G. Petroni 12/H-i, 70124 Bari",
  },
  // Google Business Profile - per email review automatica post-consegna
  googlePlaceId: "ChIJmTVNUQDpRxMR5Ruq_YElJ5Q",
  googleReviewUrl:
    "https://search.google.com/local/writereview?placeid=ChIJmTVNUQDpRxMR5Ruq_YElJ5Q",
  phone: "+39 080 123 4567",
  phoneDisplay: "080 123 4567",
  whatsapp: "+393533263829",
  whatsappDisplay: "353 326 3829",
  whatsappLink:
    "https://wa.me/393533263829?text=" +
    encodeURIComponent("Ciao Special Sushi Poke! Vorrei informazioni sull'ordine."),
  email: "specialsushipoke@gmail.com",
  vat: "09041530727",
  hours: {
    weekdays: "11:30 – 23:30",
    weekend: "11:30 – 23:30",
    closed: "Aperto tutti i giorni · orario continuato",
  },
  social: {
    instagram: "https://instagram.com/specialsushipoke",
    facebook: "https://facebook.com/specialsushipoke",
  },
  coords: {
    lat: 41.0967058,
    lng: 16.8676296,
  },
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2989.5!2d16.8676296!3d41.0967058!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sVia%20G.%20Petroni%2C%20Bari!5e0!3m2!1sit!2sit",
  googleMapsLink:
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent("Special Sushi Poke, Via G. Petroni, 70124 Bari"),
  // Regole reali in delivery_settings: gratis ≤6km, €30 min 6-12km, no >12km.
  freeDeliveryMaxKm: 6,
  deliveryRadiusKm: 12,
  cuisine: ["Sushi", "Poke", "Giapponese", "Fusion"],
  priceRange: "€€",
} as const;
