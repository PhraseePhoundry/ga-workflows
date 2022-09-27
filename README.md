# ga-workflows

This is a repository containing shared/common GitHub Actions workflows for the Phrasee Phoundry organisation.

> ❗ Important note: this repository is **public**, as is required by GitHub when working with reusable actions and workflows. Care should be taken when committing or reviewing code in this respository to ensure sensitive information is not leaked.

## Usage

Reusable workflows are located in the `.github/workflows` directory. Example usage for each of the reusable workflows can be found in `examples`.

## Contents

### service-versioning.yml

This workflow is responsible for automatic service versioning. It is triggered on a commit to `develop`, either through a direct push to the branch, or through a merged PR. It increments a service version number, updates the service's `package.json` file and pushes a new commit, then updates the `Service version` field in the corresponding Jira ticket.
