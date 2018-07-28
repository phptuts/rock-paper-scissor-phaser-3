let gameScene = new Phaser.Scene('Game');

// set config of game
const config = {
	type: Phaser.AUTO, // Will use webgl if avialable overwise it will use the canvas
	width: 640,
	height: 360,
	scene: gameScene,
	parent: 'phaser-app'
};

/**
 * Means the player has not anything
 */
const NOTHING_SELECTION_MODE = 'NOTHING_SELECTTED';

/**	
 * Means player needs click shoot to finalize selection
 */
const BEFORE_SHOT_MODE = 'BEOFRE_SHOOT';

/**	
 * Means that shooting is in progress
 */
const SHOOTING_MODE = 'SHOOTING';

/**	
 * This means the player one 
 */
const OUTCOME_PLAYER_WON = 'player_won';

/** 
 * This means computer won
 */
const OUTCOME_COMPUTER_WON = 'computer_won';

/**	
 * This means that the tie
 */
const OUTCOME_TIE = 'tie'; 

/** 
 * This is the font style used throughout the game
 */
const fontStyle = { fontSize: '32px', fill: '#fff', backgroundColor: '#000', padding: 2};

/**	 
 * This is half the width of the board
 */
const halfGameWidth = config.width / 2;

/**
 * This is the key for rock
 */
const ROCK = 'rock';

/**
 * This is the key for paper
 */
const PAPER = 'paper';

/**	
 * This is the key for scissors
 */
const SCISSORS = 'scissors';

// Runs first and is used to set all the variables
gameScene.init = () => {
	
	// key equals what it can beat.
	gameScene.rules = { 
		rock: SCISSORS, 
		paper : ROCK, 
		scissors : PAPER 
	};
	
	gameScene.mode = NOTHING_SELECTION_MODE; // This is state the game is in
	gameScene.selectedSprite = null; // This is the selected sprite
	gameScene.playerWins = 0;
	gameScene.computerWins = 0;
};

// Runs second and is used to set all the images used in the game
gameScene.preload = () => {
	gameScene.load.image('background', 'images/background.jpg');
	gameScene.load.image(ROCK, 'images/pet_rock.png');
	gameScene.load.image(PAPER, 'images/paper.png');
	gameScene.load.image(SCISSORS, 'images/scissors.gif');

};

// Runs third and is used to position all the images initially in the game
gameScene.create = () => {
	let bg = gameScene.add.sprite(0, 0, 'background');
    bg.setOrigin(0,0); // changes the center of the image
	bg.depth = -2;
	gameScene.playerRock = gameScene.add.sprite(100, 100, ROCK);
	gameScene.playerRock.originalScale = .3;
	gameScene.playerRock.setScale(gameScene.playerRock.originalScale);
	
	gameScene.playerPaper = gameScene.add.sprite(100, 200, PAPER);
	gameScene.playerPaper.originalScale = .3;
	gameScene.playerPaper.setScale(gameScene.playerPaper.originalScale);

	gameScene.playerScissors = gameScene.add.sprite(100, 300, SCISSORS);
	gameScene.playerScissors.originalScale = .15;
	gameScene.playerScissors.setScale(gameScene.playerScissors.originalScale);
	gameScene.playerScissors.flipX = true;

	gameScene.playerSprites = [
		gameScene.playerRock,
		gameScene.playerPaper, 
		gameScene.playerScissors
	];
	
	gameScene.playerSprites.forEach((sprite) => {
		sprite.setInteractive();
		sprite.on('pointerdown', (pointer, localX, localY) => {
			gameScene.selectMove(sprite);
		});
	});
	
	gameScene.computerRock = gameScene.add.sprite(540, 100, ROCK);
	gameScene.computerRock.originalScale = .3;
	gameScene.computerRock.setScale(gameScene.computerRock.originalScale);
	
	gameScene.computerPaper = gameScene.add.sprite(540, 200, PAPER);
	gameScene.computerPaper.originalScale = .3;
	gameScene.computerPaper.setScale(gameScene.computerPaper.originalScale);

	gameScene.computerScissors = gameScene.add.sprite(540, 300, SCISSORS);
	gameScene.computerScissors.originalScale = .15;
	gameScene.computerScissors.setScale(gameScene.computerScissors.originalScale);

	gameScene.computerSprites = [
		gameScene.computerRock,
		gameScene.computerPaper,
		gameScene.computerScissors
	];
	
	gameScene.sprites = [
		gameScene.computerRock,
		gameScene.computerPaper,
		gameScene.computerScissors,
		gameScene.playerPaper, 
		gameScene.playerScissors, 
		gameScene.playerRock
	];
	
	
	gameScene.sprites.forEach((sprite) => {
		sprite.winningTweenPartOne = gameScene.tweens.add({
			targets: sprite,
			x: halfGameWidth,
			y: 120,
			paused: true,
			repeat: 0,
			ease: 'Power0',
			onComplete: () => {
				sprite.depth = 1;
				sprite.winningTweenPartTwo.restart();
				gameScene.updateScore();
				let winnerText = gameScene.winner == OUTCOME_PLAYER_WON ? 
					'Player Won' : 'Computer Won';
				gameScene.gameStateText.setText(winnerText);
			}
		});
		
		sprite.winningTweenPartTwo = gameScene.tweens.add({
			targets: sprite,
			x: halfGameWidth,
			y: 220,
			scaleX: sprite.scaleX * 2,
			scaleY: sprite.scaleY * 2,
			paused: true,
			repeat: 0,
			ease: 'Power0',
			onComplete: () => {
				gameScene.time.delayedCall(1500, () => {
					gameScene.reset();
				});
			}
		});
		
		
		sprite.losingTweenPartOne = gameScene.tweens.add({
			targets: sprite,
			x: halfGameWidth,
			y: 250,
			paused: true,
			repeat: 0,
			ease: 'Power0',
			onComplete: () => {
				sprite.losingTweenPartTwo.restart();
			}
		});
		
		sprite.losingTweenPartTwo = gameScene.tweens.add({
			targets: sprite,
			alpha: 0,
			paused: true,
			repeat: 0,
			ease: 'Power0'
		});
		
		let xPositionTieTween = sprite.x + (sprite.x > 500 ? -100 : 100);
		
		sprite.tieTween = gameScene.tweens.add({
			targets: sprite,
			x: xPositionTieTween,
			paused: true,
			repeat: 0,
			ease: 'Power0',
			yoyo: true,
			onComplete: () => {
				gameScene.gameStateText.setText('Tie Game');
				gameScene.time.delayedCall(1500, () => {
					gameScene.reset();
				});
			}
		});
	})
	
	gameScene.add.text(50, 20, 'Player', fontStyle);
	
	gameScene.add.text(470, 20, 'Computer', fontStyle);

	
	gameScene.gameStateText = gameScene.add.text(halfGameWidth, 340, 'Select Move', fontStyle);
	gameScene.gameStateText.setOrigin(.5);
	gameScene.gameStateText.depth = -1;
	gameScene.gameStateText.setInteractive();
	
	gameScene.scoreText = gameScene.add.text(halfGameWidth, 35, '0 / 0',fontStyle);
	gameScene.scoreText.setOrigin(.5);
	
	gameScene.gameStateText.on('pointerdown', (pointer, localX, localY) => {
		gameScene.shoot();
	});
};

