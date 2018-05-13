var gql = require('nanographql')

var history = gql`
  query(
    $login: String!
    $includeComments: Boolean!
    $includeCommentsEndCursor: String
    $includePullRequests: Boolean!
    $includePullRequestsEndCursor: String
  ) {
    user(login: $login) {
      issueComments(first: 100, after: $includeCommentsEndCursor)
        @include(if: $includeComments) {
        nodes {
          id
          body
          createdAt
          issue {
            id
            title
            url
          }
          repository {
            nameWithOwner
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
      pullRequests(first: 100, after: $includePullRequestsEndCursor)
        @include(if: $includePullRequests) {
        nodes {
          id
          title
          body
          state
          createdAt
          mergedAt
          url
          repository {
            id
            nameWithOwner
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`

module.exports = {
  history
}
