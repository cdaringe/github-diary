import { Flare } from "./Flare";
import { githubToFlare } from "./util/github-to-flare";
import * as React from "react";
import cx from "classnames";
import { Fullscreen } from "./icons";

export type FlareViewerProps = {
  diary: any;
};
export type FlareViewerState = {
  view: "prs" | "issues";
  isFlareFullscreen: boolean;
};

export default class FlareViewer extends React.Component<
  FlareViewerProps,
  FlareViewerState
> {
  constructor(props: FlareViewerProps) {
    super(props);
    this.state = {
      view: "prs",
      isFlareFullscreen: false,
    };
  }

  render() {
    const {
      login,
      issueComments: issueCommentsById,
      pullRequests: pullRequestsById,
    } = this.props.diary;
    const { isFlareFullscreen, view } = this.state;
    let flareData;
    switch (this.state.view) {
      case "prs":
        flareData = githubToFlare(login, pullRequestsById, (pr: any) => {
          const [org, repo] = pr.repository.nameWithOwner.split("/");
          return [org, repo, pr.title];
        });
        break;
      case "issues":
        flareData = githubToFlare(login, issueCommentsById, (issue: any) => {
          const [org, repo] = issue.repository.nameWithOwner.split("/");
          return [org, repo, issue.issue.title];
        });
        break;
      default:
        throw new Error("unsupported flare view");
    }
    return (
      <React.Fragment>
        <nav role="navigation" className="transformer-tabs">
          <ul>
            <li>
              <a
                href="#prs"
                onClick={() => this.setState({ view: "prs" })}
                className={cx({ active: this.state.view === "prs" })}
              >
                Pull Requests
              </a>
            </li>
            <li>
              <a
                href="#issues"
                onClick={() => this.setState({ view: "issues" })}
                className={cx({ active: this.state.view === "issues" })}
              >
                Issue Comments
              </a>
            </li>
          </ul>
          {
            <Fullscreen
              className="flare-viewer__fullscreen-icon"
              title="fullscreen"
              onClick={() => this.setState({ isFlareFullscreen: true })}
            />
          }
        </nav>
        {this.state.isFlareFullscreen && (
          <button
            className="flare__close-button"
            onClick={() => this.setState({ isFlareFullscreen: false })}
          >
            Close
          </button>
        )}
        <Flare
          key={`${view}-${isFlareFullscreen}`}
          className={isFlareFullscreen ? "flare--fullscreen" : ""}
          data={flareData}
        />
      </React.Fragment>
    );
  }
}
