export default function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div
        className="ember-glow animate-drift-one animate-flicker"
        style={{
          top: "-10%",
          left: "-5%",
          width: "40vw",
          height: "40vw",
          background:
            "radial-gradient(circle, rgba(232,170,76,0.16), transparent 70%)",
        }}
      />
      <div
        className="ember-glow animate-drift-two"
        style={{
          bottom: "-15%",
          right: "-10%",
          width: "45vw",
          height: "45vw",
          background:
            "radial-gradient(circle, rgba(139,155,180,0.10), transparent 70%)",
        }}
      />
      <div
        className="ember-glow"
        style={{
          top: "30%",
          right: "20%",
          width: "20vw",
          height: "20vw",
          background:
            "radial-gradient(circle, rgba(193,123,95,0.08), transparent 70%)",
        }}
      />
    </div>
  );
}
