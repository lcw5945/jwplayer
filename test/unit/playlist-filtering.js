// jshint ignore: start
define([
    'test/underscore',
    'utils/helpers',
    'data/aac',
    'data/flv',
    'data/mp4',
    'data/playlists',
    'playlist/playlist',
    'providers/providers'
], function (_, helpers, aac, flv, mp4, playlists, playlist, Providers) {
    /* jshint qunit: true */

    function sourcesMatch(arr) {
        var type;

        var match = _.all(arr, function(a) {
            type = type || a.type;
            return type === a.type;
        });

        return match ? type : undefined;
    }

    var sources = {
        flv_mp4 : [flv.tagged, mp4.tagged, flv.tagged, mp4.tagged],
        mp4_flv : [mp4.tagged, flv.tagged, mp4.tagged, flv.tagged],
        aac_mp4 : [aac.tagged, mp4.tagged, aac.tagged, mp4.tagged],
        mp4_aac : [mp4.tagged, aac.tagged, mp4.tagged, aac.tagged],
        invalid : [undefined, false, undefined],
        empty   : [],
        mixed   : [mp4.tagged, undefined, mp4.tagged]
    };

    function testSource(sourceName, desiredType, isFlash, isAndroidHls) {
        var source = sources[sourceName];

        var primary = isFlash ? 'flash' : undefined;

        if (primary === 'flash' && !helpers.flashVersion()) {
            ok(true, 'Ignore flash test when plugin is unavailable');
            return;
        }

        var filtered = playlist.filterSources(source, new Providers(primary), !!isAndroidHls);

        var title = isFlash ? 'Flash only with ' : 'Html5 only with ';
        equal(sourcesMatch(filtered), desiredType, title + sourceName + ' results in ' + desiredType);
    }

    module('playlist.filterSources');

    test('flash only', function() {
        testSource('flv_mp4', 'flv', true);
        testSource('mp4_flv', 'mp4', true);
        testSource('aac_mp4', 'aac', true);
        testSource('mp4_aac', 'mp4', true);
        testSource('invalid', undefined, true);
        testSource('empty', undefined, true);
        testSource('mixed', 'mp4', true);
    });

    test('html5 only', function() {
        testSource('flv_mp4', 'mp4', false);
        testSource('mp4_flv', 'mp4', false);
        testSource('aac_mp4', 'aac', false);
        testSource('mp4_aac', 'mp4', false);
        testSource('invalid', undefined, false);
        testSource('empty', undefined, false);
        testSource('mixed', 'mp4', false);
    });


    module('playlist.filterPlaylist');

    test('filterplaylist', function() {
        var pl;
        pl = playlist.filterPlaylist(playlists['webm_mp4'], new Providers());
        equal(sourcesMatch(pl[0].sources), 'webm', 'Webm mp4 first source is webm');
        equal(sourcesMatch(pl[1].sources), 'mp4', 'Webm mp4 second source is mp4');

        pl = playlist.filterPlaylist(playlists['mp4_webm'], new Providers());
        equal(sourcesMatch(pl[0].sources), 'mp4', 'Mp4 webm, first source is mp4');
        equal(sourcesMatch(pl[1].sources), 'webm', 'mp4 webm, second source is webm');

        var androidhls = true;
        pl = playlist.filterPlaylist(playlists['mp4_webm'], new Providers(), androidhls);
        equal(pl[0].sources[0].androidhls, androidhls, 'androidhls is copied to sources');

        var empty = [];
        pl = playlist.filterPlaylist(empty, new Providers());
        equal(pl.length, 0, 'returns an empty array when playlist is empty');

        pl = playlist.filterPlaylist([{sources:[]}], new Providers());
        equal(pl.length, 0, 'filters items with empty sources');

        pl = playlist.filterPlaylist(playlists['mp4_webm']);
        equal(pl.length, 2, 'supports legacy plugins with providers not set');

        pl = playlist.filterPlaylist(playlists['mp4_webm'], {no: 'choose'});
        equal(pl.length, 2, 'supports legacy plugins with providers.choose not available');
    });


});
