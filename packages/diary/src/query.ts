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
      issueComments(first: 50, after: $includeCommentsEndCursor)
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
      pullRequests(first: 50, after: $includePullRequestsEndCursor)
        @include(if: $includePullRequests) {
        nodes {
          additions
          body
          changedFiles
          comments {
            totalCount
          }
          commits {
            totalCount
          }
          createdAt
          deletions
          id
          mergedAt
          repository {
            id,
            nameWithOwner
          }
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
`

export const contributedTo = `
query(
  $login: String!
) {
  user(login: $login) {
    repositoriesContributedTo(
      orderBy: { field: NAME, direction: ASC}
      includeUserRepositories: true,
      first: 50
    ) {
      nodes {
        id
        nameWithOwner
        defaultBranchRef {
          id
          name
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
