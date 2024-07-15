import { theme as jsonTreeTheme } from "./json-tree";
import Diary from "./Diary";
import JSONTree from "react-json-tree";
import logo from "./logo.svg";
import MagicDropzone from "react-magic-dropzone";
import React, { Component } from "react";
const STORAGE_PREFIX = "__filename__";

const keyFromFilename = (filename) => `${STORAGE_PREFIX}${filename}`;

class App extends Component {
  constructor(props) {
    super(props);
    const filenames =
      typeof window === "undefined"
        ? []
        : Object.keys(window.localStorage)
            .filter((item) => item.indexOf(STORAGE_PREFIX) === 0)
            .map((item) => item.replace(STORAGE_PREFIX, ""));
    if (new URL(window.location.href).searchParams.get("demo")) {
      this.loadDemo();
    }
    this.state = {
      filename: filenames.length === 1 ? filenames[0] : null,
      filenames,
    };
  }
  onDrop = (accepted, rejected, links) => {
    var reader = new FileReader();
    var file = accepted[0];
    reader.readAsText(file, "UTF-8");
    reader.onload = (evt) => {
      this.setDiary(file.name, evt.target.result);
    };
  };

  onFilenameSelect = (filename) => this.setState({ filename });

  loadDemo = async () => {
    const res = await window.fetch("/diary.json");
    const json = await res.json();
    this.setDiary("demo.json", JSON.stringify(json));
  };

  setDiary(name, content) {
    window.localStorage.setItem(keyFromFilename(name), content);
    if (!this.state.filename) this.onFilenameSelect(name);
  }

  render() {
    const { filename } = this.state;
    const diary = filename
      ? JSON.parse(window.localStorage.getItem(keyFromFilename(filename)))
      : null;
    let showJsonTree;
    if (process.env.NODE_ENV === "development") showJsonTree = true;
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">GitHub Diary</h1>
          <div className="logo_container">
            <div className="logo_bg" />
            <img {...logo} width={70} className="App-logo" alt="logo" />
          </div>
        </header>
        <MagicDropzone id="dropzone" accept=".json" onDrop={this.onDrop}>
          <span>
            <p>Click or drag diary.json file here!</p>
            <svg
              fill="white"
              height="30"
              width="30"
              viewBox="0 0 1024 1024"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M512 384L320 576h128v320h128V576h128L512 384zM832 320c-8.75 0-17.125 1.406-25.625 2.562C757.625 208.188 644.125 128 512 128c-132.156 0-245.562 80.188-294.406 194.562C209.156 321.406 200.781 320 192 320 85.938 320 0 406 0 512c0 106.062 85.938 192 192 192 20.531 0 39.875-4.25 58.375-10.438C284.469 731.375 331.312 756.75 384 764.5v-65.25c-49.844-10.375-91.594-42.812-112.625-87.75C249.531 629 222.219 640 192 640c-70.656 0-128-57.375-128-128 0-70.656 57.344-128 128-128 25.281 0 48.625 7.562 68.406 20.156C281.344 283.78099999999995 385.594 192 512 192c126.5 0 229.75 92.219 250.5 212.75 20-13 43.875-20.75 69.5-20.75 70.625 0 128 57.344 128 128 0 70.625-57.375 128-128 128-10.25 0-20-1.5-29.625-3.75C773.438 677.125 725.938 704 672 704c-11.062 0-21.625-1.625-32-4v64.938c10.438 1.688 21.062 3.062 32 3.062 61.188 0 116.5-24.688 157-64.438 1 0 1.875 0.438 3 0.438 106.062 0 192-85.938 192-192C1024 406 938.062 320 832 320z" />
            </svg>
          </span>
        </MagicDropzone>
        {diary && <Diary diary={diary} />}
        {!diary && (
          <div id="no_files">
            <p>No files uploaded yet!</p>
            <p className="small">
              Wondering how to use this? Check out{" "}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://www.npmjs.com/package/github-diary"
              >
                github-diary on npm.
              </a>
            </p>
            <button onClick={this.loadDemo} className="demo__load-button">
              Load Demo!
            </button>
          </div>
        )}
        {showJsonTree && diary && (
          <JSONTree theme={jsonTreeTheme} data={diary} />
        )}
      </div>
    );
  }
}

export default App;
