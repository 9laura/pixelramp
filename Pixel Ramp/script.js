const board = document.getElementById("board");
const startBtn = document.getElementById("startBtn");
const rollBtn = document.getElementById("rollBtn");
const playerCount = document.getElementById("playerCount");
const currentPlayerEl = document.getElementById("currentPlayer");
const diceResultEl = document.getElementById("diceResult");
const messageBox = document.getElementById("messageBox");
const playersList = document.getElementById("playersList");

const TOTAL_CASAS = 110;
const COLUNAS = 10;

let players = [];
let currentPlayerIndex = 0;
let gameStarted = false;
let moving = false;

const colors = [
  "#6ce5ff", "#ff4cd8", "#8cff6c", "#ff6b6b", "#46d7b9",
  "#c46cff", "#ffe66c", "#74a7ff", "#ff914d", "#7affc7"
];

const pawnImages = [
  "img/peao1.png",
  "img/peao2.png",
  "img/peao3.png",
  "img/peao4.png",
  "img/peao5.png",
  "img/peao6.png",
  "img/peao7.png",
  "img/peao8.png",
  "img/peao9.png",
  "img/peao10.png"
];

const events = {
  heart: {
    img: "img/heart.png",
    emoji: "❤️",
    message: "Power-up! Dobre o valor do seu próximo dado.",
    action: player => player.doubleNext = true
  },
  spiderman: {
    img: "img/spiderman.png",
    emoji: "🕷️",
    message: "Sentido Aranha! Na próxima rodada, mova-se em formato de L.",
    action: player => player.skipEffect = true
  },
  pearl: {
    img: "img/pearl.png",
    emoji: "🟢",
    message: "EnderPearl! Você se teleportou 10 casas à frente.",
    action: player => movePlayer(player, 10)
  },
  rainbow: {
    img: "img/rainbow.png",
    emoji: "🌈",
    message: "Caos total! Escolha dois jogadores e troque a posição deles no tabuleiro.",
    action: () => swapRandomPlayers()
  },
 pipe: {
  img: "img/pipe.png",
  emoji: "🟩",
  message: "Cano! Você entrou em um cano e saiu pelo outro.",
  action: player => teleportPipe(player)
},
  pikachu: {
    img: "img/pikachu.png",
    emoji: "⚡",
    message: "Choque! Todos os outros jogadores ficam paralisados por uma rodada.",
    action: player => freezeOthers(player)
  },
  gengar: {
    img: "img/gengar.png",
    emoji: "👾",
    message: "Que pesadelo! Gengar te derrubou 3 andares abaixo.",
    action: player => movePlayer(player, -30)
  },
  diamond: {
    img: "img/diamond.png",
    emoji: "💎",
    message: "Incrível! Você é o vencedor e conquistou o diamante cintilante!",
    action: player => player.position = TOTAL_CASAS
  },
  fire: {
    img: "img/fire.png",
    emoji: "🔥",
    message: "FOGO! Volte 4 casas para apagar o incêndio nas botas.",
    action: player => movePlayer(player, -4)
  },
  clover: {
    img: "img/clover.png",
    emoji: "🍀",
    message: "Sorte! Você está imune a qualquer efeito negativo na próxima rodada.",
    action: player => player.immune = true
  },
  ladder: {
    img: "img/ladder.png",
    emoji: "🪜",
    message: "Escada! Suba para uma casa melhor no tabuleiro.",
    action: player => movePlayer(player, 15)
  },
  sword: {
    img: "img/sword.png",
    emoji: "🗡️",
    message: "PVP! Você e um oponente rolam o dado. O menor valor volta 5 casas.",
    action: player => pvp(player)
  },
  warning: {
    img: "img/warning.png",
    emoji: "⚠️",
    message: "Critical Error! Role o dado. Se tirar 1, volte ao início.",
    action: player => {
      const d = rollDice();
      if (d === 1) player.position = 1;
      messageBox.innerHTML += `<br>Você tirou ${d}.`;
    }
  },
  luckyblock: {
    img: "img/luckyblock.png",
    emoji: "❔",
    message: "Lucky Block! Roube o efeito do próximo jogador.",
    action: player => player.stealNext = true
  },
  pokeball: {
    img: "img/pokeball.png",
    emoji: "🔴",
    message: "Pokebola! Escolha um efeito e reproduza-o.",
    action: player => movePlayer(player, 6)
  },
  pacman: {
    img: "img/pacman.png",
    emoji: "🟡",
    message: "Waka! Avance 5 casas devorando todos os obstáculos no caminho.",
    action: player => movePlayer(player, 5)
  },
  cowabunga: {
    img: "img/cowabunga.png",
    emoji: "🐢",
    message: "Cowabunga! Avance 3 casas.",
    action: player => movePlayer(player, 3)
  },
  crystal: {
    img: "img/crystal.png",
    emoji: "🔮",
    message: "Sua sorte é minha! Pegue o efeito de alguém nessa rodada.",
    action: player => movePlayer(player, 4)
  },
  potion: {
    img: "img/potion.png",
    emoji: "🧪",
    message: "Vida extra! Adicione +5 casas ao resultado do seu próximo dado.",
    action: player => player.bonusNext = 5
  },
  cat: {
    img: "img/cat.png",
    emoji: "😺",
    message: "Nyan cat, arco-íris veloz! Ande dez casas.",
    action: player => movePlayer(player, 10)
  },
  piranha: {
    img: "img/piranha.png",
    emoji: "🌱",
    message: "Planta Piranha! Ela te mordeu: volte 2 casas para se curar.",
    action: player => movePlayer(player, -2)
  },
  snail: {
    img: "img/snail.png",
    emoji: "🐌",
    message: "Meow... É o Gary! -2 nos seus próximos dois dados.",
    action: player => player.negativeTurns = 2
  },
  star: {
    img: "img/star.png",
    emoji: "⭐",
    message: "Invencibilidade! Ignore seu próximo efeito negativo.",
    action: player => player.immune = true
  },
  beepi: {
    img: "img/beepi.png",
    emoji: "🦕",
    message: "BEEPI BEEP! Era miragem! Volte para sua antiga casa.",
    action: player => player.position = player.oldPosition
  },
  party: {
    img: "img/party.png",
    emoji: "🎉",
    message: "WOW! Na próxima rodada, role dois dados e some os valores.",
    action: player => player.twoDiceNext = true
  },
  crown: {
    img: "img/crown.png",
    emoji: "👑",
    message: "Meowth te amaldiçoou! Volte ao início.",
    action: player => player.position = 1
  },
  tnt: {
    img: "img/tnt.png",
    emoji: "🧨",
    message: "Explosão! O impacto te jogou de volta para a casa 10.",
    action: player => player.position = 10
  },
  banana: {
    img: "img/banana.png",
    emoji: "🍌",
    message: "Ouch! Você escorregou e voltou 5 casas.",
    action: player => movePlayer(player, -5)
  },
  kirby: {
    img: "img/kirby.png",
    emoji: "🌸",
    message: "Copião! Repita o efeito da última casa especial de alguém.",
    action: player => movePlayer(player, 2)
  },
  ghost: {
    img: "img/ghost.png",
    emoji: "👻",
    message: "Um fantasma te cercou! Tire par no dado e fuja ou reinicie o jogo.",
    action: player => {
      const d = rollDice();
      if (d % 2 !== 0) player.position = 1;
      messageBox.innerHTML += `<br>Você tirou ${d}.`;
    }
  },
  squid: {
    img: "img/squid.png",
    emoji: "🦑",
    message: "Invasão alienígena! Um raio trator puxou você de volta 6 casas.",
    action: player => movePlayer(player, -6)
  }
};

