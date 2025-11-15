document.addEventListener("DOMContentLoaded", initGame);

let gameData;
let score = 0;
let foundDifferences = [];

const gameTitle = document.getElementById("game-title");
const scoreDisplay = document.getElementById("score");
const totalDisplay = document.getElementById("total-diff");
const imageWrapper1 = document.getElementById("image-wrapper-1");
const imageWrapper2 = document.getElementById("image-wrapper-2");
const gameImage1 = document.getElementById("game-image-1");
const gameImage2 = document.getElementById("game-image-2");
const successMessage = document.getElementById("success-message");

const foundSound = new Audio("assets/found_sound.mp3");

// 2. --- INITIALIZE THE GAME ---
async function initGame() {
  try {
    const response = await fetch("game.json");
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    gameData = await response.json();
    setupGame();
  } catch (error) {
    console.error("Bhai, JSON load karne mein phat gaya:", error);
    gameTitle.textContent = "Failed to load game. JSON check kar!";
  }
}

// 3. --- SETUP THE GAME UI ---
function setupGame() {
  // Use the data from gameData (loaded from JSON)
  gameTitle.textContent = gameData.gameTitle;
  gameImage1.src = gameData.images.image1;
  gameImage2.src = gameData.images.image2;
  scoreDisplay.textContent = score;
  totalDisplay.textContent = gameData.differences.length;

  // Add click listeners to both image wrappers
  imageWrapper1.addEventListener("click", handleImageClick);
  imageWrapper2.addEventListener("click", handleImageClick);
}

// 4. --- THE CORE: HANDLE THE CLICK ---
function handleImageClick(event) {
  // 'this' refers to the element that was clicked (imageWrapper1 or 2)
  const wrapper = this;

  const clickX = event.offsetX;
  const clickY = event.offsetY;

  // Check if this click hit a 'difference'
  const foundDiff = checkDifference(clickX, clickY);

  if (foundDiff) {
    if (!foundDifferences.includes(foundDiff.id)) {
      foundDifferences.push(foundDiff.id); // Add to our 'found' list
      score++;
      updateScore();

      // --- NEW (Play Sound) ---
      playSound();

      // Mark it on *both* images
      markDifference(imageWrapper1, foundDiff);
      markDifference(imageWrapper2, foundDiff);

      // Check if the game is won
      checkWinCondition();
    }
  }
}

// 5. --- HELPER: CHECK THE COORDINATES (The 'Math') ---
function checkDifference(clickX, clickY) {
  // Loop through all 'differences' in our game data
  for (const diff of gameData.differences) {
    // The Bounding Box logic (The 'Invisible Box')
    const isHitX = clickX >= diff.x && clickX <= diff.x + diff.width;
    const isHitY = clickY >= diff.y && clickY <= diff.y + diff.height;

    if (isHitX && isHitY) {
      return diff; // Return the *entire* difference object
    }
  }
  return null; // No hit found
}

// 6. --- HELPER: MARK THE UI (The 'Circle') ---
function markDifference(wrapper, diff) {
  const marker = document.createElement("div");
  // CSS class lagate hain (jisme animation hai)
  marker.className = "difference-marker";

  marker.style.left = `${diff.x}px`;
  marker.style.top = `${diff.y}px`;
  marker.style.width = `${diff.width}px`;
  marker.style.height = `${diff.height}px`;

  wrapper.appendChild(marker);
}

// 7. --- HELPER: UPDATE SCORE ---
function updateScore() {
  scoreDisplay.textContent = score;
}
// 8. PLAY SOUND ---
function playSound() {
  foundSound.currentTime = 0;
  foundSound.play();
}

function checkWinCondition() {
  if (score === gameData.differences.length) {
    successMessage.classList.remove("hidden");
  }
}
