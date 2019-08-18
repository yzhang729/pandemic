import React from 'react'
import {Button} from 'react-bootstrap'
import {app, db} from '../../firebase-server/firebase'

const MAXPLAYERS = 4

class Game extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      players: [],
      username: this.props.username,
      isFull: false
    }
    this.game = db.collection('games').doc(this.props.gamename)
    this.game.onSnapshot(this.listenPlayers)
  }

  async componentDidMount() {
    let players = []
    let isFull = false
    await this.game
      .get()
      .then(doc => {
        players = doc.data().players
        isFull = doc.data().isFull
      })
      .then(() => this.setState({players: players, isFull: isFull}))
  }

  componentWillUnmount() {
    const unsubscribe = this.game.onSnapshot(this.listenPlayers)
    unsubscribe()
  }

  handleClick = () => {
    this.game.set(
      {
        players: [...this.state.players, this.state.username]
      },
      {merge: true}
    )
  }

  listenPlayers = () => {
    let players = []
    this.game
      .get()
      .then(doc => {
        players = doc.data().players
      })
      .then(() => this.setState({players: players}))
      .then(() => {
        if (this.state.players.length === MAXPLAYERS) {
          this.game.set({isFull: true}, {merge: true}).then(() =>
            this.setState({
              isFull: true
            })
          )
        }
      })
  }

  render() {
    const disabled = this.state.players.includes(this.state.username)

    return (
      <div>
        {this.state.isFull ? (
          <p>The room is full</p>
        ) : (
          <p>{MAXPLAYERS - this.state.players.length} may join the game</p>
        )}

        <h4>Current players:</h4>
        <ul>
          {this.state.players.map(player => <li key={player}>{player}</li>)}
        </ul>
        {this.state.isFull ? (
          <Button variant="outline-dark" disabled={true}>
            Room full
          </Button>
        ) : (
          <Button
            variant="outline-dark"
            onClick={this.handleClick}
            disabled={disabled}
          >
            Join the Game
          </Button>
        )}
      </div>
    )
  }
}

export default Game
