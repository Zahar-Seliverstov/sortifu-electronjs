async function loadLimit() {
    const pLimit = (await import('p-limit')).default;
    return pLimit;
}

module.exports = {loadLimit};