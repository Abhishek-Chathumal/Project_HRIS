# Contributing to Project HRIS

Thank you for contributing! This document outlines our standards for version control, code quality, and collaboration.

## Table of Contents

- [Git Workflow](#git-workflow)
- [Branch Naming](#branch-naming)
- [Commit Messages](#commit-messages)
- [Pull Requests](#pull-requests)
- [Code Quality](#code-quality)
- [Release Process](#release-process)

---

## Git Workflow

We follow **Git Flow** with long-lived `main` and `develop` branches:

```
main          ──●──────────────●──────────────●── (production releases)
                \              ↑              ↑
release          \        release/1.1    release/1.2
                  \           ↑              ↑
develop            ──●──●──●──●──●──●──●──●──●── (integration)
                      \     \     ↑     ↑
feature                feat/  feat/   feat/
                      auth   leave   payroll
```

| Branch | Purpose | Merges Into |
|---|---|---|
| `main` | Production-ready code | — |
| `develop` | Integration branch | `main` (via release) |
| `feature/*` | New features | `develop` |
| `bugfix/*` | Bug fixes | `develop` |
| `hotfix/*` | Critical production fixes | `main` + `develop` |
| `release/*` | Release preparation | `main` + `develop` |
| `chore/*` | Maintenance tasks | `develop` |

## Branch Naming

Use the following naming convention:

```
<type>/<scope>-<short-description>
```

**Examples:**
```
feature/auth-mfa-setup
feature/employees-bulk-import
bugfix/leave-balance-calculation
hotfix/auth-session-expiry
release/1.2.0
chore/deps-update-nestjs
```

## Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/) enforced via **commitlint** and **Husky**.

### Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code formatting (no logic change) |
| `refactor` | Code restructuring (no feature/fix) |
| `perf` | Performance improvement |
| `test` | Tests |
| `build` | Build system changes |
| `ci` | CI/CD changes |
| `chore` | Maintenance |
| `revert` | Revert a commit |
| `security` | Security patch |
| `i18n` | Internationalization |
| `a11y` | Accessibility |

### Scopes

Use module-specific scopes: `api`, `web`, `shared`, `prisma`, `auth`, `employees`, `attendance`, `leave`, `payroll`, `recruitment`, `performance`, `training`, `policy`, `health`, `audit`, `notifications`, `ml`, `infra`, `ci`, `deps`

### Examples

```bash
feat(auth): implement MFA with TOTP
fix(leave): correct business day calculation for holidays
docs(api): add Swagger descriptions for payroll endpoints
refactor(employees): extract org chart into separate service
perf(prisma): add composite index for attendance queries
security(auth): patch JWT refresh token vulnerability
ci(infra): add staging deployment pipeline
chore(deps): upgrade NestJS to v11.2
```

### Breaking Changes

Use `!` after the type/scope and include a `BREAKING CHANGE:` footer:

```
feat(api)!: change employee endpoint response format

BREAKING CHANGE: Employee list now returns paginated response
instead of raw array. Clients must handle the new `pagination`
wrapper object.
```

## Pull Requests

### PR Title

Must follow the same Conventional Commits format as commit messages.

### PR Template

Every PR must include:
1. **What** — Description of changes
2. **Why** — Motivation / linked issue
3. **How** — Technical approach
4. **Testing** — How it was tested
5. **Screenshots** — If UI changes

### Review Requirements

| Target Branch | Required Reviews | Checks |
|---|---|---|
| `develop` | 1 approval | CI passes, lint, tests |
| `release/*` | 2 approvals | CI, tests, security scan |
| `main` | 2 approvals | All checks + QA sign-off |

## Code Quality

### Pre-commit Hooks (Automated)

- **lint-staged** — Formats staged files with Prettier
- **commitlint** — Validates commit message format

### CI Pipeline (Per PR)

1. Install dependencies
2. Lint (`pnpm lint`)
3. Type check (`pnpm type-check`)
4. Unit tests (`pnpm test`)
5. Build (`pnpm build`)
6. Security audit (`pnpm audit`)

## Release Process

We use [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`

| Version Bump | When |
|---|---|
| **MAJOR** (1.x.x → 2.0.0) | Breaking API changes |
| **MINOR** (1.1.x → 1.2.0) | New features (backward-compatible) |
| **PATCH** (1.1.1 → 1.1.2) | Bug fixes, security patches |

### Release Checklist

1. Create `release/x.y.z` branch from `develop`
2. Update `CHANGELOG.md`
3. Bump version in `package.json`
4. Run full test suite
5. PR → `main` (requires 2 approvals)
6. Tag release: `git tag -a vx.y.z -m "Release vx.y.z"`
7. Merge back into `develop`

---

## Getting Started

```bash
# Clone and install
git clone <repo> && cd Project_HRIS
pnpm install

# Create feature branch
git checkout develop
git checkout -b feature/my-feature

# Work, commit, push
git add .
git commit -m "feat(scope): description"
git push origin feature/my-feature

# Open PR → develop
```
