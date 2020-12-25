function $(str) {
    return document.querySelector(str);
}

function $$(str) {
    return document.querySelectorAll(str);
}
(function() {
    const app = {
        init: function() {
            app.genBoard();
            $("#board").addEventListener("click", function(e) {
//                console.log("Board click");
//                console.dir(e);
                app.state.lastClick = e;
                app.handleClick(e);
            });
            $("#word").addEventListener("click", function(e) {
                console.dir(e);
                app.state.lastClick = e;
                if (app.state.currentNumber) {
                    console.log(app.state.currentNumber);
                    let wnum = e.target.id.replace(/letter_/, '');
                    console.log("wnum: "+wnum);
                    console.log("wordStr: "+app.state.wordStr[wnum - 1]);
                    console.log("word: " + app.state.word[app.state.currentNumber - 1]);
                    
                    if (app.state.wordStr[wnum - 1] == app.state.word[app.state.currentNumber - 1]) {
                       e.target.value = app.state.word[app.state.currentNumber - 1];
                       app.updateScore(100);
                    } else {
                       app.updateScore(-500);
                    }

                    if (app.checkWord()) {
                        app.updateScore(1000);
                        app.lockLetters();
                    }
                    app.state.lastClick = e;

                }
                e.target.blur();
                return false;
            });
            $("#numbers").addEventListener("click", function(e) {
                // console.dir(e);
                if (e.target.nodeName === "A") {
                    if (e.target.classList.contains("disabled")) {
                        return false;
                    }
                    if (app.state.selected && app.state.selected.classList) {
                        app.state.selected.classList.remove("selected");
                    }
                    
                    if (app.state.selected === e.target) {
                        app.deselectCells();
                        e.target.classList.remove("selected");
                        app.state.currentNumber = 0;
                        app.state.selected = '';
                    } else {
                        e.target.classList.add("selected");
                        app.state.currentNumber = e.target.id.replace(/^num_/, '');
                        app.state.selected = e.target;
                        app.selectCells(app.state.currentNumber);
                    }
                }
                e.preventDefault();
                e.stopPropagation();
                return false;
            });
            $("#levelTable").addEventListener("click", function(e) {
                app.state.difficulty = e.target.hash.replace(/^#/, '');
                $(".levelSelected").classList.remove("levelSelected");
                e.target.parentNode.classList.add('levelSelected');
                
                app.storeState('state', app.state);

//                console.log("New difficulty: " + app.state.difficulty);
//                console.dir(e);
            });
            $("#newGame").addEventListener("click", function(e) {
                console.log("New game requested.");
//                console.dir(e);
                app.pauseGame(true);
                /*
                if (!app.state.state) {
                    app.newGame();
                    app.state.state = 'playing';
                //    e.target.innerHTML = "=";
                //    e.target.style.transform = "rotate(90deg)";
                } else if (app.state.state == 'playing') {
                //    e.target.innerHTML = "▶";
                //    e.target.style.transform = "rotate(0deg)";
                    app.state.state = 'paused';
                    app.pauseGame(true);
                } else {
                //    e.target.innerHTML = "=";
                //    e.target.style.transform = "rotate(90deg)";
                    app.state.state = 'playing';
                    app.pauseGame(false);
                }
                */

            });
            
            $("#solveGame").addEventListener("click", function(e) {
                if (e.target.classList.contains('disabled')) {
                    e.stopPropagation();
                    e.preventDefault();
                    return false;
                }
                app.solve();
            });
            $("#resume").addEventListener("click", function(e) {
                app.pauseGame(false);
            });
            $('#quitGame').addEventListener('click', function(e) {
                app.newGame();
                app.state.state = 'playing';
                // $("#newGame").innerHTML = "=";
                // $("#newGame").style.transform = "rotate(90deg)";
                $("#menu").style.height = '0px';
            });
            $("#gameHistory").addEventListener("click", function(e) {
                app.showHistory();
            });
            $("#highScoresBtn").addEventListener("click", function(e) {
                app.showHighScores();
            });
            $("#aboutBtn").addEventListener("click", function(e) {
                app.showAbout();
            });
            $("#helpBtn").addEventListener("click", function(e) {
                app.showHelp();
            });
            fetch("9plus.json").then(function(response) {
                return response.json();
            }).then(function(data) {
                app.config.words = data;
//                console.log("Got words");
//                console.dir(data);
            });
            const state = app.getState('state');
            if (state && !state.finish) {
                app.pauseGame(false);
                app.loadGame(state);
            } else {
                app.state = Object.assign({}, app.state, state);
            }
        },
        lockLetters: function() {

        },
        pauseGame: function(pause) {
            if (pause) {
               $("#menu").style.height='90%'; 
                app.state.state = 'paused';
            } else {
               $("#menu").style.height='0px'; 
                app.state.state = 'playing';

            }
        },
        newGame: function() {
            let gameStr = '', limit = 250, count = 0;
            // app.state.difficulty = $("#difficulty").options[$("#difficulty").selectedIndex].value;
//            console.log("Attempting to find a good sudoku puzzle...");
            app.deselectCells();
            app.clearDisabled();

            gameStr = sudoku.generate(app.state.difficulty);
            app.state.finish = 0;            
            app.state.puzzleStr = gameStr;
            app.state.puzzle = app.state.puzzleStr.split("");

            app.state.solutionStr = sudoku.solve(app.state.puzzleStr);
            app.state.solution = app.state.solutionStr.split("");
            app.state.score = 0;
            app.updateScore();
            $("#score").innerHTML = "00000";
            
            $("#solveGame").classList.remove("disabled");

            app.state.wordStr = app.config.words[Math.floor(Math.random() * app.config.words.length)].toUpperCase();
            app.state.word = app.scrambleWord(app.state.wordStr.split(""));

            for (let i = 0; i < app.state.word.length; i++) {
                $("#num_" + (i + 1)).innerHTML = app.state.word[i];
            }

            let newPuzzle = [...app.state.solution]; 
            let cell, rnd;
            for (let i=0; i< (81 - app.config.difficulty[app.state.difficulty]); i++) {
                cell = undefined;
                while (!cell) {
                    rnd = Math.floor(Math.random() * 81);
                    if (newPuzzle[rnd]!='.') {
                        cell = newPuzzle[rnd] = '.';
                    }
                }
            }

            //console.log("Old Puzzle: " + app.state.puzzleStr);
            //console.log("New Puzzle: " + newPuzzle.join(''));
            
            app.state.puzzleStr = newPuzzle.join('');
            app.state.puzzle = [...newPuzzle];

            // console.log("New puzzle: " + app.state.puzzleStr);
            sudoku.print_board(app.state.puzzleStr);
            app.state.slowFill = [];
            
            // clear letters from form inputs for word
            for (var i=1; i<10; i++) {
                $("#letter_" + i).value = "";
            }
            for (let i=1; i < (6 - app.config.difficultyLevel.indexOf(app.state.difficulty)); i++) {
                let el = undefined, cnt = 0, rnd;

                while (!el || cnt > 10) {
                    rnd = Math.floor(Math.random() * 9) + 1;
                    el = $("#letter_" + rnd);

                    if (el.value) {
                        el = undefined;
                    }
                    cnt++;
                }
                
                if (el) {
                    el.value = app.state.wordStr[rnd-1];
                }
            }
            app.fillTable(app.state.puzzle);
            app.resetCompleted();
            app.checkCompleted(true);
            app.state.time = 0;
            app.updateTime();   
            if (app.state.timer) {
                clearInterval(app.state.timer);
            }
            app.state.timer = setInterval(function() { app.updateTime(); }, 1000);
            app.storeState('state', app.state);

        },
        loadGame: function(loadState) {
            let gameStr = '', limit = 250, count = 0;
            // $("#newGame").innerHTML = "=";
            // $("#newGame").style.transform = "rotate(90deg)";

            // app.state.difficulty = $("#difficulty").options[$("#difficulty").selectedIndex].value;
            // console.log("Loading game that was already in progress...");
            
            app.state = Object.assign({}, app.state, loadState);
            
            $(".levelSelected").classList.remove("levelSelected");
            $(".level[href='#"+app.state.difficulty +"']").parentElement.classList.add('levelSelected');

            $("#score").innerHTML = app.state.score;
            app.updateScore();
            $("#solveGame").classList.remove("disabled");

            for (let i = 0; i < app.state.word.length; i++) {
                $("#num_" + (i + 1)).innerHTML = app.state.word[i];
            }

            sudoku.print_board(app.state.puzzleStr);

            if ($(".selected")) $(".selected").classList.remove("selected");
            
            if (app.state.currentNumber) $("#num_"+app.state.currentNumber).classList.add("selected");
            app.state.selected = $("#num_"+app.state.currentNumber);
            app.selectCells(app.state.currentNumber);

            app.fillTable(app.state.puzzle);
            app.resetCompleted();
            app.checkCompleted(true);
            
            app.updateTime();   // Update the UI current time value 
            
            if (app.state.timer) {
                clearInterval(app.state.timer);
            }
            app.state.timer = setInterval(function() { app.updateTime(); }, 1000);
            app.storeState('state', app.state);

        },
        scrambleWord: function(arr) {
            let currentIndex = arr.length,
                temporaryValue, randomIndex;

            // While there remain elements to shuffle...
            while (0 !== currentIndex) {

                // Pick a remaining element...
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;

                // And swap it with the current element.
                temporaryValue = arr[currentIndex];
                arr[currentIndex] = arr[randomIndex];
                arr[randomIndex] = temporaryValue;
            }

            return arr;
        },
        solve: function() {
            let slofill = [];
            for (var i = 0; i < app.state.solution.length; i++) {
                if (app.state.puzzle[i] != app.state.solution[i]) {
                    slofill.push({
                        "id": "#slot_" + i,
                        "content": "<span class='num solved'>" + app.state.word[app.state.solution[i]-1] + "</span>"
                    });
                }
            }
            app.state.slowFill = slofill;
            app.slowFill(100);
        },
        slowFill: function(delay) {
            if (!delay) delay = 100;
            if (app.state.slowFill.length) {
                const idx = Math.floor(Math.random() * app.state.slowFill.length);
                const item = app.state.slowFill.splice(idx, 1)[0];

                const el = $(item.id);

                if (el) {
                    $(item.id).innerHTML = item.content;
                    setTimeout(function() {
                        const el = $(item.id + " span.num");
                        if (el) {
                            el.classList.add('reveal');
                            el.addEventListener("transitionend", function(e) { });
//                        $(item.id + " span.num").style.transform = 'scale(1.5)';
                        }
                    }, 10);
                }
                setTimeout(function(delay) {
                    app.slowFill(delay);
                }, delay);
            }
        },
        scale: function(who) {
            //console.log("scaling " + who.id);
            who.classList.add("pop");
            who.classList.add("reveal");
            // who.style.transform = "scale(1.5)";
        },
        fly: function(letter, to) {
            let btn = app.state.word.findIndex(function(el) {
               return el==letter;
            });
            let btnEl = $("#num_" + (btn + 1));
            let fly = document.createElement("div");
            fly.classList.add("fly");
            fly.style.top = btnEl.offsetTop + "px";
            fly.style.left = btnEl.offsetLeft + "px";
            fly.innerHTML = letter;
            fly.addEventListener("transitionend", function(e) {
                //console.log("Transition ended for flying letter");
                // console.dir(e);
                if (e.target.parentElement) $("main").removeChild(e.target);
                let flier;
                while (flier = app.state.flying.pop()) {
                    if (flier.parentElement) flier.parentElement.removeChild(flier);
                }
            });
            $("main").appendChild(fly);
            app.state.flying.push(fly);

            setTimeout(function() {
                fly.style.top = (app.state.lastClick.layerY - 32) + "px";
                fly.style.left = (app.state.lastClick.layerX - 32) + "px";
            }, 100);
        },
        handleClick: function(e) {
            let tgt = e.target;
            
            if (tgt.nodeName === "SPAN") {
                tgt = tgt.parentElement;
            }
            if (tgt.nodeName === "TD") {
                const cellID = tgt.id.replace(/^slot_/, '');
                if ((app.state.puzzle[cellID] != app.state.currentNumber) && (app.state.puzzle[cellID]!='.')) {
                    if (app.state.selected && app.state.selected.classList) {
                        app.state.selected.classList.remove("selected");
                    }
                    
                    app.deselectCells();
                    $("#num_"+app.state.puzzle[cellID]).classList.add("selected");
                    app.state.currentNumber = app.state.puzzle[cellID];
                    app.state.selected = $("#num_"+app.state.puzzle[cellID]);
                    app.selectCells(app.state.currentNumber);
                    return true;
                }
                if (app.state.currentNumber) {
                    // console.log("CellID: " + cellID);

                    if (app.state.puzzle[cellID] == app.state.currentNumber) {
                        app.state.puzzle[cellID] = ".";
                        tgt.classList.remove("good");
                        tgt.classList.remove("bad");
                        tgt.classList.remove("selcell");
                        tgt.innerHTML = "";
                    } else {
                        if (tgt.classList.contains("oem")) {
                            return false;
                        }
                        let newel = document.createElement("span");
                        newel.classList.add("num");
                        newel.innerText = app.state.word[app.state.currentNumber - 1];
                        // newel.style.transform = "scale(0)";

                        tgt.appendChild(newel);
                        setTimeout(function() {
                            app.scale(newel);
                        }, 250);
                        // tgt.innerHTML = "<span class='num pop'>" + app.state.word[app.state.currentNumber-1] + "</span>";
                        tgt.classList.add("selcell");
                        
                        app.state.puzzle[cellID] = app.state.currentNumber;
                        app.fly(app.state.word[app.state.currentNumber - 1]);

                        if (app.state.solution[cellID] == app.state.currentNumber) {
                            tgt.classList.remove('bad');
                            tgt.classList.add('good');
                            app.updateScore(35);
                        } else {
                            tgt.classList.remove('good');
                            tgt.classList.add('bad');
                            app.updateScore(-500);
                            if (app.state.score < 0) {
                                app.state.score = 0;
                            }
                        }

                        //console.log("Old Puzzle: " + app.state.puzzleStr);
                        //console.log("New Puzzle: " + app.state.puzzle.join(""));
                    }
                    app.state.puzzleStr = app.state.puzzle.join("");
                    app.checkCompleted();
                    app.storeState('state', app.state);
                }
            }

        },
        clearDisabled: function() {
            const els = $$(".disabled");
            els.forEach(function(item) {
                item.classList.remove('disabled');
            });

        },
        deselectCells: function(num) {
            const sel = $$(".selcell");

            sel.forEach(function(item) {
                item.classList.remove("selcell");
            });
        },
        selectCells: function(num) {
            const sel = $$(".selcell");

            sel.forEach(function(item) {
                item.classList.remove("selcell");
            });

            for (let i = 0; i < app.state.puzzle.length; i++) {
                if (app.state.puzzle[i] == num) {
                    $("#slot_" + i).classList.add("selcell");
                }
            }
        },
        fillTable: function(items) {
            // console.dir(items);
            for (var i = 0; i < items.length; i++) {
                let slot = $("#slot_" + i);

                if (slot) {
                    slot.innerHTML = "";
                    slot.classList.remove("locked", "oem");
                    if (items[i] != ".") {
                        app.state.slowFill.push({
                            "id": "#slot_" + i,
                            "content": "<span class='num'>" + app.state.word[items[i] - 1] + "</span>"
                        });
                        slot.classList.add("oem");
                    }
                }
            }
            app.slowFill(100);
        },
        lockNumber: function(num) {
            for (var i = 0; i < app.state.puzzle.length; i++) {
                if (app.state.puzzle[i] == num) {
                    $("#slot_" + i).classList.add("locked");
                    const numspan = $("#slot_" + i + " span.num");
                    if (numspan) numspan.classList.add("bounce");
                }
            }
        },
        checkNumbers: function() {
            const out = {};

            for (var i = 0; i < app.state.puzzle.length; i++) {
                if (app.state.puzzle[i] != ".") {
                    if (!out[app.state.puzzle[i]]) out[app.state.puzzle[i]] = 0;
                    if (app.state.solution[i] == app.state.puzzle[i]) {
                        out[app.state.puzzle[i]]++;
                    }
                    if (out[app.state.puzzle[i]] == 9) {
                        console.log("found completed number: "+app.state.puzzle[i]);
                        if (!app.state.completed.numbers[app.state.puzzle[i]]) {
                            // console.log("Completed number!! " + app.state.puzzle[i]);
                            if (!$("#num_" + app.state.puzzle[i]).classList.contains("disabled")) {
                                $("#num_" + app.state.puzzle[i]).classList.add("disabled");
                                app.lockNumber(app.state.puzzle[i]);
                                app.revealLetter(app.state.puzzle[i]);
                                app.deselectCells();
                                let curbtn = $(".selected");
                                if (curbtn) curbtn.classList.remove("selected");
                                app.state.currentNumber = 0;
                                app.state.selected = '';
                                app.state.completed.numbers[app.state.puzzle[i]] = 1;
                                app.updateScore(600);
                            }
                        }
                    }
                }
            }
        },
        revealLetter: function(who) {
            const ltr = app.state.word[who - 1];
            let pos = app.state.wordStr.indexOf(ltr)+1;

            $("#letter_"+pos).value = ltr;
        },
        checkCol: function(col) {
            for (var i = col; i < 81; i += 9) {
                if (app.state.puzzle[i] == '.') {
                    return false;
                } else {
                    // console.log("OK");
                }
            }
            console.log("Found completed column: "+col);
            return true;
        },
        checkRow: function(row) {
            for (var i = row; i < row + 9; i++) {
                if (app.state.puzzle[i] == '.') {
                    return false;
                }
            }
            return true;
        },
        checkSquare: function(square) {
            for (var x = 0; x < app.config.squares[square].length; x++) {
                if (app.state.puzzle[app.config.squares[square][x]] == '.') {
                    return false;
                }
            }
            return true;
        },
        checkSquares: function(noscore) {
            for (var i = 0; i < app.config.squares.length; i++) {
                if (!app.state.completed.squares[i] && app.checkSquare(i)) {
                    //if (!$("#slot_" + app.config.squares[i][0]).classList.contains("locked")) {
                        for (var x = 0; x < app.config.squares[i].length; x++) {
                            $("#slot_" + app.config.squares[i][x]).classList.add("locked");
                            if (!noscore) $("#slot_" + app.config.squares[i][x] + ' span').classList.add("pop");
                        }
                        if (!noscore) app.updateScore(600);
                        app.state.squares[i] = true;
                    app.state.completed.squares[i] = true;
                }
            }
            return true;
        },
        clearPop: function() {
            const pops = $$(".pop");
            console.dir(pops);
            pops.forEach(function(pop) {
                pop.classList.remove('pop');
            });
            const bounce = $$(".bounce");
            bounce.forEach(function(bounce) {
                bounce.classList.remove('bounce');
            });
        },
        checkCompleted: function(noscore) {
            // Check rows and columns for completion
            for (var r = 0; r < 81; r += 9) {
                if (app.checkRow(r)) {
                    if (!app.state.completed.rows[r / 9]) {
                        for (var c = 0; c < 9; c++) {
                            $("#slot_" + (r + c)).classList.add('locked');
                            if (!noscore) {
                                $("#slot_" + (r + c) + " span").classList.add('pop');
                            }
                        }
                        if (!noscore) app.updateScore(600);
                        app.state.completed.rows[r / 9] = 1;
                    }
                }
            }

            for (var c = 0; c < 9; c++) {
                if (app.checkCol(c)) {
                    if (!app.state.completed.cols[c]) {
                        for (var r = c; r < 81; r += 9) {
                            $("#slot_" + r).classList.add('locked');
                            if (!noscore) {
                                $("#slot_" + r + " span").classList.add('pop');
                            }
                        }
                        if (!noscore) app.updateScore(600);
                        app.state.completed.cols[c] = 1;
                   }
                }
            }
            app.checkSquares(noscore);
            app.checkNumbers();
            if (app.state.puzzle.join('') == app.state.solution.join('')) {
                app.deselectCells();
                clearTimeout(app.state.timer);
                app.state.finish = 1;
                app.doWin();
                app.storeHistory();
            }
            setTimeout(function() { app.clearPop(); }, 2000);
        },
        checkHighScore: function(obj) {
            let scores = app.getState('highscores');
            if (!scores) scores = [];

            scores.push(obj);
            scores.sort((a,b)=>(b.score - a.score));
            if (scores.length > 5) scores.pop();

            app.storeState('highscores', scores); 
        },
        storeHistory: function() {
            let history = app.getState('history');
            if (!history) {
                history = [];
            }
            const now = new Date();
            let archive = { 
                score: app.state.score,
                difficulty: app.state.difficulty,
                time: app.state.time,
                solution: app.state.solution,
                date: now.toJSON()
            };
            history.push(archive);
            app.storeState('history', history);
            app.checkHighScore(archive);
        },
        goBackButton: function() {
            return "<button onclick='return app.goBack()' class='backbutton'>↩</button>";
        },
        showAbout: function() {
            let out = app.goBackButton() + "<h1 class='title'>About</h1>\n";
            out += "<h2>Wordoku: A Sudoku Game with Words!</h2>";
            out += "<p>By Christopher Robison &lt;<a href='mailto:cdr@cdr2.com'>cdr@cdr2.com</a>&gt;</p>";
            out += "<p>&copy; Copyright 2020, All Rights Reserved</p>";
            $("#about").innerHTML = out;
            $("#about").style.display = "block";
            $("#about").style.left = '0px';
            app.state.openPage = $("#about");
        },
        showHelp: function() {
            let out = app.goBackButton() + "<h1 class='title'>Help</h1>\n<hr>";
            out += "<p>Each game is based on one 9 letter word with each row, column and square containing all letters in the word while not repeating any letters. There is only one solution for any given puzzle.</p><p>Select a letter from the bottom buttons and matching squares will be highlighted.</p><p>Select squares in the puzzle where the letter is unique in each row, column and square. Correct letter placement will add <span class='points'>+35</span> points to your score.  Incorrect placement will mark the square red and subtract <span class='points minus'>-500</span> points from your score.</p>";
            out += "<p>The actual word, unscrambled, is slowly revealed as you complete each letter or you can earn extra points for correctly guessing a letter position in the word form at the bottom of the game area.  Wrong answers take significant points off of your score based on your selected difficulty level.</p>";
            out += "<p>Extra points are scored for each complete letter, row, column and square.  Points are deducted for incorrect guesses. You are always better off moving on if you are unsure of a letter placement than to guess incorrectly.</p>";
            $("#help").innerHTML = out;
            $("#help").style.display = "block";
            $("#help").style.left = '0px';

            app.state.openPage = $("#about");
        },
        showHighScores: function() {
            const histEl = $("#highScores");

            let scores = app.getState('history');
            if (!scores) scores = [];

            let out = "<button onclick='return app.goBack()' class='backbutton'>↩</button><h1 class='title'>High Scores</h1><table id='historyTable'><thead><tr><th></th><th>Date</th><th>Difficulty</th><th>Time</th><th>Score</th></tr></thead><tbody>";
            
            scores.sort(function(b, a) { return a.score - b.score; });
            for (let i=0; i<10; i++) {
                let item = scores[i];

                if (item && item.score && item.time) {
                    let d = new Date(item.date).toLocaleString();
                    let t = Math.floor(item.time / 60).toString().padStart(2, '0') + ':' + (item.time % 60).toString().padStart(2, '0');
                    out += `<tr><td>${i}</td><td>${d}</td><td>${item.difficulty}</td><td>${t}</td><td>${item.score}</td></tr>`;
                }
            }
            out += "</tbody></table>";
            histEl.innerHTML = out;
            histEl.style.display = "block";
            //histEl.style.height = "100vh";
            //histEl.style.width = "100%";
            histEl.style.left = "0px";
            app.state.openPage = histEl;
        },
        showHistory: function() {
            const histEl = $("#history");

            const history = app.getState('history');
            if (!history) history = [];

            let out = "<button onclick='return app.goBack()' class='backbutton'>↩</button><h1 class='title'>Game History</h1><table id='historyTable'><thead><tr><th>Date</th><th>Difficulty</th><th>Time</th><th>Score</th></tr></thead><tbody>";

            for (let i=0; i<history.length; i++) {
                let item = history[i];

                if (item.score && item.time) {
                    let d = new Date(item.date).toLocaleString();
                    let t = Math.floor(item.time / 60).toString().padStart(2, '0') + ':' + (item.time % 60).toString().padStart(2, '0');
                    out += `<tr><td>${d}</td><td>${item.difficulty}</td><td>${t}</td><td>${item.score}</td></tr>`;
                }
            }
            out += "</tbody></table>";
            histEl.innerHTML = out;
            histEl.style.display = "block";
            //histEl.style.height = "100vh";
            histEl.style.left = "0px";
            app.state.openPage = histEl;
        },
        goBack: function() {
            if (app.state.openPage) {
                app.state.openPage.style.left = "-100%";
            }
            const dialogs = $$(".dialog");
            dialogs.forEach(function(item) {
                if (item) {
                    item.style.left = '-100%';
                }
            });
        },
        state: {
            currentNumber: null,
            selected: null,
            puzzle: '',
            score: 0,
            time: 0,
            slowFill: [],
            difficulty: "hard",
            squares:[0,0,0,0,0,0,0,0,0],
            explosions:[],
            flying: [],
            finish:0,
            highScores:[],
            completed: {
                squares: [0,0,0,0,0,0,0,0,0],
                rows: [0,0,0,0,0,0,0,0,0],
                cols: [0,0,0,0,0,0,0,0,0],
                numbers: [0,0,0,0,0,0,0,0,0]
            }
        },
        resetCompleted: function() {
            app.state.completed = {
                squares: [0,0,0,0,0,0,0,0,0],
                rows: [0,0,0,0,0,0,0,0,0],
                cols: [0,0,0,0,0,0,0,0,0],
                numbers: [0,0,0,0,0,0,0,0,0]
            };
        },
        config: {
            squares: [
                [0, 1, 2, 9, 10, 11, 18, 19, 20],
                [3, 4, 5, 12, 13, 14, 21, 22, 23],
                [6, 7, 8, 15, 16, 17, 24, 25, 26],
                [27, 28, 29, 36, 37, 38, 45, 46, 47],
                [30, 31, 32, 39, 40, 41, 48, 49, 50],
                [33, 34, 35, 42, 43, 44, 51, 52, 53],
                [54, 55, 56, 63, 64, 65, 72, 73, 74],
                [57, 58, 59, 66, 67, 68, 75, 76, 77],
                [60, 61, 62, 69, 70, 71, 78, 79, 80]
            ],
            difficultyLevel: ["easy", "medium", "hard", "very-hard", 'insane', 'inhuman'],
            difficulty: {
                        "easy":         62,
                        "medium":       53,
                        "hard":         44,
                        "very-hard":    35,
                        "insane":       26,
                        "inhuman":      17,
            }

        },
        checkWord: function() {
            let ok = true;
            for (let i=1; i<10; i++) {
                if ($("#letter_"+i).value != app.state.wordStr[i-1]) {
                    ok = false;
                    i = 11;
                }
            }
            return ok;
        },
        updateScore: function(scr) {
            if (scr) app.state.score += scr;
            if (app.state.score < 0) app.state.score = 0;
            
            let showScore = app.state.score.toString().padStart(5, "0");
            $("#score").innerHTML = showScore;

            if (scr && app.state.lastClick) {
                let points = document.createElement("div");
                points.classList.add('points');

                points.innerHTML = (scr>0) ? '+' +  scr : scr;
                points.addEventListener("transitionend", function(e) {
                    if (e.target.offsetParent) $("main").removeChild(e.target);
                });
                $("main").appendChild(points);

                if (app.state.lastClick) {
                    points.style.top = app.state.lastClick.layerY + 'px';
                    points.style.left = (app.state.lastClick.layerX - 100) + 'px';
                }
                setTimeout(function() {
                    points.classList.add('fade');
                }, 10);
            }
        },
        genBoard: function() {
            let cnt = 0;
            let out = "<table id='board'>";
            //out += "<colgroup class='colgroup' id='colgroup0' span='3'></colgroup><colgroup class='colgroup' id='colgroup1' span='3'></colgroup><colgroup class='colgroup' id='colgroup2' span='3'></colgroup>";

            for (let rg = 0; rg < 3; rg++) {
                out += "<tbody class='rowgroup' id='rowgroup"+rg+"'>";
                for (let r = 0; r < 3; r++) {
                    out += "<tr>";
                    for (let cg = 0; cg < 3; cg++) {
                        for (let c = 0; c < 3; c++) {
                            out += "<td id='slot_" + cnt + "'></td>";
                            cnt++;
                        }
                    }
                    out += "</tr>";
                }
                out += "</tbody>";
            }
            out += "</table>";
            $("#sudoku-board").innerHTML = out;

            for (let i=1; i<app.config.squares.length; i+=2) {
                for (let j=0; j<app.config.squares[i].length; j++) {
                    $("#slot_"+app.config.squares[i][j]).classList.add('dark');
                }
            }
        },
        removeLetters: function(str, howMany) {
            let pos, 
                oemString = str;

            for (let i=0; i<howMany; i++) {
                pos = Math.floor(Math.random() * str.length);
                str = str.substring(0, pos) + '.' + str.substring(pos+1); 
            }

            return str;
        },
        updateTime: function() {
            app.state.time++;
            let min = Math.floor(app.state.time / 60);
            let sec = app.state.time % 60;
            let out = min.toString().padStart(2, '0') + ':' + sec.toString().padStart(2,'0');

            $("#time").innerHTML = out;
        },
        explode: function(x, y) {
//            console.log("Making explosion at [" + x + ", " + y + "]"); 
            let particles = 20,
            
            // explosion container and its reference to be able to delete it on animation end
            explosion = document.createElement('div');
            explosion.className = 'explosion';
          
            $("body").append(explosion);
            app.state.explosions.push(explosion);

              // position the container to be centered on click
            explosion.style.left =  x + 'px';
            explosion.style.top =  y + 'px';
            let mastercolor = app.rand(128,255) + ', ' + app.rand(128,255) + ', ' + app.rand(128,255);
            let colors = ['#f00','#0f0', '#00f', '#0ff', '#f0f', '#ff0'];
            let degrees = Math.floor(360 / particles);
            let color = colors[app.rand(0, colors.length)];
            for (let i = 0; i < particles; i++) {
              // positioning x,y of the particle on the circle (little randomized radius)
            let x = (explosion.offsetWidth / 2) + app.rand(80, 250) * Math.cos(2 * Math.PI * i / app.rand(particles - 10, particles + 10)),
                y = (explosion.offsetHeight / 2) + app.rand(80, 250) * Math.sin(2 * Math.PI * i / app.rand(particles - 10, particles + 10)),
                w = app.rand(5,20), h = app.rand(5, 30); //, color = mastercolor; // app.rand(0, 255) + ', ' + app.rand(0, 255) + ', ' + app.rand(0, 255); // randomize the color rgb
                // particle element creation (could be anything other than div)
                x = 300 + (300 * (Math.cos((Math.PI / 180) * (i * degrees)))),
                    y = 300 + (300 * (Math.sin((Math.PI / 180) * (i * degrees))));

                elm = document.createElement('div');
                elm.className = 'particle spin' + app.rand(0,1); // + " bs" + app.rand(0,3);
                elm.style.backgroundColor = color;
                elm.style.top = y + 'px';
                elm.style.left = x + 'px';
                elm.style.height = w + 'px';
                elm.style.width = w + 'px';
                elm.style.animationDuration = app.rand(50,3000) + 'ms';
                
                if (i == 0) { // no need to add the listener on all generated elements
                    // css3 animation enddetection
                    elm.addEventListener('animationend', function(e) {
                        explosion.parentNode.removeChild(explosion); // remove this explosion container when animation ended
                    }, 'once');
                }
                explosion.append(elm);
            }
        },
        rand: function(min, max) {
            return Math.floor(Math.random() * (max + 1)) + min;
        },
        doExplosion: function() {
            setTimeout(function() { app.explode(app.rand(0,window.innerWidth), app.rand(-200, window.innerHeight - 200)); }, app.rand(10, 8000));
        },
        doWin: function() {
            let win = $(".youwin");
            if (!win) {
                win = document.createElement("div");
                win.innerHTML = "You Win!";
                win.classList.add('youwin');
                $("body").append(win);
            }

            win.addEventListener("animationend", function(e) {
                $(".youwin").style.opacity = "0";
                setTimeout(function() { $("body").removeChild($(".youwin")); }, 1000);
            });
           for (let i=0; i < 50; i++) {
                app.doExplosion(i);
           }
        },
        storeState: function(key, obj) {
            window.localStorage.setItem(key, JSON.stringify(obj));
        },
        getState: function(key) {
            const obj = JSON.parse(window.localStorage.getItem(key));
            if (obj && obj.slowFill) {
                obj.slowFill = [];
            }
            return obj;
        },
        doInit: function() {
            if (!window.sudoku) {
                setTimeout(function() { app.doInit(); }, 2000);
            } else {
                app.init();
            }
        }
    
    }
    window.app = app;
    app.doInit();
})();

