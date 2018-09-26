import gql = require('nanographql')

export const history = gql`
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
          issue { id, title, url }
          repository { nameWithOwner }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
      pullRequests(first: 100, after: $includePullRequestsEndCursor)
        @include(if: $includePullRequests) {
        nodes {
          additions
          body
          changedFiles
          comments { totalCount }
          commits { totalCount }
          createdAt
          deletions
          id
          mergedAt
          repository { id, nameWithOwner }
          state
          state
          title
          url
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
      }
    }
  }
`
