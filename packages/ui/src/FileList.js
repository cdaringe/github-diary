import React, { Component } from "react";

class FileList extends Component {
  render() {
    const { filenames, onFilenameSelect } = this.props;
    return (
      <div>
        Files:
        <ul>
          {filenames.map((filename) => (
            <li key={filename} onClick={() => onFilenameSelect(filename)}>
              {filename}
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default FileList;
