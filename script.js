// Initialize a 2D array with colors and empty cells

let maxLoop = 200;
let count = 0;

let gridData = [
        [{ color: 'gray' }, { color: '' }, { color: '' }, { color: '' }, { color: '' }],
        [{ color: '' }, { color: '' }, { color: '' }, { color: '' }, { color: '' }],
        [{ color: '' }, { color: '' }, { color: 'gray' }, { color: 'red' }, { color: '' }],
        [{ color: 'gray' }, { color: '' }, { color: '' }, { color: '' }, { color: '' }],
        [{ color: '' }, { color: '' }, { color: '' }, { color: '' }, { color: '' }]
];

let target = [
        [0, 0, 1, 1, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0],
        [1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0]
];

function sleep(time) {
        return new Promise((resolve) => setTimeout(resolve, time));
}

function bfs(node, maxCounts = 1000, maxDepth = 1) {

        let smallSleep = 10;

        //child => parent
        let parentTree = [];
        let timeCount = 0;
        let visited = [];

        visited[gridToSting(node.grid)] = true;
        //console.log([JSON.parse(JSON.stringify(node))]) ;
        let queue = [JSON.parse(JSON.stringify(node))];
        //console.log('queue start ', queue);
        //console.log('-');

        while (!(queue.length === 0) && maxCounts >= timeCount) {
                // console.log('queue ', queue);

                timeCount++;

                let currNode = queue.shift();
                //console.log('curr', currNode);
                visited[gridToSting(currNode.grid)] = true;

                sleep(smallSleep * timeCount).then(() => {
                        console.log(queue.length);
                        gridData = currNode.grid;
                        count++;
                        renderGrid();
                });

                if (checkWin(currNode.grid, target)) {

                        sleep((smallSleep * timeCount + smallSleep)).then(() => {
                                gridData = currNode.grid;
                                count = currNode.depth;
                                console.log('count', count);
                                renderGrid();
                        });

                        return currNode;
                }

                // if(currNode.depth === maxDepth)continue ;

                options = generateAllOptions(currNode.grid, true, visited);

                for (let i = 0; i < options.length; i++) {
                        queue.push({
                                grid: options[i],
                                depth: currNode.depth + 1
                        });
                        parentTree[gridToSting(options[i])] = currNode;
                }
        }
        return null;
}

function dfs(node, visited = [], depth = 0, maxCount = 10) {

        if (depth > maxCount) return false;

        console.log(depth);
        console.log(node);

        if (checkWin(node, target)) {

                gridData = node;
                count = depth;
                renderGrid();
                return node ;
        };

        if (gridToSting(node) in visited) return false;

        visited[gridToSting(node)] = true;

        let options = generateAllOptions(node, true, visited);

        for (let i = 0; i < options.length; i++) {
                res = dfs(JSON.parse(JSON.stringify(options[i])), visited, depth + 1);
                if (res !== false) {
                        gridData = res;
                        renderGrid();
                        return res;
                }
        }
        return false;
}


const gridContainer = document.getElementById('grid');
let selectedCell = null;

// Render the grid based on the gridData array
function renderGrid() {

        gridContainer.innerHTML = '';
        gridData.forEach((row, rowIndex) => {
                row.forEach((cell, colIndex) => {
                        const cellDiv = document.createElement('div');
                        cellDiv.classList.add('cell');
                        cellDiv.classList.add(cell.color || 'empty');
                        cellDiv.dataset.row = rowIndex;
                        cellDiv.dataset.col = colIndex;

                        // Add click event to handle cell selection and movement
                        cellDiv.addEventListener('click', () => handleCellClick(rowIndex, colIndex));

                        if (
                                selectedCell
                                && selectedCell.row === rowIndex
                                && selectedCell.col === colIndex
                                && gridData[selectedCell.row][selectedCell.col]
                                && ['red', 'blue'].includes(gridData[selectedCell.row][selectedCell.col].color ?? '')
                        ) {
                                cellDiv.classList.add('selected');
                        }

                        if (target[rowIndex][colIndex]) {
                                cellDiv.classList.add('target');
                        }

                        gridContainer.appendChild(cellDiv);
                });
        });


        document.getElementById('win').innerHTML = '';

        if (checkWin(gridData, target)) {
                document.getElementById('win').innerHTML += 'win';
        } else {
                document.getElementById('win').innerHTML += 'playing...';
        }

        document.getElementById('count').innerHTML = '';
        document.getElementById('count').innerHTML = count;
}

