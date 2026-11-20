# Moonshot Rodeo workflow

Standing instruction from Josh: after every requested change in this thread, rebuild as needed, verify the change, commit with a descriptive message, and push to the repository. Report the branch, commit hash, and push status. Never force-push over remote history.

Edit page templates in `src/`, shared styles in `dist/styles.css`, and scripts in `dist/script.js`. Run `python3 build.py` to rebuild both served pages. Commit `dist/` including assets and generated HTML; it is the deployed site. Preserve unused event photos unless explicitly asked to remove them.
