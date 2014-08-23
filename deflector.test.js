(function () {
    //
    // QUnit/SauceLabs integration
    //
    var log = [];

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
    module("Basics");

    test("constructor", function () {
        var def = new Deflector();
        ok(def instanceof Deflector, "plain Deflector instantiated (new)");

        def = Deflector();
        ok(def instanceof Deflector, "plain Deflector instantiated (factory)");

        def = new Deflector({ userAgent: "foo"});
        ok(def instanceof Deflector, "overridden Deflector instantiated");
        strictEqual(def._userAgent, "foo", "options successfully set");
    });

    test("cookie", function () {
        var def = new Deflector();
        ok(!def.getCookie(), "cookie initially not set");

        def.setCookie();
        ok(def.getCookie(), "cookie successfully set");
        
        def.unsetCookie();
        ok(!def.getCookie(), "cookie successfully unset");
    });

    //
    // Phone/tablet detection tests
    //
    module("Detection");

    test("desktop", function () {
        var def = new Deflector();

        def.init({ userAgent: userAgents.desktopChrome });
        ok(!def.detect(), "Chrome not detected as mobile");

        def.init({ userAgent: userAgents.desktopFirefox });
        ok(!def.detect(), "Firefox not detected as mobile");

        def.init({ userAgent: userAgents.desktopSafari });
        ok(!def.detect(), "Safari not detected as mobile");

        def.init({ userAgent: userAgents.desktopExplorer });
        ok(!def.detect(), "IE not detected as mobile");

        def.init({ reverse: true });
        ok(def.detect(), "IE reverse-detected as desktop");
    });

    test("phone", function () {
        var def = new Deflector();

        def.init({ userAgent: userAgents.phoneChrome });
        ok(def.detect(), "Nexus 5 detected as mobile");

        def.init({ userAgent: userAgents.phoneSafari });
        ok(def.detect(), "iPhone detected as mobile");

        def.init({ reverse: true });
        ok(!def.detect(), "iPhone not reverse-detected as desktop");
    });

    test("tablet", function () {
        var def = new Deflector({ includeLegacy: true });

        def.init({ userAgent: userAgents.tabletChrome });
        ok(!def.detect(), "Nexus 7 not detected as mobile (default)");

        def.init({ userAgent: userAgents.tabletSafari });
        ok(!def.detect(), "iPad not detected as mobile (default)");

        def.init({ includeTablet: true });
        ok(def.detect(), "iPad detected as mobile (incl. tablet)");

        def.init({ userAgent: userAgents.tabletChrome });
        ok(def.detect(), "Nexus 7 detected as mobile (incl. tablet)");
    });

    test("override", function () {
        var def = new Deflector({
            baseUrl:   "//foo",
            userAgent: userAgents.phoneSafari
        });

        def.init({ search: "?_nodef" });
        ok(!def.decide(), "decided not to redirect (param)");
        def.init({ search: "" });
        ok(!def.decide(), "decided not to redirect (param persisted)");

        def.init({ search: "?_def" });
        ok(def.decide(), "decided to redirect (param)");
        def.init({ search: "" });
        ok(def.decide(), "decided to redirect (param persisted)");

        def.init({ referrer: "http://foo/bar" });
        ok(!def.decide(), "decided not to redirect (referrer)");
        def.init({ referrer: "" });
        ok(!def.decide(), "decided not to redirect (referrer persisted)");
        
        def.unsetCookie();
        ok(def.decide(), "decided to redirect (reset)");
    });

    //
    // Path rewriting tests
    //
    module("Paths");

    test("resolve", function () {
        var def = new Deflector({
            pathName:  "/foo",
            userAgent: userAgents.phoneSafari
        });
        strictEqual(def.getPath(), "/foo", "returned path /foo (no match)");

        def.init({ defaultPath: "/bar"});
        strictEqual(def.getPath(), "/bar", "returned path /bar (default)");

        def.init({ pathMap: { "/foo": "/baz" }});
        strictEqual(def.getPath(), "/baz", "returned path /baz (map)");

        def.init({ 
            pathMap: { "^.+foo.*$": "/qux" },
            regExpPaths: true
        });
        strictEqual(def.getPath(), "/qux", "returned path /qux (regex)");
    });
})();
