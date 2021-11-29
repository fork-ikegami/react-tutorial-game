import React from 'react';
import ReactDOM from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock } from '@fortawesome/free-solid-svg-icons'
import './index.css';

// 次はこちら
// https://ja.reactjs.org/tutorial/tutorial.html#completing-the-game
// 着手履歴のリストを昇順・降順いずれでも並べかえられるよう、トグルボタンを追加する。

// 関数コンポーネント
function Square(props) {
  return (
    // ボタンをクリックされたらBoardから渡されたonClickプロパティを呼ぶ
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square 
        key={i}
        value={this.props.squares[i]}
        // SquareにonClickを渡す
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    // ボード描画
    const board = [0, 3, 6].map((n, index) => {
      let square = [];
      for (let i = 0; i < 3; i++) {
        square.push(this.renderSquare(i + n));
      }
      return (
        <div key={index} className="board-row">
          {square}
        </div>
      )
    })
    return (
      <div>{board}</div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
      }],
      stepNumber: 0, //いま何手目か
      xIsNext: true, //Xが先手
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1); //時間を巻き戻したら不要な未来の履歴を消す
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    // 決着がついていたらreturn
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext, //次のプレーヤーへ
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    })
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber]; //現在のステップを表示する
    const winner = calculateWinner(current.squares); //勝者を判定

    const moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move :
        'Go to game start';

      // 履歴でどのマスに置いたか表示
      let position = null;
      if (move > 0) {
        step.squares.forEach(function(value, index) {
          if (value !== history[move-1].squares[index]) {
            position = `[${index}]`;
            return;
          }
        })
      }

      // 現在のステップかどうか
      const currentStep = move === this.state.stepNumber ?
        'is-current' :
        null;

      return (
        <li key={move} className={currentStep}>
          <button onClick={() => this.jumpTo(move)}>{desc}<FontAwesomeIcon icon={faClock} /></button>
          <span className="position">{position}</span>
        </li>
      );
    });

    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol className="list-moves">{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

// 勝敗判定
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}