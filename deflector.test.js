(function (window, document) {
    //
    // QUnit/SauceLabs integration
    //
    var log = [];
    QUnit.done = function (test_results) {
        var tests = [];
        for (var i = 0; i < log.length; i++) {
            tests.push({
                name: log[i].name,
                result: log[i].result,
                expected: log[i].expected,
                actual: log[i].actual,
                source: log[i].source
            });
        }
        test_results.tests = tests;
        window.global_test_results = test_results;
    };

    QUnit.testStart(function(testDetails){
        QUnit.log = function(details){
            if (!details.result) {
                details.name = testDetails.name;
                log.push(details);
            }
        };
    });

    //
    // Actual tests
    //
    module('Basics');

    test('constructor test', function () {
        var def = new Deflector();

        ok(def, 'Deflector instantiated');
        ok(def instanceof Deflector, 'Deflector has proper type');
        ok(def._userAgent, 'Deflector set up');
    });
})(window, document);