"use strict";

var Secret = function(str) {
    if (str) {
        var info = JSON.parse(str);
        this.up = info.up;
        this.down = info.down;
        this.content = info.content;
    } else {
        this.up = 0;
        this.down = 0;
        this.content = "";
    }
};

Secret.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var SecretList = function() {
    LocalContractStorage.defineProperty(this, "size");
    LocalContractStorage.defineMapProperty(this, "secrets", {
        parse: function(text) {
            return new Secret(text);
        },
        stringify: function(obj) {
            return obj.toString();
        }
    })
};


SecretList.prototype = {
    init: function() {
        this.size = 0;
    },

    getlist: function(pageNo, pageSize) {
        var start = (this.size - 1) - (pageSize * (pageNo - 1));
        var end = (this.size - 1) - (pageSize * pageNo - 1);

        if (end < 0) {
            end = 0;
        }

        var result = [];
        for (var i = start; i >= end; i--) {
            var secret = this.secrets.get(i);
            result.push(secret);
        }
        return {
            total: this.size,
            list: result
        };
    },

    setSecret: function(content) {
        var secret = new Secret();
        secret.up = 0;
        secret.down = 0;
        secret.content = content;
        var index = this.size;
        this.secrets.put(index, secret);
        this.size += 1;
    }
};

module.exports = SecretList;