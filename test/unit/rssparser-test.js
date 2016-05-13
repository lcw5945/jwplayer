define([
    'parsers/rssparser'
], function (rssparser) {
    /* jshint qunit: true */

    QUnit.module('rssparser');
    var test = QUnit.test.bind(QUnit);

    test('adds mediaTypes array to source object when at least one jwplayer:mediaTypes element is present', function (assert) {
        expect(2);
        const data =
            '<media:channel>' +
                '<item>' +
                    '<media:group>' +
                            '<media:content url="//content.jwplatform.com/manifests/lvmGBvUA.mpd" type="application/dash+xml" duration="115" width="320" height="180">' +
                                '<jwplayer:mediaTypes>video/webm; codecs="vp9"</jwplayer:mediaTypes>' +
                                '<jwplayer:mediaTypes>audio/webm; codecs="vorbis"</jwplayer:mediaTypes>' +
                            '</media:content>' +
                        '</media:group>' +
                    '</item>' +
            '</media:channel>';

        const expectedMediaTypes = [
            'video/webm; codecs="vp9"',
            'audio/webm; codecs="vorbis"'
        ];
        const actual = rssparser.parse(parseXML(data));
        const actualMediaTypes = actual[0].sources[0].mediaTypes;
        assert.ok(actualMediaTypes);
        assert.deepEqual(actualMediaTypes, expectedMediaTypes);
    });

    test('does not add a mediaTypes array to source object when no jwplayer:mediaTypes elements are present', function (assert) {
        expect(1);
        const data =
            '<media:channel>' +
                '<item>' +
                    '<media:group>' +
                        '<media:content url="//content.jwplatform.com/manifests/lvmGBvUA.mpd" type="application/dash+xml" duration="115" width="320" height="180">' +
                        '</media:content>' +
                    '</media:group>' +
                '</item>' +
            '</media:channel>';

        const actual = rssparser.parse(parseXML(data));
        assert.notOk(actual[0].sources[0].mediaTypes);
    });

    function parseXML(input) {
        if (window.DOMParser) {
            var parser = new window.DOMParser();
            return parser.parseFromString(input, 'text/xml');
        }
        var xmlDom = new window.ActiveXObject('Microsoft.XMLDOM');
        xmlDom.async = 'false';
        xmlDom.loadXML(input);
        return xmlDom;
    }
});

