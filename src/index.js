import React from 'react';
import ReactDOM from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock } from '@fortawesome/free-solid-svg-icons'
import './index.css';

// https://ja.reactjs.org/tutorial/tutorial.html#completing-the-game

// 関数コンポーネント
function Square(props) {
  return (
    // ボタンをクリックされたらBoardから渡されたonClickプロパティを呼ぶ
    <button className={`${props.class} square`} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    // 勝者がいる場合、決め手のマスにクラス付与
    let isWinnerSquare = null;
    if (this.props.winnerPosition !== null) {
      this.props.winnerPosition.forEach((e) => {
        if (e === i) {
          isWinnerSquare = 'is-winner';
        }
      });
    }
    return (
      <Square 
        key={i}
        value={this.props.squares[i]}
        // SquareにonClickを渡す
        onClick={() => this.props.onClick(i)}
        class={isWinnerSquare}
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
      ascend: true, //ソート
      winner: null, //勝者
      winnerPosition: null, //勝者の手
    };
  }

  /**
   * 
   * @param {Number} i 押されたマス目の位置
   * @returns 
   */
  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1); //時間を巻き戻したら不要な未来の履歴を消す
    const current = history[history.length - 1];
    const squares = current.squares.slice();

    // 決着がついていたらreturn
    if (this.state.winner || squares[i]) {
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

    this.setWinner(squares);
  }

  // 勝者記録
  setWinner(squares) {
    const winnerInfo = calculateWinner(squares);
    this.setState({
      winner: winnerInfo[0],
      winnerPosition: winnerInfo[1],
    });
  }

  jumpTo(step) {
    // 任意のステップに移動
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });

    // ステップを移動したら勝者情報も更新する
    const history = this.state.history;
    const current = history[step];
    this.setWinner(current.squares);
  }

  // 履歴 降順昇順
  sortHistory() {
    this.setState({
      ascend: !this.state.ascend,
    })
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber]; //現在のステップ

    const moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move :
        'Go to game start';

      // 履歴でどのマスに置いたか表示
      let position = null;
      if (move > 0) {
        step.squares.forEach(function(value, index) {
          if (value !== history[move-1].squares[index]) {
            position = ` - [${index}]`;
            return;
          }
        })
      }

      // 現在のステップかどうか
      const currentStep = move === this.state.stepNumber ?
        'is-current' :
        null;

      // 時計アイコンつける
      const iconButton = move ?
        null :
        <FontAwesomeIcon icon={faClock} />;

      return (
        <li key={move} className={currentStep}>
          <button onClick={() => this.jumpTo(move)}>{desc}{iconButton}</button>
          <span className="position">{position}</span>
        </li>
      );
    });

    // 手番表示
    let status;
    if (this.state.winner) {
      status = 'Winner: ' + this.state.winner;
    } else if (this.state.stepNumber === 9) {
      status = 'DRAW';
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    // 昇順降順
    const sortText = this.state.ascend ?
      '▲Ascending' :
      '▼Descending';

    if(!this.state.ascend) moves.reverse();

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            winnerPosition={this.state.winnerPosition}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <div className="game-history">
            <button onClick={() => this.sortHistory()} className="btn-sort">{sortText}</button>
            <ol className="list-moves">{moves}</ol>
          </div>
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
      return [squares[a], lines[i]];
    }
  }
  return [null, null];
}