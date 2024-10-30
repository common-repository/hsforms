/**
 * Copyright (c) 2019 Open New Media GmbH
 * onm_cal - Javascript Calendar
 * @version v1.1.1
 * @author Open New Media GmbH
 */
;(function($) {
    try {
        var now = moment().hours(0).minutes(0).seconds(0).milliseconds(0);
    } catch(e){
        throw 'Can not find moment.js';
    }

    var hasTouch = 'ontouchstart' in window;
    var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    var resizeTimeout;
    $(window).resize(function() {
        if (!resizeTimeout) {
            resizeTimeout = window.setTimeout(function() {
                resizeTimeout = null;
                $(window).trigger('onm.cal.resize');
            }, 133);
        }
    });

    var cssSheet;
    var cssAddRule = function(selector, rules, index) {
        if (!cssSheet) {
            var $style = $('<style/>', { type: 'text/css' }).text("");
            $('head').append($style);
            cssSheet = $style.get(0).sheet;
        }
        if ('insertRule' in cssSheet) {
            cssSheet.insertRule(selector + '{' + rules + '}', index);

        } else if('addRule' in cssSheet) {
            cssSheet.addRule(selector, rules, index);
        }
    };
    var cssClasses = {};
    var setColorCss = function(type, hexColor, hexColor2) {
        var color = hexColor.substr(1).toLowerCase();
        var color2;
        if (hexColor2) {
            color2 = hexColor2.substr(1).toLowerCase();
        }
        var index = type + '-' + color + (color2 ? '-' + color2 : '');
        if (cssClasses[index]) {
            return 'onm-cal-day-' + index;
        }
        cssClasses[index] = true;
        cssAddRule('.onm-cal .onm-cal-content > div.onm-cal-day-' + index,
            (type === 'bg' ? 'background-' : '') + 'color: #' + (color2 ? color2 : color) + ';'
              + (color2 ? 'background: linear-gradient(to right,#' + color + ' 0%,#' + color + ' 50%,#' + color2 + ' 50%,#' + color2 + ' 100%);' : '')
        );
        if (type === 'bg') {
            color = lightenDarkenColor("#" + color, -30);

            if (color2) {
                color2 = lightenDarkenColor("#" + color2, -30);
            }
        } else {
            color = 'ffffff';
        }

        cssAddRule('.onm-cal .onm-cal-content > div.onm-cal-day-' + index + '.onm-cal-day-selected',
            (type === 'bg' ? 'background-' : '') + 'color: #' + (color2 ? color2 : color) + ';'
              + (color2 ? 'background: linear-gradient(to right,#' + color + ' 0%,#' + color + ' 50%,#' + color2 + ' 50%,#' + color2 + ' 100%);' : '')
        );
        return 'onm-cal-day-' + index;
    };
    // Source: https://jsfiddle.net/gabrieleromanato/hrJ4X/
    // var lightenDarkenColor = function (col, amt) {
    //     var usePound = false;

    //     if (col[0] == "#") {
    //         col = col.slice(1);
    //         usePound = true;
    //     }
    //     var num = parseInt(col, 16);
    //     var r = (num >> 16) + amt;
    //     if (r > 255) {
    //         r = 255;
    //     } else if (r < 0) {
    //         r = 0;
    //     }
    //     var b = ((num >> 8) & 0x00FF) + amt;
    //     if (b > 255) {
    //         b = 255;
    //     } else if (b < 0) {
    //         b = 0;
    //     }
    //     var g = (num & 0x0000FF) + amt;
    //     if (g > 255) {
    //         g = 255;
    //     } else if (g < 0) {
    //         g = 0;
    //     }
    //     return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
    // };

    // Source: https://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors/13542669#13542669
    var lightenDarkenColor = function (color, percent) {

        var R = parseInt(color.substring(1,3),16);
        var G = parseInt(color.substring(3,5),16);
        var B = parseInt(color.substring(5,7),16);

        R = parseInt(R * (100 + percent) / 100);
        G = parseInt(G * (100 + percent) / 100);
        B = parseInt(B * (100 + percent) / 100);

        R = (R<255)?R:255;
        G = (G<255)?G:255;
        B = (B<255)?B:255;

        var RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
        var GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
        var BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

        return RR+GG+BB;
    }

    var methods = {
        init: function(options) {
            var options = $.extend({}, $.fn.onmCal.defaults, options);

            return this.each(function(initIndex) {
                var self = this;
                var $target = $(self);

                if ($target.data('isOnmCal')) {
                    return;
                }
                $target.data('isOnmCal', true);

                var nowLocal = moment(now.locale(options.lang));
                var localData = nowLocal.localeData();
                var popupMode;
                var $popupOpener;
                var $popupPositionTo;
                var displayMonths;
                var dateRangeMin;
                var dateRangeMax;
                var dateRange;

                var targetIsInput;
                var $targetInput;
                var targetDate;
                var targetInit;

                var rangeToMode;
                var $rangeTo;
                var rangeToIsInput;
                var $rangeToInput;
                var rangeToDate;
                var rangeToInit;

                var $container;

                var $prevButton;
                var $nextButton;
                var monthSpan;
                var yearSpan;
                var monthContainer;

                var init = function() {
                    popupMode = (typeof options.position !== 'object' || !options.position.jquery || !options.position.get(initIndex));
                    displayMonths = popupMode ? 1 : Math.min(12, Math.max(1, parseInt(options.displayMonths)));
                    dateRange = [];
                    targetIsInput = $target.get(0).nodeName.toUpperCase() === 'INPUT';
                    targetInit = false;
                    rangeToMode = typeof options.rangeToElement === 'object' && options.rangeToElement.jquery && options.rangeToElement.get(initIndex);
                    $rangeTo = $(rangeToMode ? options.rangeToElement.get(initIndex) : []);
                    rangeToIsInput = rangeToMode ? $rangeTo.get(0).nodeName.toUpperCase() === 'INPUT' : false;
                    rangeToInit = false;
                    monthSpan = [];
                    yearSpan = [];
                    monthContainer = [];

                    self.dateIndex = {};

                    if (popupMode && !options.width) {
                        options.width = '400px';
                    }

                    // Prevent keyboard from showing up if cal input is clicked
                    $([$target, $rangeTo]).each(function() {
                        $(this).on('focus', function(e) {
                            e.preventDefault();
                            $(this).blur();
                        });
                    });

                    // Work-around to prevent zoom on cal input fields
                    if (isIOS && parseInt($target.css('font-size')) < 16) {
                        $([$target, $rangeTo]).each(function() {
                            $(this).css('font-size', '16px');
                        });
                    }

                    // Default values setzen
                    if (options.value) {
                        if (!rangeToMode) {
                            targetInit = parseAsMoment(options.value);
                        } else if (options.value[0] && options.value[1]) {
                            targetInit = parseAsMoment(options.value[0]);
                            rangeToInit = parseAsMoment(options.value[1]);
                        }
                    }

                    // Extern navigation
                    options.navigationPrev.click(function() {
                        self.prevMonth();
                    });
                    options.navigationNext.click(function() {
                        self.nextMonth();
                    });

                    // Date ranges
                    $(options.dateRanges).each(function() {
                        var start = parseAsMoment(this[0]);
                        var end = parseAsMoment(this[1]);
                        if (Math.abs(start.diff(end, 'days')) < options.minRange) {
                            return;
                        }
                        dateRangeMin = dateRangeMin ? moment.min(dateRangeMin, start) : start;
                        dateRangeMax = dateRangeMax ? moment.max(dateRangeMax, end) : end;
                        dateRange.push([start, end]);
                    });
                    if (!isActive(nowLocal)) {
                        nowLocal = dateRangeMin.clone();
                    }

                    // Target input
                    if (typeof options.targetInput === 'object' && options.targetInput.jquery && options.targetInput.get(initIndex)) {
                        $targetInput = $(options.targetInput.get(initIndex));

                    } else if (options.targetInput !== false) {
                        $targetInput = $('<input/>', { type: 'hidden', name: options.targetInput === 'string' ? options.targetInput : ($target.attr('name') ? $target.attr('name') : $target.attr('id')) }); $target.attr("onm-cal","2015");
                        $target.after($targetInput);

                    } else {
                        $targetInput = $([]);
                    }

                    // Target element is input
                    if (targetIsInput) {
                        if ((options.placeholder && !$target.attr('placeholder')) || 'replace' === options.placeholder) {
                            $target.attr('placeholder', localData.longDateFormat(options.dateFormat));
                        }

                        if (targetInit === false && $target.val()) {
                            targetInit = parseAsMoment($target.val());
                            if (targetInit.isValid() && isActive(targetInit)) {
                                nowLocal = targetInit.clone();

                            } else {
                                targetInit = false;
                                self.selectDate(null);
                            }
                        }

                        $target.change(function() {
                            var momentChange = parseAsMoment($target.val());
                            if (momentChange.isValid() && isActive(momentChange)) {
                                self.selectDate(null, 'rangeTo');
                                self.selectDate(momentChange);

                                if (targetDate) {
                                    self.selectDate(targetDate.clone().add(options.minRange, 'days'), 'rangeTo');

                                    var doUpdateMonth = nowLocal.month() !== targetDate.month();
                                    nowLocal = targetDate.clone();
                                    if (doUpdateMonth) {
                                        updateMonth();
                                    }
                                }

                            } else {
                                self.selectDate(null);
                            }
                        });
                    } else if (targetInit === false && $target.text()) {
                        targetInit = parseAsMoment($target.text());
                        if (targetInit.isValid() && isActive(targetInit)) {
                            nowLocal = targetInit.clone();

                        } else {
                            targetInit = false;
                            self.selectDate(null);
                        }
                    }

                    // RangeTo
                    if (rangeToMode) {
                        // RangeTo input
                        if (typeof options.rangeToInput === 'object' && options.rangeToInput.jquery && options.rangeToInput.get(initIndex)) {
                            $rangeToInput = $(options.rangeToInput.get(initIndex));

                        } else if (options.rangeToInput !== false) {
                            $rangeToInput = $('<input/>', { type: 'hidden', name: options.rangeToInput === 'string' ? options.rangeToInput : ($rangeTo.attr('name') ? $rangeTo.attr('name') : $rangeTo.attr('id')) });
                            $rangeTo.after($rangeToInput);

                        } else {
                            $rangeToInput = $([]);
                        }

                        // RangeTo element is input
                        if (rangeToIsInput) {
                            if ((options.placeholder && !$rangeTo.attr('placeholder')) || 'replace' === options.placeholder) {
                                $rangeTo.attr('placeholder', localData.longDateFormat(options.dateFormat));
                            }

                            if (rangeToInit === false && $rangeTo.val()) {
                                rangeToInit = parseAsMoment($rangeTo.val());
                                if (rangeToInit.isValid() && isActive(rangeToInit)) {
                                    if (!targetInit) {
                                        nowLocal = rangeToInit.clone();
                                    }
                                } else {
                                    rangeToInit = false;
                                    self.selectDate(null, 'rangeTo');
                                }
                            }

                            $rangeTo.change(function() {
                                var momentChange = parseAsMoment($rangeTo.val());
                                if (momentChange.isValid() && isActive(momentChange)) {
                                    self.selectDate(momentChange, 'rangeTo');

                                    if (rangeToDate) {
                                        var doUpdateMonth = nowLocal.month() !== rangeToDate.month();
                                        nowLocal = rangeToDate.clone();
                                        if (doUpdateMonth) {
                                            updateMonth();
                                        }
                                    }

                                } else {
                                    self.selectDate(null, 'rangeTo');
                                }
                            });
                        } else if (rangeToInit === false && $rangeTo.text()) {
                            rangeToInit = parseAsMoment($rangeTo.text());
                            if (rangeToInit.isValid() && isActive(rangeToInit)) {
                                if (!targetInit) {
                                    nowLocal = rangeToInit.clone();
                                }
                            } else {
                                rangeToInit = false;
                                self.selectDate(null, 'rangeTo');
                            }
                        }
                    }

                    if (popupMode) {
                        $target.add($rangeTo).on(targetIsInput ? 'focus' : 'click', function() {
                            self.popupShow(this);
                        });
                        self.resetValue(true);
                        return;
                    }

                    $container = $(options.position.get(initIndex));
                    create();
                    self.resetValue(true);
                };

                var popupHideLeave = function(evt) {
                    if ($(evt.target).closest('.onm-cal').length || $target.get(0) === evt.target || $rangeTo.get(0) === evt.target || ($popupPositionTo && $popupPositionTo.get(0) === evt.target)
                      || $(evt.relatedTarget).closest('.onm-cal').length || $target.get(0) === evt.relatedTarget || $rangeTo.get(0) === evt.relatedTarget || ($popupPositionTo && $popupPositionTo.get(0) === evt.relatedTarget)) {
                        return;
                    }
                    self.popupHide();
                };

                var resize = function() {
                    if (!$container) {
                        return;
                    }
                    var $inner = $container.find('.onm-cal');
                    if ($inner.width() > 300) {
                        $inner.removeClass('onm-cal-small');
                    } else {
                        $inner.addClass('onm-cal-small');
                    }
                    if (typeof options.position !== 'object') {
                        var docOffsets = $popupPositionTo.offset();
                        var offsets = $popupPositionTo.position();
                        var top;
                        var left;
                        if (options.position.indexOf('top') > -1) {
                            top = offsets.top - $container.outerHeight();

                        } else {
                            top = offsets.top + $popupPositionTo.outerHeight();
                        }
                        if (options.position.indexOf('right') > -1) {
                            left = offsets.left + $popupPositionTo.outerWidth() - $container.outerWidth();

                        } else if (options.position.indexOf('center') > -1) {
                            left = offsets.left + ($popupPositionTo.outerWidth() - $container.outerWidth()) / 2;

                        } else {
                            left = offsets.left;
                        }
                        $container.css({
                            top: Math.max(offsets.top - docOffsets.top, top) + 'px',
                            left: Math.max(offsets.left - docOffsets.left, left) + 'px'
                        });
                    }
                };

                var create = function() {
                    var month = nowLocal.clone();
                    for (var i = 0; i < displayMonths; i++) {
                        var $dom = $('<div/>', { class: 'onm-cal' });
                        $dom.on('click', function(evt) {
                            if (!evt.target || evt.target.hasAttribute("disabled")) {
                                return;
                            }
                            if (popupMode) {
                                evt.preventDefault();
                            }
                            clickAction(evt);
                        });
                        if (options.hideNavigation) {
                            $dom.addClass('onm-cal-no-nav');
                        }
                        // Nav
                        var $monthElement = $('<span/>', { class: 'onm-cal-month' });
                        var $yearElement = $('<span/>', { class: 'onm-cal-year' });
                        $dom.append(
                            $('<div/>', { class: 'onm-cal-nav' }).append(
                                i === 0 ? ($prevButton = $('<button/>', { type: 'button', class: 'onm-cal-prev' })) : '',
                                $('<h6/>').append($monthElement, " ", $yearElement),
                                i === displayMonths - 1 ? ($nextButton = $('<button/>', { type: 'button', class: 'onm-cal-next' })) : ''
                            )
                        );
                        // Headline
                        $dom.append(
                            $('<div/>', { class: 'onm-cal-headline' }).append(
                                $('<div/>', { class: 'onm-cal-line-start onm-cal-day' + month.weekday(0).day() }).text(month.weekday(0).format('dd')),
                                $('<div/>', { class: 'onm-cal-day' + month.weekday(1).day() }).text(month.weekday(1).format('dd')),
                                $('<div/>', { class: 'onm-cal-day' + month.weekday(2).day() }).text(month.weekday(2).format('dd')),
                                $('<div/>', { class: 'onm-cal-day' + month.weekday(3).day() }).text(month.weekday(3).format('dd')),
                                $('<div/>', { class: 'onm-cal-day' + month.weekday(4).day() }).text(month.weekday(4).format('dd')),
                                $('<div/>', { class: 'onm-cal-day' + month.weekday(5).day() }).text(month.weekday(5).format('dd')),
                                $('<div/>', { class: 'onm-cal-day' + month.weekday(6).day() }).text(month.weekday(6).format('dd'))
                            )
                        );
                        // Content
                        var $contentElement = $('<div/>', { class: 'onm-cal-content' });
                        $dom.append($contentElement);

                        $container.append($dom);
                        monthSpan.push($monthElement.get(0));
                        yearSpan.push($yearElement.get(0));
                        monthContainer.push($contentElement.get(0));
                    }
                    updateMonth();
                    $(window).on('onm.cal.resize', resize);
                    resize();
                    $target.trigger('onm.cal.created', $container);
                };

                var clickAction = function(evt) {
                    var $cElement = $(evt.target ? evt.target : evt);
                    if ($cElement.hasClass('onm-cal-prev')) {
                        self.prevMonth();

                    } else if ($cElement.hasClass('onm-cal-next')) {
                        self.nextMonth();

                    } else if ($cElement.closest('.onm-cal-day-active').length) {
                        var mode = 'target';
                        if (rangeToMode) {
                            if (!popupMode || options.popupRangeSelect) {
                                mode = 'auto';

                            } else if ($rangeTo.get(0) === $popupOpener.get(0)) {
                                mode = 'rangeTo';
                            }
                        }
                        self.selectDate(moment($cElement.closest('.onm-cal-day-active').data('date'), ['YYYYMMDD']).locale(options.lang), mode);
                        if (!options.keepPopupOpen && (!options.popupRangeSelect || (options.popupRangeSelect && rangeToMode && targetDate && rangeToDate))) {
                            self.popupHide();
                        }
                    }
                };

                var isActive = function(date, range) {
                    range = range || 'day';
                    if (dateRangeMin && date.isBefore(dateRangeMin, range)) {
                        return false;
                    }
                    if (dateRangeMax && date.isAfter(dateRangeMax, range)) {
                        return false;
                    }
                    if ('month' === range && dateRangeMin && dateRangeMax) {
                        return true;
                    }
                    if (!dateRange.length) {
                        return true;
                    }
                    var result = false;
                    $(dateRange).each(function() {
                        if (date.isBetween(this[0], this[1], range) || date.isSame(this[0], range) || date.isSame(this[1], range)) {
                            result = true;
                            return false;
                        }
                    });
                    return result;
                };

                var inDateRange = function(date1, date2) {
                    if (!dateRange.length) {
                        return true;
                    }
                    var result = false;
                    $(dateRange).each(function() {
                        if ((date1.isBetween(this[0], this[1], 'day') || date1.isSame(this[0], 'day') || date1.isSame(this[1], 'day'))
                          && (date2.isBetween(this[0], this[1], 'day') || date2.isSame(this[0], 'day') || date2.isSame(this[1], 'day'))) {
                            result = true;
                            return false;
                        }
                    });
                    return result;
                };

                var getDateRange = function(date) {
                    if (!dateRange.length && !dateRangeMin) {
                        return false;
                    }
                    var result = false;
                    $(dateRange.length ? dateRange : [[dateRangeMin, dateRangeMax]]).each(function() {
                        if (date.isBetween(this[0], this[1], 'day') || date.isSame(this[0], 'day') || date.isSame(this[1], 'day')) {
                            result = this;
                            return false;
                        }
                    });
                    return result;
                };

                var createDates = function(month) {
                    var date = month.clone().date(1).weekday(0);
                    var $date;
                    var dates = [];
                    for (var i = 0; i < 42; i++) {
                        $date = $('<div/>', { class: (i % 7 === 0 ? 'onm-cal-line-start' : '') });
                        if (month.month() === date.month()) {
                            $date.append($('<div/>').text(date.format('D')));
                            if (isActive(date)) {
                                var index = date.format('YYYYMMDD');
                                $date.addClass('onm-cal-day-active');
                                $date.data('date', index);
                                self.dateIndex[index] = $date;
                            }
                        }
                        dates.push($date);

                        date.add(1, 'days');
                    }
                    return dates;
                };

                var updateMonth = function() {
                    var month;
                    self.dateIndex = {};
                    for (var i = 0; i < displayMonths; i++) {
                        month = nowLocal.clone().add(i, 'months');
                        $(monthSpan[i]).text(month.format('MMMM'));
                        $(yearSpan[i]).text(month.format('YYYY'));
                        $(monthContainer[i]).html(createDates(month));
                        if (i === 0) {
                            $prevButton.add(options.navigationPrev).prop('disabled', !isActive(month.clone().subtract(1, 'months'), 'month'));
                        }
                        if (i === displayMonths - 1) {
                            $nextButton.add(options.navigationNext).prop('disabled', !isActive(month.clone().add(1, 'months'), 'month'));
                        }
                    }
                    highlightDate();
                    $target.trigger('onm.cal.monthChange', [nowLocal.clone().date(1), displayMonths]);
                };

                var parseAsMoment = function(date) {
                    var momentDate;
                    if (typeof date === 'string') {
                        var formatL = localData.longDateFormat('L');
                        var formatLL = localData.longDateFormat('LL');
                        momentDate = moment(date, [
                            'YYYY-MM-DD',
                            formatL,
                            formatL.replace('MM', 'M').replace('DD', 'D'),
                            formatL.replace('YYYY', 'YY'),
                            formatL.replace('MM', 'M').replace('DD', 'D').replace('YYYY', 'YY'),
                            formatLL,
                            formatLL.replace('MMMM', 'MMM')
                        ]);

                    } else if (typeof date === 'number') {
                        momentDate = now.clone().add(date, 'days');

                    } else {
                        momentDate = moment(date).hours(0).minutes(0).seconds(0).milliseconds(0);
                    }
                    return momentDate.locale(options.lang);
                };

                var parseAsDateIndex = function(date) {
                    if (typeof date === 'string') {
                        return date.replace(/[^0-9]+/g, '');

                    } else if (typeof date === 'number') {
                        return now.clone().add(date, 'days').format('YYYYMMDD');

                    } else if (typeof date === 'object') {
                        if (moment.isDate(date)) {
                            date = moment(date);
                        }
                        if (moment.isMoment(date)) {
                            return date.format('YYYYMMDD');
                        }
                    }
                    return "";
                };

                var highlightDate = function() {
                    if (!$container) {
                        return;
                    }
                    $container.find('.onm-cal-day-selected').removeClass('onm-cal-day-selected onm-cal-day-selected-line onm-cal-day-selected-start onm-cal-day-selected-end');
                    if (targetDate) {
                        self.getDateElement(targetDate).addClass('onm-cal-day-selected' + (rangeToMode ? ' onm-cal-day-selected-start' : ''));
                    }
                    if (rangeToDate) {
                        self.getDateElement(rangeToDate).addClass('onm-cal-day-selected' + (targetDate ? ' onm-cal-day-selected-end' : ''));
                    }
                    if (targetDate && rangeToDate) {
                        var startDate = targetDate.clone().add(1, 'days');
                        while (startDate.year() * 1000 + startDate.dayOfYear() < rangeToDate.year() * 1000 + rangeToDate.dayOfYear()) {
                            self.getDateElement(startDate).addClass('onm-cal-day-selected onm-cal-day-selected-line');
                            startDate.add(1, 'days');
                        }
                    }
                };

                self.resetValue = function(init) {
                    if (init) {
                        if (rangeToMode) {
                            self.selectDate(null, 'rangeTo');
                        }
                        self.selectDate(targetInit !== false ? targetInit.clone() : null);
                        if (rangeToMode && rangeToInit !== false) {
                            self.selectDate(rangeToInit.clone(), 'rangeTo');
                        }
                    } else {
                        self.selectDate(null);
                        if (rangeToMode) {
                            self.selectDate(null, 'rangeTo');
                        }
                    }
                };

                self.update = function(updateOptions) {
                    options = $.extend(options, updateOptions);

                    if (!popupMode) {
                        $container.html('');

                    } else if ($container) {
                        $container.remove();
                    }
                    $container = null;

                    init();
                };

                self.popupHide = function() {
                    if (!popupMode) {
                        return;
                    }
                    if (!$container || $container.is(':hidden')) {
                        return;
                    }
                    if (hasTouch) {
                        $popupOpener.prop('readonly', false); // No virtual keyboard
                    }
                    $container.hide();
                    $(window).off('click focusin', popupHideLeave);
                    $target.trigger('onm.cal.popupHidden');
                    $target.blur();
                };

                self.popupShow = function(opener, rangeTo, positionTo) {
                    $popupOpener = $popupPositionTo = rangeTo && rangeToMode ? $rangeTo : $(opener);
                    if (positionTo) {
                        $popupPositionTo = $(positionTo);
                    }
                    if (hasTouch) {
                        var isReadonly = $popupOpener.prop('readonly');
                        $popupOpener.prop('readonly', true); // No virtual keyboard
                        if (isIOS && !isReadonly) { // iOS readonly must be there before open
                            $popupOpener.blur();
                            $popupOpener.focus();
                        }
                    }
                    if ($container) {
                        $container.show();
                        resize();

                    } else {
                        $container = $('<div/>', { class: 'onm-cal-popup' }).css({
                            width: options.width
                        });
                        $target.after($container);
                        create();
                        self.resetValue(true);
                    }
                    $target.trigger('onm.cal.popupShown');
                    $(window).on('click focusin', popupHideLeave);
                };

                self.prevMonth = function() {
                    nowLocal.subtract(1, 'months');
                    updateMonth();
                };
                self.nextMonth = function() {
                    nowLocal.add(1, 'months');
                    updateMonth();
                };

                self.selectDate = function(date, mode) {
                    if (date === false) {
                        return;
                    }
                    if (date !== null && !isActive(date)) {
                        date = null;
                    }
                    mode = mode || 'target';

                    if (rangeToMode) {
                        if (popupMode && !options.popupRangeSelect) {
                            // Check in dateRange (Before switch!)
                            if ('rangeTo' === mode && targetDate && !rangeToDate && date !== null && !inDateRange(targetDate, date)) {
                                self.selectDate(null, 'target');
                                $target.trigger('onm.cal.message', ['clear', 'dateRange', 'target']);

                            } else if ('target' === mode && !targetDate && rangeToDate && date !== null && !inDateRange(date, rangeToDate)) {
                                self.selectDate(null, 'rangeTo');
                                $target.trigger('onm.cal.message', ['clear', 'dateRange', 'rangeTo']);
                            }

                            // Switch
                            if ('rangeTo' === mode && targetDate && targetDate.isAfter(date)) {
                                self.selectDate(null, 'target');
                                $target.trigger('onm.cal.message', ['clear', 'direction', 'target']);

                            } else if ('target' === mode && rangeToDate && rangeToDate.isBefore(date)) {
                                self.selectDate(null, 'rangeTo');
                                $target.trigger('onm.cal.message', ['clear', 'direction', 'rangeTo']);
                            }

                            // Check minRange
                            if (options.minRange > 0) {
                                if ('rangeTo' === mode && targetDate && date !== null && Math.abs(targetDate.diff(date, 'days')) < options.minRange) {
                                    self.selectDate(null, 'target');
                                    $target.trigger('onm.cal.message', ['clear', 'minRange', 'target']);

                                } else if ('target' === mode && rangeToDate && date !== null && Math.abs(date.diff(rangeToDate, 'days')) < options.minRange) {
                                    self.selectDate(null, 'rangeTo');
                                    $target.trigger('onm.cal.message', ['clear', 'minRange', 'rangeTo']);
                                }
                            }

                            // Check maxRange
                            if (options.maxRange > 0) {
                                if ('rangeTo' === mode && targetDate && date !== null && Math.abs(targetDate.diff(date, 'days')) > options.maxRange) {
                                    self.selectDate(null, 'target');
                                    $target.trigger('onm.cal.message', ['clear', 'maxRange', 'target']);

                                } else if ('target' === mode && rangeToDate && date !== null && Math.abs(date.diff(rangeToDate, 'days')) > options.maxRange) {
                                    self.selectDate(null, 'rangeTo');
                                    $target.trigger('onm.cal.message', ['clear', 'maxRange', 'rangeTo']);
                                }
                            }
                        } else {
                            if ('auto' === mode) {
                                if (targetDate && !rangeToDate) {
                                    mode = 'rangeTo';
                                } else {
                                    mode = 'target';
                                }
                                if (targetDate && rangeToDate) {
                                    self.selectDate(null, 'rangeTo');
                                    self.selectDate(date);
                                    return;
                                }
                            }

                            // Check in dateRange (Before switch!)
                            if ('rangeTo' === mode && targetDate && !rangeToDate && date !== null && !inDateRange(targetDate, date)) {
                                mode = 'target';
                                $target.trigger('onm.cal.message', ['adaptation', 'dateRange']);

                            } else if ('target' === mode && !targetDate && rangeToDate && date !== null && !inDateRange(date, rangeToDate)) {
                                mode = 'rangeTo';
                                $target.trigger('onm.cal.message', ['adaptation', 'dateRange']);
                            }

                            // Switch
                            if ('rangeTo' === mode && targetDate && targetDate.isAfter(date)) {
                                var tempDate = targetDate.clone();
                                self.selectDate(date);
                                self.selectDate(tempDate, 'rangeTo');
                                $target.trigger('onm.cal.message', ['adaptation', 'switch']);
                                return;

                            } else if ('target' === mode && rangeToDate && rangeToDate.isBefore(date)) {
                                var tempDate = rangeToDate.clone();
                                self.selectDate(tempDate);
                                self.selectDate(date, 'rangeTo');
                                $target.trigger('onm.cal.message', ['adaptation', 'switch']);
                                return;
                            }

                            // Check minRange
                            if (options.minRange > 0) {
                                if ('rangeTo' === mode && targetDate && date !== null && Math.abs(targetDate.diff(date, 'days')) < options.minRange) {
                                    date = targetDate.clone().add(options.minRange, 'days');
                                    // Check in dateRange (range extended)
                                    if (!inDateRange(targetDate, date)) {
                                        var range = getDateRange(targetDate);
                                        date = range[1].clone();
                                        self.selectDate(date.clone().subtract(options.minRange, 'days'), 'target');
                                    }
                                    $target.trigger('onm.cal.message', ['restriction', 'minRange']);

                                } else if ('target' === mode && rangeToDate && date !== null && Math.abs(date.diff(rangeToDate, 'days')) < options.minRange) {
                                    date = rangeToDate.clone().subtract(options.minRange, 'days');
                                    // Check in dateRange (range extended)
                                    if (!inDateRange(date, rangeToDate)) {
                                        var range = getDateRange(rangeToDate);
                                        date = range[0].clone();
                                        self.selectDate(date.clone().add(options.minRange, 'days'), 'rangeTo');
                                    }
                                    $target.trigger('onm.cal.message', ['restriction', 'minRange']);
                                }
                            }

                            // Check maxRange
                            if (options.maxRange > 0) {
                                if ('rangeTo' === mode && targetDate && date !== null && Math.abs(targetDate.diff(date, 'days')) > options.maxRange) {
                                    date = targetDate.clone().add(options.maxRange, 'days');
                                    $target.trigger('onm.cal.message', ['restriction', 'maxRange']);

                                } else if ('target' === mode && rangeToDate && date !== null && Math.abs(date.diff(rangeToDate, 'days')) > options.maxRange) {
                                    date = rangeToDate.clone().subtract(options.maxRange, 'days');
                                    $target.trigger('onm.cal.message', ['restriction', 'maxRange']);
                                }
                            }
                        }
                    } else {
                        mode = 'target';
                    }

                    var changeTrigger;
                    if ('rangeTo' !== mode) {
                        changeTrigger = !(targetDate === date || targetDate && targetDate.isSame(date));
                        targetDate = date;
                        if (targetIsInput) {
                            $target.val(date ? date.format(localData.longDateFormat(options.dateFormat)) : '');
                        } else {
                            $target.text(date ? date.format(localData.longDateFormat(options.dateFormat)) : '');
                        }
                        $targetInput.val(date ? date.format('YYYY-MM-DD') : '');
                        if (changeTrigger) {
                            $target.trigger('onm.cal.change', [targetDate]);
                        }

                    } else {
                        changeTrigger = !(rangeToDate === date || rangeToDate && rangeToDate.isSame(date));
                        rangeToDate = date;
                        if (rangeToIsInput) {
                            $rangeTo.val(date ? date.format(localData.longDateFormat(options.dateFormat)) : '');
                        } else {
                            $rangeTo.text(date ? date.format(localData.longDateFormat(options.dateFormat)) : '');
                        }
                        $rangeToInput.val(date ? date.format('YYYY-MM-DD') : '');
                        if (changeTrigger) {
                            $rangeTo.trigger('onm.cal.change', [rangeToDate]);
                        }
                    }
                    highlightDate();
                };

                self.setDate = function(date, rangeTo) {
                    self.selectDate(parseAsMoment(date), rangeTo === true ? 'rangeTo' : 'target');
                };

                self.getDateElement = function(date) {
                    var dateIndex = parseAsDateIndex(date);
                    return self.dateIndex[dateIndex] ? self.dateIndex[dateIndex] : $([]);
                };

                self.setDateElementColors = function(date, bgColor, fontColor, nightMode) {
                    var classNames = '';
                    var $dateElement = self.getDateElement(date);

                    $dateElement.removeClass(function(index, css) {
                        return (css.match(/(^|\s)onm-cal-day-(bg|font)\S+/g) || []).join(' ');
                    });
                    if (typeof bgColor === 'string' && bgColor.match(/^#[0-9A-Fa-f]{6}$/)) {
                        if (!nightMode) {
                            classNames += setColorCss('bg', bgColor) + ' ';

                        } else {
                            self.getDateElement(parseAsMoment(date).add(1, 'days')).data('split-color', bgColor);
                            if (!$dateElement.data('split-color')) {
                                classNames += setColorCss('bg', bgColor) + ' ';

                            } else {
                                classNames += setColorCss('bg', $dateElement.data('split-color'), bgColor) + ' ';
                            }
                        }
                    }
                    if (typeof fontColor === 'string' && fontColor.match(/^#[0-9A-Fa-f]{6}$/)) {
                        classNames += setColorCss('font', fontColor) + ' ';
                    }
                    if (classNames) {
                        $dateElement.addClass(classNames);
                    }
                };
                self.getDateIndex = function() {
                    return self.dateIndex;
                };

                init();
            });
        },
        getDateElement: function(date) {
            var dateElement = [];
            this.each(function() {
                var $element = this.getDateElement(date);
                if (!$element.length) {
                    return;
                }
                dateElement.push($element.get(0));
            });
            return $(dateElement);
        },
        setDate: function(date, rangeTo) {
            return this.each(function() {
                this.setDate(date, rangeTo);
            });
        },
        setDateElementColors: function(date, bgColor, fontColor, nightMode) {
            return this.each(function() {
                this.setDateElementColors(date, bgColor, fontColor, nightMode);
            });
        },
        getDateIndex: function() {
            var result;
            this.each(function() {
                 result = this.getDateIndex();
                 return;
            });
            return result;
        },
        popupShow: function(rangeTo, positionTo) {
            return this.each(function() {
                this.popupShow(this, rangeTo, positionTo);
            });
        },
        popupHide: function() {
            return this.each(function() {
                this.popupHide();
            });
        },
        resetValue: function(init) {
            return this.each(function() {
                this.resetValue(init);
            });
        },
        update: function(options) {
            return this.each(function() {
                this.update(options);
            });
        }
    };

    $.fn.onmCal = function(method){
        if (!this.length) {
            return this;
        }

        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));

        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);

        } else {
            throw 'Method "' + method + '" not exists in onmCal';
        }
    };

    $.fn.onmCal.defaults = {
        lang: $('html').attr('lang') || 'en',
        dateFormat: 'L', // L, l, LL, ll
        targetInput: true, // $(input[type=hidden]), true (or string as input-name), false
        position: '', // $(.holder), top, bottom, left, center, right, and combination
        placeholder: true, // 'replace', true, false
        displayMonths: 1, // Months to display in holder (max: 12)
        rangeToElement: false, // $(.rangeTo)
        rangeToInput: true, // $(input[type=hidden]), true (or string as input-name), false
        hideNavigation: false, // Hide navigation buttons
        value: false, // Default value(s)
        navigationPrev: $([]),
        navigationNext: $([]),
        popupRangeSelect: false, // true: Closes popup after second click, false: Closes after first click
        minRange: 0, // Minimum days to select additional from start date (nights)
        maxRange: 0, // Maximum days to select additional from start date (nights)
        dateRanges: [], // Array of [from, to]-Pairs - Example Pairs: ['2015-02-25', '2015-06-25'], [1, 10]
        width: '', // PopUp width (default 400px)
        keepPopupOpen: false
        // Bind to Events
        // $element.on('onm.cal.created');
        // $element.on('onm.cal.popupShown');
        // $element.on('onm.cal.popupHidden');
        // $element.on('onm.cal.change');  $rangeToElement.on('onm.cal.change');
        // $element.on('onm.cal.monthChange');
        // $element.on('onm.cal.message');
    };

}(jQuery));
