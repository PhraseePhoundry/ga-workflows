const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
});

function sleep(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

async function fetchAndConcatenateWorkflowRuns(event) {
    let queuedWorkflowsList;
    let inProgressWorkflowsList;
    try {
        queuedWorkflowsList = await octokit.rest.actions.listWorkflowRunsForRepo({
            owner: event.repository.owner.login,
            repo: event.repository.name,
            event: 'pull_request',
            status: 'queued',
        })

        inProgressWorkflowsList = await octokit.rest.actions.listWorkflowRunsForRepo({
            owner: event.repository.owner.login,
            repo: event.repository.name,
            event: 'pull_request',
            status: 'in_progress',
        })
    } catch (err) {
        console.error(`Error retrieving workflows information: ${String(err)}`)
        process.exit(1);
    }

    const allWorkflowRuns = (queuedWorkflowsList.data.workflow_runs).concat(inProgressWorkflowsList.data.workflow_runs)
    const filteredWorkflowRuns = allWorkflowRuns.filter((workflow) => workflow.name === 'Automatic service versioning, saving PR details, and Jira update')

    return filteredWorkflowRuns
}

async function main() {
    const event = process.env.GITHUB_EVENT_PATH ? require(process.env.GITHUB_EVENT_PATH) : {};

    let runningWorkflows = await fetchAndConcatenateWorkflowRuns(event);
    let sleepCounter = 0;

    while (runningWorkflows.length > 0) {
        console.log('****************')
        console.log(`runningWorkflows.length: ${runningWorkflows.length}`)

        console.log('Found workflow runs in progress - pausing...')
        await sleep(10)
        sleepCounter += 1

        if (sleepCounter > 30) {
            console.error('Maximum timeout reached - exiting')
            process.exit(1)
        }

        runningWorkflows = await fetchAndConcatenateWorkflowRuns(event)
    }

    return
}

main()