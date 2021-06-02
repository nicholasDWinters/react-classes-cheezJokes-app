import React from "react";
import axios from "axios";
import Joke from "./Joke";
import "./JokeList.css";


class JokeList extends React.Component {
  state = {
    jokes: []
  }

  /* get jokes if there are no jokes */


  async getJokes() {

    let j = [...this.state.jokes];
    let seenJokes = new Set();
    try {
      while (j.length < this.props.numJokesToGet) {
        let res = await axios.get("https://icanhazdadjoke.com", {
          headers: { Accept: "application/json" }
        });
        let { status, ...jokeObj } = res.data;

        if (!seenJokes.has(jokeObj.id)) {
          seenJokes.add(jokeObj.id);
          j.push({ ...jokeObj, votes: 0 });
        } else {
          console.error("duplicate found!");
        }
      }
      localStorage.setItem('jokes', JSON.stringify(j));
      return this.setState({ jokes: JSON.parse(localStorage.getItem('jokes')) })
      // return this.setState({ jokes: j });
    } catch (e) {
      console.log(e);
    }
  }

  async componentDidMount() {
    if (localStorage.jokes) return this.setState({ jokes: JSON.parse(localStorage.getItem('jokes')) })
    if (this.state.jokes.length === 0) this.getJokes();
  }

  async componentDidUpdate() {
    if (this.state.jokes.length === 0) return this.getJokes();
    localStorage.setItem('jokes', JSON.stringify(this.state.jokes));
  }


  /* empty joke list and then call getJokes */

  generateNewJokes = () => {
    localStorage.removeItem('jokes');
    this.setState({ jokes: [] });
  }

  /* change vote for this id by delta (+1 or -1) */

  vote = (id, delta) => {
    this.setState({ jokes: this.state.jokes.map(j => (j.id === id ? { ...j, votes: j.votes + delta } : j)) })
    localStorage.setItem('jokes', JSON.stringify(this.state.jokes));
  }

  /* render: either loading spinner or list of sorted jokes. */

  render() {
    if (this.state.jokes.length) {
      let sortedJokes = [...this.state.jokes].sort((a, b) => b.votes - a.votes);
      return (
        <div className="JokeList">
          <button className="JokeList-getmore" onClick={this.generateNewJokes}>
            Get New Jokes
        </button>

          {sortedJokes.map(j => (
            <Joke text={j.joke} key={j.id} id={j.id} votes={j.votes} vote={this.vote} />
          ))}
        </div>
      );
    } else {
      return <h1 className='loading'>Loading...</h1>;
    }

  }

}

export default JokeList;
