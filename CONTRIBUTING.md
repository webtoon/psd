# @webtoon/psd contribution guide

Hi! We welcome all contributions to @webtoon/psd.

## Issues and pull requests

Please submit bug reports, feature requests, and questions in our [issue board](https://github.com/webtoon/psd/issues).

Before creating a new issue, please search the issue board and make sure that no one else has already created an issue with the same topic. Duplicate issues will be closed with a link referring to the previously created issue.

You may also suggest code changes by directly submitting a pull request. When doing so, please explain in detail the problem you are trying to solve and how you solved it. You don't necessarily have to create an accompanying issue for a pull request, as long as your comment is sufficiently descriptive.

Once submitted, our development team will examine your work and assign appropriate labels. We may also suggest changes to ensure that your work aligns closer to our [project goals].

## Development guide

If you want to write code for @webtoon/psd, here's a guide on getting started.

### Setting up your development environment

To develop @webtoon/psd, you need to install the following software:

- Git
- Node.js: Any [actively maintained](https://github.com/nodejs/release#release*schedule) version will do
- NPM >= 8
- [Rust](https://www.rust-lang.org/tools/install)
- Any code editor that supports TypeScript: we recommend Visual Studio Code

When your machine is ready, clone the repository on your computer. Then run `npm install` in the project root directory to install various dependencies.

Finally, run `npm run build` to build all packages. This allows packages to provide TypeScript type definitions to their dependents.

### Building and testing

When working on the @webtoon/psd, you may want to run a package in "watch mode" so that you can immediately examine your changes. To do so, run:

- `npm run start:node`: Launches the demo Node.js script in watch mode
- `npm run start:browser`: Launches the demo web page locally with hot module replacement (HMR) enabled
- `npm run start:benchmark`: Launches the demo benchmark page locally with HMR

These "watch mode" commands also watch all dependencies in the workspace, e.g. the decoder (`packages/psd-decoder/`).

You can also run unit tests with `npm test`.

### Code style

We use ESLint and Prettier to lint our code and check code style. Please ensure that all code passes the linting and code style checks.

To manually lint and check code style, run `npm run lint`. To apply possible fixes and format the code, run `npm run fix`.

When creating a commit, we run ESLint and Prettier in a `pre-commit` hook (using [husky](https://github.com/typicode/husky)). We also run linting and code style checks on pull requests.

## Code of conduct

We don't have an official code of conduct yet. For now, please respect others and be nice to everyone. This applies to our development team, too.

[project goals]: https://github.com/webtoon/psd/issues/5
