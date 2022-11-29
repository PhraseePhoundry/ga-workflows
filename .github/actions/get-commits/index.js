const github = require('@actions/github')
const core = require('@actions/core')

async function main() {

    const event = process.env.GITHUB_EVENT_PATH ? require(process.env.GITHUB_EVENT_PATH) : {};
    let messages

    if (event.pull_request) {
        console.log('---- pull request ----')
        console.log(event.pull_request)
        const octokit = new github.GitHub(process.env.GITHUB_TOKEN)

        try {
            const commitsListed = await octokit.pulls.listCommits({
                owner: event.repository.owner.login,
                repo: event.repository.name,
                pull_number: event.pull_request.number,
            })
            const commits = commitsListed.data
            messages = commits ? commits.map((commit) => commit.commit.message) : [];

        } catch (err) {
            console.error(`Error retrieving commit information: ${String(err)}`)
            process.exit(1);
        }

    } else {
        messages = event.commits ? event.commits.map((commit) => commit.message + '\n' + commit.body) : [];
    }

    if (messages.length === 0) {
        console.error('No commit messages found')
        process.exit(1);
    }

    core.setOutput('commits', JSON.stringify(messages))
    return
}

main()