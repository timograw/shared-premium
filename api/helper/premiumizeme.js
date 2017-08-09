'use strict';

let fetch = require('node-fetch');

const apiBasePath = 'https://www.premiumize.me/api/';

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
        var url = apiBasePath + 'account/info?' + this._defaultQueryString();

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

    async browseTorrent(hash) {
        let url = apiBasePath + 'torrent/browse?' + this._defaultQueryString() + '&hash=' + hash;

        var response = await fetch(url, {method: 'GET'});

        return response.json();
    }

    async listDirectory(id) {
        var url = apiBasePath + 'folder/list?' + this._defaultQueryString();
        if (id) url = url + '&id=' + id

        var response = await fetch(url, {method: 'GET'})
        
        return response.json();
    }
    
}