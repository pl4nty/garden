---
dg-publish: true
---
## API
The [GitHub API feeds endpoint](https://docs.github.com/en/rest/activity/feeds?apiVersion=2022-11-28) no longer returns private feeds like `current_user_url`, and they're not available in the GitHub homepage either. Possibly because the homepage now uses an internal server-side-rendered API.

## Codespaces
Underlying VMs are missing the `ip6tables` kernel module for docker/kind, so we have to disable in the daemon.

```sh
echo '{"ip6tables": false}' > /etc/docker/daemon.json
ps aux | grep dockerd
root        4585  0.5  1.1 2204448 94952 ?       Sl   14:54   0:26 dockerd --dns 168.63.129.16
codespa+   40662  0.0  0.0   8172  2432 pts/0    R+   16:16   0:00 grep --color=auto dockerd

sudo kill -SIGINT 4585
sudo dockerd --dns 168.63.129.16 &
```

## Actions
New workflows in a feature branch won't trigger for testing because they don't exist on `main`. A stub workflow file on `main` fixes this, particularly for manual triggering with `workflow_dispatch` on the feature branch.
```yaml
name: Feature
on:
  workflow_dispatch:
```

## Automatic remediation
GitHub's network effect as the de-facto code forge has some interesting impacts on research and remediation at scale.
Example: [Boost changed their CDN](https://github.com/boostorg/boost/issues/996) and broke one of my pipelines. It was a simple find/replace, so Copilot helped me write a script to automate remediation not just on my repos, but any other open source repo.
CodeQL and Dependabot/Renovate were already pretty powerful, but I have a feeling [GitHub Copilot Autofix](https://github.blog/news-insights/product-news/secure-code-more-than-three-times-faster-with-copilot-autofix/) could have a significant impact on legacy codebases. Particularly if it extends beyond security - looks like it only does CodeQL and ESLint at the moment.

I wonder if anyone's written an app for managing many similar PRs? Surely this'd be common for internal security teams. Particularly filtering by attributes like owner, language, or activity.

```python
import requests
from datetime import datetime
import time
import base64

# GitHub API configuration
GITHUB_TOKEN = ""
HEADERS = {
    "Authorization": f"Bearer {GITHUB_TOKEN}",
    "Accept": "application/vnd.github.v3+json"
}
BASE_URL = "https://api.github.com"
GITHUB_USER = "pl4nty"

# Search parameters
OLD_URL = "boostorg.jfrog.io/artifactory/main/release"
NEW_URL = "archives.boost.io/release"
BRANCH_NAME = "update-boost-url"
COMMIT_MESSAGE = f"""chore: update Boost artifact URL to archives.boost.io

Signed-off-by: Tom Plant <tom@tplant.com.au>"""
PR_TITLE = "Update Boost artifact URL to archives.boost.io"
PR_BODY = f"""This pull request updates Boost artifact URL(s) from `{OLD_URL}` to `{NEW_URL}`.

Boost have changed to a new download provider, and the old JFrog URLs are no longer available: https://github.com/boostorg/boost/issues/996"""

def search_code():
    """Search for repositories containing the old URL."""
    query = f'"{OLD_URL}"'
    url = f"{BASE_URL}/search/code"
    params = {
        "q": query,
        "per_page": 100
    }

    try:
        response = requests.get(url, headers=HEADERS, params=params)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error searching code: {e}")
        return None

def get_repo_info(repo_full_name):
    """Get repository information including star count."""
    url = f"{BASE_URL}/repos/{repo_full_name}"

    try:
        response = requests.get(url, headers=HEADERS)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error getting repo info: {e}")
        return None

def fork_repository(repo_full_name):
    """Create a fork of the repository."""
    url = f"{BASE_URL}/repos/{repo_full_name}/forks"

    try:
        response = requests.post(url, headers=HEADERS)
        response.raise_for_status()
        print(f"Forked repository: {repo_full_name}")
        # Wait for fork to be ready
        time.sleep(5)
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error forking repository: {e}")
        return None

def create_branch(repo_full_name, default_branch):
    """Create a new branch in the repository."""
    try:
        # Get the SHA of the default branch
        url = f"{BASE_URL}/repos/{repo_full_name}/git/refs/heads/{default_branch}"
        response = requests.get(url, headers=HEADERS)
        response.raise_for_status()
        sha = response.json()["object"]["sha"]

        # Create new branch
        url = f"{BASE_URL}/repos/{repo_full_name}/git/refs"
        data = {
            "ref": f"refs/heads/{BRANCH_NAME}",
            "sha": sha
        }
        response = requests.post(url, headers=HEADERS, json=data)
        response.raise_for_status()
        return True
    except requests.exceptions.RequestException as e:
        print(f"Error creating branch: {e}")
        return False

def get_file_content(content_url):
    """Get the content of a file."""
    try:
        response = requests.get(content_url, headers=HEADERS)
        response.raise_for_status()
        current_content = response.json()

        # Get the raw content
        file_content = requests.get(current_content["download_url"]).text
        return file_content, current_content["sha"]
    except requests.exceptions.RequestException as e:
        print(f"Error getting file content: {e}")
        return None, None

def create_tree(repo_full_name, base_tree, files):
    """Create a new tree with multiple file changes."""
    url = f"{BASE_URL}/repos/{repo_full_name}/git/trees"

    tree = [{
        "path": file_path,
        "mode": "100644",
        "type": "blob",
        "content": content.replace(OLD_URL, NEW_URL)
    } for file_path, content in files.items()]

    data = {
        "base_tree": base_tree,
        "tree": tree
    }

    try:
        response = requests.post(url, headers=HEADERS, json=data)
        response.raise_for_status()
        return response.json()["sha"]
    except requests.exceptions.RequestException as e:
        print(f"Error creating tree: {e}")
        return None

def create_commit(repo_full_name, tree_sha, parent_sha):
    """Create a commit with the new tree."""
    url = f"{BASE_URL}/repos/{repo_full_name}/git/commits"
    data = {
        "message": COMMIT_MESSAGE,
        "tree": tree_sha,
        "parents": [parent_sha]
    }

    try:
        response = requests.post(url, headers=HEADERS, json=data)
        response.raise_for_status()
        return response.json()["sha"]
    except requests.exceptions.RequestException as e:
        print(f"Error creating commit: {e}")
        return None

def update_ref(repo_full_name, commit_sha):
    """Update the branch reference to point to the new commit."""
    url = f"{BASE_URL}/repos/{repo_full_name}/git/refs/heads/{BRANCH_NAME}"
    data = {
        "sha": commit_sha
    }

    try:
        response = requests.patch(url, headers=HEADERS, json=data)
        response.raise_for_status()
        return True
    except requests.exceptions.RequestException as e:
        print(f"Error updating reference: {e}")
        return False

def create_pull_request(source_repo, target_repo, default_branch):
    """Create a pull request with the changes."""
    url = f"{BASE_URL}/repos/{target_repo}/pulls"
    data = {
        "title": PR_TITLE,
        "body": PR_BODY,
        "head": f"{GITHUB_USER}:{BRANCH_NAME}",
        "base": default_branch
    }

    try:
        response = requests.post(url, headers=HEADERS, json=data)
        response.raise_for_status()
        return response.json()["html_url"]
    except requests.exceptions.RequestException as e:
        print(f"Error creating pull request: {e}")
        return None

def main():
    # Search for repositories containing the old URL
    search_results = search_code()
    if not search_results:
        print("No repositories found containing the target URL")
        return

    # Group files by repository
    repos = {}
    for item in search_results.get("items", []):
        repo_full_name = item["repository"]["full_name"]
        if repo_full_name not in repos:
            repos[repo_full_name] = {
                "files": {},
                "repo_info": item["repository"]
            }

        repos[repo_full_name]["files"][item["path"]] = item["url"]

    # Process each repository
    for original_repo, repo_data in repos.items():
        # Get repository information
        repo_info = get_repo_info(original_repo)
        if not repo_info or repo_info['stargazers_count'] < 1000:
            continue

        print(f"\nProcessing repository: {original_repo}")
        print(f"Stars: {repo_info['stargazers_count']}")
        print(f"Last push: {repo_info['pushed_at']}")

        # Get file content
        for path, url in repos[repo_full_name]["files"].items():
            content, sha = get_file_content(url)
            if content:
                repos[repo_full_name]["files"][path] = url

        print(f"Files to update: {list(repo_data['files'].keys())}")

        # Fork the repository
        fork_info = fork_repository(original_repo)
        if not fork_info:
            continue

        forked_repo = f"{GITHUB_USER}/{repo_info['name']}"

        # Create new branch in forked repo
        if not create_branch(forked_repo, repo_info["default_branch"]):
            continue

        # Get the base tree
        base_tree_url = f"{BASE_URL}/repos/{forked_repo}/git/trees/{repo_info['default_branch']}"
        try:
            response = requests.get(base_tree_url, headers=HEADERS)
            response.raise_for_status()
            base_tree = response.json()["sha"]
        except requests.exceptions.RequestException as e:
            print(f"Error getting base tree: {e}")
            continue

        # Create new tree with all file changes
        new_tree_sha = create_tree(forked_repo, base_tree, repo_data["files"])
        if not new_tree_sha:
            continue

        # Create commit
        commit_sha = create_commit(forked_repo, new_tree_sha, base_tree)
        if not commit_sha:
            continue

        # Update branch reference
        if not update_ref(forked_repo, commit_sha):
            continue

        # Create pull request from fork to original repo
        pr_url = create_pull_request(forked_repo, original_repo, repo_info["default_branch"])
        if pr_url:
            print(f"Created pull request: {pr_url}")

        # Wait to avoid hitting rate limits
        time.sleep(0.5)

if __name__ == "__main__":
    main()

```