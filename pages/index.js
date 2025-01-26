"use client";
import { useState } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

export default function Home() {
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ playlistUrl }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze the playlist. Check the URL.");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: "#e0e0e0",
        backgroundColor: "black",
        marginTop: "2.5%",
        padding: "30px",
        borderRadius: "12px",
        boxShadow: "0px 10px 20px rgb(0, 0, 0)",
      }}
    >
      <header
        style={{
          textAlign: "center",
          marginBottom: "30px",
        }}
      >
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: "700",
            marginBottom: "10px",
            color: "#ffffff",
          }}
        >
          Playlist Analysis Tool
        </h1>
        <p
          style={{
            fontSize: "1.1rem",
            color: "#b0b0b0",
          }}
        >
          Analyze your playlist performance by viewing the data visualization.
        </p>
      </header>

      <div
        style={{
          marginBottom: "25px",
        }}
      >
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <input
            type="text"
            placeholder="Enter playlist URL"
            value={playlistUrl}
            onChange={(e) => setPlaylistUrl(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #333",
              borderRadius: "8px",
              backgroundColor: "#1e1e1e",
              color: "#e0e0e0",
              fontSize: "1rem",
              transition: "border-color 0.3s ease",
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "12px 25px",
              backgroundColor: "#3a3a3a",
              color: "#e0e0e0",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "600",
              transition: "background-color 0.3s ease, transform 0.2s ease",
            }}
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </form>
      </div>

      {error && (
        <p
          style={{
            color: "#ff4d4d",
            marginBottom: "20px",
            fontSize: "1.1rem",
            fontWeight: "500",
            textAlign: "center",
          }}
        >
          {error}
        </p>
      )}

      {result && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr",
            gap: "30px",
          }}
        >
          <div
            style={{
              padding: "25px",
              border: "1px solid #333",
              borderRadius: "12px",
              backgroundColor: "#1e1e1e",
            }}
          >
            <h2
              style={{
                color: "#ffffff",
                fontSize: "1.4rem",
                marginBottom: "15px",
              }}
            >
              Playlist
            </h2>
            <ul
              style={{
                listStyle: "none",
                padding: "0",
                display: "flex", // Flexbox for stacking vertically
                flexDirection: "column", // Stack items vertically
                gap: "20px", // Space between items
              }}
            >
              {result.videos.map((video) => (
                <li
                  key={video.id}
                  style={{
                    textAlign: "center",
                  }}
                >
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    style={{
                      width: "100%",
                      maxWidth: "220px",
                      height: "auto",
                      marginBottom: "10px",
                      borderRadius: "8px",
                      border: "1px solid #333",
                      transition: "transform 0.3s ease",
                    }}
                  />
                  <p
                    style={{
                      margin: "0",
                      color: "#b0b0b0",
                      fontSize: "1rem",
                      fontWeight: "600",
                    }}
                  >
                    {video.title}
                  </p>
                </li>
              ))}
            </ul>
          </div>
          <div
            style={{
              padding: "25px",
              border: "1px solid #333",
              borderRadius: "12px",
              backgroundColor: "#1e1e1e",
            }}
          >
            <h2
              style={{
                color: "#ffffff",
                fontSize: "1.4rem",
                marginBottom: "15px",
              }}
            >
              Views Plot
            </h2>
            <Line
              data={{
                labels: result.videos.map((_, index) => `Video ${index + 1}`),
                datasets: [
                  {
                    label: "Views",
                    data: result.videos.map((video) => video.views),
                    borderColor: "rgba(75, 192, 192, 1)",
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    pointBackgroundColor: "rgba(75, 192, 192, 1)",
                    tension: 0.3,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: true, position: "top" },
                },
                scales: {
                  x: { title: { display: true, text: "Videos" } },
                  y: { title: { display: true, text: "Views" } },
                },
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}