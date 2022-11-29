const { sleep, getRunningWorkflows } = require('../pause-workflow-utils/utils');

async function main() {
    const event = process.env.GITHUB_EVENT_PATH ? require(process.env.GITHUB_EVENT_PATH) : {};

    const params = {
        owner: event.repository.owner.login,
        repo: event.repository.name,
        eventType: 'pull_request'
    }
    const workflowName = 'Automatic service versioning, saving PR details, and Jira update'
    
    // fetch all queued or in-progress workflow runs
    let runningWorkflows = await getRunningWorkflows(params, workflowName);
    let sleepCounter = 0;

    // pause while other workflow completes
    while (runningWorkflows.length > 0) {
        console.log(`Found ${runningWorkflows.length} workflow run(s) in progress - pausing...`)
        await sleep(10)
        sleepCounter += 1

        if (sleepCounter > 30) {
            console.error('Maximum timeout reached - exiting')
            process.exit(1)
        }

        runningWorkflows = await getRunningWorkflows(params);
    }

    return
}

main()