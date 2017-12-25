
var assert = require('assert'),
    BufferBuilder = require('buffer-builder'),
    hessian = require('hessian.js'),
    Long = require('long');

function Writer(initial) {
    this.classDefs = {};
    this.valueRefs = [];
    this.builder = new BufferBuilder(initial);
}

Writer.prototype.writeCall = function(method, args) {
    var callbuf = new Buffer([0, 1, 0, 0, 0, 0]);
    callbuf.write('c');
    callbuf.write('m', 3);
    callbuf.writeInt16BE(method.length, 4);

    this.builder.appendBuffer(callbuf);
    this.builder.appendString(method);

    if (args) {
        for (var i = 0, len = args.length; i < len; ++i) {
            this.write(args[i]);
        }
    }

    this.builder.appendString('z');
    return this;

};

Writer.prototype.getBuffer = function() {
    return this.builder.get();
};

Writer.prototype.write = function(data, type) {
    this.builder.appendBuffer(hessian.encode(data));

    return this;
};

Writer.prototype.writeNull = function() {
    this.builder.appendString('N');
    return this;
};

Writer.prototype.writeBoolean = function(data) {
    this.builder.appendString(data ? new Buffer('T') : new Buffer('F'));
    return this;
};

Writer.prototype.writeInt = function(data) {
    this.builder.appendString('I');
    this.builder.appendInt32BE(data);
    return this;
};

Writer.prototype.writeLong = function(data) {
    var high = data.high,
        low = data.low;
    if (data instanceof Long) {
        high = data.getHighBits();
        low = data.getLowBitsUnsigned();
    }

    this.builder.appendString('L');
    this.builder.appendInt32BE(high);
    this.builder.appendUInt32BE(low);
    return this;
};


Writer.prototype.writeDouble = function(data) {
    this.builder.appendString('D');
    this.builder.appendDoubleBE(data);
    return this;
};


Writer.prototype.writeDate = function(date) {
    assert(date instanceof Date, 'Only Accept Date Type');
    this.builder.appendString('d');
    this.writeLong(Long.fromNumber(date.getTime()));
    return this;
};


function isInt(data) {
    return typeof data === 'number' && parseFloat(data) === parseInt(data, 10) && !isNaN(data);
}

function isFloat(data) {
    return typeof data === 'number' && parseFloat(data) !== parseInt(data, 10) && !isNaN(data);
}

Writer.prototype.writeString = function(val) {
    this.builder.appendBuffer(hessian.encode(val));
};

module.exports = Writer;