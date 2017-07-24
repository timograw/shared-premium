'use strict';

let fetch = require('node-fetch');

exports.PremiumizeMe = class PremiumizeMe{
    constructor(configuration) {
        this.configuration = configuration
    }

    _getQueryString(params) {
        return Object
        .keys(params)
        .map(k => {
            if (Array.isArray(params[k])) {
                return params[k]
                    .map(val => `${encodeURIComponent(k)}[]=${encodeURIComponent(val)}`)
                    .join('&')
            }

            return `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`
        })
        .join('&')
    }

    _defaultQueryString() {
        return this._getQueryString({
            "customer_id": this.configuration.customer_id,
            "pin": this.configuration.pin
        })
    }

    accountInformation(callback) {
        var url = 'https://www.premiumize.me/api/account/info?' + this._defaultQueryString();

        fetch(url, {method: 'GET'}).then(response => {
            // console.log(response.status);
            // console.log(response.statusText);
            return response.json();
        }).then(function(json) {
            callback(json);
        }).catch(err => {
            console.log(err);
        })
    }

    browseTorrent(hash) {

    }

    listDirectory(id, callback) {
        var url = 'https://www.premiumize.me/api/folder/list?' + this._defaultQueryString();
        if (id) url = url + '&id=' + id

        fetch(url, {
            method: 'GET',
            headers: {
                'customer_id': this.configuration.customer_id,
                'pin': this.configuration.pin
            },
            body: '{}'
        }).then(response => {
            return response.json();
        }).then(function(json) {
            callback(json);
        }).catch(err => {
            console.log(err);
        })
    }
}