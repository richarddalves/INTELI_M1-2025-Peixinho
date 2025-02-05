var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

// Peixe principal
var peixinho;

// Bolhas
var bubbles = [];

// Peixes de fundo
var backgroundFishes = [];

// Pontuação
var score = 0;
var scoreText;

// Instruções
var instructionText;
var instructionTimer = 0; // tempo até remover texto

// Grupos de peixes baseados na direção inicial
var fishFacingRight = [
    'baiacu_lado', 
    'peixe_amarelo', 
    'peixe_listra', 
    'peixe_logo', 
    'peixe_verde', 
    'peixinho_roxo'
];
var fishFacingLeft = [
    'peixe_rosa',
    'peixe_serio',
    'peixinho_azul',
    'peixinho_laranja',
    'peixinho_rosa'
];

// Lista unificada de todos os peixes
var fishKeys = fishFacingRight.concat(fishFacingLeft);

// *** MODIFICAÇÃO ***: Define um limite máximo de peixes simultâneos.
var MAX_FISHES = 10;

function preload() {
    // Plano de fundo e elementos de cena
    this.load.image('mar', 'assets/bg_azul-escuro.png');
    this.load.image('logo', 'assets/logo-inteli_branco.png');
    this.load.image('peixe', 'assets/peixes/peixe_turquesa.png');
    this.load.image('tartaruga', 'assets/peixes/tartaruga.png');
    this.load.image('bubble', 'assets/bubble.png');

    // Carregando todos os peixes para o fundo
    this.load.image('baiacu_lado', 'assets/peixes/baiacu_lado.png');
    this.load.image('peixe_amarelo', 'assets/peixes/peixe_amarelo.png');
    this.load.image('peixe_listra', 'assets/peixes/peixe_listra.png');
    this.load.image('peixe_logo', 'assets/peixes/peixe_logo.png');
    this.load.image('peixe_verde', 'assets/peixes/peixe_verde.png');
    this.load.image('peixinho_roxo', 'assets/peixes/peixinho_roxo.png');
    
    this.load.image('peixe_rosa', 'assets/peixes/peixe_rosa.png');
    this.load.image('peixe_serio', 'assets/peixes/peixe_serio.png');
    this.load.image('peixinho_azul', 'assets/peixes/peixinho_azul.png');
    this.load.image('peixinho_laranja', 'assets/peixes/peixinho_laranja.png');
    this.load.image('peixinho_rosa', 'assets/peixes/peixinho_rosa.png');
}

function create() {
    // Fundo fixo
    this.add.image(400, 300, 'mar');

    // Logo e tartaruga
    this.add.image(400, 525, 'logo').setScale(0.5);
    this.add.image(400, 525, 'tartaruga')
        .setScale(0.6)
        .setOrigin(0.8, 0.75);

    // Peixe principal
    peixinho = this.add.image(400, 300, 'peixe');
    peixinho.setOrigin(0.5, 0.5).setFlip(true, false);
    // Mantém o peixe principal na frente
    peixinho.setDepth(10);

    // Texto de pontuação
    scoreText = this.add.text(10, 10, 'Pontos: 0', {
        fontSize: '20px',
        fill: '#ffffff'
    });

    // *** MODIFICAÇÃO ***: Instruções atualizadas para breve menção da nova mecânica
    instructionText = this.add.text(10, 40, 'Clique nas bolhas ou cubra os peixes menores para pontuar!', {
        fontSize: '18px',
        fill: '#ffffff'
    });

    // Timer das bolhas (a cada 500 ms)
    this.time.addEvent({
        delay: 500,
        callback: spawnBubble,
        callbackScope: this,
        loop: true
    });

    // Timer que gera peixes de fundo a cada 1.5 s
    this.time.addEvent({
        delay: 1500,
        callback: spawnBackgroundFish,
        callbackScope: this,
        loop: true
    });
}

// ----------------------------------------------------------------------------
// Cria bolha na boca do peixe principal
function spawnBubble() {
    var dx = 90;  
    var dy = 0;   
    var bubble = this.add.image(peixinho.x + dx, peixinho.y + dy, 'bubble');
    
    var randomScale = Phaser.Math.FloatBetween(0.03, 0.08);
    bubble.setScale(randomScale);

    var randomSpeed = Phaser.Math.FloatBetween(1, 2); 
    bubble.speed = randomSpeed;

    bubble.setInteractive();
    bubble.on('pointerdown', () => {
        score++;
        scoreText.setText('Pontos: ' + score);
        bubble.destroy();
        bubbles.splice(bubbles.indexOf(bubble), 1);
    });

    bubbles.push(bubble);
}