/**	
 * Select a move for the player
 */
gameScene.selectMove = (sprite) => {
	
	// prevent things being select during shooting mode
	if (gameScene.mode == SHOOTING_MODE) return;
	
	gameScene.resetAlphasOnPlayerSprites();
	sprite.alpha = .5;
	gameScene.gameStateText.setText('Click Me To Shoot!!!');
	gameScene.mode = BEFORE_SHOT_MODE;
	gameScene.selectedSprite = sprite;
};

/**	
 * Finalizes and the move and triggeers the animations
 */
gameScene.shoot = () => {
	if (gameScene.mode != BEFORE_SHOT_MODE) return;
	gameScene.mode = SHOOTING_MODE;
	gameScene.selectedSprite.alpha = 1;
	let computerSelectedSprite = gameScene.computerSprites[Phaser.Math.Between(0, 2)];
	
	gameScene.winner = gameScene.whoWon(
		gameScene.selectedSprite.texture.key, 
		computerSelectedSprite.texture.key
	);
		
	if (gameScene.winner == OUTCOME_PLAYER_WON) {
		gameScene.playerWins += 1;
		gameScene.selectedSprite.winningTweenPartOne.restart();
		computerSelectedSprite.losingTweenPartOne.restart();
	} 
	
	if (gameScene.winner == OUTCOME_COMPUTER_WON) {
		gameScene.computerWins += 1;
		gameScene.selectedSprite.losingTweenPartOne.restart();
		computerSelectedSprite.winningTweenPartOne.restart();
	}	
	
	if (gameScene.winner == OUTCOME_TIE) {
		gameScene.selectedSprite.tieTween.restart();
		computerSelectedSprite.tieTween.restart();
	}	
};

/**
 * Resets the game back to normal
 */
gameScene.reset = () => {
	gameScene.mode = NOTHING_SELECTION_MODE;
	gameScene.selectedSprite = null;
	gameScene.gameStateText.setText('Select Move');
	
	gameScene.computerSprites.forEach((sprite, index) => {
		sprite.x = 540;
		sprite.y = 100 * (index + 1);
		sprite.alpha = 1;
		sprite.setScale(sprite.originalScale);
	});
	
	gameScene.playerSprites.forEach((sprite, index) => {
		sprite.x = 100;
		sprite.y = 100 * (index + 1);
		sprite.alpha = 1;
		sprite.setScale(sprite.originalScale);
	});
	
};

/**
 * Determines who won the game
 */
gameScene.whoWon = (playerKey, computerKey) => {
	if (gameScene.rules[playerKey] == computerKey) {
		return OUTCOME_PLAYER_WON;
	}
	
	if (gameScene.rules[computerKey] == playerKey) {
		return OUTCOME_COMPUTER_WON;
	}
	
	return OUTCOME_TIE;
};

/** 
 * Updates the score text
 */
gameScene.updateScore = () => {
	gameScene.scoreText.setText(gameScene.playerWins + " / " + gameScene.computerWins);
};

/**
 * Resets all the player sprites back to alpha of 1
 */
gameScene.resetAlphasOnPlayerSprites = () => {
	gameScene.playerSprites.forEach(sprite => {
		sprite.alpha = 1;
	});
};

// create an new game and pass configuration to it
let game = new Phaser.Game(config);