/* Infinity by GroupChatOn — git-cheatsheet. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Git command helper: describe what you want to do ("undo last commit", "new branch") and get the right command, with your own branch names filled in and danger warnings. */
GCOTools.register('git-cheatsheet', function (spot, T) {
  var h = T.h;
  // [task, command, explanation, danger?]   {b} = branch, {r} = remote, {f} = file, {m} = message, {u} = url
  var G = [
    ['Start tracking a new project', 'git init', 'Creates a git repository in the current folder.'],
    ['Copy (clone) a project', 'git clone {u}', 'Downloads a repository and its whole history.'],
    ['Set my name and email', 'git config --global user.name "Your Name"\ngit config --global user.email "you@example.com"', 'Labels your commits. Do this once per computer.'],
    ['See what changed', 'git status', 'Lists changed, new and staged files.'],
    ['See the exact line changes', 'git diff', 'Shows unstaged changes line by line. Add --staged for staged ones.'],
    ['Stage a file for the next commit', 'git add {f}', 'Marks the file to be saved in the next commit. Use git add . for everything.'],
    ['Save (commit) my changes', 'git commit -m "{m}"', 'Records staged changes with a message.'],
    ['Stage and commit all tracked files', 'git commit -am "{m}"', 'Stages changes to already-tracked files and commits them (new files still need git add).'],
    ['Send my commits to GitHub', 'git push {r} {b}', 'Uploads your commits to the remote branch.'],
    ['Get the latest changes', 'git pull {r} {b}', 'Downloads and merges new commits from the remote.'],
    ['Get changes without merging', 'git fetch {r}', 'Downloads new commits but does not change your files.'],
    ['Make a new branch and switch to it', 'git switch -c {b}', 'Creates the branch from where you are and moves onto it.'],
    ['Switch to another branch', 'git switch {b}', 'Moves to an existing branch. Commit or stash your changes first.'],
    ['List branches', 'git branch -a', 'Shows local and remote branches; * marks the current one.'],
    ['Merge a branch into the current one', 'git merge {b}', 'Brings the commits of {b} into your current branch.'],
    ['Delete a merged branch', 'git branch -d {b}', 'Removes the local branch (refuses if it is not merged).'],
    ['Rename the current branch', 'git branch -m {b}', 'Renames the branch you are on.'],
    ['Undo changes to a file (not yet staged)', 'git restore {f}', 'Throws away your edits to the file and goes back to the last commit.', 'Your unsaved edits to that file are lost.'],
    ['Unstage a file', 'git restore --staged {f}', 'Takes the file out of the next commit but keeps your edits.'],
    ['Change the last commit message', 'git commit --amend -m "{m}"', 'Rewrites the last commit. Only before you push it.', 'Do not amend commits you already pushed.'],
    ['Add a forgotten file to the last commit', 'git add {f}\ngit commit --amend --no-edit', 'Adds the file to the last commit without changing the message.'],
    ['Undo the last commit but keep the changes', 'git reset --soft HEAD~1', 'Removes the commit; its changes stay staged so you can commit again.'],
    ['Undo the last commit and throw the changes away', 'git reset --hard HEAD~1', 'Deletes the last commit and its changes.', 'Changes are lost. Never on commits others already have.'],
    ['Undo a pushed commit safely', 'git revert <commit-id>', 'Makes a new commit that reverses an old one. Safe for shared branches.'],
    ['Put my changes aside for later', 'git stash', 'Saves your uncommitted changes and cleans the working folder.'],
    ['Bring stashed changes back', 'git stash pop', 'Re-applies the most recent stash and removes it from the stash list.'],
    ['See the history', 'git log --oneline --graph --all', 'A compact history of all branches.'],
    ['See who changed each line', 'git blame {f}', 'Shows the commit and author of every line.'],
    ['Find which commit added some text', 'git log -S "text" --oneline', 'Lists commits where that text was added or removed.'],
    ['See remote addresses', 'git remote -v', 'Lists the remotes and their URLs.'],
    ['Connect my project to GitHub', 'git remote add origin {u}\ngit push -u origin {b}', 'Links the local project to an empty GitHub repo and pushes the first time.'],
    ['Change the remote address', 'git remote set-url origin {u}', 'Points origin to a new URL.'],
    ['Tag a release', 'git tag -a v1.0 -m "{m}"\ngit push {r} v1.0', 'Marks this commit as a version.'],
    ['Bring my branch up to date with main (rebase)', 'git fetch {r}\ngit rebase {r}/main', 'Replays your commits on top of the latest main for a straight history.', 'Do not rebase branches others are working on.'],
    ['Copy one commit to this branch', 'git cherry-pick <commit-id>', 'Applies a single commit from elsewhere.'],
    ['Fix a merge conflict', 'git status\n# edit the files, remove <<<<<<< ======= >>>>>>> markers\ngit add {f}\ngit commit', 'Shows which files conflict; after fixing them, add and commit.'],
    ['Stop a merge that went wrong', 'git merge --abort', 'Returns to how things were before the merge started.'],
    ['Ignore files (like node_modules)', 'echo "node_modules/" >> .gitignore', 'Lists files and folders git should not track.'],
    ['Stop tracking a file but keep it', 'git rm --cached {f}', 'Removes the file from git but leaves it on disk. Add it to .gitignore too.'],
    ['Delete untracked files', 'git clean -n\ngit clean -f', 'The first shows what would go; the second deletes untracked files.', 'Deleted files cannot be recovered from git.'],
    ['Force push my branch', 'git push --force-with-lease {r} {b}', 'Overwrites the remote branch, but refuses if someone else pushed meanwhile.', 'Overwrites remote history. Avoid on shared branches.'],
    ['Find a lost commit', 'git reflog', 'Lists everywhere HEAD has been, so you can recover “lost” commits after a reset.'],
    ['Compare two branches', 'git diff main..{b}', 'Shows what {b} changes compared with main.'],
    ['Create a branch from an old commit', 'git switch -c {b} <commit-id>', 'Starts a new branch at an older commit.'],
    ['Update submodules', 'git submodule update --init --recursive', 'Downloads nested repositories.']
  ];
  function fill(s, v) { return s.replace(/\{b\}/g, v.b || 'main').replace(/\{r\}/g, v.r || 'origin').replace(/\{f\}/g, v.f || 'file.txt').replace(/\{m\}/g, v.m || 'Describe your change').replace(/\{u\}/g, v.u || 'https://github.com/user/repo.git'); }
  function find(q) { var w = q.toLowerCase().split(/\s+/).filter(Boolean); return G.filter(function (g) { var t = (g[0] + ' ' + g[1] + ' ' + g[2]).toLowerCase(); return w.every(function (x) { return t.indexOf(x) >= 0; }); }); }
  var q = h('input', { type: 'search', placeholder: 'What do you want to do? e.g. undo commit, new branch, stash', 'aria-label': 'Search' });
  var v = { b: h('input', { type: 'text', value: 'main' }), r: h('input', { type: 'text', value: 'origin' }), f: h('input', { type: 'text', value: 'index.html' }), m: h('input', { type: 'text', value: 'Fix contact form' }) };
  var list = h('div', { style: 'display:grid;gap:10px', 'data-out': '' });
  function draw() {
    var vals = { b: v.b.value.trim(), r: v.r.value.trim(), f: v.f.value.trim(), m: v.m.value.trim() }, r = find(q.value);
    list.innerHTML = '';
    if (!r.length) list.appendChild(h('p', { 'class': 'tstatus', text: 'Nothing matches. Try simpler words like “undo”, “branch”, “push” or “history”.' }));
    r.forEach(function (g) {
      var cmd = fill(g[1], vals);
      list.appendChild(h('div', { style: 'padding:10px 12px;border:1px solid ' + (g[3] ? '#f59e0b' : 'var(--line)') + ';border-radius:12px;background:var(--bg);display:grid;gap:6px' }, [h('b', { text: g[0] }),
        h('pre', { 'class': 'tmono', style: 'margin:0;white-space:pre-wrap;padding:8px;border-radius:8px;background:var(--surface-2)', text: cmd }), h('small', { text: fill(g[2], vals) }),
        g[3] ? h('small', { style: 'color:#b45309;font-weight:600', text: '⚠ ' + g[3] }) : null, T.row([T.button('Copy', { small: true, onclick: function (e) { T.copy(cmd, e.currentTarget); } })])]));
    });
  }
  [q, v.b, v.r, v.f, v.m].forEach(function (x) { x.addEventListener('input', draw); });
  spot.appendChild(T.card([T.field('Search', q), h('div', { 'class': 'tgrid2' }, [T.field('Branch', v.b), T.field('Remote', v.r), T.field('File', v.f), T.field('Commit message', v.m)]), list]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  draw();
  T.tests['git-cheatsheet'] = function () {
    var f = [];
    if (G.length < 40) f.push('only ' + G.length);
    if (find('undo last commit').length < 2) f.push('search undo');
    if (fill('git push {r} {b}', { b: 'dev', r: 'up' }) !== 'git push up dev' || fill('git commit -m "{m}"', {}) !== 'git commit -m "Describe your change"') f.push('fill');
    if (!G.filter(function (g) { return /reset --hard/.test(g[1]); })[0][3]) f.push('danger flag');
    return Promise.resolve({ ok: !f.length, n: 4, fails: f });
  };
});
