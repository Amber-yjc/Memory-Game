// init the game in the specified html div container
function StartMatrixMemoryGame(htmlDivContainer) {
    // icon htmls
    const pauseIcon = `<i class="material-icons">pause</i>`;
    const resumeIcon = `<i class="material-icons">play_arrow</i>`;
    const terminateIcon = `<i class="material-icons">clear</i>`;   

    const correctSound = new Audio("/music/correct.wav");
    const wrongSound = new Audio("/music/evilLaugh.wav");

    // create status bar, control and game container
    (function createGameComponent() {
        htmlDivContainer.innerHTML = `
            <div id="content-container-lw">

                <div id="status-bar-lw">
                    <div id="controls-lw">
                        <button id="pause-btn-lw" class="control-btns-lw">${pauseIcon}</button>
                        <button id="terminate-btn-lw" class="control-btns-lw">${terminateIcon}</button>                        
                    </div>
                    <div class="pull-top pull-right">
                        <b class="game-status-lw">TILES: <span id="remaining-tiles-lw">--</span></b>
                        <b class="game-status-lw">SCORE: <span id="user-score-lw">--</span></b>                        
                    </div>
                </div>
                <div id="game-container-lw"><button id="play-btn-lw">Play</button></div>
            </div>
        `;
        pauseTerminateBar();
    })();

    
    function pauseTerminateBar() {
        //pause button
        const pauseBtn = document.getElementById('pause-btn-lw');
        pauseBtn.onclick = puaseBtnClick.bind(null, pauseBtn);
        //terminate button
        const terminateBtn = document.getElementById('terminate-btn-lw');
        terminateBtn.onclick = terminateBtnClick.bind(null, terminateBtn);

        //when click reset button, game restarts without saving to leaderboard, or just start
        document.getElementById('play-btn-lw').onclick = () => {
            restartGame();
        };
    }
    
    //--------------------------------game logic---------------------------------------
    // matrix dimension, number of tiles to be clicked and user score
    let row, col, tilesTobeClicked, prevLvScore, score; //maybe add trial, but is unlimited


    //reset game states and run it again
    function restartGame() {
        row = 5;
        col = 5;
        tilesTobeClicked = 5;
        prevLvScore = 0;
        score = 0;
        setUpRunCurrentLevel();
    }
    //restart current matrix size board (current level)
    function setUpRunCurrentLevel() {
        cleanUpPrevLevelState();
        updatePlayerScoreTiles();
        createNewTiles();
        pickRandomCorrectTiles();
        flashTargetTiles(1500,
            rotateTiles.bind(null, 500, () => {
                allowClick = true;
            })
        );
    }
    // at the current level, the # of tile has been clicked, any wrong tiles and the tiles are ready for clicked
    let tileClicked = 0, wrongClick = false, allowClick = false;
    // tiles of the current level
    const allTiles = [], targetTiles = [];
    // cleanup tiles and interact state
    function cleanUpPrevLevelState() {
        tileClicked = 0;
        wrongClick = false;
        allowClick = false;
        allTiles.length = 0;
        targetTiles.length = 0;
    }
    function updatePlayerScoreTiles() {
        document.getElementById('user-score-lw').innerText = (score === undefined) ? '--' : score;
        document.getElementById('remaining-tiles-lw').innerText = (tilesTobeClicked === undefined) ? '--' : tilesTobeClicked - tileClicked;
    }
    // create tiles match the current level
    function createNewTiles() {
        // div used for rotation 
        const tilesContainer = document.createElement('div');
        tilesContainer.setAttribute('id', 'tiles-container-lw');

        const gameContainer = document.getElementById('game-container-lw');
        // remove prev tiles
        gameContainer.innerHTML = '';
        gameContainer.appendChild(tilesContainer);

        // create new tiles
        for (let y = 0; y < row; ++y) {
            let row = document.createElement('div');
            row.setAttribute('class', 'tile-rows-lw');
            tilesContainer.appendChild(row);

            //present each tiles in the row as button
            for (let x = 0; x < col; ++x) {
                let tile = document.createElement('button');
                tile.setAttribute('class', 'tiles-lw');
                tile.onclick = () => { tileClick(tile) }
                row.appendChild(tile)
                //register each tiles into the allTiles []
                allTiles.push(tile)
            }
        }
    }
    // check if clicked tile is correct
    function tileClick(tile) {
        if (!allowClick) {
            return;
        }
        ++tileClicked;
        // prevent double click
        tile.onclick = null;
        // flip effect
        tile.classList.add('flip-transform');
        checkClickedTileIsCorrect(tile);
        //when used up moves, then show answer, adjust difficulty
        if (tileClicked == tilesTobeClicked) {
            allowClick = false;
            evalCurrentLevel();
        }
    }
    // mark correct / wrong for the clicked tile
    function checkClickedTileIsCorrect(tile) {
        if (targetTiles.includes(tile)) {
            //correct tile, increase score 
            ++score;
            updatePlayerScoreTiles();
            //add class correct to the tile
            tile.classList.add('correct-tiles-lw');
        } else {
            wrongClick = true;
            --score;
            updatePlayerScoreTiles();
            tile.classList.add('wrong-tiles-lw');
            wrongSound.play();
        }
    }
    // end the current level, reveal answer and adjust difficulty
    function evalCurrentLevel() {
        revealResult();
        setTimeout(() => {
            if (score <= 0) {
                gameOver();
            } else {
                // if there is wrong answer, decrease, else increase
                if (wrongClick) {
                    decreaseDifficulty();
                } else {
                    increaseDifficulty();
                }
                prevLvScore = score;
                setUpRunCurrentLevel();
            }
        }, 850);
    }
    // randomly select target tiles 
    function pickRandomCorrectTiles() {
        //if need more target Tiles, add more to match length of tilesToBeClicked
        while (targetTiles.length < tilesTobeClicked) {
            //get a random index from allTiles
            let rd = Math.floor(Math.random() * allTiles.length)
            //if the index is not already in targetTiles, add to array
            if (!targetTiles.includes(allTiles[rd]))
                targetTiles.push(allTiles[rd])
        }
    }
    // flash the target tile for the specified ms, then invoke the callback function that rotates the targetTiles
    function flashTargetTiles(ms = 1000, callback) {
        const promises = [];
        targetTiles.forEach((tile) => {
            // reveal the correct tiles
            tile.classList.add('target-tiles-lw');
            //add a promise to promise array
            promises.push(setTimeoutPromise(() => {
                // swithc back to normal
                tile.classList.remove('target-tiles-lw');
            }, ms))
        })
        if (callback) {
            Promise.all(promises) //for all promise
                .then(callback) //rotate
        }
    }
    // wrap settimout with promise
    function setTimeoutPromise(func, ms) {
        return new Promise((res) => {
            setTimeout(() => {
                func();
                res();
            }, ms);
        });
    }
    // after the specified ms, rotate then invoke callback function
    function rotateTiles(ms = 500, callback) {
        const tiles = document.getElementById('tiles-container-lw');
        setTimeout(() => {
            //rotate either ccw or cw
            if (Math.random() < 0.5) {
                tiles.classList.add('rotatecw-lw'); //have roate css for this class
            } else {
                tiles.classList.add('rotateccw-lw')
            }
            if (callback) {
                callback(); //make clickable 
            }
        }, ms);
    }
    // reveal the correct tiles
    function revealResult() {
        targetTiles.forEach((tile) => {
            tile.classList.add('target-tiles-lw');
        })
    }
    function gameOver() {
        const gameOverText = document.createElement('h1');
        gameOverText.setAttribute('id', 'game-over-text-lw');
        gameOverText.innerText = 'Game Over';
        //create confirmTerminatBtn();
        const confirmTerminateBtn = document.createElement('button');
        confirmTerminateBtn.innerText = 'Summary';
        confirmTerminateBtn.setAttribute('id', 'end-btn-lw');
        confirmTerminateBtn.onclick = () => {
            // need to change to take to summary page with score and tile info
            window.location = "/summary?score=" + score + "&tiles=" + tilesTobeClicked;
        };
        const gameContainer = document.getElementById('game-container-lw');
        gameContainer.innerHTML = '';
        gameContainer.appendChild(gameOverText);
        gameContainer.appendChild(confirmTerminateBtn);
        //need to append leader board button and possible inputs as well
    }
    // add one dimension or 1 target tile
    function increaseDifficulty() {
        correctSound.play();
        //increase matrix size or tile
        if (Math.random() < 0.5) {
            if (row === col) {
                ++col;
            } else {
                ++row;
            }
        } else {
            ++tilesTobeClicked;
        }
    }
    // decrease 1 dimension and 1 target tile
    function decreaseDifficulty() {
        if (Math.random() < 0.5) {
            if (row > 5 || col > 5) {
                if (row === col) {
                    --row;
                } else {
                    --col;
                }
            }
        } else {
            if (tilesTobeClicked > 3) {
                --tilesTobeClicked;
            }
        }
    }
    let gameIsPaused = false;
    function pauseGame() {
        // clear clicked tiles score
        score = prevLvScore;
        updatePlayerScoreTiles();
        gameIsPaused = true;
        // createResumeBtn();
        const resumeBtn = document.createElement('button');
        resumeBtn.innerText = 'Resume';
        resumeBtn.setAttribute('id', 'resume-btn-lw');
        resumeBtn.onclick = () => {
            document.getElementById('pause-btn-lw').click();
        };
        const gameContainer = document.getElementById('game-container-lw');
        gameContainer.innerHTML = '';
        gameContainer.appendChild(resumeBtn);
    }



    function terminateGame() {
        // clear clicked tiles score
        score = prevLvScore;
        updatePlayerScoreTiles();

        gameIsPaused = true;
        //create div to hold terminate question
        const terminateDiv = document.createElement('div');
        terminateDiv.setAttribute('id', 'terminate-div-lw');
        const terminateP = document.createElement('p');
        terminateP.setAttribute('id', 'terminate-p-lw');
        terminateP.innerText = 'Are you sure you want to terminate?'
        terminateDiv.appendChild(terminateP);

        // createResumeBtn();
        const resumeBtn = document.createElement('button');
        resumeBtn.innerText = 'No';
        resumeBtn.setAttribute('id', 'resume-btn-lw');
        resumeBtn.onclick = () => {
            document.getElementById('pause-btn-lw').click();
        };

        //create confirmTerminatBtn();
        const confirmTerminateBtn = document.createElement('button');
        confirmTerminateBtn.innerText = 'Yes';
        confirmTerminateBtn.setAttribute('id', 'end-btn-lw');
        confirmTerminateBtn.onclick = () => {
            // go to summary page with player's score and tiles number lvl
            window.location = "/summary?score=" + score + "&tiles=" + tilesTobeClicked;
        };

        terminateDiv.appendChild(confirmTerminateBtn);
        terminateDiv.appendChild(resumeBtn);

        const gameContainer = document.getElementById('game-container-lw');
        gameContainer.innerHTML = '';
        gameContainer.appendChild(terminateDiv);
    }


    // rerun the current level when resume
    function resumeGame() {
        if (gameIsPaused) {
            gameIsPaused = false;

            // game is not started
            if (isNaN(tilesTobeClicked)) {
                restartGame(); //restart from beginning
            } else {
                setUpRunCurrentLevel(); //restart current level
            }
        }
    }

    function puaseBtnClick(btn) {
        if (btn.innerHTML === pauseIcon) {
            pauseGame();
            btn.innerHTML = resumeIcon;
        } else {
            resumeGame();
            btn.innerHTML = pauseIcon;
        }
    }

    function terminateBtnClick(btn) {
        terminateGame();        
    }
    
}
