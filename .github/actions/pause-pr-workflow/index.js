const { Octokit } = require("@octokit/rest");
const { sleep, getRunningWorkflows } = require('../pause-workflow-utils')

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
});

async function getPauseWorkflowStep(event, workflowId) {
    let jobsForWorkflow;

    try {
        jobsForWorkflow = await octokit.rest.actions.listJobsForWorkflowRun({
            owner: event.repository.owner.login,
            repo: event.repository.name,
            run_id: workflowId
        })
    } catch (err) {
        console.error(`Error retrieving jobs information for workflow: ${String(err)}`)
        process.exit(1);
    }

    const serviceVersionJob = jobsForWorkflow.data.jobs.filter((job) => job.name.includes('Bump service version'))[0]

    if (serviceVersionJob.length === 0) {
        return {}
    }

    return serviceVersionJob.steps.filter((step) => step.name === 'Pause workflow')[0]

}

async function getCompletedPauseWorkflowSteps(event, runningWorkflows) {

    const getPauseWorkflowStepPromises = []

    runningWorkflows.forEach((workflow) => {
        getPauseWorkflowStepPromises.push(getPauseWorkflowStep(event, workflow.id))
    })
    
    const pauseWorkflowSteps = await Promise.all(getPauseWorkflowStepPromises)

    const completedPauseWorkflowSteps = pauseWorkflowSteps.filter((step) => step.status === 'completed')

    return completedPauseWorkflowSteps
}

async function main() {
    const event = process.env.GITHUB_EVENT_PATH ? require(process.env.GITHUB_EVENT_PATH) : {};

    const params = {
        owner: event.repository.owner.login,
        repo: event.repository.name
    }
    const workflowName = 'Automatic service version bump'
    
    // fetch all queued or in-progress workflow runs
    let runningWorkflows = await getRunningWorkflows(params, workflowName);

    // fetch all completed "Pause workflow" steps for queued/in-progress workflow runs
    let completedPauseWorkflowSteps = await getCompletedPauseWorkflowSteps(event, runningWorkflows)

    // pause while other workflow completes
    let sleepCounter = 0;
    while (completedPauseWorkflowSteps.length > 0) {
        console.log(`Found ${completedPauseWorkflowSteps.length} workflow run(s) in progress - pausing...`)
        await sleep(10)
        sleepCounter += 1

        if (sleepCounter > 30) {
            console.error('Maximum timeout reached - exiting')
            process.exit(1)
        }

        runningWorkflows = await getRunningWorkflows(params, workflowName);
        completedPauseWorkflowSteps = await getCompletedPauseWorkflowSteps(event, runningWorkflows)
    }

    return
}

main()