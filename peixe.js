var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,

    scene: {
        preload: preload,
        create: create,
        update: update
    }
}

var game = new Phaser.Game(config);

var peixinho;

function preload() {
    this.load.image('mar', 'assets/bg_azul-escuro.png');
    this.load.image('logo', 'assets/logo-inteli_branco.png');
    this.load.image('peixe', 'assets/peixes/peixe_turquesa.png');

    //Meu próprio elemento
    this.load.image('tartaruga', 'assets/peixes/tartaruga.png');
}

function create() {
    this.add.image(400, 300, 'mar');
    this.add.image(400, 525, 'logo').setScale(0.5);
    this.add.image(400, 525, 'tartaruga').setScale(0.6).setOrigin(0.8, 0.75);

    peixinho = this.add.image(400, 300, 'peixe');
    peixinho.setOrigin(0.5, 0.5).setFlip(true, false);
}

function update() {
    peixinho.x = this.input.x;
    peixinho.y = this.input.y;
}