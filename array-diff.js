Array.prototype.diff = function(a) {
    let source = this;
    let diffIndexes = [];
    diffSource = this.filter(function(i) {
        if (a.indexOf(i) < 0) {
            diffIndexes.push(source.indexOf(i));
            return true;
        } else {
            return false;
        }
    });
    let ___a = { indexes : diffIndexes, sources : diffSource }
    return ___a
};
