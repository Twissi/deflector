(function(window, document, defaults) {
    //
    // instantiate deflector
    //
    var Deflector = function (options) {
        if (this instanceof Deflector) {
            this.init(defaults);
            if (options) {
                this.init(options);
            }
        }
        else {
            return new Deflector(options);
        }
    };

    //
    // configure deflector instance
    //
    Deflector.prototype.init = function (options) {
        for (var key in options) {
            if (options.hasOwnProperty(key)) {
                this["_"+ key] = options[key];
            }
        }
    };

    //
    // detect (mobile) browser and redirect appropriately
    //
    Deflector.prototype.deflect = function () {
        if (this.decide()) {
            window.location.replace(this._baseUrl + this.getPath());
        }
    };

    //
    // decide whether browser is to be considered mobile
    // enable detection override using referrer/query param/cookie
    //
    Deflector.prototype.decide = function () {
        if (this._referrer.indexOf(this._baseUrl) > 0 ||
            this._search.indexOf(this._paramNoDef) > 0) {   
            this.setCookie();
        }
        else if (this._search.indexOf(this._paramDef) > 0) {
            this.unsetCookie();
        }
        return !this.getCookie() && this.detect();
    };

    //
    // perform actual browser detection using wurfl regexps
    //
    Deflector.prototype.detect = function () {
        var regExp;
        if (this._includeTablet) {
            regExp = new RegExp(this._patternPhone + this._patternTablet, "i");
        }
        else {
            regExp = new RegExp(this._patternPhone, "i");
        }
        var result = regExp.test(this._userAgent);

        if (!result && this._includeLegacy) {
            regExp = new RegExp(this._patternLegacy, "i");
            result = regExp.test(this._userAgent.substr(0, 4));
        }
        return this._reverse ? !result : result;
    };

    //
    // determine destination path using path map and default path
    //
    Deflector.prototype.getPath = function () {
        if (this._pathMap.hasOwnProperty(this._pathName)) {
            return this._pathMap[this._pathName];
        }
        if (this._regExpPaths) {
            for (var key in this._pathMap) {
                if (this._pathMap.hasOwnProperty(key)) {
                    var regExp = new RegExp(key, 'i');
                    if (regExp.test(this._pathName)) {
                        return this._pathMap[key];
                    }
                }
            }
        }
        return this._defaultPath || this._pathName;
    };

    //
    // access override cookie
    //
    Deflector.prototype.getCookie = function () {
        var cookies = document.cookie.split(';'),
            cookieNameEq = this._cookieName +"=";

        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i];

            while (cookie.charAt(0) === ' ') {
                cookie = cookie.substring(1, cookie.length);
            }
            if (cookie.indexOf(cookieNameEq) === 0) {
                return !!cookie.substring(cookieNameEq.length, cookie.length);
            }
        }
        return false;
    };

    //
    // set override cookie
    //
    Deflector.prototype.setCookie = function (unset) {
        var ttl = unset ? -86400000 : (this._cookieTtl * 1000),
            value = unset ? "" : "1",
            date = new Date(),
            expires = "";

        if (ttl) {
            date.setTime(date.getTime() + ttl);
            expires = "; expires="+ date.toGMTString();
        }
        document.cookie = this._cookieName +"="+ value + expires +"; path=/";
    };

    // 
    // unset override cookie
    //
    Deflector.prototype.unsetCookie = function () {
        this.setCookie(true);
    };

    //
    // export constructor as anonymous module or global object
    //
    if (typeof define === "function" && define.amd) {
        define(function () { return Deflector; });
    } 
    else {
        window.Deflector = Deflector;
    }
})(window, document, {
    //
    // define default options
    //
    baseUrl:        document.location.hostname.replace(/^(www\.)?/i, "//m."),
    pathMap:        {},
    defaultPath:    false,
    regExpPaths:    false,
    reverse:        false,
    includeLegacy:  false,
    includeTablet:  false,
    cookieTtl:      false,
    cookieName:     "_nodef",
    paramNoDef:     "_nodef",
    paramDef:       "_def",
    pathName:       document.location.pathname,
    search:         document.location.search,
    referrer:       document.referrer,
    //
    // provided by http://detectmobilebrowsers.com
    // based on http://wurfl.sourceforge.net
    //
    userAgent:      navigator.userAgent || navigator.vendor || window.opera,
    patternPhone:   "(android|bb\\d+|meego).+mobile|avantgo|bada/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\\.(browser|link)|vodafone|wap|windows ce|xda|xiino",
    patternLegacy:  "1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\\-(n|u)|c55/|capi|ccwa|cdm\\-|cell|chtm|cldc|cmd\\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\\-s|devi|dica|dmob|do(c|p)o|ds(12|\\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\\-|_)|g1 u|g560|gene|gf\\-5|g\\-mo|go(\\.w|od)|gr(ad|un)|haie|hcit|hd\\-(m|p|t)|hei\\-|hi(pt|ta)|hp( i|ip)|hs\\-c|ht(c(\\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\\-(20|go|ma)|i230|iac( |\\-|/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |/)|klon|kpt |kwc\\-|kyo(c|k)|le(no|xi)|lg( g|/(k|l|u)|50|54|\\-[a-w])|libw|lynx|m1\\-w|m3ga|m50/|ma(te|ui|xo)|mc(01|21|ca)|m\\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\\-2|po(ck|rt|se)|prox|psio|pt\\-g|qa\\-a|qc(07|12|21|32|60|\\-[2-7]|i\\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\\-|oo|p\\-)|sdk/|se(c(\\-|0|1)|47|mc|nd|ri)|sgh\\-|shar|sie(\\-|m)|sk\\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\\-|v\\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\\-|tdg\\-|tel(i|m)|tim\\-|t\\-mo|to(pl|sh)|ts(70|m\\-|m3|m5)|tx\\-9|up(\\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\\-|your|zeto|zte\\-",
    patternTablet:  "|android|ipad|playbook|silk"
});