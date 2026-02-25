// ==========================================
// 1. VARIABLES GLOBALES DEL JUEGO
// ==========================================
let score = 0;
let timeLeft = 30;
let combo = 0;
let timerInterval;
let shieldActive = false;
let correctAnswer = 0;
let hardModeUnlocked = false; // Se activa después del primer escudo

// Variables para el control de errores de tipeo
let invalidKeyCount = 0;
let resetKeyCountTimer;

// ==========================================
// 2. SELECCIÓN DE ELEMENTOS DEL DOM
// ==========================================
// Pantallas
const screenHome = document.getElementById('screen-home');
const screenGame = document.getElementById('screen-game');
const screenResult = document.getElementById('screen-result');

// Botones
const btnStart = document.getElementById('btn-start');
const btnRestart = document.getElementById('btn-restart');

// Textos e Interfaz
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const finalScoreDisplay = document.getElementById('final-score');
const comboBar = document.getElementById('combo-bar');
const feedbackMessage = document.getElementById('feedback-message');

// Área de operaciones
const mathQuestion = document.getElementById('math-question');
const userAnswer = document.getElementById('user-answer');

// ==========================================
// 3. FLUJO DE PANTALLAS (INICIO Y FIN)
// ==========================================
function startGame() {
    // Reiniciamos todas las variables
    score = 0;
    timeLeft = 30;
    combo = 0;
    shieldActive = false;
    hardModeUnlocked = false;
    
    // Reseteamos la interfaz
    scoreDisplay.innerText = score;
    timerDisplay.innerText = timeLeft;
    comboBar.style.transition = 'width 0.3s ease-out'; // Aseguramos la velocidad normal
    comboBar.style.width = '0%';
    comboBar.classList.remove('shield-active');
    userAnswer.value = '';
    feedbackMessage.innerText = '';
    timerDisplay.style.color = "var(--text-white)";
    
    // Cambiamos de pantalla
    screenHome.classList.add('hidden');
    screenResult.classList.add('hidden');
    screenGame.classList.remove('hidden');
    
    // Preparamos el juego
    userAnswer.focus(); 
    generateQuestion();
    startTimer();
}

