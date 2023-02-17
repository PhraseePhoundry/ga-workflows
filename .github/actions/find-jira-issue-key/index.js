const core = require('@actions/core')

const issueIdRegEx = /\b[a-zA-Z]{2}-\d+\b/g

async function main() {
    console.log('Finding Jira issue key')
    
    const commits = JSON.parse(core.getInput('commits'));
    const commitsStr = commits.join(" ").replace('\n', '');

    const issueKeys = findIssueKey(commitsStr)

    let uniqueKeys
    if(issueKeys) {
        uniqueKeys = Array.from(new Set(issueKeys))
        console.log(`Detected issue key(s): ${uniqueKeys}`)
    }
    core.setOutput('issue', JSON.stringify(uniqueKeys))
}

const findIssueKey = (searchStr) => {
    const matches = searchStr.match(issueIdRegEx)

    console.log(`Searching in string: \n ${searchStr}`)

    if (!matches) {
      console.log('No issue keys found')

      return
    }

    return matches.map((match) => match.trim())
  }


main()