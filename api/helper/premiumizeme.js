'use strict';

let fetch = require('node-fetch');

module.exports = class PremiumizeMe{
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

    accountInformation() {
        var url = 'https://www.premiumize.me/api/account/info?' + this._defaultQueryString();

        return fetch(url, {
            method: 'GET',
            headers: {
                'customer_id': '982043859',
                'pin': 'z234zdkiis57ahc0'
            },
            body: '{}'
        }).then(response => {
            console.log(response.ok);
            console.log(response.status);
            console.log(response.statusText);
            console.log(response.headers.raw());
            console.log(response.headers.get('content-type'));
            return response.json();
        }).catch(err => {
            console.log(err);
        })
    }
}