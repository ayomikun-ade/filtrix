import { ImageResponse } from "next/og";

export const alt = "Filtrix — Visual Query Builder";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        background: "#0a0a0a",
        color: "#ededed",
        padding: "80px",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
        <div
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "7px",
            background: "#a6f236",
          }}
        />
        <div style={{ fontSize: "34px", fontWeight: 600, color: "#a6f236" }}>
          filtrix
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div
          style={{
            fontSize: "68px",
            fontWeight: 700,
            lineHeight: 1.08,
            maxWidth: "940px",
            letterSpacing: "-0.02em",
          }}
        >
          Build complex queries without writing the syntax.
        </div>
        <div style={{ fontSize: "30px", color: "#a1a1a1" }}>
          Visual query builder · SQL · MongoDB · GraphQL
        </div>
      </div>

      <div
        style={{
          width: "140px",
          height: "8px",
          borderRadius: "4px",
          background: "#a6f236",
        }}
      />
    </div>,
    { ...size },
  );
}
