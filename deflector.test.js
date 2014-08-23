(function (window, document) {
    //
    // QUnit/SauceLabs integration
    //
    var log = [];
    var testName;

    QUnit.done(function (test_results) {
        var tests = [];
        for(var i = 0, len = log.length; i < len; i++) {
            var details = log[i];
            tests.push({
                name: details.name,
                result: details.result,
                expected: details.expected,
                actual: details.actual,
                source: details.source
            });
        }
        test_results.tests = tests;
        window.global_test_results = test_results;
    });

    QUnit.testStart(function(testDetails) {
        QUnit.log(function(details) {
            if (!details.result) {
                details.name = testDetails.name;
                log.push(details);
            }
        });
    });

    //
    // User agent strings
    //
    var userAgents = {
        desktopChrome:   "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1985.143 Safari/537.36",
        desktopFirefox:  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:31.0) Gecko/20100101 Firefox/31.0",
        desktopSafari:   "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_4) AppleWebKit/537.78.2 (KHTML, like Gecko) Version/7.0.6 Safari/537.78.2",
        desktopExplorer: "Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)",
        phoneChrome:     "Mozilla/5.0 (Linux; Android 4.4.2; Nexus 5 Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.99 Mobile Safari/537.36",
        phoneSafari:     "Mozilla/5.0 (iPhone; CPU iPhone OS 7_1 like Mac OS X) AppleWebKit/537.51.2 (KHTML, like Gecko) Version/7.0 Mobile/11D167 Safari/9537.53",
        tabletChrome:    "Mozilla/5.0 (Linux; Android 4.4.2; Nexus 7 Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.141 Safari/537.36",
        tabletSafari:    "Mozilla/5.0 (iPad; CPU OS 7_1 like Mac OS X) AppleWebKit/537.51.2 (KHTML, like Gecko) Version/7.0 Mobile/11D167 Safari/9537.53"
    };

    //
    // Actual tests
    //
    module('Basics');

    test('constructor test', function () {
        var defP = new Deflector();
        ok(defP instanceof Deflector, 'plain Deflector instantiated');


        var defO = new Deflector({ userAgent: 'foo'});
        ok(defO instanceof Deflector, 'overridden Deflector instantiated');
        ok(defO._userAgent === 'foo', 'options has been set');
    });


    test('cookie test', function () {
        var def = new Deflector();

        ok(!def.getCookie(), 'cookie not set');
        
        def.setCookie();
        ok(def.getCookie(), 'cookie set');
        
        def.unsetCookie();
        ok(!def.getCookie(), 'cookie unset');
    });


    module('Detection');

    test('desktop test', function () {
        var defDC = new Deflector({ userAgent: userAgents.desktopChrome });
        ok(!defDC.detect(), "desktop Chrome not detected");

        var defDF = new Deflector({ userAgent: userAgents.desktopFirefox });
        ok(!defDF.detect(), "desktop Firefox not detected");

        var defDS = new Deflector({ userAgent: userAgents.desktopSafari });
        ok(!defDS.detect(), "desktop Safari not detected");

        var defDE = new Deflector({ userAgent: userAgents.desktopExplorer });
        ok(!defDE.detect(), "desktop Internet Explorer not detected");

        var defRDC = new Deflector({ 
            userAgent: userAgents.desktopChrome,
            reverse: true
        });
        ok(defRDC.detect(), "desktop Chrome reverse-detected");
    });


    test('phone test', function () {
        var defPC = new Deflector({ userAgent: userAgents.phoneChrome });
        ok(defPC.detect(), "phone Chrome detected");

        var defPS = new Deflector({ userAgent: userAgents.phoneSafari });
        ok(defPS.detect(), "phone Safari detected");

        var defRPC = new Deflector({ 
            userAgent: userAgents.phoneChrome,
            reverse: true
        });
        ok(!defRPC.detect(), "phone Chrome not reverse-detected");
    });


    test('tablet test', function () {
        var defTC = new Deflector({ userAgent: userAgents.tabletChrome });
        ok(!defTC.detect(), "tablet Chrome not detected");

        var defTS = new Deflector({ userAgent: userAgents.tabletSafari });
        ok(!defTS.detect(), "tablet Safari not detected");

        var defTTC = new Deflector({ 
            userAgent: userAgents.tabletChrome,
            includeTablet: true
        });
        ok(defTTC.detect(), "tablet Chrome detected");

        var defTTS = new Deflector({ 
            userAgent: userAgents.tabletSafari,
            includeTablet: true
        });
        ok(defTTS.detect(), "tablet Safari detected");
    });

})(window, document);