const houseIcons = {
  3: "heart",
  6: "spiderman",
  9: "pearl",
  12: "cat",
  14: "party",
  15: "star",
  17: "piranha",
  21: "party",
  24: "beepi",
  25: "cat",
  27: "star",
  30: "snail",
  31: "crown",
  33: "ladder",
  36: "tnt",
  39: "banana",
  42: "cowabunga",
  45: "ghost",
  48: "kirby",
  50: "crystal",
  52: "pipe",
  54: "warning",
  56: "star",
  59: "snail",
  61: "ladder",
  64: "ladder",
  66: "beepi",
  68: "pikachu",
  70: "gengar",
  72: "potion",
  74: "spiderman",
  76: "pokeball",
  79: "banana",
  81: "sword",
  84: "ladder",
  86: "pipe",
  88: "squid",
  90: "luckyblock",
  92: "pacman",
  94: "ladder",
  96: "sword",
  98: "rainbow",
  100: "rainbow",
  101: "diamond",
  103: "gengar",
  104: "clover",
  106: "fire",
  108: "diamond",
  109: "gengar"
};

function createBoard() {
  board.innerHTML = "";

  for (let row = 10; row >= 0; row--) {
    const start = row * COLUNAS + 1;
    const nums = [];

    for (let i = 0; i < COLUNAS; i++) {
      nums.push(start + i);
    }

    if (row % 2 === 1) nums.reverse();

    nums.forEach(num => {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.house = num;
      cell.style.background = colors[(num - 1) % colors.length];

      const iconKey = houseIcons[num];

      if (iconKey) {
        const event = events[iconKey];

        const img = document.createElement("img");
        img.className = "cell-icon";
        img.src = event.img;
        img.alt = iconKey;

        img.onerror = () => {
          img.remove();
          const fallback = document.createElement("span");
          fallback.className = "fallback-icon";
          fallback.textContent = event.emoji;
          cell.appendChild(fallback);
        };

        cell.appendChild(img);
      } else {
        const number = document.createElement("span");
        number.className = "cell-number";
        number.textContent = num;
        cell.appendChild(number);
      }

      const tokens = document.createElement("div");
      tokens.className = "tokens";
      cell.appendChild(tokens);

      board.appendChild(cell);
    });
  }
}

