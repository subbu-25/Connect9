import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Cell from "./Cell/cell";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function GAME() {
  const [allNumbersCollected, setAllNumbersCollected] = useState(false);
  const [gotpath, setGotpath] = useState(false);
  const [startpoint, setStartpoint] = useState({});
  const [endpoint, setEndpoint] = useState({});
  const [path, setPath] = useState([]);
  const sequenceRef = useRef(0);
  const [playerPosition, setPlayerPosition] = useState({});
  const [moveStack, setMoveStack] = useState([]);
  const [lastvisited, setLastvisited] = useState(1);
  const [correctorder, setCorrectOrder] = useState(true);
  const [numberofvalues, setNumberOfValues] = useState(0);
  const [correctorderval, setCorrectOrderVal] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentAnimationIndex, setCurrentAnimationIndex] = useState(-1);
  const animationTimeoutRef = useRef(null);

  // Authoritative counter for visited cells
  const visitedCount = useRef(0);
  const [visitedCells, setVisitedCells] = useState([]);

  const grid = useMemo(() => {
    const g = Array(6)
      .fill()
      .map(() => Array(6).fill(null));

    path.forEach(({ row, col, value }) => {
      if (value !== undefined) {
        g[row][col] = value;
      }
    });

    console.log("Grid after mapping:", g);
    console.log(path);
    return g;
  }, [path]);
  const isCellAnimating = (row, col) => {
    if (!isAnimating || currentAnimationIndex < 0) return false;
    const currentPathCell = path[currentAnimationIndex];
    return (
      currentPathCell &&
      currentPathCell.row === row &&
      currentPathCell.col === col
    );
  };

  // New function to start path animation
  const startPathAnimation = () => {
    if (path.length === 0) {
      toast.info("No path to animate!", {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }

    if (isAnimating) {
      // Stop current animation
      setIsAnimating(false);
      setCurrentAnimationIndex(-1);
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      return;
    }

    setIsAnimating(true);
    setCurrentAnimationIndex(0);
    animateNextCell(0);
  };

  // Function to animate each cell in sequence
  const animateNextCell = (index) => {
    if (index >= path.length) {
      // Animation complete
      setIsAnimating(false);
      setCurrentAnimationIndex(-1);
      toast.success("Path animation complete!", {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }

    setCurrentAnimationIndex(index);

    animationTimeoutRef.current = setTimeout(() => {
      animateNextCell(index + 1);
    }, 300); // 300ms delay between each cell animation
  };

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  function place7digits() {
    const placements = [
      { index: 0, value: 1 },
      { index: 5, value: 2 },
      { index: 9, value: 3 },
      { index: 13, value: 4 },
      { index: 17, value: 5 },
      { index: 21, value: 6 },
      { index: 25, value: 7 },
      { index: 30, value: 8 },
      { index: 35, value: 9 },
    ];
    setPath((prevState) => {
      const newState = [...prevState];

      placements.forEach(({ index, value }) => {
        newState[index] = {
          ...newState[index],
          value: value,
        };
      });

      return newState;
    });
  }

  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  const isCellVisited = (row, col) => {
    return visitedCells.some((cell) => cell.row === row && cell.col === col);
  };
  const generateNewPuzzle = () => {
    // Stop any ongoing animation
    if (isAnimating) {
      setIsAnimating(false);
      setCurrentAnimationIndex(-1);
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    }

    // Reset all state variables to initial values
    setAllNumbersCollected(false);
    setGotpath(false);
    setStartpoint({});
    setEndpoint({});
    setPath([]);
    sequenceRef.current = 0;
    setPlayerPosition({});
    setMoveStack([]);
    setLastvisited(1);
    setCorrectOrder(true);
    setNumberOfValues(0);
    setCorrectOrderVal(1);
    setCurrentAnimationIndex(-1);

    // Reset visited cells tracking
    visitedCount.current = 0;
    setVisitedCells([]);

    toast.info("Generating new puzzle...", {
      position: "top-center",
      autoClose: 2000,
    });
  };

  function findHamiltonianPath(start, end) {
    const localVisited = Array(6)
      .fill()
      .map(() => Array(6).fill(false));
    const localPath = [];

    function dfs(current, target, pathLength) {
      localPath.push({ row: current.row, col: current.col });
      localVisited[current.row][current.col] = true;

      if (
        pathLength === 35 &&
        Math.abs(current.row - target.row) +
          Math.abs(current.col - target.col) ===
          1 &&
        !localVisited[target.row][target.col]
      ) {
        localPath.push({ row: target.row, col: target.col });
        return true;
      }
      const randomDirs = shuffle(directions);

      for (let i = 0; i < 4; i++) {
        const nr = current.row + randomDirs[i][0];
        const nc = current.col + randomDirs[i][1];

        if (nr >= 0 && nr < 6 && nc >= 0 && nc < 6 && !localVisited[nr][nc]) {
          if (dfs({ row: nr, col: nc }, target, pathLength + 1)) {
            return true;
          }
        }
      }

      localPath.pop();
      localVisited[current.row][current.col] = false;
      return false;
    }

    const found = dfs(start, end, 1);

    if (found) {
      setPath([...localPath]);
      return true;
    } else {
      setPath([]);
      return false;
    }
  }

  function generatePath() {
    const currentSequence = ++sequenceRef.current;
    const sPoint = {
      row: Math.floor(Math.random() * 6),
      col: Math.floor(Math.random() * 6),
    };

    let ePoint;
    do {
      ePoint = {
        row: Math.floor(Math.random() * 6),
        col: Math.floor(Math.random() * 6),
      };
    } while (sPoint.row === ePoint.row && sPoint.col === ePoint.col);

    setStartpoint(sPoint);
    setEndpoint(ePoint);
    setPlayerPosition(sPoint);

    const success = findHamiltonianPath(sPoint, ePoint);
    console.log("Path found:", success);
    console.log("Path length:", path.length);
    console.log(path);
    if (success && currentSequence === sequenceRef.current) {
      setGotpath(true);
      place7digits();
      // Reset all state variables
      setMoveStack([]);
      setVisitedCells([sPoint]);
      visitedCount.current = 1; // Start cell already visited
      setLastvisited(1);
      setCorrectOrder(true);
      setNumberOfValues(0);
      setCorrectOrderVal(1);
      setAllNumbersCollected(false);
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (!gotpath) {
        generatePath();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gotpath]);

  const handleKeyPress = useCallback(
    (event) => {
      event.preventDefault();
      if (event.key === " " || event.key === "Spacebar") {
        if (moveStack.length > 0) {
          const lastMove = moveStack[moveStack.length - 1];

          // Check if we're undoing a move that had a number
          const currentCell = grid[playerPosition.row][playerPosition.col];
          const wasNumberCell = currentCell !== null;

          setMoveStack((prev) => prev.slice(0, -1));

          setVisitedCells((prev) => {
            const withoutCurrent = prev.filter(
              (cell) =>
                !(
                  cell.row === playerPosition.row &&
                  cell.col === playerPosition.col
                )
            );
            visitedCount.current = withoutCurrent.length;
            return withoutCurrent;
          });

          // Restore number tracking state
          if (wasNumberCell) {
            // If we're undoing from a numbered cell, restore previous state
            setCorrectOrderVal(lastMove.correctOrderVal || 1);
            setLastvisited(lastMove.lastVisited || 1);
            setNumberOfValues(lastMove.numberOfValues || 0);
            setCorrectOrder(
              lastMove.correctOrder !== undefined ? lastMove.correctOrder : true
            );
          }
          if (currentCell === 9) {
            setAllNumbersCollected(false);
          }

          setPlayerPosition(lastMove.position);
          console.log("Undid move to:", lastMove.position);
        } else {
          toast.info("No moves to undo!", {
            position: "top-left",
            autoClose: 1500,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
        return;
      }

      setPlayerPosition((prev) => {
        let newRow = prev.row;
        let newCol = prev.col;

        switch (event.key) {
          case "ArrowUp":
            newRow = Math.max(0, prev.row - 1);
            break;
          case "ArrowDown":
            newRow = Math.min(5, prev.row + 1);
            break;
          case "ArrowLeft":
            newCol = Math.max(0, prev.col - 1);
            break;
          case "ArrowRight":
            newCol = Math.min(5, prev.col + 1);
            break;
          default:
            return prev;
        }

        const newPosition = { row: newRow, col: newCol };

        if (newRow !== prev.row || newCol !== prev.col) {
          if (isCellVisited(newRow, newCol)) {
            toast.error("Can visit only once!", {
              position: "top-left",
              autoClose: 2000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
            return prev;
          }

          const cellValue = grid[newRow][newCol];
          let newCorrectOrder = correctorder;
          let newCorrectOrderVal = correctorderval;
          let newLastVisited = lastvisited;
          let newNumberOfValues = numberofvalues;

          if (cellValue !== null) {
            // Check if numbers are visited in order
            if (cellValue !== correctorderval + 1) {
              toast.error("Numbers shall be visited in order!", {
                position: "top-left",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              });
              newCorrectOrder = false;
            } else {
              // Update tracking variables when correct number is visited
              newCorrectOrderVal = cellValue;
              newLastVisited = cellValue;
              newNumberOfValues = numberofvalues + 1;
              newCorrectOrder = true;
            }

            // Update the state variables
            setCorrectOrderVal(newCorrectOrderVal);
            setLastvisited(newLastVisited);
            setNumberOfValues(newNumberOfValues);
            setCorrectOrder(newCorrectOrder);
          }

          // Store enhanced move info in stack
          setMoveStack((prevStack) => {
            const lastElement = prevStack[prevStack.length - 1];
            if (
              lastElement &&
              lastElement.position.row === prev.row &&
              lastElement.position.col === prev.col
            ) {
              return prevStack;
            }

            // Store current state before the move
            return [
              ...prevStack,
              {
                position: prev,
                correctOrderVal: correctorderval,
                lastVisited: lastvisited,
                numberOfValues: numberofvalues,
                correctOrder: correctorder,
              },
            ];
          });

          // Unique cell addition with counter update
          setVisitedCells((prev) => {
            const already = prev.some(
              (c) => c.row === newRow && c.col === newCol
            );
            if (already) return prev;
            visitedCount.current = prev.length + 1;
            return [...prev, newPosition];
          });
        }

        console.log(`Player moved to: ${newRow}, ${newCol}`);
        return { row: newRow, col: newCol };
      });
    },
    [
      visitedCells,
      isCellVisited,
      moveStack,
      playerPosition,
      grid,
      correctorderval,
      lastvisited,
      numberofvalues,
      correctorder,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  // Central success/warning gate (single place, single toast)
  useEffect(() => {
    if (!correctorder || correctorderval < 9) return; // haven't got 1-9 yet
    if (allNumbersCollected) return; // toast already fired

    setAllNumbersCollected(true);

    if (visitedCount.current === 36) {
      toast.success(
        "Perfect! All numbers collected and all 36 cells visited!",
        {
          position: "top-center",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    } else {
      toast.warning(
        `All numbers collected in order, but only ${visitedCount.current}/36 cells visited. Keep exploring!`,
        {
          position: "top-center",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    }
  }, [correctorder, correctorderval, allNumbersCollected]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>CONNECT9</h2>
      <div style={{ textAlign: "center", marginBottom: "10px" }}>
        <p>
          Numbers visited in order: {correctorder ? "Yes" : "No"} | Expected
          next: {correctorderval + 1} | Cells visited: {visitedCount.current}/36
        </p>

        {/* Wrap buttons in a flex container with gap */}
        <div
          style={{
            display: "flex",
            gap: "20px",
            justifyContent: "center",
            marginTop: "10px",
          }}
        >
          {/* Animation Button */}
          <button
            onClick={startPathAnimation}
            disabled={path.length === 0}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              fontWeight: "bold",
              backgroundColor: isAnimating ? "#f44336" : "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: path.length === 0 ? "not-allowed" : "pointer",
              transition: "background-color 0.3s ease",
            }}
          >
            {isAnimating ? "Stop Animation" : "Animate Path"}
          </button>

          {/* Generate New Puzzle Button */}
          <button
            onClick={generateNewPuzzle}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              fontWeight: "bold",
              backgroundColor: "#2196F3",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              transition: "background-color 0.3s ease",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#1976D2")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#2196F3")}
          >
            Generate New Puzzle
          </button>
        </div>

        {isAnimating && (
          <p style={{ marginTop: "10px", color: "#666" }}>
            Animating step {currentAnimationIndex + 1} of {path.length}
          </p>
        )}
      </div>

      <table style={{ borderCollapse: "collapse", margin: "20px auto" }}>
        <tbody>
          {grid.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, colIndex) => (
                <Cell
                  key={colIndex}
                  value={cell}
                  row={rowIndex}
                  col={colIndex}
                  isStart={
                    startpoint.row === rowIndex && startpoint.col === colIndex
                  }
                  isEnd={endpoint.row === rowIndex && endpoint.col === colIndex}
                  isPlayer={
                    playerPosition.row === rowIndex &&
                    playerPosition.col === colIndex
                  }
                  isVisited={isCellVisited(rowIndex, colIndex)}
                  isAnimating={isCellAnimating(rowIndex, colIndex)}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <ToastContainer />
    </div>
  );
}
