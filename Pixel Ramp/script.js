const board = document.getElementById("board");
const startBtn = document.getElementById("startBtn");
const rollBtn = document.getElementById("rollBtn");
const playerCount = document.getElementById("playerCount");
const currentPlayerEl = document.getElementById("currentPlayer");
const diceResultEl = document.getElementById("diceResult");
const messageBox = document.getElementById("messageBox");
const playersList = document.getElementById("playersList");
const modalEvento = document.getElementById("modalEvento");
const modalClose = document.getElementById("modalClose");


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
  "img/peao1.png", "img/peao2.png", "img/peao3.png", "img/peao4.png", "img/peao5.png",
  "img/peao6.png", "img/peao7.png", "img/peao8.png", "img/peao9.png", "img/peao10.png"
];

const houseIcons = {
  3: "heart",
  6: "spiderman",
  9: "pearl",
  12: "scared",
  15: "cat",
  18: "piranha",
  21: "snail",
  24: "star",
  27: "beepi",
  29: "ladder",
  30: "party",
  33: "crown",
  35: "snake",
  36: "tnt",
  37: "ladder",
  39: "banana",
  43: "kirby",
  46: "ghost",
  49: "cowabunga",
  51: "crystal",
  54: "justice",
  57: "rainbow",
  59: "snake",
  60: "pipe",
  62: "pikachu",
  64: "ladder",
  65: "saved",
  68: "solar",
  72: "father",
  74: "snake",
  75: "potion",
  78: "luckyblock",
  81: "impostor",
  82: "snake",
  84: "pokeball",
  86: "ladder",
  87: "pipe",
  90: "pacman",
  93: "squid",
  96: "sword",
  99: "warning",
  103: "fire",
  106: "clover",
  108: "snake",
  109: "gengar",
  110: "diamond"
};

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
    action: player => player.bonusNext = 3
  },
  pearl: {
    img: "img/pearl.png",
    emoji: "🟢",
    message: "EnderPearl! Você se teletransportou 10 casas à frente.",
    action: player => movePlayer(player, 10)
  },
  scared: {
    img: "img/scared.png",
    emoji: "😱",
    message: "Medroso! Fique uma rodada sem jogar de tanto susto.",
    action: player => player.frozen = 1
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
    message: "BEEP! BEEP! Era miragem! Volte a sua antiga casa.",
    action: player => player.position = player.oldPosition
  },
  ladder: {
    img: "img/ladder.png",
    emoji: "🪜",
    message: "Escada! Você subiu para uma casa mais alta.",
    action: player => useLadder(player)
  },
  party: {
    img: "img/party.png",
    emoji: "🎉",
    message: "WOW! Na próxima rodada, role dois dados e some os valores!",
    action: player => player.twoDiceNext = true
  },
  crown: {
    img: "img/crown.png",
    emoji: "👑",
    message: "Meowth te amaldiçoou! Volte ao início.",
    action: player => player.position = 1
  },
  snake: {
    img: "img/snake.png",
    emoji: "🐍",
    message: "Cobra! Você deslizou para uma casa mais baixa.",
    action: player => useSnake(player)
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
    action: player => repeatLastSpecial(player)
  },
  ghost: {
    img: "img/ghost.png",
    emoji: "👻",
    message: "Um fantasma te cercou! Tire par no dado e fuja ou reinicie o jogo!",
    action: player => {
      const d = rollDice();
      messageBox.innerHTML += `<br>Você tirou ${d}.`;
      if (d % 2 !== 0) player.position = 1;
    }
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
  justice: {
    img: "img/justice.png",
    emoji: "⚖️",
    message: "Justiça! Escolha um jogador à sua frente e troque de lugar com ele.",
    action: player => swapWithAheadPlayer(player)
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
    message: "Atalho! Viaje pelo encanamento até o outro cano.",
    action: player => teleportPipe(player)
  },
  pikachu: {
    img: "img/pikachu.png",
    emoji: "⚡",
    message: "Choque! Todos os outros jogadores ficam paralisados por uma rodada.",
    action: player => freezeOthers(player)
  },
  saved: {
    img: "img/saved.png",
    emoji: "🛡️",
    message: "Salvo! Pule sua vez, mas no próximo giro, ande o triplo do dado!",
    action: player => {
      player.frozen = 1;
      player.tripleNext = true;
    }
  },
  solar: {
    img: "img/solar.png",
    emoji: "🌻",
    message: "Energia solar! Dance até a sua próxima vez de jogar.",
    action: player => player.frozen = 1
  },
  father: {
    img: "img/father.png",
    emoji: "🖤",
    message: "Eu sou seu pai! O susto foi tão grande que todos os jogadores voltam 1 casa.",
    action: () => players.forEach(p => movePlayer(p, -1))
  },
  potion: {
    img: "img/potion.png",
    emoji: "🧪",
    message: "Vida extra! Adicione +5 casas ao resultado do seu próximo dado.",
    action: player => player.bonusNext = 5
  },
  luckyblock: {
    img: "img/luckyblock.png",
    emoji: "❔",
    message: "Lucky Block! Roube o efeito do próximo jogador.",
    action: player => movePlayer(player, 6)
  },
  impostor: {
    img: "img/impostor.png",
    emoji: "🔪",
    message: "Impostor! A qualquer momento do jogo, sabote um jogador e o derrube 15 casas.",
    action: player => sabotageAheadPlayer(player)
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
  squid: {
    img: "img/squid.png",
    emoji: "🦑",
    message: "Invasão alienígena! Um raio trator te puxou de volta 6 casas.",
    action: player => movePlayer(player, -6)
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
      messageBox.innerHTML += `<br>Você tirou ${d}.`;
      if (d === 1) player.position = 1;
    }
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
  }
};

