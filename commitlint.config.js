/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        // Enforce type enum
        'type-enum': [
            2,
            'always',
            [
                'feat',     // New feature
                'fix',      // Bug fix
                'docs',     // Documentation changes
                'style',    // Code style (formatting, semicolons, etc.)
                'refactor', // Code refactoring (no feature change, no bug fix)
                'perf',     // Performance improvements
                'test',     // Adding or updating tests
                'build',    // Build system or external dependencies
                'ci',       // CI/CD configuration
                'chore',    // Maintenance tasks
                'revert',   // Reverts a previous commit
                'security', // Security patches
                'i18n',     // Internationalization
                'a11y',     // Accessibility improvements
            ],
        ],
        // Enforce scope enum (HR domain-specific)
        'scope-enum': [
            1, // Warning level — allow custom scopes
            'always',
            [
                'api',
                'web',
                'shared',
                'prisma',
                'auth',
                'employees',
                'attendance',
                'leave',
                'payroll',
                'recruitment',
                'performance',
                'training',
                'policy',
                'health',
                'audit',
                'notifications',
                'ml',
                'infra',
                'ci',
                'deps',
            ],
        ],
        'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
        'subject-max-length': [2, 'always', 100],
        'body-max-line-length': [1, 'always', 120],
    },
};
