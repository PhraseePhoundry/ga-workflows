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
            exclude_pull_requests: true,
            status: 'queued',
        })

        inProgressWorkflowsList = await octokit.rest.actions.listWorkflowRunsForRepo({
            owner: event.repository.owner.login,
            repo: event.repository.name,
            exclude_pull_requests: true,
            status: 'in_progress',
        })
    } catch (err) {
        console.error(`Error retrieving workflows information: ${String(err)}`)
        process.exit(1);
    }

    return (queuedWorkflowsList.data.workflow_runs).concat(inProgressWorkflowsList.data.workflow_runs)
}

async function getPauseWorkflowStep(event, workflowId) {
    let jobsList;

    try {
        jobsList = await octokit.rest.actions.listJobsForWorkflowRun({
            owner: event.repository.owner.login,
            repo: event.repository.name,
            run_id: workflowId
        })
    } catch (err) {
        console.error(`Error retrieving jobs information for workflow: ${String(err)}`)
        process.exit(1);
    }

    const serviceVersionJob = jobsList.data.jobs.filter((job) => job.name === 'Bump service version')

    if (serviceVersionJob.length === 0) {
        return {}
    }

    return serviceVersionJob.steps.filter((step) => step.name === 'Pause workflow')[0]

}

async function fetchWorkflowsAndCompletedPauseWorkflowSteps(event) {
    // fetch all queued or in-progress workflow runs
    let runningWorkflows = await fetchAndConcatenateWorkflowRuns(event);
    console.log('---- Workflows ----')
    console.log(runningWorkflows)

    const getPauseWorkflowStepPromises = []

    runningWorkflows.forEach((workflow) => {
        getPauseWorkflowStepPromises.push(getPauseWorkflowStep(event, workflow.id))
    })

    const pauseWorkflowSteps = Promise.all(getPauseWorkflowStepPromises)

    console.log('---- Steps ----')
    console.log(pauseWorkflowSteps)

    const completedPauseWorkflowSteps = pauseWorkflowSteps.filter((step) => step.status === 'completed')

    console.log('---- Completed steps ----')
    console.log(completedPauseWorkflowSteps)

    return completedPauseWorkflowSteps
}

async function main() {
    const event = process.env.GITHUB_EVENT_PATH ? require(process.env.GITHUB_EVENT_PATH) : {};

    let completedPauseWorkflowSteps = fetchWorkflowsAndCompletedPauseWorkflowSteps(event)
    let sleepCounter = 0;

    while (completedPauseWorkflowSteps.length > 0) {
        console.log(`Found ${completedPauseWorkflowSteps.length} workflow run(s) in progress - pausing...`)
        await sleep(10)
        sleepCounter += 1

        if (sleepCounter > 30) {
            console.error('Maximum timeout reached - exiting')
            process.exit(1)
        }

        completedPauseWorkflowSteps = await fetchWorkflowsAndCompletedPauseWorkflowSteps(event)
    }

    return
}

main()