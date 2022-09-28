# ga-workflows

This is a repository containing shared/common GitHub Actions workflows for the Phrasee Phoundry organisation.

> ❗ Important note: this repository is **public**, as is required by GitHub when working with reusable actions and workflows. Care should be taken when committing or reviewing code in this respository to ensure sensitive information is not leaked.

Reusable workflows are located in the `.github/workflows` directory. Example usage for each of the reusable workflows can be found in `examples`.

# Contents

## service-versioning.yml

This workflow is responsible for automatic service versioning. It is triggered on a commit to `develop`, either through a direct push to the branch, or through a merged PR. It increments a service version number, updates the service's `package.json` file and pushes a new commit, then updates the `Service version` field in the corresponding Jira ticket.

### Usage

This workflow uses git commit messages to determine how to update both the semantic version number, and the corresponding Jira ticket for a service.

### Usage: Jira

The workflow uses forks of the Atlassian [`gajira-login`](https://github.com/atlassian/gajira-login) and [`gajira-find-issue-key`](https://github.com/atlassian/gajira-find-issue-key) actions, as well as a custom [`ga-jira-update-issue`](https://github.com/PhraseePhoundry/ga-jira-update-issue) action.

The workflow looks for a Jira ticket ID in the git commits, in order to update the `Service version` field on a ticket. This Jira ticket ID should be in the format `<project code>-<ticket number>`. A (non-exhaustive) list of acceptable commit message formats is as follows:

```
AA-123 commit text
AA-123 - commit text
[AA-123] commit text
[AA-123] - commit text
commit text AA-123 more commit text
commit text [AA-123] more commit text
```

A Jira ticket ID is not a requirement for the workflow to complete successfully - if no ticket ID is found from the commit messages, the service version will be incremented gracefully with no corresponding Jira ticket update.

### Usage: Service version incrementing

If a commit uses the phrase "SET VERSION NUMBER {xx.xx.xx}", the semantic version will be updated in its entirety to match the version number specified.
```
git commit -m "[AB-123] - This is a commit to SET VERSION NUMBER {2.4.12}"
1.0.0 ==> 2.4.12
```

If a commit uses the words/phrases "MAJOR VERSION INCREMENT", "major", or "breaking change", the _major_ version will be incremented.
```
git commit -m "[AB-123] - This is a commit containing a breaking change"
2.4.12 ==> 3.4.12
```

If a commit uses the words/phrases "MINOR VERSION INCREMENT", "new feature", or "minor", the _minor_ version will be incremented.
```
git commit -m "[AB-123] - This is a commit containing a new feature"
3.4.12 ==> 3.5.12
```

If a commit contains none of the above keywords/phrases, the _patch_ version will be incremented.
```
git commit -m "[AB-123] - This is a normal commit message"
3.5.12 ==> 3.5.13
```