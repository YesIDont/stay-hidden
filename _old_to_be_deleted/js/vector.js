const Vector = function(x = 0, y = 0) {
    this.x = x;
    this.y = y;

    return this;
}

Vector.prototype.getLength = function() {
    return Math.sqrt((this.x * this.x + this.y * this.y));
}

Vector.prototype.normalize = function() {
    const length = this.getLength();

    this.x /= length;
    this.y /= length;

    return this;
}