// Function to attract gray cells along rows and columns
function nextGrid(row, col, selectedRow, selectedCol, grid) {

        //console.log('next grid functions ');

        let tmpGrid = grid;

        ////console.log('cor color ' , grid[0][0].color); 

        color = tmpGrid[selectedRow][selectedCol].color;
        tmpGrid[selectedRow][selectedCol].color = '';
        tmpGrid[row][col].color = color;

        ////console.log('next color : ' , color) ;

        //test frirt with red

        /**
         * if red , start from red 
         * if i am '' and the far not '' switch
         * 
         * 
         * if blue start from wall 
         * if i am '' and the far not '' switch
         */

        //move with delta , switch with -delta


        foreachValues = [
                //left
                {
                        startRow: row,
                        startCol: color === 'red' ? col : 0,

                        endRow: null,
                        endCol: color === 'red' ? 0 : Math.max(col - 1, 0),

                        deltaRow: 0,
                        deltaCol: color === 'red' ? -1 : 1,
                },//right
                {
                        startRow: row,
                        startCol: color === 'red' ? col : tmpGrid[0].length - 1,

                        endRow: null,
                        endCol: color === 'red' ? tmpGrid[0].length - 1 : Math.min(col + 1, tmpGrid[0].length - 1),

                        deltaRow: 0,
                        deltaCol: color === 'red' ? 1 : -1,
                },//up
                {
                        startRow: color === 'red' ? row : 0,
                        startCol: col,

                        endRow: color === 'red' ? 0 : Math.max(row - 1, 0),
                        endCol: null,

                        deltaRow: color === 'red' ? -1 : 1,
                        deltaCol: 0,
                }
                ,//down
                {
                        startRow: color === 'red' ? row : tmpGrid.length - 1,
                        startCol: col,

                        endRow: color === 'red' ? tmpGrid.length - 1 : Math.min(row + 1, tmpGrid.length - 1),
                        endCol: null,

                        deltaRow: color === 'red' ? 1 : -1,
                        deltaCol: 0,
                },
        ];

        foreachValues.forEach(({ startRow, startCol, endCol, endRow, deltaCol, deltaRow }) => {

                //check for the grid size inside the switch not the foreach
                for (
                        //start 
                        let currRow = startRow, currCol = startCol;

                        //if
                        currRow !== endRow
                        && currCol !== endCol

                        && currRow >= 0
                        && currCol >= 0
                        && currRow < tmpGrid.length
                        && currCol < tmpGrid[0]?.length

                        && currRow + deltaRow >= 0
                        && currCol + deltaCol >= 0
                        && currRow + deltaRow < tmpGrid.length
                        && currCol + deltaCol < tmpGrid[0]?.length


                        //increment
                        ; currRow += deltaRow, currCol += deltaCol) {

                        let targetRow = currRow + deltaRow;
                        let targetCol = currCol + deltaCol;


                        if (--maxLoop < 0) {
                                break;
                        };

                        ////console.log(currRow , currCol , targetRow , targetCol) ;

                        if (
                                tmpGrid[currRow] != 'undefined'
                                && tmpGrid[targetRow] != 'undefined'
                                && tmpGrid[currRow][currCol] != 'undefined'
                                && tmpGrid[targetRow][targetCol] != 'undefined'
                        ) {
                                if (
                                        tmpGrid[currRow][currCol].color != 'undefined'
                                        && tmpGrid[currRow][currCol].color === ''
                                        && tmpGrid[targetRow][targetCol].color != 'undefined'
                                        && tmpGrid[targetRow][targetCol].color !== ''
                                ) {
                                        tmpGrid[currRow][currCol].color = tmpGrid[targetRow][targetCol].color;
                                        tmpGrid[targetRow][targetCol].color = '';
                                }
                        } else {
                                break;
                        }
                }
        });

        maxLoop = 200;

        return tmpGrid;
}

function checkWin(grid, target) {
        isTrue = true;
        for (let i = 0; i < target.length; i++) {
                for (let j = 0; j < target[0].length; j++) {
                        if (target[i][j] && grid[i][j].color === '') {
                                isTrue = false;
                                break;
                        }
                }
                if (!isTrue) break;
        }
        return isTrue;
}

function generateAllOptions(grid, checkVisited = false, visited) {
        let colored = [];
        let empty = [];

        let options = [];

        for (let i = 0; i < grid.length; i++) {
                for (let j = 0; j < grid[0].length; j++) {
                        if (grid[i][j].color === '') {
                                empty.push({
                                        row: i,
                                        col: j,
                                        color: '',
                                });
                        }
                        else if (['red', 'blue'].includes(grid[i][j].color)) {
                                colored.push({
                                        row: i,
                                        col: j,
                                        color: grid[i][j].color,
                                });
                        }
                }
        }

        for (let c = 0; c < colored.length; c++) {
                for (let e = 0; e < empty.length; e++) {
                        ////console.log(grid[0][0].color);
                        newOption = nextGrid(
                                empty[e].row,
                                empty[e].col,
                                colored[c].row,
                                colored[c].col,
                                JSON.parse(JSON.stringify(grid))
                        );

                        if (checkVisited && (gridToSting(newOption) in visited)) {
                                continue;
                        }
                        options.push(newOption);
                }
        }

        return options;
}

function gridToSting(grid) {
        let _string = '';

        for (let i = 0; i < grid.length; i++) {
                for (let j = 0; j < grid[0].length; j++) {
                        _string += grid[i][j].color === '' ? '_' : grid[i][j].color;
                }
        }

        return _string;
}


// Handle cell selection and movement logic
function handleCellClick(row, col) {
        const cell = gridData[row][col];

        options = generateAllOptions(gridData);

        //console.log('options : ', options);

        // for (let i = 0; i < options.length; i++) {
        //         sleep(1000 * i).then(() => {
        //                 gridData = options[i];
        //                 renderGrid();
        //         });
        // }

        if (selectedCell) {
                // If clicking an empty cell, move the color to it
                if (!cell.color && ['red', 'blue'].includes(gridData[selectedCell.row][selectedCell.col].color)) {
                        count++;

                        let newGrid = nextGrid(row, col, selectedCell.row, selectedCell.col, JSON.parse(JSON.stringify(gridData)));

                        ////console.log('new grid', newGrid);
                        // ////console.log(newGrid);

                        gridData = newGrid;

                        // Deselect
                        selectedCell = null;
                } else {
                        // Deselect if a colored cell is clicked again
                        selectedCell = selectedCell.row === row && selectedCell.col === col ? null : { row, col };
                }
        } else if (cell.color) {
                // Select the colored cell
                selectedCell = { row, col };
        }

        renderGrid();

        ////console.log('string : ', gridToSting(gridData));
}

// Initial render
renderGrid();

// console.log(bfs({
//         grid: JSON.parse(JSON.stringify(gridData)),
//         depth: 0
// }));
//console.log(dfs(JSON.parse(JSON.stringify(gridData))));
