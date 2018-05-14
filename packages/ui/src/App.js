import React, { Component } from 'react'
import logo from './logo.svg'
import './App.css'
import MagicDropzone from 'react-magic-dropzone'
import FileList from './FileList'
import JSONTree from 'react-json-tree'
import Diary from './Diary'

const STORAGE_PREFIX = '__filename__'

const theme = {
  scheme: 'monokai',
  base00: '#272822',
  base01: '#383830',
  base02: '#49483e',
  base03: '#75715e',
  base04: '#a59f85',
  base05: '#f8f8f2',
  base06: '#f5f4f1',
  base07: '#f9f8f5',
  base08: '#f92672',
  base09: '#fd971f',
  base0A: '#f4bf75',
  base0B: '#a6e22e',
  base0C: '#a1efe4',
  base0D: '#66d9ef',
  base0E: '#ae81ff',
  base0F: '#cc6633'
}

class App extends Component {
  constructor (props) {
    super(props)
    const filenames = Object.keys(window.localStorage)
      .filter(item => item.indexOf(STORAGE_PREFIX) === 0)
      .map(item => item.replace(STORAGE_PREFIX, ''))
    this.state = {
      filename: filenames.length === 1 ? filenames[0] : null,
      filenames
    }
  }
  onDrop = (accepted, rejected, links) => {
    var reader = new FileReader()
    var file = accepted[0]
    reader.readAsText(file, 'UTF-8')
    reader.onload = evt => {
      window.localStorage.setItem(
        `${STORAGE_PREFIX}${file.name}`,
        evt.target.result
      )
      if (!this.state.filename) this.onFilenameSelect(file.name)
    }
  }

  onFilenameSelect = filename => this.setState({ filename })

  render () {
    const { filename, filenames } = this.state
    const diary = filename
      ? JSON.parse(window.localStorage.getItem(`${STORAGE_PREFIX}${filename}`))
      : null
    let showJsonTree
    if (process.env.NODE_ENV === 'development') showJsonTree = true
    console.log(filename, diary)
    return (
      <div className='App'>
        <header className='App-header'>
          <h1 className='App-title'>GitHub Diary</h1>
          <div className='logo_container'>
            <div className='logo_bg' />
            <img src={logo} className='App-logo' alt='logo' />
          </div>
        </header>
        <MagicDropzone id='dropzone' accept='.json' onDrop={this.onDrop}>
          <div>Click or drag diary.json file here!</div>
        </MagicDropzone>
        {diary && <Diary diary={diary} />}
        <FileList {...{ filenames, onFilenameSelect: this.onFilenameSelect }} />
        {showJsonTree && diary ? <JSONTree theme={theme} data={diary} /> : null}
      </div>
    )
  }
}

export default App
