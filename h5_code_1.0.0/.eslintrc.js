module.exports = {
    "extends": "standard",
    "installedESLint": true,
    "plugins": [
        "standard",
        "promise"
    ],
    "rules": {
        "semi": ["error", "always"],
        "quotes": ["warn","double"],
        "space-before-function-paren": ["warn","never"],
        "brace-style": ["error","stroustrup", { "allowSingleLine": true }],
        "keyword-spacing": 0,
        "no-tabs": 0,
        "indent": ["error", "tab"],
        "spaced-comment": 0,
        "no-useless-escape": 0,
        "eqeqeq": 0,
        "no-mixed-spaces-and-tabs": 0
    }
};