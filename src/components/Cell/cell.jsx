export default function Cell({
  value,
  row,
  col,
  isStart,
  isEnd,
  isPlayer,
  isVisited,
  isAnimating, // New prop
}) {
  const getBackgroundColor = () => {
    if (isAnimating) return "#FFD700"; // Yellow for animation
    if (isPlayer) return "#9C27B0";
    if (isStart) return "#4CAF50";
    if (isEnd) return "#f44336";
    if (isVisited) return "#87CEEB";
    return "#f9f9f9";
  };

  const getTextColor = () => {
    if (isAnimating) return "#333";
    if (isStart || isEnd) return "#fff";
    if (value) return "black";
    return "#333";
  };

  return (
    <td
      style={{
        width: "50px",
        height: "50px",
        border: "2px solid #333",
        textAlign: "center",
        verticalAlign: "middle",
        backgroundColor: getBackgroundColor(),
        color: getTextColor(),
        fontWeight: "bold",
        fontSize: "35px",
        transition: "background-color 0.2s ease", // Smooth color transition
        transform: isAnimating ? "scale(1.1)" : "scale(1)", // Slight scale effect
        boxShadow: isAnimating ? "0 0 10px rgba(255, 215, 0, 0.7)" : "none", // Glow effect
      }}
    >
      {value || ""}
    </td>
  );
}