// ----------------------------------------------------------------------------
// Cria UM peixe de fundo (DVD-style ou Pass-Through), menor e mais lento
function spawnBackgroundFish() {
    // *** MODIFICAÇÃO ***: Verifica se já atingimos o limite máximo de peixes.
    if (backgroundFishes.length >= MAX_FISHES) {
        return; 
    }

    // Escolhe qual peixe (imagem) usar
    var fishKey = Phaser.Utils.Array.GetRandom(fishKeys);

    // *** MODIFICAÇÃO ***: Agora peixes só vêm pelos lados (0=esquerda, 1=direita)
    var side = Phaser.Math.Between(0, 1);
    var x, y;

    if (side === 0) {
        x = -50;
        y = Phaser.Math.Between(50, 550);
    } else {
        x = 850;
        y = Phaser.Math.Between(50, 550);
    }

    // Cria o sprite
    var fish = this.add.image(x, y, fishKey);

    // Escala pequena (0.2 ~ 0.5) para não ficar do tamanho do peixe principal
    var scale = Phaser.Math.FloatBetween(0.2, 0.5);
    fish.setScale(scale);

    // Decide se é DVD ou pass-through
    var isDVD = Math.random() < 0.3;  // ex.: 30% DVD, 70% pass-through
    fish.dvd = isDVD;

    if (fish.dvd) {
        fish.vx = Phaser.Math.FloatBetween(-0.7, 0.7);
        fish.vy = Phaser.Math.FloatBetween(-0.7, 0.7);

        // Garante que ele se mova para dentro
        if (side === 0 && fish.vx < 0) fish.vx *= -1; // veio da esquerda, vx deve ser positivo
        if (side === 1 && fish.vx > 0) fish.vx *= -1; // veio da direita, vx deve ser negativo

        if (fish.vx === 0) fish.vx = 0.4;
        if (fish.vy === 0) fish.vy = 0.4;

        if (isFacingRight(fishKey)) {
            fish.setFlipX(fish.vx < 0);
        } else {
            fish.setFlipX(fish.vx > 0);
        }
    } else {
        if (side === 0) {
            fish.vx = Phaser.Math.FloatBetween(0.3, 1);
            fish.vy = Phaser.Math.FloatBetween(-0.2, 0.2);
        } else {
            fish.vx = -Phaser.Math.FloatBetween(0.3, 1);
            fish.vy = Phaser.Math.FloatBetween(-0.2, 0.2);
        }

        if (fish.vx < 0) {
            if (isFacingRight(fishKey)) {
                fish.setFlipX(true);
            } else {
                fish.setFlipX(false);
            }
        } else {
            if (isFacingRight(fishKey)) {
                fish.setFlipX(false);
            } else {
                fish.setFlipX(true);
            }
        }
    }
    
    backgroundFishes.push(fish);
}

// Função auxiliar: verifica se um peixe é originalmente virado à direita
function isFacingRight(key) {
    return fishFacingRight.includes(key);
}

// *** MODIFICAÇÃO ***: Função para calcular área de interseção de retângulos
function getRectIntersectionArea(ax, ay, aw, ah, bx, by, bw, bh) {
    var overlapW = Math.min(ax + aw, bx + bw) - Math.max(ax, bx);
    var overlapH = Math.min(ay + ah, by + bh) - Math.max(ay, by);
    if (overlapW <= 0 || overlapH <= 0) {
        return 0; // sem interseção
    }
    return overlapW * overlapH;
}

// ----------------------------------------------------------------------------
function update(time, delta) {
    // Peixe principal segue mouse (com limites)
    peixinho.x = Phaser.Math.Clamp(this.input.x, 0, 800);
    peixinho.y = Phaser.Math.Clamp(this.input.y, 0, 600);

    // Inclinação leve do peixe principal
    var tilt = 0.2;  
    var mouseDy = this.input.y - peixinho.y;
    peixinho.angle = mouseDy * tilt;

    // 1) Atualiza as bolhas
    for (var i = 0; i < bubbles.length; i++) {
        var b = bubbles[i];
        b.y -= b.speed; // sobem devagar

        if (b.y < 0) {
            b.destroy();
            bubbles.splice(i, 1);
            i--;
        }
    }

    // 2) Atualiza peixes de fundo
    // *** MODIFICAÇÃO ***: Checar se peixinho cobre >=80% do peixe menor
    // depois de mover cada peixe
    for (var j = 0; j < backgroundFishes.length; j++) {
        var fish = backgroundFishes[j];

        fish.x += fish.vx;
        fish.y += fish.vy;

        if (fish.dvd) {
            var halfW = fish.displayWidth * 0.5;
            var halfH = fish.displayHeight * 0.5;

            if (fish.x - halfW < 0) {
                fish.x = halfW;
                fish.vx *= -1;
                fish.setFlipX(!fish.flipX);
            }
            else if (fish.x + halfW > 800) {
                fish.x = 800 - halfW;
                fish.vx *= -1;
                fish.setFlipX(!fish.flipX);
            }
            if (fish.y - halfH < 0) {
                fish.y = halfH;
                fish.vy *= -1;
            }
            else if (fish.y + halfH > 600) {
                fish.y = 600 - halfH;
                fish.vy *= -1;
            }
        } else {
            if (fish.x < -100 || fish.x > 900 || fish.y < -100 || fish.y > 700) {
                fish.destroy();
                backgroundFishes.splice(j, 1);
                j--;
                continue;
            }
        }

        // *** MODIFICAÇÃO ***: Testar "cobertura" >= 80%
        // Retângulo do peixe principal
        var pW = peixinho.displayWidth;
        var pH = peixinho.displayHeight;
        var pX = peixinho.x - pW/2;
        var pY = peixinho.y - pH/2;

        // Retângulo do peixe menor
        var fW = fish.displayWidth;
        var fH = fish.displayHeight;
        var fX = fish.x - fW/2;
        var fY = fish.y - fH/2;

        // Área do peixe menor
        var fishArea = fW * fH;
        // Área de interseção
        var intersec = getRectIntersectionArea(pX, pY, pW, pH, fX, fY, fW, fH);

        // Se a interseção for >= 80% da área do peixe menor
        if (intersec >= 0.8 * fishArea) {
            // +1 ponto e remove o peixe
            score++;
            scoreText.setText('Pontos: ' + score);

            fish.destroy();
            backgroundFishes.splice(j, 1);
            j--;
        }
    }

    // 3) Altera o tempo do texto de instruções para ~12 segundos
    instructionTimer += delta; 
    if (instructionTimer > 12000 && instructionText.alpha > 0) { 
        instructionText.alpha -= 0.005;
        if (instructionText.alpha <= 0) {
            instructionText.destroy();
        }
    }
}
