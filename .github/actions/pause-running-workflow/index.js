const github = require('@actions/github')
const core = require('@actions/core')

async function main() {

    const event = process.env.GITHUB_EVENT_PATH ? require(process.env.GITHUB_EVENT_PATH) : {};

    const octokit = new github.GitHub(process.env.GITHUB_TOKEN)

    try {
        const runningWorkflowsList = await octokit.actions.listRepoWorkflowRuns({
            owner: event.repository.owner.login,
            repo: event.repository.name,
            event: 'pull_request',
        })
        const runningWorkflows = runningWorkflowsList.data

        console.log('-------------------------------')
        console.log(runningWorkflows)

    } catch (err) {
        console.error(`Error retrieving workflows information: ${String(err)}`)
        process.exit(1);
    }

    return
}

main()