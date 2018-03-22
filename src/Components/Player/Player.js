import { h, Component } from "preact"
import { connect } from "react-redux"
import styled from "styled-components"
import Item from "../Utils/Item"
import { Icon } from "../Utils/Icon"
import Slider from "../Slider/Slider"

import { play_next, play_prev, on_play, on_pause } from "@/store/actions"

import play from "./play.svg"
import back from "./back.svg"
import next from "./next.svg"
import pause from "./pause.svg"

const Wrapper = styled.div`
  background: ${props => (props.online ? "#fff" : "#ef5350")};
  padding-top: 6px;
  position: fixed;
  bottom: 0px;
  left: 0px;
  width: 100%;
  height: 40px;
  display: flex;
  transform: ${props =>
    props.visible ? "translateX(0)" : "translateX(-100%)"};
  transition: transform 500ms ease;

  @media screen and (min-width: 500px) {
    margin-left: 220px;
    width: calc(100% - 220px);
  }
`

const Controls = styled.div`
  display: flex;
  justify-content: center;
`

const Song = styled.div`
  flex: 1;
  > p {
    color: #444;
    overflow: hidden;
    display: block;
    text-decoration: none;
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.7rem;

    &:first-child {
      font-size: 0.8rem;
    }
  }
`

class Player extends Component {
  state = {
    duration: 0,
    currentTime: 0
  }

  componentDidMount() {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = "paused"
      navigator.mediaSession.setActionHandler(
        "previoustrack",
        this.props.playPrev
      )
      navigator.mediaSession.setActionHandler("play", this.togglePlay)
      navigator.mediaSession.setActionHandler("pause", this.togglePlay)
      navigator.mediaSession.setActionHandler("nexttrack", this.props.playNext)
    }
  }
  componentWillReceiveProps(nextProps) {
    if ("mediaSession" in navigator) {
      /* eslint-disable */
      navigator.mediaSession.metadata = new MediaMetadata({
        title: nextProps.currentSong.title,
        artist: nextProps.currentSong.user,
        artwork: [
          {
            src: nextProps.currentSong.artwork.replace("large", "t500x500"),
            sizes: "500x500",
            type: "image/jpg"
          }
        ]
      })
      /* eslint-enable */
    }
  }

  onLoadedMetadata = () => {
    this.setState({
      duration: this.audioElement.duration
    })
    this.audioElement.play()
    document.title = this.props.currentSong.title
  }

  onTimeUpdate = () => {
    this.setState({
      currentTime: this.audioElement.currentTime
    })
  }

  changeCurrentTime = currentTime => {
    this.audioElement.currentTime = currentTime
  }

  togglePlay = () => {
    if (this.audioElement.paused) {
      this.audioElement.play()
    } else {
      this.audioElement.pause()
    }
  }

  render({
    currentSong,
    isPlaying,
    audioUrl,
    playNext,
    playPrev,
    onPause,
    onPlay,
    online
  }) {
    return (
      <Wrapper visible={currentSong !== null} online={online}>
        <Slider onChange={this.changeCurrentTime} {...this.state} />

        <Controls>
          <Item link noMobile onClick={playPrev}>
            <Icon src={back} size={25} />
          </Item>
          <Item link onClick={this.togglePlay}>
            <Icon src={isPlaying ? pause : play} size={25} />
          </Item>
          <Item link noMobile onClick={playNext}>
            <Icon src={next} size={25} />
          </Item>
        </Controls>

        {currentSong && (
          <Song>
            <p>{currentSong.title}</p>
            <p>{currentSong.user}</p>
          </Song>
        )}

        <audio
          crossOrigin="anonymous"
          src={audioUrl}
          onEnded={playNext}
          onLoadedMetadata={this.onLoadedMetadata}
          onPause={onPause}
          onPlay={onPlay}
          onTimeUpdate={this.onTimeUpdate}
          ref={element => (this.audioElement = element)}
        />
      </Wrapper>
    )
  }
}

const state = ({ playlist, root }) => ({
  currentSong: playlist.currentSong,
  audioUrl: playlist.audioUrl,
  isPlaying: playlist.isPlaying,
  online: root.online
})

const actions = {
  playNext: play_next,
  playPrev: play_prev,
  onPause: on_pause,
  onPlay: on_play
}

export default connect(state, actions)(Player)