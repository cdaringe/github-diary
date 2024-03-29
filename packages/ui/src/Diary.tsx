import { toImg } from "./util/dom-to-img";
import FlareViewer from "./FlareViewer";
import groupBy from "lodash/groupBy";
import React from "react";

const values = Object["values"];
export type Stat = {
  text: string;
  value: any;
};

export type CanvasNode = HTMLCanvasElement;
export type ButtonNode = HTMLButtonElement;

function toTable(stats: Stat[]) {
  return (
    <table>
      <tbody>
        {stats.map((stat, i) => (
          <tr key={i}>
            <td>{stat.text}</td>
            <td>{stat.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export type DiaryProps = {
  diary: any;
};
export type DiaryState = {
  isFlareFullscreen: boolean;
};

export default class Diary extends React.PureComponent<DiaryProps, DiaryState> {
  public __diary_node: CanvasNode | undefined;
  public __button_ref: ButtonNode | undefined;

  buttonRef = (ref: ButtonNode) => (this.__button_ref = ref);
  diaryRef = (ref: CanvasNode) => (this.__diary_node = ref);
  toImg = () => {
    if (!this.__button_ref || !this.__diary_node) return;
    toImg(this.__button_ref, this.__diary_node, "diary.png");
  };

  render() {
    var {
      diary: {
        login,
        issueComments: issueCommentsById,
        pullRequests: pullRequestsById,
      },
    } = this.props;
    var issueComments = values(issueCommentsById);
    var pullRequests = values(pullRequestsById);
    var numComments = issueComments.length;
    var numPrs = pullRequests.length;
    var numInteractions = numComments + numPrs;
    var prsByRepo = groupBy(pullRequests, "repository.nameWithOwner");
    var commentsByRepo = groupBy(issueComments, "repository.nameWithOwner");
    var numUniqueRepoPrAgainst = Object.keys(prsByRepo).length;
    var numUniqueRepoCommentAgainst = Object.keys(commentsByRepo).length;
    var numUniqueRepos = Object.keys(
      Object.assign({}, prsByRepo, commentsByRepo)
    ).length;
    var mostCommentedOn = values(commentsByRepo)
      .sort((a: any[], b: any[]) => {
        if (a.length < b.length) return 1;
        if (a.length === b.length) return 0;
        return -1;
      })
      .slice(0, 10)
      .map((set: any) => ({
        text: set[0].repository.nameWithOwner,
        value: set.length,
      }));
    var mostPrOn = values(prsByRepo)
      .sort((a: any[], b: any[]) => {
        if (a.length < b.length) return 1;
        if (a.length === b.length) return 0;
        return -1;
      })
      .slice(0, 10)
      .map((set: any) => ({
        text: set[0].repository.nameWithOwner,
        value: set.length,
      }));
    var statGroup1 = [
      { text: "Number of comments", value: numComments },
      { text: "Number of pull requests", value: numPrs },
      { text: "Total number of interactions", value: numInteractions },
    ];
    var statGroupUnique = [
      { text: "Pull requested against:", value: numUniqueRepoPrAgainst },
      { text: "Commented against:", value: numUniqueRepoCommentAgainst },
      { text: "Interacted with:", value: numUniqueRepos },
    ];
    return (
      <div
        id="diary_container"
        ref={this.diaryRef as any}
        className="diary markdown-body"
      >
        <button
          ref={this.buttonRef}
          onClick={this.toImg}
          style={{ float: "right", margin: 10 }}
        >
          download
        </button>
        <h1>
          GitHub.com Diary -{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`https://github.com/${login}`}
          >
            {login}
          </a>
        </h1>
        <h2>Overall</h2>
        {toTable(statGroup1)}
        <FlareViewer diary={this.props.diary} />
        <h2>Unique Contributions</h2>
        Number of unique repositories...
        {toTable(statGroupUnique)}
        <h2>Discussed most</h2>
        {toTable(mostCommentedOn)}
        <h2>Pull Requested most</h2>
        {toTable(mostPrOn)}
      </div>
    );
  }
}