function startGame() {
  const count = Number(playerCount.value);

  players = [];

  for (let i = 0; i < count; i++) {
    players.push({
      id: i + 1,
      name: `Jogador ${i + 1}`,
      position: 1,
      oldPosition: 1,
      avatar: pawnImages[i],
      doubleNext: false,
      twoDiceNext: false,
      bonusNext: 0,
      negativeTurns: 0,
      immune: false,
      frozen: 0
    });
  }

  currentPlayerIndex = 0;
  gameStarted = true;

  rollBtn.disabled = false;
  messageBox.textContent = "Jogo iniciado! Boa sorte.";
  renderPlayers();
  renderTokens();
  updateHUD();
}

function renderPlayers() {
  playersList.innerHTML = "";

  players.forEach((player, index) => {
    const card = document.createElement("div");
    card.className = "player-card";

    if (index === currentPlayerIndex) {
      card.classList.add("active");
    }

    card.innerHTML = `
      <img src="${player.avatar}" onerror="this.style.display='none'">
      ${player.name}<br>
      Casa: ${player.position}
    `;

    playersList.appendChild(card);
  });
}

function renderTokens() {
  document.querySelectorAll(".tokens").forEach(t => t.innerHTML = "");

  players.forEach(player => {
    const cellTokens = document.querySelector(`[data-house="${player.position}"] .tokens`);
    if (!cellTokens) return;

    const playersInSameHouse = players.filter(p => p.position === player.position);
    const indexInHouse = playersInSameHouse.findIndex(p => p.id === player.id);
    const totalInHouse = playersInSameHouse.length;

    const token = document.createElement("img");
    token.className = "token";
    token.src = player.avatar;
    token.title = player.name;

    const positions = getTokenPosition(indexInHouse, totalInHouse);

    token.style.left = positions.left;
    token.style.top = positions.top;
    token.style.transform = positions.transform;
    token.style.zIndex = 10 + indexInHouse;

    token.onerror = () => {
      token.remove();
      const fallback = document.createElement("div");
      fallback.className = "token";
      fallback.textContent = player.id;
      fallback.style.left = positions.left;
      fallback.style.top = positions.top;
      fallback.style.transform = positions.transform;
      fallback.style.zIndex = 10 + indexInHouse;
      cellTokens.appendChild(fallback);
    };

    cellTokens.appendChild(token);
  });
}

function getTokenPosition(index, total) {
  if (total === 1) {
    return {
      left: "50%",
      top: "50%",
      transform: "translate(-50%, -50%)"
    };
  }

  const positions = [
    {
      left: "38%",
      top: "52%",
      transform: "translate(-50%, -50%) rotate(-8deg)"
    },
    {
      left: "62%",
      top: "48%",
      transform: "translate(-50%, -50%) rotate(8deg)"
    },
    {
      left: "50%",
      top: "35%",
      transform: "translate(-50%, -50%) scale(.92)"
    },
    {
      left: "50%",
      top: "68%",
      transform: "translate(-50%, -50%) scale(.92)"
    },
    {
      left: "30%",
      top: "35%",
      transform: "translate(-50%, -50%) scale(.85) rotate(-10deg)"
    },
    {
      left: "70%",
      top: "35%",
      transform: "translate(-50%, -50%) scale(.85) rotate(10deg)"
    },
    {
      left: "30%",
      top: "68%",
      transform: "translate(-50%, -50%) scale(.85) rotate(8deg)"
    },
    {
      left: "70%",
      top: "68%",
      transform: "translate(-50%, -50%) scale(.85) rotate(-8deg)"
    },
    {
      left: "42%",
      top: "42%",
      transform: "translate(-50%, -50%) scale(.78)"
    },
    {
      left: "58%",
      top: "58%",
      transform: "translate(-50%, -50%) scale(.78)"
    }
  ];

  return positions[index] || positions[0];
}

function updateHUD() {
  const current = players[currentPlayerIndex];
  currentPlayerEl.textContent = current ? current.name : "-";
  renderPlayers();
}

function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}