function endGame() {
    clearInterval(timerInterval); // Frenamos el reloj
    finalScoreDisplay.innerText = score; // Mostramos puntaje final
    
    // Cambiamos a pantalla de resultados
    screenGame.classList.add('hidden');
    screenResult.classList.remove('hidden');
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.innerText = timeLeft;

        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

// ==========================================
// 4. LÓGICA MATEMÁTICA Y DIFICULTAD
// ==========================================
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateQuestion() {
    let num1, num2, operator;

    // MECÁNICA 2: Si ya desbloquearon el Hard Mode, sale cualquier operación al azar
    if (hardModeUnlocked) {
        const randomOp = getRandomInt(1, 3);
        if (randomOp === 1) { // Suma difícil
            num1 = getRandomInt(15, 50); 
            num2 = getRandomInt(10, 40); 
            operator = '+'; 
            correctAnswer = num1 + num2;
        } else if (randomOp === 2) { // Resta difícil
            num1 = getRandomInt(20, 80); 
            num2 = getRandomInt(1, num1); 
            operator = '-'; 
            correctAnswer = num1 - num2;
        } else { // Multiplicación difícil
            num1 = getRandomInt(3, 12); 
            num2 = getRandomInt(3, 12); 
            operator = 'x'; 
            correctAnswer = num1 * num2;
        }
    } 
    // Progresión normal basada en la barra de combo
    else if (combo < 40) { // Nivel 1: Sumas
        num1 = getRandomInt(1, 20); 
        num2 = getRandomInt(1, 20); 
        operator = '+'; 
        correctAnswer = num1 + num2;
    } else if (combo < 80) { // Nivel 2: Restas
        num1 = getRandomInt(10, 50); 
        num2 = getRandomInt(1, num1); 
        operator = '-'; 
        correctAnswer = num1 - num2;
    } else { // Nivel 3: Multiplicaciones
        num1 = getRandomInt(2, 9); 
        num2 = getRandomInt(2, 9); 
        operator = 'x'; 
        correctAnswer = num1 * num2;
    }

    mathQuestion.innerText = `${num1} ${operator} ${num2}`;
}

// ==========================================
// 5. MANEJO DE RESPUESTAS Y CONTROLES
// ==========================================
userAnswer.addEventListener('keydown', function(event) {
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Enter'];

    // Filtro anti-letras
    if (!/^[0-9]$/.test(event.key) && !allowedKeys.includes(event.key)) {
        event.preventDefault(); 
        invalidKeyCount++;
        clearTimeout(resetKeyCountTimer);
        
        // Si se equivoca de tecla 3 veces seguidas
        if (invalidKeyCount >= 3) {
            feedbackMessage.innerText = "¡Ojo! Solo números 🔢";
            userAnswer.classList.add('input-error');
            setTimeout(() => userAnswer.classList.remove('input-error'), 400);
            
            invalidKeyCount = 0;
            setTimeout(() => {
                if (feedbackMessage.innerText.includes("números")) {
                    feedbackMessage.innerText = "";
                }
            }, 2000);
        } else {
            resetKeyCountTimer = setTimeout(() => { invalidKeyCount = 0; }, 1000);
        }
    } else {
        invalidKeyCount = 0;
    }

    // Evaluar respuesta
    if (event.key === 'Enter') {
        checkAnswer();
    }
});

function checkAnswer() {
    const userVal = parseInt(userAnswer.value);
    if (isNaN(userVal)) return;

    if (userVal === correctAnswer) {
        // --- ¡ACIERTAN! ---
        score += 10;
        
        if (shieldActive) {
            // MECÁNICA 1: +2 Segundos durante el escudo
            timeLeft += 2;
            timerDisplay.innerText = timeLeft;
            timerDisplay.style.color = "var(--correct-green)";
            setTimeout(() => timerDisplay.style.color = "var(--text-white)", 300);
            feedbackMessage.innerText = "¡+2 Segundos! ⏳";
        } else {
            // Cargar combo normal
            combo += 20; 
            if (combo > 100) combo = 100;
            feedbackMessage.innerText = "¡Excelente! 🚀";
        }

        userAnswer.classList.add('input-correct');
        setTimeout(() => userAnswer.classList.remove('input-correct'), 300);

        if (combo === 100 && !shieldActive) {
            activateShield();
        }

        scoreDisplay.innerText = score;
        updateComboBar();
        generateQuestion();

    } else {
        // --- SE EQUIVOCAN ---
        if (!shieldActive) {
            combo = 0; // Pierden el combo si no tienen escudo
        }

        feedbackMessage.innerText = "¡Intenta de nuevo! 💥";
        userAnswer.classList.add('input-error');
        setTimeout(() => userAnswer.classList.remove('input-error'), 400);

        updateComboBar();
    }

    userAnswer.value = ''; // Limpiar input
}

function updateComboBar() {
    if (!shieldActive) {
        comboBar.style.width = combo + '%';
    }
}

// ==========================================
// 6. BONUS: ESCUDO DE TIEMPO
// ==========================================
function activateShield() {
    shieldActive = true;
    hardModeUnlocked = true; // Activa el Modo Difícil permanente
    comboBar.classList.add('shield-active');
    
    feedbackMessage.innerText = "¡ESCUDO ACTIVADO! 🛡️ (+Tiempo por acierto)";
    
    // Pausar reloj principal
    clearInterval(timerInterval);

    // Animación de drenaje fluido de 10 segundos
    comboBar.style.transition = 'width 10s linear';
    comboBar.style.width = '0%';

    // Apagar escudo
    setTimeout(() => {
        shieldActive = false;
        combo = 0; 
        
        // Restaurar barra y reloj
        comboBar.style.transition = 'width 0.3s ease-out';
        comboBar.classList.remove('shield-active');
        feedbackMessage.innerText = "¡Entrando a zona de asteroides! (Modo Difícil)";
        
        startTimer();
    }, 10000);
}

// ==========================================
// 7. EVENT LISTENERS PRINCIPALES
// ==========================================
btnStart.addEventListener('click', startGame);
btnRestart.addEventListener('click', startGame);