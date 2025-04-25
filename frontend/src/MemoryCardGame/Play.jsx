import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import backgroundGif from "../assets/images/play.gif";
import calmBackground from "../assets/images/calm-wallpaper.jpg";
import backgroundMusic from "../assets/audio/background-music.mp3";
import buttonHoverSound from "../assets/audio/button-hover.mp3";
import buttonClickSound from "../assets/audio/button-click.mp3";
import { X } from "lucide-react";
import "./Play.css";
import axios from "axios";

const modalStyles = {
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    zIndex: 999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  content: {
    backgroundColor: "#1e1e2e",
    border: "2px solid #4a4e69",
    borderRadius: "20px",
    padding: "40px",
    maxWidth: "600px",
    height: "300px",
    width: "90%",
    color: "#fff",
    textAlign: "center",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    overflow: "hidden",
  },
};

const modalPlayAndHistoryStyles = {
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    zIndex: 999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  content: {
    backgroundColor: "#1e1e2e",
    border: "2px solid #4a4e69",
    borderRadius: "20px",
    padding: "40px",
    maxWidth: "600px",
    height: "200px",
    width: "90%",
    color: "#fff",
    textAlign: "center",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    overflow: "hidden",
  },
};

const Play = () => {
  const navigate = useNavigate();
  const [SettingsmodalIsOpen, setModalSettingIsOpen] = useState(false);
  const [PlaymodalIsOpen, setModalPlayIsOpen] = useState(false);
  const [difficulty, setDifficulty] = useState(null);
  const [isCalmMode] = useState(false);
  const [HistoryModalIsOpen, setHistoryModalIsOpen] = useState(false);
  const [HistoryData, setHistoryData] = useState([]);

  const [bgVolume, setBgVolume] = useState(
    localStorage.getItem("bgVolume") !== null ? parseInt(localStorage.getItem("bgVolume"), 10) : 50
  );
  const [sfxVolume, setSfxVolume] = useState(
    localStorage.getItem("sfxVolume") !== null ? parseInt(localStorage.getItem("sfxVolume"), 10) : 50
  );

  const [mutedBg, setMutedBg] = useState(false);
  const [mutedSfx, setMutedSfx] = useState(false);

  const bgAudioRef = useRef(null);
  const hoverAudioRef = useRef(null);
  const clickAudioRef = useRef(null);

  useEffect(() => {
    bgAudioRef.current = new Audio(backgroundMusic);
    hoverAudioRef.current = new Audio(buttonHoverSound);
    clickAudioRef.current = new Audio(buttonClickSound);

    const bgAudio = bgAudioRef.current;
    bgAudio.loop = true;
    bgAudio.volume = bgVolume / 100;

    const startMusic = () => {
      bgAudio.play().catch((error) => console.error("Autoplay failed:", error));
    };

    document.addEventListener("click", startMusic, { once: true });

    return () => {
      document.removeEventListener("click", startMusic);
      bgAudio.pause();
      bgAudio.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    if (bgAudioRef.current) {
      bgAudioRef.current.volume = bgVolume / 100;
    }
    localStorage.setItem("bgVolume", bgVolume);
  }, [bgVolume]);

  useEffect(() => {
    hoverAudioRef.current.volume = sfxVolume / 100;
    clickAudioRef.current.volume = sfxVolume / 100;
    localStorage.setItem("sfxVolume", sfxVolume);
  }, [sfxVolume]);

  const handleBgVolumeChange = (event) => {
    const newVolume = parseInt(event.target.value, 10);
    setBgVolume(newVolume);
    setMutedBg(newVolume === 0);
  };

  const handleSfxVolumeChange = (event) => {
    const newVolume = parseInt(event.target.value, 10);
    setSfxVolume(newVolume);
    setMutedSfx(newVolume === 0);
  };

  const playHoverSound = () => {
    hoverAudioRef.current.currentTime = 0;
    hoverAudioRef.current.play().catch((error) =>
      console.error("Hover sound playback failed:", error)
    );
  };

  const playClickSound = () => {
    clickAudioRef.current.currentTime = 0;
    clickAudioRef.current.play().catch((error) =>
      console.error("Click sound playback failed:", error)
    );
  };

  const SettingopenModal = () => {
    setModalSettingIsOpen(true);
    playClickSound();
  };

  const SettingcloseModal = () => {
    setModalSettingIsOpen(false);
    playClickSound();
  };

  const PlayopenModal = () => {
    playClickSound();
    setModalPlayIsOpen(true);
  };

  const PlaycloseModal = () => {
    playClickSound();
    setModalPlayIsOpen(false);
  };

  const handleDifficultySelect = (level) => {
    setDifficulty(level);
  };

  const handlePlay = () => {
    playClickSound();
    const userID = localStorage.getItem("userID");
    if (!userID) {
      alert("UserID is missing. Please log in again.");
      return;
    }
    localStorage.setItem("gameStarted", "true");

    if (isCalmMode) {
      if (difficulty === "red") {
        navigate("/calm-hard");
      } else if (difficulty === "yellow") {
        navigate("/calm-medium");
      } else if (difficulty === "green") {
        navigate("/calm-easy");
      } else {
        alert(`Selected difficulty: ${difficulty}`);
      }
    } else {
      if (difficulty === "red") {
        navigate("/memory-card-game");
      } else if (difficulty === "yellow") {
        navigate("/medium");
      } else if (difficulty === "green") {
        navigate("/easy");
      } else {
        alert(`Selected difficulty: ${difficulty}`);
      }
    }
  };

  const getHistoryGame = useCallback(async () => {
    try {
      const userID = localStorage.getItem("userID");

      const response = await axios.post("http://localhost:5001/api/memory/history-game", { userID }, {
        headers: { "Content-Type": "application/json" },
      });

      setHistoryModalIsOpen(true);
      if (response?.data?.data?.length) {
        setHistoryData(response.data.data);
      }
    } catch (error) {
      console.error("Error saving game data:", error.response ? error.response.data : error.message);
    }
  }, [setHistoryModalIsOpen, setHistoryData]);

  return (
    <div
      className="background-container"
      style={{
        backgroundImage: `url(${isCalmMode ? calmBackground : backgroundGif})`,
      }}
    >
      <h1 className={`game-title ${isCalmMode ? "calm-title" : ""}`}>
        WonderCards
      </h1>

      <div className="button-container">
        <button
          className={`game-button ${isCalmMode ? "calm-button" : ""}`}
          onClick={PlayopenModal}
          onMouseEnter={playHoverSound}
        >
          Play
        </button>
        <button
          className={`game-button ${isCalmMode ? "calm-button" : ""}`}
          onClick={() => {
            playClickSound();
            alert("Instructions coming soon!");
          }}
          onMouseEnter={playHoverSound}
        >
          Instructions
        </button>
        <button
          className={`game-button ${isCalmMode ? "calm-button" : ""}`}
          onClick={() => {
            getHistoryGame();
          }}
          onMouseEnter={playHoverSound}
        >
          History
        </button>
        <button
          className={`game-button ${isCalmMode ? "calm-button" : ""}`}
          onClick={SettingopenModal}
          onMouseEnter={playHoverSound}
        >
          Settings
        </button>
      </div>
      <Modal
        isOpen={SettingsmodalIsOpen}
        onRequestClose={SettingcloseModal}
        style={{
          ...modalStyles,
          content: {
            ...modalStyles.content,
            backgroundColor: isCalmMode ? "#86a17d" : "#1e1e2e",
            color: isCalmMode ? "#ffffff" : "#fff",
          },
        }}
      >
        <button
          onClick={SettingcloseModal}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#fff",
          }}
        >
          <X size={24} />
        </button>

        <h2 className={`${isCalmMode ? "calm-mode-label" : ""} modal-h2`}>
          Background Music
        </h2>
        <div className="volume-control">
          <span className="volume-icon">{mutedBg ? "🔇" : "🔊"}</span>
          <input
            type="range"
            min="0"
            max="100"
            value={bgVolume}
            onChange={handleBgVolumeChange}
            className="volume-slider"
          />
        </div>

        <h2 className={`${isCalmMode ? "calm-mode-label" : ""} modal-h2`}>
          Sound Effects
        </h2>
        <div className="volume-control">
          <span className="volume-icon">{mutedSfx ? "🔇" : "🔊"}</span>
          <input
            type="range"
            min="0"
            max="100"
            value={sfxVolume}
            onChange={handleSfxVolumeChange}
            className="volume-slider"
          />
        </div>
      </Modal>

      <Modal
        isOpen={HistoryModalIsOpen}
        onRequestClose={() => setHistoryModalIsOpen(false)}
        style={{
          ...modalPlayAndHistoryStyles,
          content: {
            ...modalPlayAndHistoryStyles.content,
            backgroundColor: isCalmMode ? "#86a17d" : "#1e1e2e",
            color: isCalmMode ? "#ffffff" : "#fff",
            height: "400px",
          },
        }}
      >
        <button
          onClick={() => setHistoryModalIsOpen(false)}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#fff",
          }}
        >
          <X size={24} />
        </button>

        <h2 className={`${isCalmMode ? "calm-mode-label" : ""} modal-h2`}>
          Your History
        </h2>
        <div className="difficulty-selection">
          {HistoryData?.length === 0 ? (
            <p>No matches yet.</p>
          ) : (
            <table className="history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Difficulty</th>
                  <th>Time Taken (s)</th>
                  <th>Completed</th>
                  <th>Failed</th>
                </tr>
              </thead>
              <tbody>
                {HistoryData.map((game) => (
                  <tr key={game._id}>
                    <td>{new Date(game.gameDate).toLocaleDateString()}</td>
                    <td>{game.difficulty}</td>
                    <td>{game.timeTaken}s</td>
                    <td>{game.completed ? '✅' : '❌'}</td>
                    <td>{game.failed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={PlaymodalIsOpen}
        onRequestClose={PlaycloseModal}
        style={{
          ...modalPlayAndHistoryStyles,
          content: {
            ...modalPlayAndHistoryStyles.content,
            backgroundColor: isCalmMode ? "#86a17d" : "#1e1e2e",
            color: isCalmMode ? "#ffffff" : "#fff",
          },
        }}
      >
        <button
          onClick={PlaycloseModal}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#fff",
          }}
        >
          <X size={24} />
        </button>

        <h2 className={`${isCalmMode ? "calm-mode-label" : ""} modal-h2`}>
          Select Difficulty
        </h2>
        <div className="difficulty-selection">
          <button
            onClick={() => {
              handleDifficultySelect("green");
              playClickSound();
            }}
            className={`difficulty-button green ${difficulty === "green" && !isCalmMode ? "selected" : ""
              } ${isCalmMode && difficulty === "green" ? "calm-selected" : ""}`}
            onMouseEnter={playHoverSound}
          >
            Easy
          </button>
          <button
            onClick={() => {
              handleDifficultySelect("yellow");
              playClickSound();
            }}
            className={`difficulty-button yellow ${difficulty === "yellow" && !isCalmMode ? "selected" : ""
              } ${isCalmMode && difficulty === "yellow" ? "calm-selected" : ""}`}
            onMouseEnter={playHoverSound}
          >
            Normal
          </button>
          <button
            onClick={() => {
              handleDifficultySelect("red");
              playClickSound();
            }}
            className={`difficulty-button red ${difficulty === "red" && !isCalmMode ? "selected" : ""
              } ${isCalmMode && difficulty === "red" ? "calm-selected" : ""}`}
            onMouseEnter={playHoverSound}
          >
            Hard
          </button>
        </div>

        <div>
          <button
            onClick={handlePlay}
            className="play-button"
            onMouseEnter={playHoverSound}
          >
            Accept
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Play;