async function playTurn() {
  if (!gameStarted || moving) return;

  const player = players[currentPlayerIndex];

  if (player.frozen > 0) {
    player.frozen--;
    messageBox.textContent = `${player.name} está paralisado e perdeu a rodada.`;
    nextPlayer();
    return;
  }

  player.oldPosition = player.position;

  let dice = rollDice();

  if (player.twoDiceNext) {
    dice += rollDice();
    player.twoDiceNext = false;
  }

  if (player.doubleNext) {
    dice *= 2;
    player.doubleNext = false;
  }

  if (player.bonusNext > 0) {
    dice += player.bonusNext;
    player.bonusNext = 0;
  }

  if (player.negativeTurns > 0) {
    dice = Math.max(1, dice - 2);
    player.negativeTurns--;
  }

  diceResultEl.textContent = dice;

  messageBox.textContent = `${player.name} tirou ${dice} no dado.`;

  await animateMove(player, dice);

  checkHouseEvent(player);

  if (player.position >= TOTAL_CASAS) {
    player.position = TOTAL_CASAS;
    renderTokens();
    renderPlayers();
    rollBtn.disabled = true;
    messageBox.innerHTML = `🏆 ${player.name} venceu o jogo!`;
    return;
  }

  renderTokens();
  renderPlayers();

  setTimeout(nextPlayer, 700);
}

function movePlayer(player, amount) {
  player.position += amount;

  if (player.position < 1) player.position = 1;
  if (player.position > TOTAL_CASAS) player.position = TOTAL_CASAS;
}

function animateMove(player, steps) {
  return new Promise(resolve => {
    moving = true;

    let count = 0;

    const interval = setInterval(() => {
      if (count >= steps) {
        clearInterval(interval);
        moving = false;
        resolve();
        return;
      }

      if (player.position < TOTAL_CASAS) {
        player.position++;
      }

      count++;
      renderTokens();
      renderPlayers();
    }, 180);
  });
}

function checkHouseEvent(player) {
  const iconKey = houseIcons[player.position];

  if (!iconKey) {
    messageBox.innerHTML += `<br>${player.name} caiu em uma casa comum.`;
    return;
  }

  const event = events[iconKey];

  const negativeEvents = [
    "gengar", "fire", "warning", "crown", "tnt",
    "banana", "ghost", "squid", "piranha", "snail"
  ];

  if (player.immune && negativeEvents.includes(iconKey)) {
    player.immune = false;
    messageBox.innerHTML += `<br>Invencibilidade ativada! ${player.name} ignorou o efeito negativo.`;
    return;
  }

  messageBox.innerHTML += `<br><strong>${event.message}</strong>`;
  event.action(player);

  if (player.position < 1) player.position = 1;
  if (player.position > TOTAL_CASAS) player.position = TOTAL_CASAS;
}

function nextPlayer() {
  currentPlayerIndex++;

  if (currentPlayerIndex >= players.length) {
    currentPlayerIndex = 0;
  }

  updateHUD();
}

function freezeOthers(currentPlayer) {
  players.forEach(player => {
    if (player.id !== currentPlayer.id) {
      player.frozen = 1;
    }
  });
}

function swapRandomPlayers() {
  if (players.length < 2) return;

  const a = players[Math.floor(Math.random() * players.length)];
  let b = players[Math.floor(Math.random() * players.length)];

  while (a.id === b.id) {
    b = players[Math.floor(Math.random() * players.length)];
  }

  const temp = a.position;
  a.position = b.position;
  b.position = temp;

  messageBox.innerHTML += `<br>${a.name} trocou de lugar com ${b.name}.`;
}
function teleportPipe(player) {
  const pipeHouses = Object.keys(houseIcons)
    .filter(house => houseIcons[house] === "pipe")
    .map(Number)
    .sort((a, b) => a - b);

  if (pipeHouses.length < 2) return;

  const firstPipe = pipeHouses[0];
  const secondPipe = pipeHouses[1];

  if (player.position === firstPipe) {
    player.position = secondPipe;
    messageBox.innerHTML += `<br>Você saiu pelo cano da casa ${secondPipe}.`;
  } else if (player.position === secondPipe) {
    player.position = firstPipe;
    messageBox.innerHTML += `<br>Você saiu pelo cano da casa ${firstPipe}.`;
  }
}

function pvp(player) {
  const opponents = players.filter(p => p.id !== player.id);
  const opponent = opponents[Math.floor(Math.random() * opponents.length)];

  const d1 = rollDice();
  const d2 = rollDice();

  if (d1 < d2) {
    movePlayer(player, -5);
  } else if (d2 < d1) {
    movePlayer(opponent, -5);
  }

  messageBox.innerHTML += `<br>${player.name} tirou ${d1}. ${opponent.name} tirou ${d2}.`;
}

startBtn.addEventListener("click", startGame);
rollBtn.addEventListener("click", playTurn);

createBoard();