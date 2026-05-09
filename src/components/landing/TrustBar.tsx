export default function TrustBar() {
  const placeholders = Array.from({ length: 5 }, (_, i) => i);

  return (
    <section className="py-12 bg-gray-50 border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium text-gray-500 uppercase tracking-wider mb-8">
          Trusted by industry leaders nationwide
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {placeholders.map((i) => (
            <div
              key={i}
              className="w-28 h-10 bg-gray-200 rounded-md flex items-center justify-center"
            >
              <span className="text-xs text-gray-400 font-medium">Logo</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
