/*
 * Plugin Name: Vanilla Scroll Level
 * Version: 0.2.2
 * Plugin URL: https://github.com/JavaScriptUtilities/vanillaScrollLevel
 * Vanilla Scroll Level may be freely distributed under the MIT license.
 * Usage status: Work in progress
 */
/* jshint browser: true */

var vanillaScrollLevel = function(settings) {
    'use strict';

    var winHeight = 0,
        winScroll = 0,
        percentScroll = 0,
        _animDisabled = true,
        $body = document.body,
        _settings = {};

    var _defaultSettings = {
        animDisabledLevel: 0,
        scrollPauseDelta: 1.1,
        scrollPauseDeltaHalf: 1.1,
        getWinHeight: function() {
            return window.innerHeight;
        }
    };

    /* Init Settings */
    for (var attr in _defaultSettings) {
        _settings[attr] = _defaultSettings[attr];
    }
    for (var attr2 in settings) {
        _settings[attr2] = settings[attr2];
    }

    /* ----------------------------------------------------------
      Base events
    ---------------------------------------------------------- */

    function on_resize() {
        winHeight = _settings.getWinHeight();
        _animDisabled = window.innerWidth < _settings.animDisabledLevel;
        $body.setAttribute('data-scroll-anims', _animDisabled ? '0' : '1');
        on_scroll_requestanim();
    }

    function on_scroll() {
        if (_animDisabled) {
            return;
        }

        winScroll = Math.max(window.scrollY, 1);
        percentScroll = (winScroll % winHeight / winHeight);

        /* Set values */
        set_css_vars();
        set_body_attributes();
    }

    /* ----------------------------------------------------------
      Var functions
    ---------------------------------------------------------- */

    function set_css_vars() {
        var scrollTmp = 0,
            attributePrefix = '--percentscroll';

        /* Full
        -------------------------- */

        /* 0 -> 0.5 -> 1 */
        scrollTmp = Math.min(percentScroll * _settings.scrollPauseDelta, 1);
        $body.style.setProperty(attributePrefix + 'grow', scrollTmp);

        /* 1 -> 0.5 -> 0 */
        scrollTmp = 1 - Math.min(percentScroll * _settings.scrollPauseDelta, 1);
        $body.style.setProperty(attributePrefix + 'shrink', scrollTmp);

        /* First half
        -------------------------- */

        /* 0.. -> 1 -> 1 */
        scrollTmp = 1;
        if (percentScroll <= 0.5) {
            scrollTmp = Math.max(0, percentScroll * _settings.scrollPauseDeltaHalf * 2 - _settings.scrollPauseDeltaHalf + 1);
        }
        $body.style.setProperty(attributePrefix + 'firsthalfgrow', scrollTmp);

        /* 1.. -> 0 -> 0 */
        scrollTmp = 0;
        if (percentScroll <= 0.5) {
            scrollTmp = Math.min(((1 - percentScroll) * 2 - 1) * _settings.scrollPauseDeltaHalf, 1);
        }
        $body.style.setProperty(attributePrefix + 'firsthalfshrink', scrollTmp);

        /* Last half
        -------------------------- */

        /* 1 -> 1 -> ..0 */
        scrollTmp = 1;
        if (percentScroll >= 0.5) {
            scrollTmp = Math.max(0, 1 - ((percentScroll - 0.5) * 2) * _settings.scrollPauseDeltaHalf);
        }
        $body.style.setProperty(attributePrefix + 'lasthalfshrink', scrollTmp);

        /* 0 -> 0 -> ..1 */
        scrollTmp = 0;
        if (percentScroll >= 0.5) {
            scrollTmp = Math.min(1, (percentScroll - 0.5) * 2 * _settings.scrollPauseDeltaHalf);
        }

        $body.style.setProperty(attributePrefix + 'lasthalfgrow', scrollTmp);
    }

    function set_body_attributes() {
        var scrollRatio = winScroll / winHeight,
            attributePrefix = 'data-scroll-level';
        $body.setAttribute(attributePrefix, Math.floor(scrollRatio) * 100);
        $body.setAttribute(attributePrefix + '-double', Math.floor(scrollRatio * 2) * 50);
        $body.setAttribute(attributePrefix + '-quart', Math.floor(scrollRatio * 4) * 25);
        $body.setAttribute(attributePrefix + '-percent', Math.floor(scrollRatio * 100));
    }

    /* ----------------------------------------------------------
      Events
    ---------------------------------------------------------- */

    var scheduledAnimationFrame = false;

    function on_scroll_requestanim() {
        if (scheduledAnimationFrame) {
            return;
        }
        scheduledAnimationFrame = true;
        requestAnimationFrame(on_scroll);
        scheduledAnimationFrame = false;
    }

    on_resize();
    on_scroll_requestanim();

    window.addEventListener('resize', on_resize);
    document.addEventListener('scroll', on_scroll_requestanim);
    window.addEventListener('vanilla-scrolllevel-compute', function() {
        on_resize();
        on_scroll_requestanim();
    });
};
