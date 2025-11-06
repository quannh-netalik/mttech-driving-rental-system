export default function ThemeBackground() {
  return (
    <>
      {/* Light Mode Background */}
      <div
        className="absolute inset-0 -z-10 transition-opacity duration-500 dark:opacity-0"
        style={{
          background: 'radial-gradient(125% 125% at 50% 10%, #fff 40%, #475569 100%)',
        }}
      />

      {/* Dark Mode Background */}
      <div className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 dark:opacity-100 bg-[#020617]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle 500px at 50% 200px, #3e3e3e, transparent)',
          }}
        />
      </div>
    </>
  );
}
