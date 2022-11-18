const core = require('@actions/core')

const issueIdRegEx = /([a-zA-Z0-9]+-[0-9]+)/g

async function main() {
    console.log('Finding Jira issue key')
    
    const commits = core.getInput('commits');
    const commitsStr = commits.map(commit => commit.message).join(" ").replace('\n', '');

    const issueKey = findIssueKey(commitsStr)
    core.setOutput('issue', issueKey)
}

const findIssueKey = (searchStr) => {
    const match = searchStr.match(issueIdRegEx)

    console.log(`Searching in string: \n ${searchStr}`)

    if (!match) {
      console.log('No issue keys found')

      return
    }

    return match[0]
  }


main()