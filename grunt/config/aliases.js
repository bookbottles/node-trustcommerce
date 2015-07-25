module.exports = {
    'default': [
        'watch'
    ],
    'test': [
        'mocha_istanbul',
        'istanbul_check_coverage',
        'lint'
    ],
    'lint': [
        'eslint'
    ]
};