function createBoard() {
  board.innerHTML = "";

  for (let row = 10; row >= 0; row--) {
    const start = row * COLUNAS + 1;
    const nums = [];

    for (let i = 0; i < COLUNAS; i++) nums.push(start + i);

    if (row % 2 === 1) nums.reverse();

    nums.forEach(num => {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.house = num;
      cell.style.background = colors[(num - 1) % colors.length];

      const iconKey = houseIcons[num];

      if (iconKey && iconKey !== "ladder" && iconKey !== "snake") {
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
      tripleNext: false,
      bonusNext: 0,
      negativeTurns: 0,
      immune: false,
      frozen: 0,
      lastSpecial: null
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

    if (index === currentPlayerIndex) card.classList.add("active");

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

    const pos = getTokenPosition(indexInHouse, totalInHouse);

    token.style.left = pos.left;
    token.style.top = pos.top;
    token.style.transform = pos.transform;
    token.style.zIndex = 10 + indexInHouse;

    token.onerror = () => {
      token.remove();

      const fallback = document.createElement("div");
      fallback.className = "token";
      fallback.textContent = player.id;
      fallback.style.left = pos.left;
      fallback.style.top = pos.top;
      fallback.style.transform = pos.transform;
      fallback.style.zIndex = 10 + indexInHouse;

      cellTokens.appendChild(fallback);
    };

    cellTokens.appendChild(token);
  });
}

function abrirModal() {
  modalEvento.classList.add("active");
}

function fecharModal() {
  modalEvento.classList.remove("active");
}

modalClose.addEventListener("click", fecharModal);
modalEvento.addEventListener("click", event => {
  if (event.target === modalEvento) fecharModal();
});

function getTokenPosition(index, total) {
  if (total === 1) {
    return { left: "50%", top: "50%", transform: "translate(-50%, -50%)" };
  }

  const positions = [
    { left: "38%", top: "52%", transform: "translate(-50%, -50%) rotate(-8deg)" },
    { left: "62%", top: "48%", transform: "translate(-50%, -50%) rotate(8deg)" },
    { left: "50%", top: "35%", transform: "translate(-50%, -50%) scale(.92)" },
    { left: "50%", top: "68%", transform: "translate(-50%, -50%) scale(.92)" },
    { left: "30%", top: "35%", transform: "translate(-50%, -50%) scale(.85) rotate(-10deg)" },
    { left: "70%", top: "35%", transform: "translate(-50%, -50%) scale(.85) rotate(10deg)" },
    { left: "30%", top: "68%", transform: "translate(-50%, -50%) scale(.85) rotate(8deg)" },
    { left: "70%", top: "68%", transform: "translate(-50%, -50%) scale(.85) rotate(-8deg)" },
    { left: "42%", top: "42%", transform: "translate(-50%, -50%) scale(.78)" },
    { left: "58%", top: "58%", transform: "translate(-50%, -50%) scale(.78)" }
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

  if (player.tripleNext) {
    dice *= 3;
    player.tripleNext = false;
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
  abrirModal();

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

      if (player.position < TOTAL_CASAS) player.position++;

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
    "gengar", "fire", "warning", "crown", "tnt", "banana",
    "ghost", "squid", "piranha", "snail", "snake"
  ];

  if (player.immune && negativeEvents.includes(iconKey)) {
    player.immune = false;
    messageBox.innerHTML += `<br>Invencibilidade ativada! ${player.name} ignorou o efeito negativo.`;
    return;
  }

  player.lastSpecial = iconKey;

  messageBox.innerHTML += `<br><strong>${event.message}</strong>`;
  event.action(player);

  if (player.position < 1) player.position = 1;
  if (player.position > TOTAL_CASAS) player.position = TOTAL_CASAS;

  renderTokens();
  renderPlayers();
}

function movePlayer(player, amount) {
  player.position += amount;

  if (player.position < 1) player.position = 1;
  if (player.position > TOTAL_CASAS) player.position = TOTAL_CASAS;
}

function useLadder(player) {
  const ladders = {
    29: 48,
    37: 56,
    64: 83,
    86: 107
  };

  const target = ladders[player.position];
  if (!target) return;

  player.position = target;
  messageBox.innerHTML += `<br>Você subiu pela escada até a casa ${target}.`;
}

function useSnake(player) {
  const snakes = {
    35: 14,
    59: 40,
    74: 55,
    82: 61,
    108: 89
  };

  const target = snakes[player.position];
  if (!target) return;

  player.position = target;
  messageBox.innerHTML += `<br>Você deslizou pela cobra até a casa ${target}.`;
}

function teleportPipe(player) {
  if (player.position === 60) {
    player.position = 87;
    messageBox.innerHTML += `<br>Você saiu pelo cano da casa 87.`;
  } else if (player.position === 87) {
    player.position = 60;
    messageBox.innerHTML += `<br>Você saiu pelo cano da casa 60.`;
  }
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

function swapWithAheadPlayer(player) {
  const aheadPlayers = players.filter(p => p.id !== player.id && p.position > player.position);

  if (aheadPlayers.length === 0) {
    messageBox.innerHTML += `<br>Não há jogadores à frente para trocar.`;
    return;
  }

  const target = aheadPlayers.sort((a, b) => a.position - b.position)[0];

  const temp = player.position;
  player.position = target.position;
  target.position = temp;

  messageBox.innerHTML += `<br>${player.name} trocou de lugar com ${target.name}.`;
}

function sabotageAheadPlayer(player) {
  const targets = players.filter(p => p.id !== player.id && p.position > player.position);

  if (targets.length === 0) {
    messageBox.innerHTML += `<br>Não há jogadores à frente para sabotar.`;
    return;
  }

  const target = targets.sort((a, b) => b.position - a.position)[0];

  movePlayer(target, -15);

  messageBox.innerHTML += `<br>${target.name} foi sabotado e caiu 15 casas.`;
}

function repeatLastSpecial(player) {
  const otherSpecials = players
    .filter(p => p.id !== player.id && p.lastSpecial && p.lastSpecial !== "kirby")
    .map(p => p.lastSpecial);

  if (otherSpecials.length === 0) {
    messageBox.innerHTML += `<br>Nenhum efeito especial disponível para copiar.`;
    return;
  }

  const copiedKey = otherSpecials[otherSpecials.length - 1];
  const copiedEvent = events[copiedKey];

  messageBox.innerHTML += `<br>${player.name} copiou: ${copiedEvent.message}`;
  copiedEvent.action(player);
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

function nextPlayer() {
  currentPlayerIndex++;

  if (currentPlayerIndex >= players.length) currentPlayerIndex = 0;

  updateHUD();
}
function abrirModal() {
  modalEvento.classList.add("active");
}

function fecharModal() {
  modalEvento.classList.remove("active");
}

modalClose.addEventListener("click", fecharModal);

modalEvento.addEventListener("click", event => {
  if (event.target === modalEvento) fecharModal();
});

startBtn.addEventListener("click", startGame);
rollBtn.addEventListener("click", playTurn);

createBoard();