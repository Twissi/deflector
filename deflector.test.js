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
    // Constructor/cookie handling tests
    //
    module('Basics');

    test('constructor test', function () {
        var def = new Deflector();
        ok(def instanceof Deflector, 'plain Deflector instantiated (new)');

        def = Deflector();
        ok(def instanceof Deflector, 'plain Deflector instantiated (factory)');

        def = new Deflector({ userAgent: 'foo'});
        ok(def instanceof Deflector, 'overridden Deflector instantiated');
        strictEqual(def._userAgent, 'foo', 'options successfully set');
    });


    test('cookie test', function () {
        var def = new Deflector();
        ok(!def.getCookie(), 'cookie initially not set');

        def.setCookie();
        ok(def.getCookie(), 'cookie successfully set');
        
        def.unsetCookie();
        ok(!def.getCookie(), 'cookie successfully unset');
    });

    //
    // Phone/tablet detection tests
    //
    module('Detection');

    test('desktop test', function () {
        var def = new Deflector();

        def.init({ userAgent: userAgents.desktopChrome });
        ok(!def.detect(), "desktop Chrome not detected as mobile");

        def.init({ userAgent: userAgents.desktopFirefox });
        ok(!def.detect(), "desktop Firefox not detected as mobile");

        def.init({ userAgent: userAgents.desktopSafari });
        ok(!def.detect(), "desktop Safari not detected as mobile");

        def.init({ userAgent: userAgents.desktopExplorer });
        ok(!def.detect(), "desktop IE not detected as mobile");

        def.init({ reverse: true });
        ok(def.detect(), "desktop IE reverse-detected as desktop");
    });


    test('phone test', function () {
        var def = new Deflector();

        def.init({ userAgent: userAgents.phoneChrome });
        ok(def.detect(), "phone Chrome detected as mobile");

        def.init({ userAgent: userAgents.phoneSafari });
        ok(def.detect(), "phone Safari detected as mobile");

        def.init({ reverse: true });
        ok(!def.detect(), "phone Safari not reverse-detected as desktop");
    });


    test('tablet test', function () {
        var def = new Deflector();

        def.init({ userAgent: userAgents.tabletChrome });
        ok(!def.detect(), "tablet Chrome not detected as mobile");

        def.init({ userAgent: userAgents.tabletSafari });
        ok(!def.detect(), "tablet Safari not detected as mobile");

        def.init({ includeTablet: true });
        ok(def.detect(), "tablet Safari detected as mobile");

        def.init({ userAgent: userAgents.tabletChrome });
        ok(def.detect(), "tablet Chrome detected as mobile");
    });


    test('advanced test', function () {
        var def = new Deflector({
            cookieName: '_nodeftest',
            includeLegacy: true,
            userAgent: userAgents.phoneSafari
        });

        def.init({ search: "?"+ def._paramNoDef });
        ok(!def.decide(), 'decided not to redirect (param)');
        def.init({ search: "" });
        ok(!def.decide(), 'decided not to redirect (param persisted)');
        def.unsetCookie();

        def.init({ search: "?"+ def._paramDef });
        ok(def.decide(), 'decided to redirect (param)');
        def.init({ search: "" });
        ok(def.decide(), 'decided to redirect (param persisted)');
        def.unsetCookie();

        def.init({ referrer: "http:"+ def._baseUrl });
        ok(!def.decide(), 'decided not to redirect (referrer)');
        def.init({ referrer: "" });
        ok(!def.decide(), 'decided not to redirect (referrer persisted)');
        def.unsetCookie();

        ok(def.decide(), 'decided to redirect (reset)');
    });

    //
    // Path rewriting tests
    //
    module('Rewrites');

    test('pathmap test', function () {
        var def = new Deflector({ 
            userAgent: userAgents.phoneSafari,
            pathName: '/foo'
        });
        strictEqual(def.getPath(), '/foo', 'returned path /foo');

        def.init({ defaultPath: '/bar'});
        strictEqual(def.getPath(), '/bar', 'returned path /bar');

        def.init({ pathMap: { '/foo': '/baz' }});
        strictEqual(def.getPath(), '/baz', 'returned path /baz');

        def.init({ 
            pathMap: { '^.+foo.*$': '/qux' },
            regExpPaths: true
        });
        strictEqual(def.getPath(), '/qux', 'returned path /qux');
    });

})(window, document);