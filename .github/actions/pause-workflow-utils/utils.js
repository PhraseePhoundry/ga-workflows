export function sleep(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

export async function getRunningWorkflows({params, workflowName}) {
    let queuedWorkflowsList;
    let inProgressWorkflowsList;
    try {
        queuedWorkflowsList = await octokit.rest.actions.listWorkflowRunsForRepo({...params, status: 'queued'})
        inProgressWorkflowsList = await octokit.rest.actions.listWorkflowRunsForRepo({...params, status: 'in_progress'})
    } catch (err) {
        console.error(`Error retrieving workflows information: ${String(err)}`)
        process.exit(1);
    }

    const allWorkflowRuns = (queuedWorkflowsList.data.workflow_runs).concat(inProgressWorkflowsList.data.workflow_runs)
    const filteredWorkflowRuns = allWorkflowRuns.filter((workflow) => workflow.name === workflowName)

    return filteredWorkflowRuns
}