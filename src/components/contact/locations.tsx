interface Location {
  id: string;
  title: string;
  subtitle: string;
  address: string;
  mapSrc: string;
}

const LOCATION: Location = {
  id: "main-branch",
  title: "Combine Foundation",
  subtitle: "Head Office",
  address: "B-18 Block 16 Gulshan-e-Iqbal near Expo Centre main University Road Karachi, Sindh, Pakistan",
  mapSrc:
    "https://maps.google.com/maps?q=B-18+Block+16+Gulshan-e-Iqbal+near+Expo+Centre+Main+University+Road+Karachi&z=16&ie=UTF8&output=embed",
};

const Locations = () => {
  return (
    <section className="max-w-[1500px] w-full mx-auto px-4 md:px-6 lg:px-8 py-10">
      <div className="w-full">
        {/* Header */}
        <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-secondary-500 mb-3">
          Our Location
        </h2>

        <hr className="border-black/70 mb-6" />

        {/* ── MOBILE LAYOUT (hidden on lg+) ── */}
        <div className="lg:hidden flex flex-col gap-4">
          {/* Location Info Card */}
          <div className="bg-white rounded-2xl p-4 border border-gray-200">
            <h3 className="text-lg font-bold text-black">{LOCATION.title}</h3>
            {LOCATION.subtitle && (
              <p className="text-sm text-gray-500 font-medium mb-2">
                {LOCATION.subtitle}
              </p>
            )}
            <p className="text-[12px] text-gray-400 font-medium uppercase tracking-wide mt-3 mb-0.5">
              Address
            </p>
            <p className="text-[15px] text-gray-800 leading-snug">
              {LOCATION.address}
            </p>
          </div>

          {/* Map */}
          <div className="rounded-[20px] overflow-hidden border border-gray-300 h-[260px] sm:h-[320px]">
            <iframe
              src={LOCATION.mapSrc}
              title={`Map for ${LOCATION.title}`}
              className="w-full h-full border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        {/* ── DESKTOP LAYOUT (hidden below lg) ── */}
        <div className="hidden lg:block">
          <div className="relative rounded-[28px] overflow-hidden border border-gray-300 h-[430px]">
            {/* Google Map */}
            <iframe
              src={LOCATION.mapSrc}
              title={`Map for ${LOCATION.title}`}
              className="absolute inset-0 w-full h-full border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />

            {/* Floating Info Card */}
            <div className="absolute top-4 left-4 z-10 w-[360px]">
              <div className="w-full rounded-[24px] bg-[#F8F8F8]/95 backdrop-blur-md px-6 py-5 border border-gray-200 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
                <h3 className="text-[22px] leading-[1.15] font-semibold text-black">
                  {LOCATION.title}
                  {LOCATION.subtitle && (
                    <>
                      <br />
                      <span className="font-medium text-base text-gray-600">
                        {LOCATION.subtitle}
                      </span>
                    </>
                  )}
                </h3>
                <p className="mt-4 text-[16px] leading-[1.6] text-gray-600">
                  {LOCATION.address}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Locations;